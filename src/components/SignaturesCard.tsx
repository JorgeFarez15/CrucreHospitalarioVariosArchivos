import React, { useState } from 'react';
import { PenTool, CheckCircle, Edit3, ShieldCheck } from 'lucide-react';
import { SignaturesInfo } from '../types/fefo';

interface SignaturesCardProps {
  signatures: SignaturesInfo;
  servicioNombre: string;
  onUpdateSignatures: (newSignatures: SignaturesInfo, newServicio: string) => void;
}

export const SignaturesCard: React.FC<SignaturesCardProps> = ({
  signatures,
  servicioNombre,
  onUpdateSignatures,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [servicio, setServicio] = useState(servicioNombre || signatures.servicioSolicitante);
  const [elaborado, setElaborado] = useState(signatures.elaboradoPor);
  const [entregado, setEntregado] = useState(signatures.entregadoPor);
  const [validado, setValidado] = useState(signatures.validadoPor);

  const handleSave = () => {
    onUpdateSignatures(
      {
        ...signatures,
        elaboradoPor: elaborado.toUpperCase().trim(),
        entregadoPor: entregado.toUpperCase().trim(),
        validadoPor: validado.toUpperCase().trim(),
        servicioSolicitante: servicio.toUpperCase().trim(),
      },
      servicio.toUpperCase().trim()
    );
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-700/40 text-blue-400 flex items-center justify-center shrink-0">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Firmas Electrónicas y Servicio Solicitante
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> FirmaEC Detectado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nombres extraídos del PDF para el Acta Oficial de Dispensación
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isEditing
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          {isEditing ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" /> Guardar Cambios
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" /> Editar Firmantes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {/* Servicio */}
        <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase block">
            Servicio Solicitante
          </span>
          {isEditing ? (
            <input
              type="text"
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              className="mt-1.5 w-full bg-slate-900 border border-blue-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          ) : (
            <p className="text-xs font-bold text-white mt-1 truncate">
              {servicioNombre || signatures.servicioSolicitante || 'GENERAL'}
            </p>
          )}
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Área médica hospitalaria
          </span>
        </div>

        {/* Elaboró */}
        <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
            Elaboró / Recibió Conforme
          </span>
          {isEditing ? (
            <input
              type="text"
              value={elaborado}
              onChange={(e) => setElaborado(e.target.value)}
              className="mt-1.5 w-full bg-slate-900 border border-blue-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          ) : (
            <p className="text-xs font-bold text-slate-200 mt-1 truncate">
              {signatures.elaboradoPor || 'RESPONSABLE DE SERVICIO'}
            </p>
          )}
          <span className="text-[10px] text-emerald-400/80 mt-0.5 block flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" /> Responsable de Servicio
          </span>
        </div>

        {/* Entregó */}
        <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
            Entregado por Bodega
          </span>
          {isEditing ? (
            <input
              type="text"
              value={entregado}
              onChange={(e) => setEntregado(e.target.value)}
              className="mt-1.5 w-full bg-slate-900 border border-blue-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          ) : (
            <p className="text-xs font-bold text-slate-200 mt-1 truncate">
              {signatures.entregadoPor || 'GUARDALMACÉN / DESPACHADOR'}
            </p>
          )}
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Custodio de Almacén General
          </span>
        </div>

        {/* Validó */}
        <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
            Validó / Autorizó
          </span>
          {isEditing ? (
            <input
              type="text"
              value={validado}
              onChange={(e) => setValidado(e.target.value)}
              className="mt-1.5 w-full bg-slate-900 border border-blue-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          ) : (
            <p className="text-xs font-bold text-slate-200 mt-1 truncate">
              {signatures.validadoPor || 'COORDINACIÓN / FARMACIA'}
            </p>
          )}
          <span className="text-[10px] text-emerald-400/80 mt-0.5 block flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" /> Autoridad / Coordinador
          </span>
        </div>
      </div>
    </div>
  );
};
