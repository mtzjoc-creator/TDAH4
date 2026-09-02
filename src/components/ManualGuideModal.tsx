import React from 'react';
import { BookOpen, X, ShieldCheck, GraduationCap, Home, CheckCircle2, AlertCircle } from 'lucide-react';

interface ManualGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualGuideModal: React.FC<ManualGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold">Manual Clínico Oficial Conners 4ta Edición (Conners 4™)</h3>
              <p className="text-xs text-indigo-200">
                Fundamentación psicométrica, baremación e interpretación de Folletos Docente y Padres (MHS)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Dual Informant Architecture */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              1. Estructura de los Dos Folletos Oficiales
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <GraduationCap className="w-4 h-4" />
                  <span>Folleto Docente (Teacher - 106 ítems)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Evalúa conductas en el aula y contexto escolar: atención en clases, seguimiento de instrucciones grupales, finalización de tareas, convivencia en el recreo y deterioro en el clima de aula.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <Home className="w-4 h-4" />
                  <span>Folleto Padres de Familia (Parent - 114 ítems)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Evalúa conductas en el hogar y vida cotidiana: rutinas familiares, tareas escolares en casa, hora de acostarse, salidas públicas, juego libre y relación con hermanos/tutores.
                </p>
              </div>
            </div>
          </div>

          {/* Rating Options */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              2. Escala de Calificación de 4 Puntos (Observación del Último Mes)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-slate-800">0 = Nunca / Rara vez:</strong> No fue nada cierto sobre el alumno/hijo en el último mes.
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-amber-700">1 = Ocasionalmente:</strong> Fue solo un poco cierto sobre el alumno/hijo en el último mes.
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-orange-700">2 = A menudo / Frecuente:</strong> Fue bastante cierto sobre el alumno/hijo en el último mes.
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-rose-700">3 = Muy a menudo / Siempre:</strong> Fue completamente cierto sobre el alumno/hijo en el último mes.
              </div>
            </div>
          </div>

          {/* Cutoffs & T-Scores */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900">
              3. Puntuaciones T Estandarizadas y Puntos de Corte Clínico
            </h4>
            <p className="text-xs">
              Las puntuaciones directas se transforman a <strong>Puntuaciones T</strong> con Media = 50 y Desviación Estándar = 10, según la muestra normativa del manual Conners 4™:
            </p>
            <ul className="space-y-1.5 pl-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                <span><strong>T &lt; 60 (Percentil &lt; 84%):</strong> Puntuación Típica / Promedio. Sin indicios de dificultad significativa.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span><strong>T 60 - 64 (Percentil 84% - 92%):</strong> Límite / Ligeramente Elevada. Sugiere seguimiento y ajustes preventivos.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                <span><strong>T 65 - 69 (Percentil 93% - 97%):</strong> Elevada. Preocupación clínica evidente y deterioro funcional.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                <span><strong>T ≥ 70 (Percentil &gt; 97%):</strong> Muy Elevada. Dificultad clínica severa y alto impacto en la vida diaria.</span>
              </li>
            </ul>
          </div>

          {/* Multi-Setting Requirement */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Importancia de la Evaluación Multi-Informante (Criterio C DSM-5-TR)</span>
            </div>
            <p>
              El diagnóstico formal de TDAH requiere que los síntomas se manifiesten en <strong>dos o más entornos diferentes</strong> (Hogar y Escuela). La aplicación permite completar y analizar de manera independiente el reporte docente y el reporte de padres para cotejar la generalización del cuadro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
