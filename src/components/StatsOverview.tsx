import React from 'react';
import { PackageCheck, AlertTriangle, Boxes, CheckCircle2 } from 'lucide-react';
import { CrossProcessingResult } from '../types/fefo';

interface StatsOverviewProps {
  data: CrossProcessingResult;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ data }) => {
  const totalItems = data.items.length;
  const alertItems = data.items.filter((i) => i.alertaRojo || i.stockBodega <= 0).length;
  const fullItems = totalItems - alertItems;
  const fulfillmentPct =
    data.totalAprobado > 0
      ? Math.round((data.totalDespachado / data.totalAprobado) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stat 1: Total Items */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Ítems Solicitados
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              {totalItems}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                dispositivos
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {data.totalSolicitado} unids pedidas / {data.totalAprobado} aprobadas
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-950/80 border border-blue-700/40 text-blue-400 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Stat 2: Despacho Completo */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Despacho Completo
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {fullItems}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                ({totalItems > 0 ? Math.round((fullItems / totalItems) * 100) : 0}%)
              </span>
            </h3>
            <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Lotes asignados 100% FEFO
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-700/40 text-emerald-400 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Stat 3: Alertas / Quiebre */}
      <div
        className={`bg-slate-900/70 border rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden ${
          alertItems > 0
            ? 'border-red-900/50 bg-red-950/10'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Alertas / Quiebre de Stock
            </p>
            <h3
              className={`text-2xl font-black mt-1 ${
                alertItems > 0 ? 'text-red-400' : 'text-slate-200'
              }`}
            >
              {alertItems}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                {alertItems === 1 ? 'ítem crítico' : 'ítems críticos'}
              </span>
            </h3>
            <p className="text-[11px] text-red-400/90 mt-1 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3" /> Requiere reposición o ajuste
            </p>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              alertItems > 0
                ? 'bg-red-950/80 border border-red-700/50 text-red-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Stat 4: Cumplimiento de Unidades */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Cumplimiento de Cantidades
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              {fulfillmentPct}%
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                despachado
              </span>
            </h3>
            <div className="w-36 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  fulfillmentPct >= 90
                    ? 'bg-emerald-500'
                    : fulfillmentPct >= 70
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${fulfillmentPct}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200 block">
              {data.totalDespachado}
            </span>
            <span className="text-[10px] text-slate-400">
              de {data.totalAprobado} unids
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
