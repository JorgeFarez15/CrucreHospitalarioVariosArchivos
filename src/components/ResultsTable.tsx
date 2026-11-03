import React, { useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Code2,
} from 'lucide-react';
import { CrossProcessingResult, CrossResultRow } from '../types/fefo';

interface ResultsTableProps {
  data: CrossProcessingResult;
  onDownloadExcel: () => void;
  onDownloadPdf: () => void;
  onPreviewActa: () => void;
  onInspectRawText: () => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  onDownloadExcel,
  onDownloadPdf,
  onPreviewActa,
  onInspectRawText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'alerts' | 'completed'>('all');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleExpand = (nro: number) => {
    setExpandedRows((prev) => ({ ...prev, [nro]: !prev[nro] }));
  };

  const filteredItems = data.items.filter((item) => {
    // Filter mode
    const isAlert = item.alertaRojo || item.stockBodega <= 0;
    if (filterMode === 'alerts' && !isAlert) return false;
    if (filterMode === 'completed' && isAlert) return false;

    // Search term
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.dispositivoMedico.toLowerCase().includes(term) ||
      item.codigo.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term) ||
      item.lotesYCantidades.toLowerCase().includes(term)
    );
  });

  const alertCount = data.items.filter((i) => i.alertaRojo || i.stockBodega <= 0).length;
  const completedCount = data.items.length - alertCount;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Table Header and Toolbar */}
      <div className="p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30">
              2
            </span>
            Matriz de Despacho y Asignación FEFO
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Criterio Primero en Caducar, Primero en Salir &bull; Hospital Vicente Corral Moscoso
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onInspectRawText}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Inspeccionar texto extraído del PDF y regex"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Texto PDF</span>
          </button>

          <button
            type="button"
            onClick={onPreviewActa}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Vista Previa Acta</span>
          </button>

          <button
            type="button"
            onClick={onDownloadExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText className="w-4 h-4" />
            <span>Descargar Acta PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-5 py-3.5 bg-slate-900/40 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            Todos ({data.items.length})
          </button>
          <button
            onClick={() => setFilterMode('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterMode === 'alerts'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-red-300 hover:bg-slate-800 border border-red-800/40'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Con Alerta / Faltante ({alertCount})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterMode === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-emerald-300 hover:bg-slate-800 border border-emerald-800/40'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Despacho Completo ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o lote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="bg-[#1F4E78] text-white font-bold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3 text-center w-12">Nro.</th>
              <th className="py-3 px-3 text-center w-28">Código / SKU</th>
              <th className="py-3 px-4 min-w-[200px]">Dispositivo Médico</th>
              <th className="py-3 px-3 text-center w-24">Cantidades</th>
              <th className="py-3 px-4 min-w-[240px]">Lotes y Asignación FEFO</th>
              <th className="py-3 px-3 min-w-[150px]">Caducidad</th>
              <th className="py-3 px-3 text-right w-24">Stock Bodega</th>
              <th className="py-3 px-3 text-center w-24">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No se encontraron dispositivos que coincidan con la búsqueda o filtro.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isAlert = item.alertaRojo || item.stockBodega <= 0;
                const isExpanded = Boolean(expandedRows[item.nro]);

                return (
                  <React.Fragment key={item.nro}>
                    <tr
                      className={`transition-colors ${
                        isAlert
                          ? 'bg-red-950/20 hover:bg-red-950/30'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Nro */}
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {item.nro}
                      </td>

                      {/* Código & SKU */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono text-[11px] font-bold text-blue-300">
                          {item.codigo}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {item.sku}
                        </div>
                      </td>

                      {/* Dispositivo Médico */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2">
                          {item.allocations.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(item.nro)}
                              className="mt-0.5 text-slate-400 hover:text-white transition-colors"
                              title="Ver desglose de lotes"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <div>
                            <span
                              className={`font-semibold block ${
                                isAlert ? 'text-red-300' : 'text-slate-100'
                              }`}
                            >
                              {item.dispositivoMedico}
                            </span>
                            {item.motivoAlerta && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 mt-0.5">
                                <AlertTriangle className="w-3 h-3" />
                                {item.motivoAlerta}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cantidades (Sol / Ap / Desp) */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-bold text-white text-xs">
                          {item.cantDespachada} / {item.cantAprobada}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Pedida: {item.cantSolicitada}
                        </div>
                      </td>

                      {/* Lotes y Cantidades */}
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          {item.lotesYCantidades.split(' / ').map((loteChunk, idx) => {
                            const isShortage = loteChunk.includes('FALTAN');
                            const isNoLot = loteChunk.includes('SIN LOTE');

                            return (
                              <span
                                key={idx}
                                className={`inline-block mr-1.5 mb-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                                  isShortage || isNoLot
                                    ? 'bg-red-950 text-red-300 border border-red-700/60 font-bold'
                                    : 'bg-slate-800 text-blue-200 border border-slate-700'
                                }`}
                              >
                                {loteChunk}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Fechas de Caducidad */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-300">
                          {item.fechasCaducidad.split(' / ').map((fechaChunk, idx) => {
                            const isShortage =
                              fechaChunk.includes('INSUFICIENTE') || fechaChunk === 'S/F';

                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-1 leading-tight mb-0.5 ${
                                  isShortage ? 'text-red-400 font-bold' : 'text-slate-300'
                                }`}
                              >
                                {!isShortage && (
                                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                )}
                                <span>{fechaChunk}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Stock Bodega */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-bold ${
                            item.stockBodega <= 0 ? 'text-red-400' : 'text-slate-200'
                          }`}
                        >
                          {Number(item.stockBodega).toLocaleString('en-US')}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 text-center">
                        {isAlert ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-800/60">
                            <AlertTriangle className="w-3 h-3" /> Quiebre
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" /> OK FEFO
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Lot Allocation Drawer */}
                    {isExpanded && item.allocations.length > 0 && (
                      <tr className="bg-slate-950/60">
                        <td colSpan={8} className="py-3 px-6 border-y border-slate-800">
                          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
                              <Layers className="w-3.5 h-3.5 text-blue-400" />
                              Desglose Detallado de Lotes Asignados por FEFO:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {item.allocations.map((alloc, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2.5 text-xs flex justify-between items-center"
                                >
                                  <div>
                                    <span className="font-mono font-bold text-blue-300 block">
                                      {alloc.lote}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      Vence: {alloc.fechaCaducidad}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-emerald-400 text-sm block">
                                      {alloc.cantidad} unids
                                    </span>
                                    {alloc.diasParaCaducar !== null &&
                                      alloc.diasParaCaducar !== undefined && (
                                        <span
                                          className={`text-[10px] font-medium ${
                                            alloc.diasParaCaducar <= 60
                                              ? 'text-amber-400 font-bold'
                                              : 'text-slate-400'
                                          }`}
                                        >
                                          {alloc.diasParaCaducar > 0
                                            ? `en ${alloc.diasParaCaducar} días`
                                            : 'Caducado'}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div>
          Mostrando {filteredItems.length} de {data.items.length} dispositivos médicos
          {alertCount > 0 && ` (${alertCount} con alertas de stock o falta de lote)`}
        </div>
        <div className="flex items-center gap-4 text-slate-300 font-medium">
          <span>
            Total Aprobado:{' '}
            <strong className="text-white">{data.totalAprobado}</strong>
          </span>
          <span>
            Total Despachado:{' '}
            <strong className="text-emerald-400">{data.totalDespachado}</strong>
          </span>
          <span>
            Diferencia:{' '}
            <strong
              className={
                data.totalAprobado - data.totalDespachado > 0
                  ? 'text-red-400'
                  : 'text-slate-400'
              }
            >
              {data.totalAprobado - data.totalDespachado}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
