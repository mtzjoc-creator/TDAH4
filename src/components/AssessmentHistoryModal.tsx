import React, { useState } from 'react';
import { FullAssessmentResult } from '../types';
import {
  History,
  X,
  Trash2,
  FolderOpen,
  Calendar,
  School,
  GraduationCap,
  Home,
  GitCompare,
  CheckSquare,
  Square,
} from 'lucide-react';

interface AssessmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAssessments: FullAssessmentResult[];
  onLoadAssessment: (assessment: FullAssessmentResult) => void;
  onDeleteAssessment: (id: string) => void;
  onCompareTwoAssessments?: (id1: string, id2: string) => void;
}

export const AssessmentHistoryModal: React.FC<AssessmentHistoryModalProps> = ({
  isOpen,
  onClose,
  savedAssessments,
  onLoadAssessment,
  onDeleteAssessment,
  onCompareTwoAssessments,
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSelectForCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length === 2 && onCompareTwoAssessments) {
      onCompareTwoAssessments(selectedForCompare[0], selectedForCompare[1]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <History className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold">Historial de Evaluaciones Conners 4™</h3>
              <p className="text-xs text-slate-300">
                Selecciona una para abrir o marca dos para comparar (Docente vs. Padres / Evolución)
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

        {/* Selection bar for Comparison */}
        {savedAssessments.length >= 2 && onCompareTwoAssessments && (
          <div className="px-6 py-3 bg-purple-50/80 border-b border-purple-100 flex items-center justify-between gap-3">
            <div className="text-xs text-purple-900 font-medium flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-purple-700" />
              <span>
                Seleccionadas para comparar:{' '}
                <strong className="font-bold text-purple-950">
                  {selectedForCompare.length} de 2
                </strong>
              </span>
            </div>
            <button
              type="button"
              disabled={selectedForCompare.length !== 2}
              onClick={handleLaunchCompare}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 mr-1.5" />
              Ver Comparativa y Análisis Conjunto
            </button>
          </div>
        )}

        {/* List Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {savedAssessments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No hay evaluaciones guardadas aún</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Cuando completes una evaluación de un alumno/hijo y hagas clic en "Guardar en Historial", aparecerá aquí para consultas y comparaciones posteriores.
              </p>
            </div>
          ) : (
            savedAssessments.map((item) => {
              const isTeacher = item.formType === 'TEACHER';
              const isSelected = selectedForCompare.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                    isSelected
                      ? 'border-purple-400 bg-purple-50/40 ring-2 ring-purple-200'
                      : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {onCompareTwoAssessments && (
                      <button
                        type="button"
                        onClick={() => toggleSelectForCompare(item.id)}
                        className="mt-1 text-purple-600 hover:text-purple-800 transition-colors"
                        title="Marcar para comparativa"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-purple-600 fill-purple-100" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.studentInfo.studentName || 'Estudiante Evaluado'} {item.studentInfo.studentLastName || ''}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                            isTeacher
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isTeacher ? <GraduationCap className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                          <span>{isTeacher ? 'Docente (106)' : 'Padres (114)'}</span>
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {item.studentInfo.age} años
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.completedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <School className="w-3.5 h-3.5 text-slate-400" />
                          {item.studentInfo.schoolName || 'Escuela N/A'}
                        </span>
                        <span className="font-semibold text-indigo-700">
                          {item.dsmEvaluation.presentation}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadAssessment(item);
                        onClose();
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                    >
                      <FolderOpen className="w-3.5 h-3.5 mr-1" />
                      Abrir Informe
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAssessment(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

