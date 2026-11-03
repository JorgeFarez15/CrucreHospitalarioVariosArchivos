import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CrossResultRow, SignaturesInfo } from '../types/fefo';

/**
 * Generates the Official Hospital Acta in PDF format, exactly matching
 * the Python reportlab layout:
 * - Hospital title and subtitle in #1F4E78
 * - Metadata header: SERVICIO SOLICITANTE & FECHA EMISIÓN
 * - Exact table columns with widths: [25, 55, 175, 42, 145, 80, 50]
 * - Red warning text (#C00000) for items with 0 stock or shortages
 * - Institutional 3-signature block: ELABORÓ, ENTREGADO POR BODEGA, VALIDÓ / AUTORIZÓ
 */
export function generateOfficialActaPdf(
  items: CrossResultRow[],
  signatures: SignaturesInfo,
  servicioNombre: string
): Blob {
  // Letter size in points: 612 x 792 pt
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 18;
  let currentY = 28;

  // 1. Hospital Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(31, 78, 120); // #1F4E78
  doc.text(
    'HOSPITAL PROVINCIAL GENERAL DOCENTE VICENTE CORRAL MOSCOSO',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  currentY += 13;
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(
    'ACTA OFICIAL DE DISPENSACIÓN Y CRUCE DE STOCK (CRITERIO FEFO)',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  currentY += 15;
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  const servClean = servicioNombre || signatures.servicioSolicitante || 'GENERAL';
  const fechaStr = signatures.fechaEmision || new Date().toLocaleString('es-EC');

  // Metadata Line
  doc.setFont('helvetica', 'bold');
  const metaText1 = `SERVICIO SOLICITANTE: `;
  const metaText2 = `${servClean}        |        FECHA EMISIÓN: `;
  const metaText3 = `${fechaStr}`;

  doc.text(`${metaText1}${metaText2}${metaText3}`, marginX, currentY);

  currentY += 8;

  // 2. Table Data Preparation
  const headers = [
    'Nro.',
    'Código',
    'Dispositivo Médico',
    'Cant. Ap.',
    'Lotes y Cantidades a Despachar',
    'Fechas Caducidad',
    'Stock Bodega',
  ];

  const bodyData = items.map((row) => {
    return [
      String(row.nro),
      row.codigo,
      row.dispositivoMedico,
      String(Math.round(row.cantAprobada)),
      row.lotesYCantidades,
      row.fechasCaducidad,
      Number(row.stockBodega).toLocaleString('en-US', { maximumFractionDigits: 0 }),
    ];
  });

  // Table with exact widths and styles
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [headers],
    body: bodyData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 3,
      lineColor: [217, 217, 217],
      lineWidth: 0.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [31, 78, 120], // #1F4E78
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 55, halign: 'center' },
      2: { cellWidth: 175, halign: 'left' },
      3: { cellWidth: 42, halign: 'center' },
      4: { cellWidth: 145, halign: 'left' },
      5: { cellWidth: 80, halign: 'left' },
      6: { cellWidth: 54, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const item = items[rowIndex];
        if (item && (item.alertaRojo || item.stockBodega <= 0)) {
          data.cell.styles.textColor = [192, 0, 0]; // #C00000
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Last Y position after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : currentY + 200;

  // Ensure enough space for the signature block (needs ~90pt)
  const signatureHeight = 90;
  if (finalY + signatureHeight > pageHeight - 30) {
    doc.addPage();
    finalY = 40;
  } else {
    finalY += 24;
  }

  // 3. Official 3-Column Signature Block
  const colWidth = (pageWidth - marginX * 2) / 3;
  const yLine = finalY + 45;
  const yName = yLine + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  // Column 1: Elaboró
  const x1 = marginX + colWidth / 2;
  doc.text('ELABORÓ / RECIBIDO CONFORME:', x1, finalY, { align: 'center' });
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.75);
  doc.line(marginX + 15, yLine, marginX + colWidth - 15, yLine);
  doc.setFontSize(7);
  doc.text(signatures.elaboradoPor || 'RESPONSABLE DE SERVICIO', x1, yName, {
    align: 'center',
    maxWidth: colWidth - 20,
  });

  // Column 2: Entregado
  const x2 = marginX + colWidth + colWidth / 2;
  doc.setFontSize(7.5);
  doc.text('ENTREGADO POR BODEGA:', x2, finalY, { align: 'center' });
  doc.line(marginX + colWidth + 15, yLine, marginX + colWidth * 2 - 15, yLine);
  doc.setFontSize(7);
  doc.text(signatures.entregadoPor || 'GUARDALMACÉN / DESPACHADOR', x2, yName, {
    align: 'center',
    maxWidth: colWidth - 20,
  });

  // Column 3: Validó
  const x3 = marginX + colWidth * 2 + colWidth / 2;
  doc.setFontSize(7.5);
  doc.text('VALIDÓ / AUTORIZÓ:', x3, finalY, { align: 'center' });
  doc.line(marginX + colWidth * 2 + 15, yLine, marginX + colWidth * 3 - 15, yLine);
  doc.setFontSize(7);
  doc.text(signatures.validadoPor || 'COORDINACIÓN MÉDICA / FARMACIA', x3, yName, {
    align: 'center',
    maxWidth: colWidth - 20,
  });

  // Add subtle page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Página ${p} de ${totalPages} — Sistema de Cruce Hospitalario FEFO — Hospital Vicente Corral Moscoso`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );
  }

  const pdfOutput = doc.output('blob');
  return pdfOutput;
}
