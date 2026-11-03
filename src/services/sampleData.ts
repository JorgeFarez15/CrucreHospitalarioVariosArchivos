import { ExtractedPdfItem, LotRecord, StockBodegaRecord, SignaturesInfo } from '../types/fefo';
import { cleanExact } from './excelParser';
import * as XLSX from 'xlsx';

export const SAMPLE_SERVICIO_NOMBRE = 'EMERGENCIA';

export const SAMPLE_SIGNATURES: SignaturesInfo = {
  elaboradoPor: 'MARIA BELEN CANTOS ESPINOZA',
  entregadoPor: 'GUARDALMACÉN / DESPACHADOR',
  validadoPor: 'DANIEL GUILLERMO DELEG SARI',
  servicioSolicitante: 'EMERGENCIA',
  fechaEmision: '20/10/2026 14:35',
  rawFirmantes: ['MARIA BELEN CANTOS ESPINOZA', 'DANIEL GUILLERMO DELEG SARI'],
};

export const SAMPLE_RAW_PDF_TEXT = `HOSPITAL PROVINCIAL GENERAL DOCENTE VICENTE CORRAL MOSCOSO
DIRECCIÓN TÉCNICA DE ATENCIÓN DE SALUD
SOLICITUD DE PEDIDO DE DISPOSITIVOS MÉDICOS
Servicio: EMERGENCIA - ÁREA CRÍTICA Y REANIMACIÓN
FECHA: 20/10/2026   NRO. PEDIDO: PED-2026-08942   VERSIÓN: 2.1   CÓDIGO: MSP-HPGVD-004

DETALLE DE DISPOSITIVOS MÉDICOS Y MATERIALES SOLICITADOS
Nro. Dispositivo Médico (AUTORIZADA SEGÚN CUADRO NACIONAL BÁSICO) Solicitada Aprobada
1 CATETER INTRAVENOSO PERIFERICO 20G X 1 1/4" (AUTORIZADA POR COMISION TECNICA) 120 100
2 TUBO ENDOTRAQUEAL CON BALON NRO. 7.5 (AUTORIZADA POR COMISION TECNICA) 40 35
3 JERINGA DESCARTABLE DE 10 ML CON AGUJA 21G X 1 1/2" (AUTORIZADA POR COMISION TECNICA) 250 200
4 GUANTES QUIRURGICOS ESTERILES NRO. 7.5 (AUTORIZADA POR COMISION TECNICA) 150 150
5 MASCARILLA DE OXIGENO CON RESERVORIO ADULTO (AUTORIZADA POR COMISION TECNICA) 30 30
6 EQUIPO DE VENOCLISIS MACROGOTERO CON FILTRO (AUTORIZADA POR COMISION TECNICA) 80 80
7 SONDA FOLEY DE 2 VIAS 100% SILICONA NRO. 16 (AUTORIZADA POR COMISION TECNICA) 25 25
8 CANULA NASAL DE OXIGENO PARA ADULTO (AUTORIZADA POR COMISION TECNICA) 50 50
9 LLAVE DE TRES VIAS CON EXTENSION DE 10 CM (AUTORIZADA POR COMISION TECNICA) 60 60
10 SOLUCION CLORURO DE SODIO AL 0.9% 1000 ML BOLSA (AUTORIZADA POR COMISION TECNICA) 100 100

FirmaEC - Sistema Oficial de Firma Electrónica del Gobierno del Ecuador
Firmado electrónicamente por: MARIA BELEN CANTOS ESPINOZA
Validador de Integridad: FIRMAEC TIME STAMPING SECURITY DATA QR ELABORACION
Firmado electrónicamente por: DANIEL GUILLERMO DELEG SARI
Validador de Integridad: FIRMAEC TIME STAMPING SECURITY DATA QR APROBACION`;

