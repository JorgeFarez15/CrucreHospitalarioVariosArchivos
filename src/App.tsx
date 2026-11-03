import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUploadSection } from './components/FileUploadSection';
import { StatsOverview } from './components/StatsOverview';
import { ResultsTable } from './components/ResultsTable';
import { SignaturesCard } from './components/SignaturesCard';
import { OfficialActaPreviewModal } from './components/OfficialActaPreviewModal';
import { RawTextInspectorModal } from './components/RawTextInspectorModal';
import {
  CrossProcessingResult,
  SignaturesInfo,
  LotRecord,
  StockBodegaRecord,
} from './types/fefo';
import { extractTextFromPdf, parseHospitalPdfText } from './services/pdfParser';
import { parseExcelLotes, parseExcelUnificado } from './services/excelParser';
import { executeFefoCross } from './services/fefoEngine';
import { generateStyledExcel, downloadFile } from './services/excelGenerator';
import { generateOfficialActaPdf } from './services/pdfGenerator';
import {
  SAMPLE_PDF_ITEMS,
  SAMPLE_LOTES,
  SAMPLE_STOCK_BODEGA,
  SAMPLE_SIGNATURES,
  SAMPLE_SERVICIO_NOMBRE,
  SAMPLE_RAW_PDF_TEXT,
} from './services/sampleData';
import { AlertCircle, FileCheck, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export default function App() {
  const [result, setResult] = useState<CrossProcessingResult | null>(null);
  const [cachedLotes, setCachedLotes] = useState<LotRecord[]>([]);
  const [cachedUnificado, setCachedUnificado] = useState<StockBodegaRecord[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showInspectorModal, setShowInspectorModal] = useState<boolean>(false);

  // Load demo data
  const handleLoadDemo = () => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const cross = executeFefoCross(
          SAMPLE_PDF_ITEMS,
          SAMPLE_LOTES,
          SAMPLE_STOCK_BODEGA,
          SAMPLE_SIGNATURES,
          SAMPLE_SERVICIO_NOMBRE,
          SAMPLE_RAW_PDF_TEXT
        );
        setCachedLotes(SAMPLE_LOTES);
        setCachedUnificado(SAMPLE_STOCK_BODEGA);
        setResult(cross);
      } catch (err: unknown) {
        console.error(err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Error al procesar los datos de demostración'
        );
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  // Process user uploaded files
  const handleProcessFiles = async (
    pdfFile: File | null,
    lotesFile: File | null,
    stockFile: File | null
  ) => {
    if (!pdfFile || !lotesFile || !stockFile) {
      setErrorMessage('Por favor seleccione los 3 archivos requeridos');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Read files into ArrayBuffers
      const [pdfBytes, lotesBytes, stockBytes] = await Promise.all([
        pdfFile.arrayBuffer(),
        lotesFile.arrayBuffer(),
        stockFile.arrayBuffer(),
      ]);

      // 2. Extract text from PDF
      const pdfRawText = await extractTextFromPdf(pdfBytes);
      if (!pdfRawText || pdfRawText.trim().length === 0) {
        throw new Error(
          'No se pudo extraer texto legible del archivo PDF. Verifique que no sea un documento escaneado solo como imagen.'
        );
      }

      // 3. Parse PDF service name, signatures, and items
      const { servicioNombre, signatures, items: pdfItems } = parseHospitalPdfText(pdfRawText);

      if (pdfItems.length === 0) {
        throw new Error(
          'No se pudieron identificar ítems en el formato del PDF (se esperaba tabla con Nro., Descripción y cantidades). Puede inspeccionar el texto en la pestaña de depuración.'
        );
      }

      // 4. Parse Excel files
      const lotes = parseExcelLotes(lotesBytes);
      const unificado = parseExcelUnificado(stockBytes);

      if (lotes.length === 0) {
        throw new Error(
          'El archivo Excel de Lotes no contiene registros válidos o no tiene las columnas esperadas (Producto, Lote, F. Cad, Existen).'
        );
      }

      if (unificado.length === 0) {
        throw new Error(
          'El archivo Excel de Stock Bodega no contiene registros válidos o no tiene las columnas requeridas (Código, SKU, Producto, Bodega).'
        );
      }

      // 5. Execute FEFO Cross
      const crossResult = executeFefoCross(
        pdfItems,
        lotes,
        unificado,
        signatures,
        servicioNombre,
        pdfRawText
      );

      setCachedLotes(lotes);
      setCachedUnificado(unificado);
      setResult(crossResult);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al procesar los archivos hospitalarios.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Re-process with customized raw text
  const handleReprocessWithText = (newText: string) => {
    if (!newText.trim()) return;
    try {
      const { servicioNombre, signatures, items: pdfItems } = parseHospitalPdfText(newText);
      const lotes = cachedLotes.length > 0 ? cachedLotes : SAMPLE_LOTES;
      const unificado = cachedUnificado.length > 0 ? cachedUnificado : SAMPLE_STOCK_BODEGA;

      const cross = executeFefoCross(
        pdfItems,
        lotes,
        unificado,
        signatures,
        servicioNombre,
        newText
      );
      setResult(cross);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Error al reprocesar el texto modificado.'
      );
    }
  };

  // Update signatures and service
  const handleUpdateSignatures = (newSignatures: SignaturesInfo, newServicio: string) => {
    if (!result) return;
    setResult({
      ...result,
      signatures: newSignatures,
      servicioNombre: newServicio,
    });
  };

  // Download styled Excel
  const handleDownloadExcel = async () => {
    if (!result) return;
    const blob = await generateStyledExcel(result.items, result.servicioNombre);
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanServ = (result.servicioNombre || 'GENERAL').replace(/[^a-zA-Z0-9]/g, '_');
    downloadFile(blob, `Despacho_FEFO_${cleanServ}_${dateStr}.xlsx`);
  };

  // Download official Acta PDF
  const handleDownloadPdf = () => {
    if (!result) return;
    const blob = generateOfficialActaPdf(result.items, result.signatures, result.servicioNombre);
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanServ = (result.servicioNombre || 'GENERAL').replace(/[^a-zA-Z0-9]/g, '_');
    downloadFile(blob, `Acta_Oficial_FEFO_${cleanServ}_${dateStr}.pdf`);
  };

  const handleReset = () => {
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Institutional Header */}
      <Header
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        hasData={Boolean(result)}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error notification */}
        {errorMessage && (
          <div className="bg-red-950/60 border border-red-700/60 text-red-200 px-4 py-3.5 rounded-xl shadow-lg flex items-start gap-3 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block text-red-300">
                Aviso de procesamiento:
              </strong>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200 text-xs font-semibold underline ml-2"
            >
              Entendido
            </button>
          </div>
        )}

        {/* File Upload Section */}
        <FileUploadSection
          onProcess={handleProcessFiles}
          onLoadDemo={handleLoadDemo}
          isLoading={isLoading}
          hasResults={Boolean(result)}
        />

        {/* If results available, show Statistics, Signatures, and Matrix Table */}
        {result ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Executive Stats Overview */}
            <StatsOverview data={result} />

            {/* Signatures & Service Banner */}
            <SignaturesCard
              signatures={result.signatures}
              servicioNombre={result.servicioNombre}
              onUpdateSignatures={handleUpdateSignatures}
            />

            {/* Results Table */}
            <ResultsTable
              data={result}
              onDownloadExcel={handleDownloadExcel}
              onDownloadPdf={handleDownloadPdf}
              onPreviewActa={() => setShowPreviewModal(true)}
              onInspectRawText={() => setShowInspectorModal(true)}
            />
          </div>
        ) : (
          /* Empty State Guide */
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 sm:p-12 text-center shadow-lg">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-950/60 border border-blue-700/40 text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Flujo Normado de Cruce Hospitalario FEFO
              </h3>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                Este sistema procesa la solicitud del servicio médico, extrae los nombres de firmas electrónicas (FirmaEC), cruza contra el inventario de lotes bajo el criterio legal de caducidad (FEFO) y genera el Acta Oficial PDF y el Excel formateado.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-950 flex items-center justify-center border border-blue-700/50">
                      1
                    </span>
                    Lectura de PDF & Firmas
                  </div>
                  <p className="text-xs text-slate-400">
                    Extracción de ítems autorizados, servicio solicitante y nombres de FirmaEC.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-700/50">
                      2
                    </span>
                    Asignación FEFO
                  </div>
                  <p className="text-xs text-slate-400">
                    Prioriza lotes más próximos a caducar y detecta faltantes o quiebres en bodega.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-950 flex items-center justify-center border border-indigo-700/50">
                      3
                    </span>
                    Emisión de Actas
                  </div>
                  <p className="text-xs text-slate-400">
                    Generación de Acta oficial en PDF para firmas y archivo Excel con resaltados.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleLoadDemo}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-105"
                >
                  <span>Probar Caso Ejemplo de Emergencia</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              Hospital Provincial General Docente Vicente Corral Moscoso &bull; MSP Ecuador
            </span>
          </div>
          <div>
            Dispensación y Cruce de Stock FEFO &bull; Farmacia y Bodega Institucional
          </div>
        </div>
      </footer>

      {/* Preview Modal */}
      {showPreviewModal && result && (
        <OfficialActaPreviewModal
          data={result}
          onClose={() => setShowPreviewModal(false)}
          onDownloadPdf={handleDownloadPdf}
        />
      )}

      {/* Raw Text Inspector Modal */}
      {showInspectorModal && result && (
        <RawTextInspectorModal
          data={result}
          onClose={() => setShowInspectorModal(false)}
          onReprocessText={handleReprocessWithText}
        />
      )}
    </div>
  );
}
