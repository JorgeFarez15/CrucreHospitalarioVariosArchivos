import ExcelJS from 'exceljs';
import { CrossResultRow } from '../types/fefo';

/**
 * Generates the stylized Excel file exactly matching the Python openpyxl specification.
 *
 * Headers: ['Nro.', 'Código', 'SKU', 'Dispositivo Médico', 'Cant. Solicitada', 'Cant. Aprobada', 'Lotes y Cantidades a Despachar', 'Fechas de Caducidad', 'Stock Bodega']
 * Colors:
 * - Header fill: #1F4E78 (Navy blue), Font: Calibri 11pt Bold White #FFFFFF
 * - Red row fill (for zero stock or shortages): #FCE4D6, Font: Calibri 11pt Bold #C00000
 * - Normal font: Calibri 11pt
 * - Border: thin #D9D9D9
 */
export async function generateStyledExcel(
  items: CrossResultRow[],
  servicioNombre: string = 'DESPACHO'
): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Hospital Vicente Corral Moscoso - Sistema FEFO';
  wb.created = new Date();

  const ws = wb.addWorksheet('Despacho FEFO', {
    views: [{ showGridLines: true }],
  });

  const headers = [
    'Nro.',
    'Código',
    'SKU',
    'Dispositivo Médico',
    'Cant. Solicitada',
    'Cant. Aprobada',
    'Lotes y Cantidades a Despachar',
    'Fechas de Caducidad',
    'Stock Bodega',
  ];

  // Set column widths
  ws.columns = [
    { key: 'nro', width: 8 },
    { key: 'codigo', width: 16 },
    { key: 'sku', width: 16 },
    { key: 'dispositivo', width: 45 },
    { key: 'cantSol', width: 16 },
    { key: 'cantAp', width: 16 },
    { key: 'lotes', width: 40 },
    { key: 'fechas', width: 30 },
    { key: 'stockBodega', width: 16 },
  ];

  // Add header row
  const headerRow = ws.addRow(headers);
  headerRow.height = 26;

  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' },
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  };

  for (let col = 1; col <= headers.length; col++) {
    const cell = headerRow.getCell(col);
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderThin;
  }

  const redFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFCE4D6' },
  };

  const redFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFC00000' },
  };

  const normalFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 11,
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isZeroStock = item.alertaRojo || item.stockBodega <= 0;

    const rowData = [
      item.nro,
      item.codigo,
      item.sku,
      item.dispositivoMedico,
      item.cantSolicitada,
      item.cantAprobada,
      item.lotesYCantidades,
      item.fechasCaducidad,
      item.stockBodega,
    ];

    const row = ws.addRow(rowData);
    row.height = 22;

    for (let col = 1; col <= headers.length; col++) {
      const cell = row.getCell(col);
      cell.border = borderThin;

      if (isZeroStock) {
        cell.fill = redFill;
        cell.font = redFont;
      } else {
        cell.font = normalFont;
      }

      // Alignment rules
      if (col === 1 || col === 2 || col === 3) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (col === 5 || col === 6 || col === 9) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }
    }
  }

  // Generate buffer
  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Triggers automatic browser download of the blob
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
