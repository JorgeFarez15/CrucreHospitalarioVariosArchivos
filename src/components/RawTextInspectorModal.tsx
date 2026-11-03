import React, { useState } from 'react';
import { X, Copy, Check, RefreshCw, FileText, Terminal } from 'lucide-react';
import { CrossProcessingResult } from '../types/fefo';

interface RawTextInspectorModalProps {
  data: CrossProcessingResult;
  onClose: () => void;
  onReprocessText?: (newText: string) => void;
}

export const RawTextInspectorModal: React.FC<RawTextInspectorModalProps> = ({
  data,
  onClose,
  onReprocessText,
}) => {
  const [text, setText] = useState(data.pdfRawText || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Inspección de Texto Extraído del PDF y Regex
              </h3>
              <p className="text-[11px] text-slate-400">
                Verifique los patrones extraídos por el motor de cruce hospitalario
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar Texto
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagnostic Tokens */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Servicio Detectado
            </span>
            <span className="font-mono font-bold text-blue-300 text-xs">
              {data.servicioNombre}
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Firmantes Extraídos (FirmaEC)
            </span>
            <span className="font-mono font-bold text-emerald-300 text-xs">
              {data.signatures.rawFirmantes.join(' &bull; ') || 'Defaults aplicados'}
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Ítems Identificados
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {data.items.length} dispositivos médicos
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Texto plano obtenido del PDF:
            </label>
            {onReprocessText && (
              <span className="text-[10px] text-slate-400">
                Puede editar el texto directamente y reprocesar
              </span>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="w-full bg-slate-950 font-mono text-xs text-slate-200 p-3 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-none"
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex justify-end gap-2">
          {onReprocessText && (
            <button
              onClick={() => {
                onReprocessText(text);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reprocesar con este Texto</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
