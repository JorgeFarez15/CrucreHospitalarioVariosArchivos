import * as pdfjsLib from 'pdfjs-dist';
import { ExtractedPdfItem, SignaturesInfo } from '../types/fefo';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    // Standard CDN worker matching installed pdfjs version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Worker initialization warning:', e);
  }
}

/**
 * Extracts raw text from an ArrayBuffer containing a PDF
 */
export async function extractTextFromPdf(pdfBytes: ArrayBuffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBytes),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageStrings = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .filter(Boolean);
    fullText += pageStrings.join(' ') + '\n';
  }

  return fullText;
}

/**
 * Extracts service name, digital signatures, and requested items matching
 * the hospital's Python script specifications.
 */
export function parseHospitalPdfText(pdfText: string): {
  servicioNombre: string;
  signatures: SignaturesInfo;
  items: ExtractedPdfItem[];
} {
  // 1. Servicio Solicitante
  let servicioNombre = 'GENERAL';
  const matchServ = pdfText.match(/Servicio\s*[:]\s*([^\r\n]+)/i);
  if (matchServ && matchServ[1]) {
    let rawServ = matchServ[1].trim();
    const stopWords = ['FECHA', 'NRO', 'VERSIÓN', 'VERSION', 'CÓDIGO', 'CODIGO'];
    for (const stopWord of stopWords) {
      const idx = rawServ.toUpperCase().indexOf(stopWord);
      if (idx !== -1) {
        rawServ = rawServ.substring(0, idx).trim();
      }
    }
    if (rawServ.length > 1) {
      servicioNombre = rawServ;
    }
  }

  // 2. Firmas Electrónicas (FirmaEC / Firmado electrónicamente por...)
  const firmantesEncontrados: string[] = [];
  const textoPlanoContinuo = pdfText.replace(/[\r\n]+/g, ' ');

  const firmaRegex = /(?:Firmado\s+electr[oó]nicamente\s+por|por\s*[:])\s*([A-ZÁÉÍÓÚÑ\s]{5,50})/gi;
  let matchFirma: RegExpExecArray | null;
  while ((matchFirma = firmaRegex.exec(textoPlanoContinuo)) !== null) {
    const candidato = matchFirma[1].trim();
    const palabras = candidato
      .split(/\s+/)
      .filter(
        (w) =>
          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(w) &&
          w.length > 1 &&
          ![
            'VALIDAR',
            'UNICAMENTE',
            'FIRMAEC',
            'TIME',
            'STAMPING',
            'SECURITY',
            'DATA',
            'QR',
            'POR',
            'DE',
            'DEL',
            'LA',
            'LAS',
            'LOS',
            'EL',
            'Y',
          ].includes(w.toUpperCase())
      );

    if (palabras.length >= 2) {
      const nombreValido = palabras.slice(0, 4).join(' ').toUpperCase();
      if (!firmantesEncontrados.includes(nombreValido)) {
        firmantesEncontrados.push(nombreValido);
      }
    }
  }

  // Fallback a nombres conocidos del hospital Vicente Corral Moscoso
  if (firmantesEncontrados.length < 2) {
    const lines = pdfText.split('\n');
    const knownNames = [
      'CANTOS ESPINOZA',
      'DELEG SARI',
      'YUQUILIMA PUMA',
      'CABRERA ZENTENO',
      'ROJAS BURI',
    ];
    for (const line of lines) {
      const lUp = line.trim().toUpperCase();
      for (const kn of knownNames) {
        if (lUp.includes(kn) && !firmantesEncontrados.includes(lUp)) {
          firmantesEncontrados.push(lUp);
        }
      }
    }
  }

  const elaboradoPor =
    firmantesEncontrados.length > 0
      ? firmantesEncontrados[0]
      : 'RESPONSABLE DE SERVICIO';

  const validadoPor =
    firmantesEncontrados.length > 1
      ? firmantesEncontrados[1]
      : servicioNombre.toUpperCase().includes('EMERGENCIA')
      ? 'DANIEL GUILLERMO DELEG SARI'
      : 'XIMENA KARINA CABRERA ZENTENO';

  const entregadoPor = 'GUARDALMACÉN / DESPACHADOR';

  // 3. Extracción de Ítems desde "Nro."
  const idxTabla = pdfText.indexOf('Nro.');
  const textoItems = idxTabla !== -1 ? pdfText.substring(idxTabla) : pdfText;
  let cleanBlob = textoItems.replace(/\s+/g, ' ');

  const itemsExtraidos: ExtractedPdfItem[] = [];

  // Método A: Regex oficial con (AUTORIZADA...)
  for (let i = 1; i < 100; i++) {
    const patternItem = new RegExp(
      `(?:^|\\s)${i}\\s+(.+?)\\s*\\(\\s*AUTORIZADA[^\\)]*\\)\\s*(\\d+)\\s+(\\d+)`,
      'i'
    );
    const m = cleanBlob.match(patternItem);
    if (m) {
      const desc = m[1].trim();
      const sol = parseInt(m[2], 10);
      const aprob = parseInt(m[3], 10);

      itemsExtraidos.push({
        nro: i,
        dispositivoMedico: desc,
        cantidadesSolicitadas: sol,
        cantidadesAprobadas: aprob,
      });

      cleanBlob = cleanBlob.replace(m[0], '');
    } else {
      if (i > 3 && itemsExtraidos.length > 0) {
        break;
      }
    }
  }

  // Método B: Si el PDF viene sin la etiqueta "(AUTORIZADA...)", intentar extracción tabular estándar
  if (itemsExtraidos.length === 0) {
    let fallbackBlob = textoItems.replace(/\s+/g, ' ');
    for (let i = 1; i < 100; i++) {
      const regexB = new RegExp(
        `(?:^|\\s)${i}\\s+([A-ZÁÉÍÓÚÑ0-9\\-\\.\\,\\/\\%\\s]{6,120}?)\\s+(\\d+)\\s+(\\d+)(?:\\s|$)`,
        'i'
      );
      const m = fallbackBlob.match(regexB);
      if (m) {
        itemsExtraidos.push({
          nro: i,
          dispositivoMedico: m[1].trim(),
          cantidadesSolicitadas: parseInt(m[2], 10),
          cantidadesAprobadas: parseInt(m[3], 10),
        });
        fallbackBlob = fallbackBlob.replace(m[0], '');
      } else {
        if (i > 3 && itemsExtraidos.length > 0) break;
      }
    }
  }

  const now = new Date();
  const fechaEmision = `${String(now.getDate()).padStart(2, '0')}/${String(
    now.getMonth() + 1
  ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
    2,
    '0'
  )}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    servicioNombre,
    signatures: {
      elaboradoPor,
      entregadoPor,
      validadoPor,
      servicioSolicitante: servicioNombre,
      fechaEmision,
      rawFirmantes: firmantesEncontrados,
    },
    items: itemsExtraidos,
  };
}