export const SAMPLE_PDF_ITEMS: ExtractedPdfItem[] = [
  {
    nro: 1,
    dispositivoMedico: 'CATETER INTRAVENOSO PERIFERICO 20G X 1 1/4"',
    cantidadesSolicitadas: 120,
    cantidadesAprobadas: 100,
  },
  {
    nro: 2,
    dispositivoMedico: 'TUBO ENDOTRAQUEAL CON BALON NRO. 7.5',
    cantidadesSolicitadas: 40,
    cantidadesAprobadas: 35,
  },
  {
    nro: 3,
    dispositivoMedico: 'JERINGA DESCARTABLE DE 10 ML CON AGUJA 21G X 1 1/2"',
    cantidadesSolicitadas: 250,
    cantidadesAprobadas: 200,
  },
  {
    nro: 4,
    dispositivoMedico: 'GUANTES QUIRURGICOS ESTERILES NRO. 7.5',
    cantidadesSolicitadas: 150,
    cantidadesAprobadas: 150,
  },
  {
    nro: 5,
    dispositivoMedico: 'MASCARILLA DE OXIGENO CON RESERVORIO ADULTO',
    cantidadesSolicitadas: 30,
    cantidadesAprobadas: 30,
  },
  {
    nro: 6,
    dispositivoMedico: 'EQUIPO DE VENOCLISIS MACROGOTERO CON FILTRO',
    cantidadesSolicitadas: 80,
    cantidadesAprobadas: 80,
  },
  {
    nro: 7,
    dispositivoMedico: 'SONDA FOLEY DE 2 VIAS 100% SILICONA NRO. 16',
    cantidadesSolicitadas: 25,
    cantidadesAprobadas: 25,
  },
  {
    nro: 8,
    dispositivoMedico: 'CANULA NASAL DE OXIGENO PARA ADULTO',
    cantidadesSolicitadas: 50,
    cantidadesAprobadas: 50,
  },
  {
    nro: 9,
    dispositivoMedico: 'LLAVE DE TRES VIAS CON EXTENSION DE 10 CM',
    cantidadesSolicitadas: 60,
    cantidadesAprobadas: 60,
  },
  {
    nro: 10,
    dispositivoMedico: 'SOLUCION CLORURO DE SODIO AL 0.9% 1000 ML BOLSA',
    cantidadesSolicitadas: 100,
    cantidadesAprobadas: 100,
  },
];

