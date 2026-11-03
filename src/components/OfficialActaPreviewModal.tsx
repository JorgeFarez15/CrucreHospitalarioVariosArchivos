import React, { useRef } from 'react';
import { X, Printer, Download, Hospital } from 'lucide-react';
import { CrossProcessingResult } from '../types/fefo';

interface OfficialActaPreviewModalProps {
  data: CrossProcessingResult;
  onClose: () => void;
  onDownloadPdf: () => void;
}

export const OfficialActaPreviewModal: React.FC<OfficialActaPreviewModalProps> = ({
  data,
  onClose,
  onDownloadPdf,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top bar (hidden in print) */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Hospital className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Vista Previa del Acta Oficial de Dispensación FEFO
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Paper */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center">
          <div
            ref={printAreaRef}
            className="w-full max-w-[850px] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm print:shadow-none print:p-0 print:m-0"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
          >
            {/* Hospital Header */}
            <div className="text-center mb-4">
              <h1 className="text-base sm:text-lg font-bold text-[#1F4E78] tracking-tight uppercase leading-snug">
                Hospital Provincial General Docente Vicente Corral Moscoso
              </h1>
              <h2 className="text-xs font-bold text-slate-600 tracking-wider uppercase mt-1">
                Acta Oficial de Dispensación y Cruce de Stock (Criterio FEFO)
              </h2>
            </div>

            {/* Metadata Bar */}
            <div className="border-t border-b border-slate-300 py-1.5 px-2 my-3 text-[11px] font-bold text-slate-900 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[#1F4E78]">SERVICIO SOLICITANTE:</span>{' '}
                {data.servicioNombre || data.signatures.servicioSolicitante || 'GENERAL'}
              </div>
              <div>
                <span className="text-[#1F4E78]">FECHA EMISIÓN:</span>{' '}
                {data.signatures.fechaEmision}
              </div>
            </div>

            {/* Document Table */}
            <table className="w-full text-[10px] border-collapse border border-slate-300 mt-2 mb-6">
              <thead>
                <tr className="bg-[#1F4E78] text-white font-bold text-center">
                  <th className="border border-slate-400 py-1.5 px-1 w-8">Nro.</th>
                  <th className="border border-slate-400 py-1.5 px-1.5 w-16">Código</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-left">
                    Dispositivo Médico
                  </th>
                  <th className="border border-slate-400 py-1.5 px-1 w-12">Cant. Ap.</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-left">
                    Lotes y Cantidades a Despachar
                  </th>
                  <th className="border border-slate-400 py-1.5 px-1.5 text-left w-28">
                    Fechas Caducidad
                  </th>
                  <th className="border border-slate-400 py-1.5 px-1.5 text-center w-16">
                    Stock Bodega
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((row) => {
                  const isRed = row.alertaRojo || row.stockBodega <= 0;
                  return (
                    <tr
                      key={row.nro}
                      className={isRed ? 'text-[#C00000] font-bold bg-red-50/50' : 'text-slate-800'}
                    >
                      <td className="border border-slate-300 py-1.5 px-1 text-center font-bold">
                        {row.nro}
                      </td>
                      <td className="border border-slate-300 py-1.5 px-1.5 text-center font-mono">
                        {row.codigo}
                      </td>
                      <td className="border border-slate-300 py-1.5 px-2 text-left">
                        {row.dispositivoMedico}
                      </td>
                      <td className="border border-slate-300 py-1.5 px-1 text-center font-bold">
                        {Math.round(row.cantAprobada)}
                      </td>
                      <td className="border border-slate-300 py-1.5 px-2 text-left">
                        {row.lotesYCantidades}
                      </td>
                      <td className="border border-slate-300 py-1.5 px-1.5 text-left">
                        {row.fechasCaducidad}
                      </td>
                      <td className="border border-slate-300 py-1.5 px-1.5 text-center font-bold">
                        {Number(row.stockBodega).toLocaleString('en-US')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Official 3-Column Signature Block */}
            <div className="mt-8 pt-4">
              <div className="grid grid-cols-3 gap-6 text-center">
                {/* Column 1: Elaboró */}
                <div>
                  <p className="text-[10px] font-bold text-slate-800">
                    ELABORÓ / RECIBIDO CONFORME:
                  </p>
                  <div className="h-16 flex items-end justify-center">
                    <div className="w-4/5 border-b border-slate-600"></div>
                  </div>
                  <p className="text-[9.5px] font-bold text-slate-900 mt-1 uppercase">
                    {data.signatures.elaboradoPor}
                  </p>
                  <p className="text-[8px] text-slate-500">
                    Responsable de Servicio / Solicitante
                  </p>
                </div>

                {/* Column 2: Entregado */}
                <div>
                  <p className="text-[10px] font-bold text-slate-800">
                    ENTREGADO POR BODEGA:
                  </p>
                  <div className="h-16 flex items-end justify-center">
                    <div className="w-4/5 border-b border-slate-600"></div>
                  </div>
                  <p className="text-[9.5px] font-bold text-slate-900 mt-1 uppercase">
                    {data.signatures.entregadoPor}
                  </p>
                  <p className="text-[8px] text-slate-500">
                    Guardalmacén / Despachador General
                  </p>
                </div>

                {/* Column 3: Validó */}
                <div>
                  <p className="text-[10px] font-bold text-slate-800">
                    VALIDÓ / AUTORIZÓ:
                  </p>
                  <div className="h-16 flex items-end justify-center">
                    <div className="w-4/5 border-b border-slate-600"></div>
                  </div>
                  <p className="text-[9.5px] font-bold text-slate-900 mt-1 uppercase">
                    {data.signatures.validadoPor}
                  </p>
                  <p className="text-[8px] text-slate-500">
                    Coordinación Médica / Farmacia
                  </p>
                </div>
              </div>
            </div>

            {/* Institutional footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[8.5px] text-slate-400">
              Hospital Provincial General Docente Vicente Corral Moscoso &bull; Cuenca, Ecuador &bull; Sistema de Gestión FEFO &bull; Cumplimiento Normativo MSP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
