import React, { useState } from 'react';
import {
  FullAssessmentResult,
  MultiInformantComparison,
  SeverityLevel,
  ScaleType,
} from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import {
  GitCompare,
  Sparkles,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Home,
  Calendar,
  Layers,
  TrendingUp,
  ArrowRight,
  School,
  FileText,
  Activity,
  HeartHandshake,
  Stethoscope,
  Copy,
  Check,
} from 'lucide-react';

interface ComparisonDashboardProps {
  comparison: MultiInformantComparison;
  savedAssessments: FullAssessmentResult[];
  onSelectAssessment1: (id: string) => void;
  onSelectAssessment2: (id: string) => void;
  onLoadPredefinedPair: (pairKey: 'mateo' | 'sofia' | 'lucas') => void;
  onGenerateAiJointReport: () => void;
  isGeneratingAi: boolean;
  aiJointNarrative: string | null;
  onPrint: () => void;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({
  comparison,
  savedAssessments,
  onSelectAssessment1,
  onSelectAssessment2,
  onLoadPredefinedPair,
  onGenerateAiJointReport,
  isGeneratingAi,
  aiJointNarrative,
  onPrint,
}) => {
  const [chartCategoryFilter, setChartCategoryFilter] = useState<
    'ALL' | 'CONTENT' | 'DSM' | 'IMPAIRMENT'
  >('ALL');
  const [copiedAi, setCopiedAi] = useState(false);

  const { assessment1, assessment2, comparisonType, chartData, jointAnalysis } =
    comparison;

  const isTeacher1 = assessment1.formType === 'TEACHER';
  const isTeacher2 = assessment2.formType === 'TEACHER';

  // Filter chart data
  const filteredChartData = chartData.filter((item) => {
    if (chartCategoryFilter === 'ALL') return true;
    return item.category === chartCategoryFilter;
  });

  const getSeverityBadge = (level: SeverityLevel) => {
    switch (level) {
      case 'GRAVE':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          label: 'GRAVEDAD SEVERA / GRAVE',
        };
      case 'MODERADO':
        return {
          bg: 'bg-orange-100 text-orange-800 border-orange-300',
          dot: 'bg-orange-600',
          label: 'GRAVEDAD MODERADA',
        };
      case 'LEVE':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-600',
          label: 'GRAVEDAD LEVE',
        };
      case 'TÍPICO':
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
          label: 'RANGO TÍPICO / PROMEDIO',
        };
    }
  };

  const getPresentationColor = (pres: string) => {
    if (pres.includes('Combinada')) return 'from-rose-600 to-indigo-700 text-white';
    if (pres.includes('Inatento')) return 'from-blue-600 to-indigo-700 text-white';
    if (pres.includes('Hiperactivo')) return 'from-amber-600 to-orange-700 text-white';
    return 'from-slate-700 to-slate-900 text-white';
  };

  const sevBadge = getSeverityBadge(jointAnalysis.severityLevel);

  const handleCopyAi = () => {
    if (!aiJointNarrative) return;
    navigator.clipboard.writeText(aiJointNarrative);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Controls & Selector Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700">
              <GitCompare className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Módulo de Comparación Psicométrica y Análisis Conjunto
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Comparativa Visual y Evolución (Docentes vs. Padres / Longitudinal)
            </h2>
            <p className="text-xs text-slate-500">
              Cotejo transituacional de puntuaciones T (Conners 4™), validación del Criterio C (DSM-5-TR) y determinación conjunta de tipo y gravedad.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5 text-slate-600" />
              Imprimir Informe Comparativo
            </button>
            <button
              type="button"
              onClick={onGenerateAiJointReport}
              disabled={isGeneratingAi}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-300 animate-pulse" />
              {isGeneratingAi ? 'Redactando con IA...' : 'Generar Informe Conjunto con IA'}
            </button>
          </div>
        </div>

        {/* Informant Selectors & Sample Pairs */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {/* Assessment 1 Picker */}
            <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
              <label className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                {isTeacher1 ? <GraduationCap className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                <span>Evaluación 1 ({isTeacher1 ? 'Docente' : 'Padres'})</span>
              </label>
              <select
                className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                value={assessment1.id}
                onChange={(e) => onSelectAssessment1(e.target.value)}
              >
                {savedAssessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.studentInfo.studentName} ({a.formType === 'TEACHER' ? 'Docente' : 'Padres'}) - {new Date(a.completedAt).toLocaleDateString()}
                  </option>
                ))}
                {!savedAssessments.some((a) => a.id === assessment1.id) && (
                  <option value={assessment1.id}>
                    {assessment1.studentInfo.studentName} ({assessment1.formType === 'TEACHER' ? 'Docente' : 'Padres'}) [Actual]
                  </option>
                )}
              </select>
              <div className="text-[11px] text-indigo-700 flex justify-between">
                <span>Informante: {assessment1.studentInfo.evaluatorFirstName || 'No especificado'}</span>
                <span>{assessment1.studentInfo.evaluationDate}</span>
              </div>
            </div>

            {/* Assessment 2 Picker */}
            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
              <label className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                {isTeacher2 ? <GraduationCap className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                <span>Evaluación 2 ({isTeacher2 ? 'Docente' : 'Padres'})</span>
              </label>
              <select
                className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                value={assessment2.id}
                onChange={(e) => onSelectAssessment2(e.target.value)}
              >
                {savedAssessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.studentInfo.studentName} ({a.formType === 'TEACHER' ? 'Docente' : 'Padres'}) - {new Date(a.completedAt).toLocaleDateString()}
                  </option>
                ))}
                {!savedAssessments.some((a) => a.id === assessment2.id) && (
                  <option value={assessment2.id}>
                    {assessment2.studentInfo.studentName} ({assessment2.formType === 'TEACHER' ? 'Docente' : 'Padres'}) [Actual]
                  </option>
                )}
              </select>
              <div className="text-[11px] text-emerald-700 flex justify-between">
                <span>Informante: {assessment2.studentInfo.evaluatorFirstName || 'No especificado'}</span>
                <span>{assessment2.studentInfo.evaluationDate}</span>
              </div>
            </div>
          </div>

          {/* Quick Predefined Pairs */}
          <div className="flex flex-col gap-1.5 justify-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Casos de Muestra Multi-Informante:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onLoadPredefinedPair('mateo')}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 rounded-lg transition-colors border border-slate-200"
              >
                Caso Mateo (Combinado Grave)
              </button>
              <button
                type="button"
                onClick={() => onLoadPredefinedPair('sofia')}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 rounded-lg transition-colors border border-slate-200"
              >
                Caso Sofía (Inatento Moderado)
              </button>
              <button
                type="button"
                onClick={() => onLoadPredefinedPair('lucas')}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 rounded-lg transition-colors border border-slate-200"
              >
                Caso Lucas (Evolución Pre/Post)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* JOINT DIAGNOSTIC DETERMINATION HERO BANNER */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
        <div className={`p-6 sm:p-8 bg-linear-to-r ${getPresentationColor(jointAnalysis.jointPresentation)}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold tracking-wide uppercase border border-white/30">
                  Dictamen Diagnóstico Integrado
                </span>
                <span className="px-3 py-1 rounded-full bg-white text-slate-900 text-xs font-bold">
                  {jointAnalysis.comparisonType === 'DOCENTE_VS_PADRES'
                    ? 'Evaluación Multi-Informante (Escuela + Hogar)'
                    : 'Evaluación de Evolución Temporal'}
                </span>
                <span className="text-white/90 text-xs font-medium">
                  {jointAnalysis.studentName} ({jointAnalysis.studentAge} años)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
                {jointAnalysis.jointPresentation}
              </h1>
              <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
                {jointAnalysis.executiveJointSummary}
              </p>
            </div>

            {/* Severity Level Block */}
            <div className="bg-white/95 text-slate-900 rounded-2xl p-4 shadow-xl border border-white/40 flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Nivel de Gravedad (DSM-5-TR)
              </span>
              <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${sevBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${sevBadge.dot}`} />
                {sevBadge.label}
              </span>
              <p className="text-[11px] text-slate-600 font-medium mt-1.5 leading-snug max-w-[190px]">
                {jointAnalysis.jointPresentation === 'Sin evidencia clínica suficiente'
                  ? 'Sin deterioro clínico significativo'
                  : jointAnalysis.severityLevel === 'GRAVE'
                  ? 'Alto impacto en escuela y hogar con elevación clínica severa'
                  : jointAnalysis.severityLevel === 'MODERADO'
                  ? 'Interferencia evidente en tareas escolares y convivencia'
                  : 'Afectación leve o compensada con apoyos básicos'}
              </p>
            </div>
          </div>
        </div>

        {/* Criterion C & Cross-Setting Key Indicators */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Criterio C (DSM-5-TR)
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                  jointAnalysis.criterionCStatus === 'CUMPLIDO_GENERALIZADO'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : jointAnalysis.criterionCStatus === 'PARCIAL_UN_ENTORNO'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {jointAnalysis.criterionCStatus === 'CUMPLIDO_GENERALIZADO'
                  ? 'CUMPLIDO (2+ ENTORNOS)'
                  : jointAnalysis.criterionCStatus === 'PARCIAL_UN_ENTORNO'
                  ? 'PARCIAL (1 ENTORNO)'
                  : 'NO CUMPLIDO'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {jointAnalysis.criterionCExplanation}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <School className="w-4 h-4 text-indigo-600" />
              Impacto Funcional Escolar
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-indigo-900">
                {jointAnalysis.schoolFunctionalImpact}
              </span>
              <span className="text-[11px] text-slate-500">
                (Académico T={Math.max(assessment1.scaleResults.IMP_ACADEMIC?.tScore || 50, assessment2.scaleResults.IMP_ACADEMIC?.tScore || 50)})
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Dificultades en finalización de tareas, atención sostenida en clase y clima de convivencia escolar.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-600" />
              Impacto en la Vida Familiar
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-emerald-900">
                {jointAnalysis.homeFunctionalImpact}
              </span>
              <span className="text-[11px] text-slate-500">
                (Familiar T={Math.max(assessment1.scaleResults.IMP_FAMILY?.tScore || 50, assessment2.scaleResults.IMP_FAMILY?.tScore || 50)})
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Interferencia en rutinas del hogar, realización de deberes en casa y regulación afectiva en familia.
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE COMPARATIVE LINE CHART SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700">
              <Activity className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Gráfico Comparativo de Puntuaciones T Estandarizadas
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Perfil Transituacional y Evolución de Escalas Conners 4™
            </h3>
            <p className="text-xs text-slate-500">
              Líneas de corte clínico: T=60 (Límite), T=65 (Elevada) y T=70 (Muy Elevada). Media Poblacional = 50.
            </p>
          </div>

          {/* Chart Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold self-start sm:self-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setChartCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartCategoryFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas (13)
            </button>
            <button
              type="button"
              onClick={() => setChartCategoryFilter('CONTENT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartCategoryFilter === 'CONTENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contenido (7)
            </button>
            <button
              type="button"
              onClick={() => setChartCategoryFilter('DSM')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartCategoryFilter === 'DSM'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Criterios DSM-5-TR (4)
            </button>
            <button
              type="button"
              onClick={() => setChartCategoryFilter('IMPAIRMENT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartCategoryFilter === 'IMPAIRMENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deterioro (2)
            </button>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredChartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 65 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="scaleName"
                angle={-35}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                height={65}
              />
              <YAxis
                domain={[30, 95]}
                ticks={[30, 40, 50, 60, 65, 70, 80, 90]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{
                  value: 'Puntuación T (Media=50, DE=10)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#64748b', fontSize: 11 },
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as (typeof filteredChartData)[0];
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-2 border border-slate-700 min-w-[220px]">
                        <p className="font-bold text-indigo-300 text-sm border-b border-slate-800 pb-1">
                          {label} ({data.scaleKey})
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-indigo-200">
                            <span className="flex items-center gap-1 font-semibold">
                              <span className="w-2 h-2 rounded-full bg-indigo-400" />
                              {assessment1.formType === 'TEACHER' ? 'Docente' : 'Eval 1'}:
                            </span>
                            <span className="font-bold text-white">
                              T = {data.tScore1} ({data.classification1})
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-200">
                            <span className="flex items-center gap-1 font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              {assessment2.formType === 'PARENT' ? 'Padres' : 'Eval 2'}:
                            </span>
                            <span className="font-bold text-white">
                              T = {data.tScore2} ({data.classification2})
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-amber-300 font-bold">
                            <span>Diferencia (Δ):</span>
                            <span>{data.diff > 0 ? `+${data.diff}` : data.diff} pts T</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px' }}
              />

              {/* Reference Lines for Clinical Cutoffs */}
              <ReferenceLine
                y={50}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{ value: 'T=50 (Media)', fill: '#94a3b8', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={60}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{ value: 'T=60 (Límite)', fill: '#d97706', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={65}
                stroke="#ea580c"
                strokeDasharray="3 3"
                label={{ value: 'T=65 (Elevada)', fill: '#c2410c', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={70}
                stroke="#e11d48"
                strokeDasharray="3 3"
                label={{ value: 'T=70 (Muy Elevada)', fill: '#be123c', fontSize: 10, position: 'right' }}
              />

              {/* Line 1: Evaluation 1 (Docente / Blue-Indigo) */}
              <Line
                type="monotone"
                dataKey="tScore1"
                name={`${assessment1.formType === 'TEACHER' ? 'Docente (Escuela)' : 'Evaluación 1'} [T]`}
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, stroke: '#4f46e5', strokeWidth: 2 }}
              />

              {/* Line 2: Evaluation 2 (Padres / Emerald-Teal) */}
              <Line
                type="monotone"
                dataKey="tScore2"
                name={`${assessment2.formType === 'PARENT' ? 'Padres (Hogar)' : 'Evaluación 2'} [T]`}
                stroke="#059669"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, stroke: '#059669', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DETAILED COMPARATIVE TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabla Comparativa de Escalas y Baremos
            </h3>
            <p className="text-xs text-slate-500">
              Análisis detallado de concordancia y discrepancia psicométrica por dominio evaluado
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              {assessment1.formType === 'TEACHER' ? 'Folleto Docente' : 'Evaluación 1'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              {assessment2.formType === 'PARENT' ? 'Folleto Padres' : 'Evaluación 2'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Escala / Dimensión</th>
                <th className="py-3 px-4">
                  {assessment1.formType === 'TEACHER' ? 'Docente (Escuela)' : 'Eval 1'}
                </th>
                <th className="py-3 px-4">
                  {assessment2.formType === 'PARENT' ? 'Padres (Hogar)' : 'Eval 2'}
                </th>
                <th className="py-3 px-4 text-center">Diferencia (Δ)</th>
                <th className="py-3 px-4">Interpretación Transituacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartData.map((row) => {
                const isHighDiff = row.diffAbs >= 15;
                const isModDiff = row.diffAbs >= 10 && row.diffAbs < 15;

                return (
                  <tr key={row.scaleKey} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{row.scaleName}</div>
                      <span className="text-[10px] text-slate-400 font-normal uppercase">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>T = {row.tScore1}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            row.band1 === 'VERY_ELEVATED'
                              ? 'bg-rose-100 text-rose-800'
                              : row.band1 === 'ELEVATED'
                              ? 'bg-orange-100 text-orange-800'
                              : row.band1 === 'BORDERLINE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {row.classification1}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>T = {row.tScore2}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            row.band2 === 'VERY_ELEVATED'
                              ? 'bg-rose-100 text-rose-800'
                              : row.band2 === 'ELEVATED'
                              ? 'bg-orange-100 text-orange-800'
                              : row.band2 === 'BORDERLINE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {row.classification2}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          isHighDiff
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isModDiff
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {row.diff > 0 ? `+${row.diff}` : row.diff} pts
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      {isHighDiff ? (
                        <span className="text-rose-700 font-semibold">
                          {row.tScore1 > row.tScore2
                            ? 'Mayor afectación en la escuela'
                            : 'Mayor afectación en el hogar'}{' '}
                          (discrepancia sustancial)
                        </span>
                      ) : isModDiff ? (
                        <span className="text-amber-800">
                          Diferencia contextual moderada entre entornos
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          Alta concordancia transituacional
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONVERGENCES AND DISCREPANCIES CLINICAL ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Convergencias y Hallazgos Transituacionales
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {jointAnalysis.convergenceSummary}
          </p>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-emerald-950 text-xs space-y-1">
            <strong className="block text-emerald-900">Implicación Clínica:</strong>
            Las conductas coincidentes en el aula y en casa demuestran la naturaleza neurobiológica y generalizada del cuadro, descartando que se trate de un problema reactivo aislado a un profesor o dinámica familiar puntual.
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Análisis de Discrepancias Contextuales
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {jointAnalysis.divergenceSummary}
          </p>
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-amber-950 text-xs space-y-1">
            <strong className="block text-amber-900">Comprensión de Diferencias:</strong>
            Es común observar mayor inatención en la escuela (debido a demandas prolongadas de foco pasivo y estímulos competitivos) y mayor desregulación o impulsividad en el hogar (por fatiga atencional acumulada o menor estructuración).
          </div>
        </div>
      </div>

      {/* UNIFIED JOINT ACTION PLAN (SCHOOL + HOME + CLINICAL) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-2 text-indigo-700">
          <HeartHandshake className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Plan de Acción y Recomendaciones Integradas
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          Estrategias Coordinadas para la Escuela, el Hogar y el Equipo de Salud
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* School Plan */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
              <School className="w-4 h-4 text-indigo-700" />
              <span>Para el Equipo Docente (Aula)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {jointAnalysis.schoolActionPlan.map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Home Plan */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <Home className="w-4 h-4 text-emerald-700" />
              <span>Para la Familia (Hogar)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {jointAnalysis.homeActionPlan.map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Multidisciplinary Clinical Plan */}
          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
            <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
              <Stethoscope className="w-4 h-4 text-purple-700" />
              <span>Seguimiento Clínico y Derivación</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {jointAnalysis.multidisciplinaryClinicalPlan.map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* AI-GENERATED JOINT NARRATIVE REPORT */}
      {aiJointNarrative && (
        <div className="bg-white rounded-3xl border border-indigo-200 p-6 sm:p-8 shadow-lg space-y-4 animate-in fade-in zoom-in-98 duration-200">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
            <div className="flex items-center space-x-2 text-indigo-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">
                Informe Cualitativo de Integración Multi-Informante (IA Gemini 3.7 Flash)
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCopyAi}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copiedAi ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1 text-slate-600" />
                  Copiar Informe
                </>
              )}
            </button>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
            <ReactMarkdown>{aiJointNarrative}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