export const SAMPLE_LOTES: LotRecord[] = [
  // 1. Cateter: Multiple lots with different expirations (FEFO test: L2026-A expires Nov 2026, L2027-B expires March 2027)
  {
    producto: 'CATETER INTRAVENOSO PERIFERICO 20G X 1 1/4"',
    lote: 'LOT-CAT-2601',
    fCad: '15/11/2026',
    fCadDate: new Date(2026, 10, 15),
    fCadFormatted: '15/11/2026',
    existen: 60,
    cleanName: cleanExact('CATETER INTRAVENOSO PERIFERICO 20G X 1 1/4"'),
  },
  {
    producto: 'CATETER INTRAVENOSO PERIFERICO 20G X 1 1/4"',
    lote: 'LOT-CAT-2703',
    fCad: '28/03/2027',
    fCadDate: new Date(2027, 2, 28),
    fCadFormatted: '28/03/2027',
    existen: 100,
    cleanName: cleanExact('CATETER INTRAVENOSO PERIFERICO 20G X 1 1/4"'),
  },
  // 2. Tubo endotraqueal: Shortage test! Approved 35, available only 20
  {
    producto: 'TUBO ENDOTRAQUEAL CON BALON NRO. 7.5',
    lote: 'LOT-TET-2708',
    fCad: '14/08/2027',
    fCadDate: new Date(2027, 7, 14),
    fCadFormatted: '14/08/2027',
    existen: 20,
    cleanName: cleanExact('TUBO ENDOTRAQUEAL CON BALON NRO. 7.5'),
  },
  // 3. Jeringa 10ml: Single lot with sufficient stock
  {
    producto: 'JERINGA DESCARTABLE DE 10 ML CON AGUJA 21G X 1 1/2"',
    lote: 'LOT-JER-2801',
    fCad: '10/01/2028',
    fCadDate: new Date(2028, 0, 10),
    fCadFormatted: '10/01/2028',
    existen: 500,
    cleanName: cleanExact('JERINGA DESCARTABLE DE 10 ML CON AGUJA 21G X 1 1/2"'),
  },
  // 4. Guantes quirurgicos: 2 lots
  {
    producto: 'GUANTES QUIRURGICOS ESTERILES NRO. 7.5',
    lote: 'LOT-GQ-2612',
    fCad: '05/12/2026',
    fCadDate: new Date(2026, 11, 5),
    fCadFormatted: '05/12/2026',
    existen: 100,
    cleanName: cleanExact('GUANTES QUIRURGICOS ESTERILES NRO. 7.5'),
  },
  {
    producto: 'GUANTES QUIRURGICOS ESTERILES NRO. 7.5',
    lote: 'LOT-GQ-2706',
    fCad: '20/06/2027',
    fCadDate: new Date(2027, 5, 20),
    fCadFormatted: '20/06/2027',
    existen: 80,
    cleanName: cleanExact('GUANTES QUIRURGICOS ESTERILES NRO. 7.5'),
  },
  // 5. Mascarilla reservorio: Zero stock test! (no lot) -> will test "SIN LOTE DISPONIBLE"
  // (omitted intentionally)
  // 6. Venoclisis macrogotero
  {
    producto: 'EQUIPO DE VENOCLISIS MACROGOTERO CON FILTRO',
    lote: 'LOT-VNC-2704',
    fCad: '12/04/2027',
    fCadDate: new Date(2027, 3, 12),
    fCadFormatted: '12/04/2027',
    existen: 120,
    cleanName: cleanExact('EQUIPO DE VENOCLISIS MACROGOTERO CON FILTRO'),
  },
  // 7. Sonda Foley
  {
    producto: 'SONDA FOLEY DE 2 VIAS 100% SILICONA NRO. 16',
    lote: 'LOT-SND-2710',
    fCad: '30/10/2027',
    fCadDate: new Date(2027, 9, 30),
    fCadFormatted: '30/10/2027',
    existen: 45,
    cleanName: cleanExact('SONDA FOLEY DE 2 VIAS 100% SILICONA NRO. 16'),
  },
  // 8. Canula nasal
  {
    producto: 'CANULA NASAL DE OXIGENO PARA ADULTO',
    lote: 'LOT-CNL-2611',
    fCad: '22/11/2026',
    fCadDate: new Date(2026, 10, 22),
    fCadFormatted: '22/11/2026',
    existen: 75,
    cleanName: cleanExact('CANULA NASAL DE OXIGENO PARA ADULTO'),
  },
  // 9. Llave 3 vias
  {
    producto: 'LLAVE DE TRES VIAS CON EXTENSION DE 10 CM',
    lote: 'LOT-LLV-2709',
    fCad: '18/09/2027',
    fCadDate: new Date(2027, 8, 18),
    fCadFormatted: '18/09/2027',
    existen: 90,
    cleanName: cleanExact('LLAVE DE TRES VIAS CON EXTENSION DE 10 CM'),
  },
  // 10. Cloruro de Sodio 0.9% 1000ml
  {
    producto: 'SOLUCION CLORURO DE SODIO AL 0.9% 1000 ML BOLSA',
    lote: 'LOT-SAL-2612',
    fCad: '31/12/2026',
    fCadDate: new Date(2026, 11, 31),
    fCadFormatted: '31/12/2026',
    existen: 80,
    cleanName: cleanExact('SOLUCION CLORURO DE SODIO AL 0.9% 1000 ML BOLSA'),
  },
  {
    producto: 'SOLUCION CLORURO DE SODIO AL 0.9% 1000 ML BOLSA',
    lote: 'LOT-SAL-2705',
    fCad: '15/05/2027',
    fCadDate: new Date(2027, 4, 15),
    fCadFormatted: '15/05/2027',
    existen: 150,
    cleanName: cleanExact('SOLUCION CLORURO DE SODIO AL 0.9% 1000 ML BOLSA'),
  },
];

