import React, { useState } from 'react';
import { FullAssessmentResult, ScaleResult, ScaleType } from '../types';
import { SCALE_DEFINITIONS } from '../data/conners4Items';
import {
  Brain,
  Activity,
  HeartHandshake,
  Users,
  GraduationCap,
  Sparkles,
  Printer,
  Save,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Home,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  GitCompare,
} from 'lucide-react';
import Markdown from 'react-markdown';

interface ResultsDashboardProps {
  result: FullAssessmentResult;
  onEditResponses: () => void;
  onSaveAssessment: () => void;
  onPrint: () => void;
  onGenerateAiReport: () => Promise<void>;
  isGeneratingAi: boolean;
  aiNarrative: string | null;
  onNavigateToComparison?: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  onEditResponses,
  onSaveAssessment,
  onPrint,
  onGenerateAiReport,
  isGeneratingAi,
  aiNarrative,
  onNavigateToComparison,
}) => {
  const [activeTab, setActiveTab] = useState<
    'qualitative' | 'ai_narrative' | 'accommodations' | 'dsm_matrix' | 'validity' | 'open_responses'
  >('qualitative');
  const [copiedAi, setCopiedAi] = useState<boolean>(false);

  const {
    studentInfo,
    scaleResults,
    dsmEvaluation,
    validityIndices,
    criticalItems,
    qualitativeReport,
    topObservedBehaviors,
    openEndedResponses,
  } = result;

  const isTeacher = studentInfo.formType === 'TEACHER';

  const handleCopyAiNarrative = () => {
    if (!aiNarrative) return;
    navigator.clipboard.writeText(aiNarrative);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  const elevatedScalesCount = Object.values(scaleResults).filter(
    (s) => s.tScore >= 65
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE DIAGNOSTIC BANNER */}
      <div
        className={`rounded-3xl text-white p-6 sm:p-8 shadow-xl border relative overflow-hidden ${
          isTeacher
            ? 'bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 border-indigo-900/50'
            : 'bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 border-emerald-900/50'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  isTeacher
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}
              >
                {isTeacher
                  ? 'Protocolo Conners 4™ Docente (Escuela - 106 ítems)'
                  : 'Protocolo Conners 4™ Padres de Familia (Hogar - 114 ítems)'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                Baremo Estandarizado (Media=50, DE=10)
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {studentInfo.studentName || 'Estudiante Evaluado'} {studentInfo.studentLastName || ''}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Edad: <strong className="text-white">{studentInfo.age} años</strong> | Grado:{' '}
                <strong className="text-white">{studentInfo.grade || 'No indicado'}</strong> | Centro:{' '}
                <strong className="text-white">{studentInfo.schoolName || 'No indicado'}</strong>
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Informante:{' '}
                <strong className="text-slate-200">
                  {studentInfo.evaluatorFirstName} {studentInfo.evaluatorLastName || ''}
                </strong>{' '}
                ({isTeacher ? studentInfo.evaluatorRole : studentInfo.relationshipWithChild === 'BIOLOGICAL_PARENT' ? 'Padre/Madre Biológico' : 'Familiar/Tutor'}) • Fecha: {studentInfo.evaluationDate}
              </p>
            </div>

            {/* DSM-5-TR Classification Pill */}
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <div
                className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 ${
                  dsmEvaluation.presentation.includes('Combinada') ||
                  dsmEvaluation.presentation.includes('Predominio')
                    ? 'bg-rose-500/20 text-rose-200 border-rose-400/30'
                    : dsmEvaluation.presentation.includes('Subclínico')
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                    : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                }`}
              >
                <Brain className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                    Clasificación Sugerida DSM-5-TR ({isTeacher ? 'Ámbito Escolar' : 'Ámbito Hogar'})
                  </div>
                  <div className="text-sm font-extrabold">{dsmEvaluation.presentation}</div>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
                <span>Inatención: <strong>{dsmEvaluation.inattentionCount}/9</strong></span>
                <span className="mx-2">•</span>
                <span>Hiperactividad/Impulsividad: <strong>{dsmEvaluation.hyperactiveImpulsiveCount}/9</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-trigger-ai-narrative"
              onClick={onGenerateAiReport}
              disabled={isGeneratingAi}
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingAi ? 'Redactando con IA...' : 'Interpretar con IA (Gemini)'}</span>
            </button>

            {onNavigateToComparison && (
              <button
                type="button"
                id="btn-go-to-comparison"
                onClick={onNavigateToComparison}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
              >
                <GitCompare className="w-4 h-4" />
                <span>Comparativa Multi-Informante</span>
              </button>
            )}

            <button
              type="button"
              id="btn-print-report"
              onClick={onPrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Informe Oficial</span>
            </button>

            <button
              type="button"
              id="btn-edit-answers"
              onClick={onEditResponses}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Modificar Respuestas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PSYCHOMETRIC T-SCORE PROFILE VISUALIZER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Perfil Psicométrico de Puntuaciones T (Conners 4™)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Puntuaciones estandarizadas (Media = 50, DE = 10). Puntuaciones T ≥ 65 señalan significación clínica.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" /> Promedio (&lt;60)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Límite (60-64)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Elevada (≥65)
            </span>
          </div>
        </div>

        {/* T-Score Horizontal Scale Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {Object.values(scaleResults).map((res) => {
            const isElevated = res.tScore >= 65;
            const isBorderline = res.tScore >= 60 && res.tScore < 65;
            const barWidthPercent = Math.min(
              100,
              Math.max(5, ((res.tScore - 30) / (90 - 30)) * 100)
            );

            return (
              <div
                key={res.scale}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{res.shortName}</div>
                    <div className="text-[11px] text-slate-500">
                      PD: {res.rawScore}/{res.maxRawScore} • Percentil {res.percentile}% (IC95%: {res.ci95Low}-{res.ci95High})
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-black px-2 py-0.5 rounded-md ${
                        isElevated
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : isBorderline
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      T = {res.tScore}
                    </span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-2 relative">
                  {/* Guideline marker for T=65 (Clinical line) */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                    style={{ left: `${((65 - 30) / (90 - 30)) * 100}%` }}
                    title="Punto de corte clínico T=65"
                  />
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isElevated ? 'bg-rose-500' : isBorderline ? 'bg-amber-400' : 'bg-slate-600'
                    }`}
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. REPORT TABBED NAVIGATION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/70 p-1.5 gap-1">
          {[
            { id: 'qualitative', label: 'Informe Cualitativo Integral', icon: FileText },
            { id: 'ai_narrative', label: 'Interpretación IA Especializada', icon: Sparkles },
            { id: 'accommodations', label: isTeacher ? 'Adaptaciones para el Aula' : 'Pautas para el Hogar', icon: GraduationCap },
            { id: 'dsm_matrix', label: 'Criterios DSM-5-TR Detallados', icon: Brain },
            { id: 'open_responses', label: 'Respuestas Abiertas del Evaluador', icon: MessageSquare },
            { id: 'validity', label: 'Índices de Validez y Alertas', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-8">
          {/* TAB 1: INTEGRATED QUALITATIVE REPORT */}
          {activeTab === 'qualitative' && (
            <div className="space-y-6">
              {/* Executive Summary Section */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-700" />
                  1. Resumen Ejecutivo del Perfil
                </h4>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                  {qualitativeReport.executiveSummary}
                </p>
              </div>

              {/* Cognitive & Executive Function */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  2. Atención Focalizada y Funcionamiento Ejecutivo
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {qualitativeReport.cognitiveAttentionProfile}
                </p>
              </div>

              {/* Motor & Impulsivity */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  3. Control Motor e Inhibición Conductual
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {qualitativeReport.motorImpulsivityProfile}
                </p>
              </div>

              {/* Emotional & Mood */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-rose-600" />
                  4. Regulación Emocional y Afectividad
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {qualitativeReport.emotionalRegulationProfile}
                </p>
              </div>

              {/* Social Peer Relations */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  5. Dimensión Social e Interacción con Compañeros / Amigos
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {qualitativeReport.socialPeerProfile}
                </p>
              </div>

              {/* Setting Impact (Classroom vs Family) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  {isTeacher ? <GraduationCap className="w-4 h-4 text-indigo-600" /> : <Home className="w-4 h-4 text-emerald-600" />}
                  6. Impacto Funcional en {isTeacher ? 'el Aula y Rendimiento Académico' : 'el Hogar y Convivencia Familiar'}
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {qualitativeReport.settingImpactSummary}
                </p>
              </div>

              {/* Top Observed Behaviors */}
              {topObservedBehaviors.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Conductas con Mayor Frecuencia de Observación (Puntuadas con 2 o 3)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {topObservedBehaviors.slice(0, 8).map((b) => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs flex items-center justify-between gap-2"
                      >
                        <span className="text-slate-800 font-medium">{b.text}</span>
                        <span className="font-bold text-amber-900 shrink-0 px-2 py-0.5 rounded bg-amber-200/80">
                          {b.score === 3 ? 'Siempre (3)' : 'A menudo (2)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI SPECIALIZED NARRATIVE */}
          {activeTab === 'ai_narrative' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Informe Clínico Personalizado con IA (Gemini 3.7 Flash)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Generado a partir de los baremos oficiales Conners 4™ y criterios DSM-5-TR
                  </p>
                </div>
                {aiNarrative && (
                  <button
                    type="button"
                    onClick={handleCopyAiNarrative}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedAi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAi ? 'Copiado' : 'Copiar Texto'}</span>
                  </button>
                )}
              </div>

              {isGeneratingAi ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-bold text-sm text-slate-800">
                    Sintetizando informe psicopedagógico con IA...
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Analizando el perfil {isTeacher ? 'escolar (Docente)' : 'familiar (Padres)'} y generando recomendaciones clínicas personalizadas.
                  </p>
                </div>
              ) : aiNarrative ? (
                <div className="p-6 rounded-2xl bg-white border border-slate-200 prose prose-slate max-w-none text-sm leading-relaxed">
                  <Markdown>{aiNarrative}</Markdown>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
                  <div>
                    <p className="font-bold text-sm text-slate-800">
                      Aún no se ha generado la interpretación cualitativa con IA
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Haga clic en el botón a continuación para redactar automáticamente un informe neuropsicológico exhaustivo adaptado al entorno {isTeacher ? 'escolar' : 'familiar'}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onGenerateAiReport}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generar Informe con IA</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOMMODATIONS & GUIDANCE */}
          {activeTab === 'accommodations' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {isTeacher
                    ? 'Plan de Adaptaciones Psicopedagógicas en el Aula'
                    : 'Pautas de Organización y Rutinas para el Hogar'}
                </h4>
                <p className="text-xs text-slate-500">
                  Estrategias basadas en evidencia para favorecer el desempeño y la autorregulación
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {qualitativeReport.pedagogicalAccommodations.map((acc, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900">{acc.title}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{acc.description}</p>
                    </div>
                    <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                      {acc.strategies.map((st, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Family & School Guidance */}
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                  Pautas de Colaboración Escuela-Familia
                </h5>
                <ul className="space-y-1.5 text-xs text-amber-950">
                  {qualitativeReport.familyGuidance.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: DSM-5-TR MATRIX */}
          {activeTab === 'dsm_matrix' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Matriz de Criterios Diagnósticos DSM-5-TR
                </h4>
                <p className="text-xs text-slate-500">
                  Umbral requerido: ≥ 6 síntomas de inatención o ≥ 6 síntomas de hiperactividad/impulsividad en menores de 17 años
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inattention Domain */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-800">Criterio A1: Inatención</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        dsmEvaluation.inattentionEligible
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {dsmEvaluation.inattentionCount} / 9 Síntomas
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {dsmEvaluation.inattentionEligible
                      ? 'Cumple el umbral de 6 o más síntomas clínicos de inatención según el DSM-5-TR.'
                      : 'No alcanza el umbral de 6 síntomas para el subtipo inatento.'}
                  </p>
                </div>

                {/* Hyperactivity/Impulsivity Domain */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-800">
                      Criterio A2: Hiperactividad e Impulsividad
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        dsmEvaluation.hyperactiveImpulsiveEligible
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {dsmEvaluation.hyperactiveImpulsiveCount} / 9 Síntomas
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {dsmEvaluation.hyperactiveImpulsiveEligible
                      ? 'Cumple el umbral de 6 o más síntomas clínicos de hiperactividad/impulsividad.'
                      : 'No alcanza el umbral de 6 síntomas para el subtipo hiperactivo.'}
                  </p>
                </div>
              </div>

              {/* DSM Criterio C Note */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">
                  Nota Clínica sobre el Criterio C del DSM-5-TR:
                </span>
                <p>
                  El DSM-5-TR exige que varios síntomas de inatención o hiperactivo-impulsivos estén presentes en dos o más entornos (por ejemplo, en el hogar y en la escuela). Este protocolo documenta los síntomas observados específicamente en {isTeacher ? 'la escuela por el docente' : 'el hogar por los padres'}. Para confirmar el diagnóstico formal se recomienda la correlación con la otra fuente.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: OPEN-ENDED RESPONSES */}
          {activeTab === 'open_responses' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Observaciones Descriptivas del Evaluador ({isTeacher ? 'Ítems 107 a 109' : 'Ítems 115 a 117'})
                </h4>
                <p className="text-xs text-slate-500">
                  Comentarios abiertos provistos durante la administración del folleto
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-700">
                    {isTeacher
                      ? '107. Problemas serios causados por estos comportamientos en la escuela o con amigos:'
                      : '115. Problemas serios causados por estos comportamientos en el hogar, escuela o con amigos:'}
                  </div>
                  <p className="text-sm text-slate-900 font-medium">
                    {openEndedResponses?.item107_115_seriousProblems || 'Sin observaciones registradas.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-700">
                    {isTeacher
                      ? '108. Otras preocupaciones acerca del estudiante:'
                      : '116. Otras preocupaciones acerca de su hijo(a):'}
                  </div>
                  <p className="text-sm text-slate-900 font-medium">
                    {openEndedResponses?.item108_116_otherConcerns || 'Sin observaciones registradas.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-700">
                    {isTeacher
                      ? '109. Fortalezas o habilidades destacadas del estudiante:'
                      : '117. Fortalezas o habilidades destacadas de su hijo(a):'}
                  </div>
                  <p className="text-sm text-slate-900 font-medium">
                    {openEndedResponses?.item109_117_strengths || 'Sin observaciones registradas.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VALIDITY & CRITICAL ITEMS */}
          {activeTab === 'validity' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Índices de Validez del Protocolo y Conductas Críticas
                </h4>
                <p className="text-xs text-slate-500">
                  Control de inconsistencia de respuestas, omisiones y conductas de riesgo
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-semibold text-slate-500">Índice de Inconsistencia (INC)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {validityIndices.inconsistencyScore} pts
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {validityIndices.inconsistencyElevated ? 'Elevado (Inconsistente)' : 'Adecuado / Consistente'}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-semibold text-slate-500">Índice Impresión Negativa (NI)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {validityIndices.negativeImpressionScore} / {result.formType === 'TEACHER' ? 106 : 114}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {validityIndices.negativeImpressionElevated ? 'Muy elevado' : 'Típico'}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-semibold text-slate-500">Ítems Omitidos</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {validityIndices.omittedCount} ítems
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {validityIndices.omittedCount === 0 ? 'Protocolo 100% Completo' : 'Omisiones registradas'}
                  </div>
                </div>
              </div>

              {/* Critical Items List */}
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Ítems Críticos de Alerta Reportados ({criticalItems.length})
                </h5>

                {criticalItems.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    No se reportaron conductas de riesgo o ítems críticos en este protocolo.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {criticalItems.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="font-bold text-rose-900 mr-2">Ítem {c.itemNumber}:</span>
                          <span className="text-rose-950">{c.text}</span>
                          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                            {c.category}
                          </span>
                        </div>
                        <span className="font-black text-rose-700 shrink-0 px-2 py-1 rounded bg-rose-200">
                          Puntaje: {c.score}/3
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
