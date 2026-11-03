import React from 'react';
import { Hospital, ShieldCheck, FileSpreadsheet, Sparkles, RefreshCw } from 'lucide-react';
import { generateSampleLotesExcelBlob, generateSampleStockExcelBlob } from '../services/sampleData';
import { downloadFile } from '../services/excelGenerator';

interface HeaderProps {
  onLoadDemo: () => void;
  onReset: () => void;
  hasData: boolean;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadDemo,
  onReset,
  hasData,
  isLoading,
}) => {
  const downloadLotesTemplate = () => {
    const blob = generateSampleLotesExcelBlob();
    downloadFile(blob, 'Plantilla_Lotes_Hospital.xlsx');
  };

  const downloadStockTemplate = () => {
    const blob = generateSampleStockExcelBlob();
    downloadFile(blob, 'Plantilla_Stock_Bodega_Hospital.xlsx');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-900/30 shrink-0">
              <Hospital className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-700/50">
                  MSP Ecuador &bull; Hospital Docente
                </span>
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  <ShieldCheck className="w-3 h-3" /> Criterio FEFO Normado
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Hospital Provincial General Docente Vicente Corral Moscoso
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Sistema Oficial de Dispensación y Cruce de Stock &bull; Generador de Actas y Reportes de Bodega
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="dropdown relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Descargar plantillas Excel de ejemplo"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Plantillas Excel</span>
              </button>
              <div className="absolute right-0 mt-1 w-56 rounded-lg bg-slate-800 border border-slate-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
                <button
                  onClick={downloadLotesTemplate}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded-md flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Plantilla de Lotes y Caducidades
                </button>
                <button
                  onClick={downloadStockTemplate}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded-md flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  Plantilla de Stock Bodega General
                </button>
              </div>
            </div>

            <button
              onClick={onLoadDemo}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Cargar Ejemplo (Emergencia)</span>
            </button>

            {hasData && (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Limpiar datos cargados"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
