import React from 'react';
import {
  FileText,
  BarChart3,
  BookOpen,
  History,
  Sparkles,
  RefreshCw,
  Printer,
  ShieldCheck,
  GraduationCap,
  Home,
  GitCompare,
} from 'lucide-react';
import { FormType } from '../types';

interface HeaderProps {
  currentTab: 'assessment' | 'results' | 'comparison' | 'history' | 'guide';
  onTabChange: (tab: 'assessment' | 'results' | 'comparison' | 'history' | 'guide') => void;
  completionPercentage: number;
  hasResults: boolean;
  hasComparison?: boolean;
  formType: FormType;
  onOpenSampleModal: () => void;
  onReset: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  completionPercentage,
  hasResults,
  hasComparison = true,
  formType,
  onOpenSampleModal,
  onReset,
  onPrint,
}) => {
  const isTeacher = formType === 'TEACHER';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0 ${
                isTeacher
                  ? 'bg-linear-to-br from-indigo-600 to-blue-700 shadow-indigo-100'
                  : 'bg-linear-to-br from-emerald-600 to-teal-700 shadow-emerald-100'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Evaluador TDAH Conners 4™
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isTeacher
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isTeacher ? <GraduationCap className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                  <span>{isTeacher ? 'Folleto Docente (106)' : 'Folleto Padres (114)'}</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  Manual Oficial MHS & DSM-5-TR
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Evaluación psicométrica, baremo estandarizado e interpretación cualitativa integral
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-sample-cases"
              onClick={onOpenSampleModal}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
              title="Cargar perfil de ejemplo para demostración rápida"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Casos de Muestra
            </button>

            {hasResults && (
              <button
                type="button"
                id="btn-print-report"
                onClick={onPrint}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                Imprimir Informe
              </button>
            )}

            <button
              type="button"
              id="btn-reset-evaluation"
              onClick={onReset}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent rounded-lg transition-colors"
              title="Reiniciar cuestionario"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-100 pt-1 pb-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            id="tab-assessment"
            onClick={() => onTabChange('assessment')}
            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'assessment'
                ? isTeacher
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            <span>Folleto de Evaluación ({isTeacher ? '106' : '114'} ítems)</span>
            <span
              className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                completionPercentage === 100
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {completionPercentage}%
            </span>
          </button>

          <button
            type="button"
            id="tab-results"
            onClick={() => onTabChange('results')}
            disabled={!hasResults}
            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              !hasResults
                ? 'text-slate-300 cursor-not-allowed'
                : currentTab === 'results'
                ? isTeacher
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            <span>Resultados e Informe</span>
          </button>

          <button
            type="button"
            id="tab-comparison"
            onClick={() => onTabChange('comparison')}
            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'comparison'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <GitCompare className="w-4 h-4 mr-2 text-purple-600" />
            <span>Comparativa & Análisis Conjunto</span>
            <span className="ml-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Docente vs Padres
            </span>
          </button>

          <button
            type="button"
            id="tab-history"
            onClick={() => onTabChange('history')}
            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'history'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4 mr-2" />
            <span>Historial</span>
          </button>

          <button
            type="button"
            id="tab-guide"
            onClick={() => onTabChange('guide')}
            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'guide'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            <span>Manual & Baremos</span>
          </button>
        </div>
      </div>
    </header>
  );
};
