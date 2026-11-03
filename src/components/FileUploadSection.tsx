import React, { useRef, useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface FileUploadSectionProps {
  onProcess: (
    pdfFile: File | null,
    lotesFile: File | null,
    stockFile: File | null
  ) => Promise<void>;
  onLoadDemo: () => void;
  isLoading: boolean;
  hasResults: boolean;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onProcess,
  onLoadDemo,
  isLoading,
  hasResults,
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [lotesFile, setLotesFile] = useState<File | null>(null);
  const [stockFile, setStockFile] = useState<File | null>(null);

  const [dragOverCard, setDragOverCard] = useState<string | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const lotesInputRef = useRef<HTMLInputElement>(null);
  const stockInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent, card: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragOverCard(card);
    } else if (e.type === 'dragleave') {
      setDragOverCard(null);
    }
  };

  const handleDrop = (e: React.DragEvent, card: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCard(null);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (card === 'pdf') {
        if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
          setPdfFile(file);
        } else {
          alert('Por favor suba un archivo PDF válido');
        }
      } else if (card === 'lotes') {
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          setLotesFile(file);
        } else {
          alert('Por favor suba un archivo Excel (.xlsx o .xls)');
        }
      } else if (card === 'stock') {
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          setStockFile(file);
        } else {
          alert('Por favor suba un archivo Excel (.xlsx o .xls)');
        }
      }
    }
  };

  const allFilesSelected = Boolean(pdfFile && lotesFile && stockFile);

  const handleExecute = () => {
    if (!allFilesSelected) return;
    onProcess(pdfFile, lotesFile, stockFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30">
              1
            </span>
            Carga de Archivos Hospitalarios
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arrastre o seleccione los 3 archivos requeridos para el cruce FEFO institucional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-950 text-blue-300 hover:bg-blue-900/80 border border-blue-700/50 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Usar archivos de demostración</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: PDF Pedido */}
        <div
          onDragEnter={(e) => handleDrag(e, 'pdf')}
          onDragLeave={(e) => handleDrag(e, 'pdf')}
          onDragOver={(e) => handleDrag(e, 'pdf')}
          onDrop={(e) => handleDrop(e, 'pdf')}
          onClick={() => pdfInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200 ${
            dragOverCard === 'pdf'
              ? 'border-blue-500 bg-blue-950/40'
              : pdfFile
              ? 'border-emerald-500/50 bg-emerald-950/20'
              : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70'
          }`}
        >
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setPdfFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                pdfFile
                  ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-600/40'
                  : 'bg-red-900/20 text-red-400 border border-red-700/30'
              }`}
            >
              <FileText className="w-6 h-6" />
            </div>

            <span className="text-xs font-bold text-white tracking-wide uppercase">
              1. Solicitud PDF (Pedido)
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Documento con firmas FirmaEC
            </span>

            {pdfFile ? (
              <div className="mt-3.5 w-full bg-slate-800/80 rounded-lg p-2.5 border border-slate-700 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate text-xs font-medium text-emerald-300">
                    {pdfFile.name}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 pl-6">
                  {formatFileSize(pdfFile.size)} &bull; Listo para extraer
                </div>
              </div>
            ) : (
              <div className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                <Upload className="w-3.5 h-3.5" /> Seleccionar PDF
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Excel Lotes */}
        <div
          onDragEnter={(e) => handleDrag(e, 'lotes')}
          onDragLeave={(e) => handleDrag(e, 'lotes')}
          onDragOver={(e) => handleDrag(e, 'lotes')}
          onDrop={(e) => handleDrop(e, 'lotes')}
          onClick={() => lotesInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200 ${
            dragOverCard === 'lotes'
              ? 'border-blue-500 bg-blue-950/40'
              : lotesFile
              ? 'border-emerald-500/50 bg-emerald-950/20'
              : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70'
          }`}
        >
          <input
            ref={lotesInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setLotesFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                lotesFile
                  ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-600/40'
                  : 'bg-emerald-900/20 text-emerald-400 border border-emerald-700/30'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <span className="text-xs font-bold text-white tracking-wide uppercase">
              2. Excel de Lotes y Caducidad
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Columnas: Producto, Lote, F. Cad, Existen
            </span>

            {lotesFile ? (
              <div className="mt-3.5 w-full bg-slate-800/80 rounded-lg p-2.5 border border-slate-700 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate text-xs font-medium text-emerald-300">
                    {lotesFile.name}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 pl-6">
                  {formatFileSize(lotesFile.size)} &bull; Listo para FEFO
                </div>
              </div>
            ) : (
              <div className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                <Upload className="w-3.5 h-3.5" /> Seleccionar Excel
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Excel Stock Bodega */}
        <div
          onDragEnter={(e) => handleDrag(e, 'stock')}
          onDragLeave={(e) => handleDrag(e, 'stock')}
          onDragOver={(e) => handleDrag(e, 'stock')}
          onDrop={(e) => handleDrop(e, 'stock')}
          onClick={() => stockInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200 ${
            dragOverCard === 'stock'
              ? 'border-blue-500 bg-blue-950/40'
              : stockFile
              ? 'border-emerald-500/50 bg-emerald-950/20'
              : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70'
          }`}
        >
          <input
            ref={stockInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setStockFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                stockFile
                  ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-600/40'
                  : 'bg-indigo-900/20 text-indigo-400 border border-indigo-700/30'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <span className="text-xs font-bold text-white tracking-wide uppercase">
              3. Excel Stock Unificado (Bodega)
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Columnas: Código, SKU, Producto, Bodega
            </span>

            {stockFile ? (
              <div className="mt-3.5 w-full bg-slate-800/80 rounded-lg p-2.5 border border-slate-700 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate text-xs font-medium text-emerald-300">
                    {stockFile.name}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 pl-6">
                  {formatFileSize(stockFile.size)} &bull; Maestro listo
                </div>
              </div>
            ) : (
              <div className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                <Upload className="w-3.5 h-3.5" /> Seleccionar Excel
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            {allFilesSelected
              ? 'Los 3 archivos están listos para el procesamiento.'
              : 'Seleccione o arrastre los 3 archivos (o use el botón de demo) para iniciar.'}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {pdfFile || lotesFile || stockFile ? (
            <button
              type="button"
              onClick={() => {
                setPdfFile(null);
                setLotesFile(null);
                setStockFile(null);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Limpiar selección
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleExecute}
            disabled={!allFilesSelected || isLoading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all ${
              allFilesSelected && !isLoading
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-blue-300" />
                <span>Procesando Cruce FEFO...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Procesar Cruce Hospitalario</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