export const SAMPLE_STOCK_BODEGA: StockBodegaRecord[] = [
  {
    producto: 'CATETER INTRAVENOSO PERIFERICO 20G X 1 1/4"',
    codigo: 'MED-001092',
    sku: 'SKU-CAT-20G',
    stockBodega: 160,
    cleanName: cleanExact('CATETER INTRAVENOSO PERIFERICO 20G X 1 1/4"'),
  },
  {
    producto: 'TUBO ENDOTRAQUEAL CON BALON NRO. 7.5',
    codigo: 'MED-002481',
    sku: 'SKU-TET-75',
    stockBodega: 20, // Low stock: generates shortage warning
    cleanName: cleanExact('TUBO ENDOTRAQUEAL CON BALON NRO. 7.5'),
  },
  {
    producto: 'JERINGA DESCARTABLE DE 10 ML CON AGUJA 21G X 1 1/2"',
    codigo: 'MED-003310',
    sku: 'SKU-JER-10ML',
    stockBodega: 500,
    cleanName: cleanExact('JERINGA DESCARTABLE DE 10 ML CON AGUJA 21G X 1 1/2"'),
  },
  {
    producto: 'GUANTES QUIRURGICOS ESTERILES NRO. 7.5',
    codigo: 'MED-004128',
    sku: 'SKU-GQ-75',
    stockBodega: 180,
    cleanName: cleanExact('GUANTES QUIRURGICOS ESTERILES NRO. 7.5'),
  },
  {
    producto: 'MASCARILLA DE OXIGENO CON RESERVORIO ADULTO',
    codigo: 'MED-005602',
    sku: 'SKU-MSK-RES',
    stockBodega: 0, // Zero stock: triggers red row
    cleanName: cleanExact('MASCARILLA DE OXIGENO CON RESERVORIO ADULTO'),
  },
  {
    producto: 'EQUIPO DE VENOCLISIS MACROGOTERO CON FILTRO',
    codigo: 'MED-006249',
    sku: 'SKU-VNC-MAC',
    stockBodega: 120,
    cleanName: cleanExact('EQUIPO DE VENOCLISIS MACROGOTERO CON FILTRO'),
  },
  {
    producto: 'SONDA FOLEY DE 2 VIAS 100% SILICONA NRO. 16',
    codigo: 'MED-007815',
    sku: 'SKU-SND-16',
    stockBodega: 45,
    cleanName: cleanExact('SONDA FOLEY DE 2 VIAS 100% SILICONA NRO. 16'),
  },
  {
    producto: 'CANULA NASAL DE OXIGENO PARA ADULTO',
    codigo: 'MED-008901',
    sku: 'SKU-CNL-ADU',
    stockBodega: 75,
    cleanName: cleanExact('CANULA NASAL DE OXIGENO PARA ADULTO'),
  },
  {
    producto: 'LLAVE DE TRES VIAS CON EXTENSION DE 10 CM',
    codigo: 'MED-009144',
    sku: 'SKU-LLV-10C',
    stockBodega: 90,
    cleanName: cleanExact('LLAVE DE TRES VIAS CON EXTENSION DE 10 CM'),
  },
  {
    producto: 'SOLUCION CLORURO DE SODIO AL 0.9% 1000 ML BOLSA',
    codigo: 'MED-010055',
    sku: 'SKU-SAL-1000',
    stockBodega: 230,
    cleanName: cleanExact('SOLUCION CLORURO DE SODIO AL 0.9% 1000 ML BOLSA'),
  },
];

/**
 * Generates downloadable Excel template for Lotes
 */
export function generateSampleLotesExcelBlob(): Blob {
  const wsData = [
    ['Producto', 'Lote', 'F. Cad', 'Existen'],
    ...SAMPLE_LOTES.map((l) => [l.producto, l.lote, l.fCadFormatted || l.fCad, l.existen]),
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Lotes');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Generates downloadable Excel template for Stock Bodega
 */
export function generateSampleStockExcelBlob(): Blob {
  const wsData = [
    ['Código', 'SKU', 'Producto', 'BODEGA GENERAL'],
    ...SAMPLE_STOCK_BODEGA.map((s) => [s.codigo, s.sku, s.producto, s.stockBodega]),
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Stock');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
