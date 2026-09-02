import React, { useState, useMemo } from 'react';
import { FormType, OpenEndedResponses, RatingValue } from '../types';
import { getItemsForForm, SCALE_DEFINITIONS } from '../data/conners4Items';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  SlidersHorizontal,
  GraduationCap,
  Home,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

interface EvaluationFlowProps {
  formType: FormType;
  responses: Record<string, RatingValue>;
  openEndedResponses: OpenEndedResponses;
  onResponseChange: (itemId: string, value: RatingValue) => void;
  onOpenEndedChange: (field: keyof OpenEndedResponses, value: string) => void;
  onBulkSetResponses: (newResponses: Record<string, RatingValue>) => void;
  onGenerateResults: () => void;
  studentName: string;
}

export const EvaluationFlow: React.FC<EvaluationFlowProps> = ({
  formType,
  responses,
  openEndedResponses,
  onResponseChange,
  onOpenEndedChange,
  onBulkSetResponses,
  onGenerateResults,
  studentName,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<
    'ALL' | 'UNANSWERED' | 'ANSWERED' | 'CRITICAL' | 'DSM'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'SHEET' | 'PAGINATED'>('SHEET');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 20;

  const items = useMemo(() => getItemsForForm(formType), [formType]);
  const isTeacher = formType === 'TEACHER';

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [items]);

  // Filtered items list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeCategory !== 'ALL' && item.category !== activeCategory) {
        return false;
      }

      const isAnswered = responses[item.id] !== undefined;
      if (filterMode === 'UNANSWERED' && isAnswered) return false;
      if (filterMode === 'ANSWERED' && !isAnswered) return false;
      if (filterMode === 'CRITICAL' && !item.isCritical) return false;
      if (filterMode === 'DSM' && !item.dsmCode) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesText = item.text.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesNumber = item.number.toString().includes(query);
        if (!matchesText && !matchesCategory && !matchesNumber) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeCategory, filterMode, searchQuery, responses]);

  const totalItemsCount = items.length;
  const answeredCount = Object.keys(responses).filter((k) =>
    items.some((i) => i.id === k)
  ).length;
  const unansweredCount = totalItemsCount - answeredCount;
  const progressPercent = Math.round((answeredCount / totalItemsCount) * 100);

  // Quick fill remaining items as 0 (Nunca / Rara vez)
  const handleFillRemainingAsZero = () => {
    const updated = { ...responses };
    items.forEach((item) => {
      if (updated[item.id] === undefined) {
        updated[item.id] = 0;
      }
    });
    onBulkSetResponses(updated);
  };

  const currentDisplayItems = useMemo(() => {
    if (viewMode === 'SHEET') return filteredItems;
    const start = currentPage * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [viewMode, filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);

  return (
    <div className="space-y-6">
      {/* Progress & Instruction Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isTeacher ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isTeacher ? <GraduationCap className="w-5 h-5" /> : <Home className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">
                  {isTeacher
                    ? 'Folleto de Observación Escolar (Docentes) — 106 ítems'
                    : 'Folleto de Observación Familiar (Padres de Familia) — 114 ítems'}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  Escala de 4 puntos (0 a 3)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTeacher
                  ? 'Instrucciones: Califique cada conducta según lo observado en el aula y ámbito escolar durante el último mes.'
                  : 'Instrucciones: Califique cada conducta según lo observado en el hogar y convivencia familiar durante el último mes.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Progreso del Folleto</div>
              <div className="text-base font-extrabold text-slate-900">
                {answeredCount} / {totalItemsCount}{' '}
                <span className="text-xs font-medium text-slate-400">({progressPercent}%)</span>
              </div>
            </div>

            <button
              type="button"
              id="btn-generate-results-top"
              onClick={onGenerateResults}
              disabled={answeredCount === 0}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm ${
                answeredCount >= 20
                  ? isTeacher
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Generar Informe Clínico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="mt-4">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isTeacher ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-1.5 font-medium">
            <span>
              {unansweredCount === 0
                ? '¡Todos los ítems completados!'
                : `${unansweredCount} ítems pendientes de valorar`}
            </span>
            {unansweredCount > 0 && (
              <button
                type="button"
                id="btn-fill-remaining-zero"
                onClick={handleFillRemainingAsZero}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-xs"
              >
                Puntuar no observados como 0 (Nunca/Rara vez)
              </button>
            )}
          </div>
        </div>

        {/* Rating Scale Legend Reference (Matching Manual) */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-white font-bold text-slate-700 border border-slate-300 flex items-center justify-center shrink-0">
              0
            </span>
            <div>
              <div className="font-bold text-slate-800">Nunca / Rara vez</div>
              <div className="text-[10px] text-slate-500">Nada cierto</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-white font-bold text-amber-600 border border-amber-300 flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <div className="font-bold text-slate-800">Ocasionalmente</div>
              <div className="text-[10px] text-slate-500">Solo un poco cierto</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-white font-bold text-orange-600 border border-orange-300 flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <div className="font-bold text-slate-800">A menudo / Frecuente</div>
              <div className="text-[10px] text-slate-500">Bastante cierto</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-white font-bold text-rose-600 border border-rose-300 flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <div className="font-bold text-slate-800">Muy a menudo / Siempre</div>
              <div className="text-[10px] text-slate-500">Completamente cierto</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-items"
              type="text"
              placeholder="Buscar conducta o palabra clave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              type="button"
              id="filter-all"
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterMode === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              type="button"
              id="filter-unanswered"
              onClick={() => setFilterMode('UNANSWERED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterMode === 'UNANSWERED'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Pendientes ({unansweredCount})
            </button>
            <button
              type="button"
              id="filter-critical"
              onClick={() => setFilterMode('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterMode === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Críticos / Alerta ({items.filter((i) => i.isCritical).length})
            </button>
            <button
              type="button"
              id="filter-dsm"
              onClick={() => setFilterMode('DSM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterMode === 'DSM'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Criterios DSM-5 ({items.filter((i) => i.dsmCode).length})
            </button>
          </div>
        </div>
      </div>

      {/* Item List / Questionnaire Sheet */}
      <div className="space-y-3">
        {currentDisplayItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-sm">No se encontraron ítems con los filtros aplicados.</p>
            <button
              type="button"
              onClick={() => {
                setFilterMode('ALL');
                setActiveCategory('ALL');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : (
          currentDisplayItems.map((item) => {
            const currentResponse = responses[item.id];
            const isAnswered = currentResponse !== undefined;

            return (
              <div
                key={item.id}
                id={`item-card-${item.id}`}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isAnswered
                    ? currentResponse >= 2
                      ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                      : 'bg-white border-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Item Text and Metadata */}
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {item.number}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      {item.isCritical && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Alerta Crítica ({item.criticalCategory})
                        </span>
                      )}
                      {item.dsmCode && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {item.dsmCode}
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                      {item.text}
                    </p>
                  </div>

                  {/* 4-point Rating Options */}
                  <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center shrink-0">
                    {[
                      { val: 0, label: '0', desc: 'Nunca / Rara vez', activeColor: 'bg-slate-800 text-white border-slate-800 shadow-sm' },
                      { val: 1, label: '1', desc: 'Ocasional', activeColor: 'bg-amber-500 text-white border-amber-500 shadow-sm' },
                      { val: 2, label: '2', desc: 'A menudo', activeColor: 'bg-orange-600 text-white border-orange-600 shadow-sm' },
                      { val: 3, label: '3', desc: 'Siempre', activeColor: 'bg-rose-600 text-white border-rose-600 shadow-sm' },
                    ].map((opt) => {
                      const isSelected = currentResponse === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          id={`btn-rate-${item.id}-${opt.val}`}
                          onClick={() => onResponseChange(item.id, opt.val as RatingValue)}
                          title={`${opt.val} - ${opt.desc}`}
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center font-extrabold text-sm sm:text-base transition-all border ${
                            isSelected
                              ? opt.activeColor
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className="text-[8px] font-medium opacity-80 leading-none">
                            {opt.val === 0 ? 'Nunca' : opt.val === 1 ? 'Poco' : opt.val === 2 ? 'Frec.' : 'Siempre'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Open-Ended Questions Section (Items 107-109 for Teacher, 115-117 for Parents) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div
            className={`p-2 rounded-xl ${
              isTeacher ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Preguntas Adicionales y Observaciones Cualitativas ({isTeacher ? 'Ítems 107 a 109' : 'Ítems 115 a 117'})
            </h3>
            <p className="text-xs text-slate-500">
              Conclusiones descriptivas del evaluador para enriquecer el informe psicopedagógico
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {isTeacher
                ? '107. Describa cómo estos comportamientos causan serios problemas para el estudiante en la escuela o con sus amigos:'
                : '115. Describa cómo estos comportamientos causan serios problemas para su hijo(a) en el hogar, en la escuela, en el trabajo o con sus amigos:'}
            </label>
            <textarea
              id="input-open-serious-problems"
              rows={2}
              placeholder="Ej. Dificultad para terminar exámenes a tiempo, interrupciones continuas al docente, roces frecuentes en el recreo..."
              value={openEndedResponses.item107_115_seriousProblems || ''}
              onChange={(e) => onOpenEndedChange('item107_115_seriousProblems', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {isTeacher
                ? '108. ¿Tiene cualquier otra preocupación acerca del estudiante?'
                : '116. ¿Tiene usted cualquier otra preocupación acerca de su hijo(a)?'}
            </label>
            <textarea
              id="input-open-other-concerns"
              rows={2}
              placeholder="Ej. Se muestra desmotivado con materias de alta lectura, parece cansado por las mañanas..."
              value={openEndedResponses.item108_116_otherConcerns || ''}
              onChange={(e) => onOpenEndedChange('item108_116_otherConcerns', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {isTeacher
                ? '109. ¿Qué fortalezas o habilidades tiene el estudiante?'
                : '117. ¿Qué fortalezas o habilidades tiene su hijo(a)?'}
            </label>
            <textarea
              id="input-open-strengths"
              rows={2}
              placeholder="Ej. Es muy creativo dibujando, tiene gran empatía con animales, excelente razonamiento verbal..."
              value={openEndedResponses.item109_117_strengths || ''}
              onChange={(e) => onOpenEndedChange('item109_117_strengths', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-indigo-400">
            {progressPercent}%
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Estado del Cuestionario</div>
            <div className="text-sm font-bold text-white">
              {answeredCount} de {totalItemsCount} ítems valorados
            </div>
          </div>
        </div>

        <button
          type="button"
          id="btn-generate-results-bottom"
          onClick={onGenerateResults}
          disabled={answeredCount === 0}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            answeredCount >= 20
              ? isTeacher
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Generar Interpretación y Resultados Cualitativos</span>
        </button>
      </div>
    </div>
  );
};
