import * as XLSX from 'xlsx';
import { LotRecord, StockBodegaRecord } from '../types/fefo';

/**
 * Text normalization matching Python clean_exact:
 * unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode("utf-8").upper().strip()
 */
export function cleanExact(s: unknown): string {
  if (s === null || s === undefined) return '';
  const str = String(s);
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses any date representation (Excel serial number, ISO string, DD/MM/YYYY, etc.)
 */
export function parseDateSafe(val: unknown): { date: Date | null; formatted: string } {
  if (!val) {
    return { date: null, formatted: 'S/F' };
  }

  // If already a Date object
  if (val instanceof Date && !isNaN(val.getTime())) {
    return {
      date: val,
      formatted: formatDateDDMMYYYY(val),
    };
  }

  // If Excel numeric serial date (e.g. 45000)
  if (typeof val === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + val * 86400000);
    if (!isNaN(date.getTime())) {
      return {
        date,
        formatted: formatDateDDMMYYYY(date),
      };
    }
  }

  const str = String(val).trim();

  // Try parsing DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (ddmmyyyy) {
    const d = parseInt(ddmmyyyy[1], 10);
    const m = parseInt(ddmmyyyy[2], 10) - 1;
    const y = parseInt(ddmmyyyy[3], 10);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) {
      return {
        date,
        formatted: formatDateDDMMYYYY(date),
      };
    }
  }

  // Try parsing YYYY-MM-DD
  const yyyymmdd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (yyyymmdd) {
    const y = parseInt(yyyymmdd[1], 10);
    const m = parseInt(yyyymmdd[2], 10) - 1;
    const d = parseInt(yyyymmdd[3], 10);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) {
      return {
        date,
        formatted: formatDateDDMMYYYY(date),
      };
    }
  }

  // Fallback to standard Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return {
      date: parsed,
      formatted: formatDateDDMMYYYY(parsed),
    };
  }

  return { date: null, formatted: str };
}

export function formatDateDDMMYYYY(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Safe Excel reader that converts sheet to row objects
 */
export function readExcelRows(fileBytes: ArrayBuffer): Record<string, unknown>[] {
  const wb = XLSX.read(fileBytes, { type: 'array', cellDates: true });
  const firstSheetName = wb.SheetNames[0];
  const worksheet = wb.Sheets[firstSheetName];
  if (!worksheet) return [];

  return XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
}

/**
 * Parses the Excel Lotes file
 */
export function parseExcelLotes(fileBytes: ArrayBuffer): LotRecord[] {
  const rows = readExcelRows(fileBytes);
  if (rows.length === 0) return [];

  // Find column names dynamically
  const sample = rows[0] || {};
  const keys = Object.keys(sample);

  const prodKey =
    keys.find((k) => cleanExact(k).includes('PRODUCTO') || cleanExact(k).includes('DISPOSITIVO')) ||
    keys[0];

  const loteKey =
    keys.find((k) => cleanExact(k).includes('LOTE') || cleanExact(k).includes('BATCH')) ||
    keys[1] ||
    'Lote';

  const fCadKey =
    keys.find(
      (k) =>
        cleanExact(k).includes('CAD') ||
        cleanExact(k).includes('VENC') ||
        cleanExact(k).includes('EXP')
    ) || 'F. Cad';

  const existenKey =
    keys.find(
      (k) =>
        cleanExact(k).includes('EXISTEN') ||
        cleanExact(k).includes('STOCK') ||
        cleanExact(k).includes('CANT') ||
        cleanExact(k).includes('SALDO')
    ) || 'Existen';

  const lotRecords: LotRecord[] = [];

  for (const row of rows) {
    const rawProd = row[prodKey];
    if (!rawProd || String(rawProd).trim() === '') continue;

    const rawLote = String(row[loteKey] || 'S/L').trim();
    const rawFCad = row[fCadKey];
    const { date, formatted } = parseDateSafe(rawFCad);

    const rawExisten = row[existenKey];
    const existen = parseFloat(String(rawExisten).replace(/,/g, '')) || 0;

    lotRecords.push({
      producto: String(rawProd).trim(),
      lote: rawLote,
      fCad: formatted,
      fCadDate: date,
      fCadFormatted: formatted,
      existen,
      cleanName: cleanExact(rawProd),
    });
  }

  return lotRecords;
}

/**
 * Parses the Excel Unificado (Master Catalog / Stock Bodega)
 */
export function parseExcelUnificado(fileBytes: ArrayBuffer): StockBodegaRecord[] {
  const rows = readExcelRows(fileBytes);
  if (rows.length === 0) return [];

  const sample = rows[0] || {};
  const keys = Object.keys(sample);

  const prodKey =
    keys.find((k) => cleanExact(k).includes('PRODUCTO') || cleanExact(k).includes('DESCRIP')) ||
    keys[0];

  const codKey =
    keys.find((k) => cleanExact(k).includes('COD') || cleanExact(k).includes('ITEM')) ||
    'Código';

  const skuKey =
    keys.find((k) => cleanExact(k).includes('SKU')) || 'SKU';

  // Find column with 'BOD' or 'FARM' in upper case
  const bodegaKey =
    keys.find((k) => {
      const cu = cleanExact(k);
      return cu.includes('BOD') || cu.includes('FARM');
    }) || keys[keys.length - 1];

  const stockRecords: StockBodegaRecord[] = [];

  for (const row of rows) {
    const rawProd = row[prodKey];
    if (!rawProd || String(rawProd).trim() === '') continue;

    const rawCod = row[codKey] || 'SIN-CODIGO';
    const rawSku = row[skuKey] || 'SIN-SKU';
    const rawStock = row[bodegaKey];
    const stockBodega = parseFloat(String(rawStock).replace(/,/g, '')) || 0.0;

    stockRecords.push({
      producto: String(rawProd).trim(),
      codigo: String(rawCod).trim(),
      sku: String(rawSku).trim(),
      stockBodega,
      cleanName: cleanExact(rawProd),
    });
  }

  return stockRecords;
}
