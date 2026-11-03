import {
  CrossProcessingResult,
  CrossResultRow,
  ExtractedPdfItem,
  LotAllocation,
  LotRecord,
  SignaturesInfo,
  StockBodegaRecord,
} from '../types/fefo';
import { cleanExact, formatDateDDMMYYYY } from './excelParser';

interface GroupedLot {
  cleanName: string;
  lote: string;
  fCadStr: string;
  fCadDate: Date | null;
  existen: number;
}

/**
 * Executes the hospital FEFO (First Expired, First Out) cross-matching algorithm
 * exactly as defined in the institutional Python script.
 */
export function executeFefoCross(
  pdfItems: ExtractedPdfItem[],
  lotes: LotRecord[],
  unificado: StockBodegaRecord[],
  signatures: SignaturesInfo,
  servicioNombre: string,
  rawPdfText: string
): CrossProcessingResult {
  // 1. Group lotes by [clean_name, Lote, F. Cad] and sum Existen
  const groupedMap = new Map<string, GroupedLot>();

  for (const item of lotes) {
    const key = `${item.cleanName}___${item.lote}___${item.fCadFormatted || item.fCad}`;
    const existing = groupedMap.get(key);
    if (existing) {
      existing.existen += item.existen;
    } else {
      groupedMap.set(key, {
        cleanName: item.cleanName,
        lote: item.lote,
        fCadStr: item.fCadFormatted || String(item.fCad),
        fCadDate: item.fCadDate || null,
        existen: item.existen,
      });
    }
  }

  // 2. Sort lotes by clean_name ASC and F. Cad DT ASC (FEFO: earliest expiration first)
  const groupedList = Array.from(groupedMap.values()).sort((a, b) => {
    if (a.cleanName !== b.cleanName) {
      return a.cleanName.localeCompare(b.cleanName);
    }
    const timeA = a.fCadDate ? a.fCadDate.getTime() : 9999999999999;
    const timeB = b.fCadDate ? b.fCadDate.getTime() : 9999999999999;
    return timeA - timeB;
  });

  // Create quick lookup for unificado
  const unifMap = new Map<string, StockBodegaRecord>();
  for (const u of unificado) {
    if (!unifMap.has(u.cleanName)) {
      unifMap.set(u.cleanName, u);
    }
  }

  const resultadoFilas: CrossResultRow[] = [];
  let totalSolicitado = 0;
  let totalAprobado = 0;
  let totalDespachado = 0;
  let totalAlertas = 0;

  const now = new Date();

  // 3. Process each item requested in the PDF
  for (let idx = 0; idx < pdfItems.length; idx++) {
    const pdfRow = pdfItems[idx];
    const pName = cleanExact(pdfRow.dispositivoMedico);
    const cantAprobada = pdfRow.cantidadesAprobadas;
    const cantSolicitada = pdfRow.cantidadesSolicitadas;
    let cantPendiente = cantAprobada;

    totalSolicitado += cantSolicitada;
    totalAprobado += cantAprobada;

    // Match in unificado
    const matchUnif = unifMap.get(pName);
    const codigo = matchUnif ? matchUnif.codigo : 'SIN-CODIGO';
    const sku = matchUnif ? matchUnif.sku : 'SIN-SKU';
    const stockBodega = matchUnif ? matchUnif.stockBodega : 0.0;

    // Filter lots for this product
    const lotesProd = groupedList.filter((l) => l.cleanName === pName);

    if (lotesProd.length === 0 || stockBodega <= 0) {
      totalAlertas++;
      resultadoFilas.push({
        nro: idx + 1,
        codigo: String(codigo),
        sku: String(sku),
        dispositivoMedico: pdfRow.dispositivoMedico,
        cantSolicitada,
        cantAprobada,
        cantDespachada: 0,
        lotesYCantidades: 'SIN LOTE DISPONIBLE (0 unids)',
        fechasCaducidad: 'S/F',
        stockBodega,
        alertaRojo: true,
        motivoAlerta:
          stockBodega <= 0 ? 'Sin stock en bodega' : 'Sin lote disponible en inventario',
        allocations: [],
        faltante: cantAprobada,
      });
    } else {
      const lotesInfo: string[] = [];
      const fechasInfo: string[] = [];
      const allocations: LotAllocation[] = [];
      let totalDespachadoItem = 0;

      for (const lRow of lotesProd) {
        if (cantPendiente <= 0) break;
        const dispLote = lRow.existen;
        if (dispLote <= 0) continue;

        let cantAUsar = 0;
        if (dispLote >= cantPendiente) {
          cantAUsar = cantPendiente;
          cantPendiente = 0;
        } else {
          cantAUsar = dispLote;
          cantPendiente -= dispLote;
        }

        totalDespachadoItem += cantAUsar;

        lotesInfo.push(`${lRow.lote} (${Math.round(cantAUsar)} unids)`);
        const fechaFmt = lRow.fCadDate ? formatDateDDMMYYYY(lRow.fCadDate) : lRow.fCadStr;
        fechasInfo.push(`${lRow.lote}: ${fechaFmt}`);

        const diasParaCaducar = lRow.fCadDate
          ? Math.ceil((lRow.fCadDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        allocations.push({
          lote: lRow.lote,
          cantidad: cantAUsar,
          fechaCaducidad: fechaFmt,
          fechaCaducidadDate: lRow.fCadDate,
          diasParaCaducar,
        });
      }

      const tieneFaltante = cantPendiente > 0;
      if (tieneFaltante) {
        lotesInfo.push(`FALTAN (${Math.round(cantPendiente)} unids)`);
        fechasInfo.push('STOCK INSUFICIENTE');
        totalAlertas++;
      }

      totalDespachado += totalDespachadoItem;

      resultadoFilas.push({
        nro: idx + 1,
        codigo: String(codigo),
        sku: String(sku),
        dispositivoMedico: pdfRow.dispositivoMedico,
        cantSolicitada,
        cantAprobada,
        cantDespachada: totalDespachadoItem,
        lotesYCantidades: lotesInfo.join(' / '),
        fechasCaducidad: fechasInfo.join(' / '),
        stockBodega,
        alertaRojo: tieneFaltante || stockBodega <= 0,
        motivoAlerta: tieneFaltante ? `Faltan ${Math.round(cantPendiente)} unidades` : undefined,
        allocations,
        faltante: cantPendiente,
      });
    }
  }

  return {
    servicioNombre,
    signatures,
    items: resultadoFilas,
    totalSolicitado,
    totalAprobado,
    totalDespachado,
    totalAlertas,
    pdfRawText: rawPdfText,
  };
}
