export interface ExtractedPdfItem {
  nro: number;
  dispositivoMedico: string;
  cantidadesSolicitadas: number;
  cantidadesAprobadas: number;
  cleanName?: string;
}

export interface LotRecord {
  producto: string;
  lote: string;
  fCad: string | Date | number;
  fCadDate?: Date | null;
  fCadFormatted?: string;
  existen: number;
  cleanName: string;
}

export interface StockBodegaRecord {
  producto: string;
  codigo: string;
  sku: string;
  stockBodega: number;
  cleanName: string;
}

export interface LotAllocation {
  lote: string;
  cantidad: number;
  fechaCaducidad: string;
  fechaCaducidadDate?: Date | null;
  diasParaCaducar?: number | null;
}

export interface CrossResultRow {
  nro: number;
  codigo: string;
  sku: string;
  dispositivoMedico: string;
  cantSolicitada: number;
  cantAprobada: number;
  cantDespachada: number;
  lotesYCantidades: string;
  fechasCaducidad: string;
  stockBodega: number;
  alertaRojo: boolean;
  motivoAlerta?: string;
  allocations: LotAllocation[];
  faltante: number;
}

export interface SignaturesInfo {
  elaboradoPor: string;
  entregadoPor: string;
  validadoPor: string;
  servicioSolicitante: string;
  fechaEmision: string;
  rawFirmantes: string[];
}

export interface CrossProcessingResult {
  servicioNombre: string;
  signatures: SignaturesInfo;
  items: CrossResultRow[];
  totalSolicitado: number;
  totalAprobado: number;
  totalDespachado: number;
  totalAlertas: number;
  pdfRawText: string;
}
