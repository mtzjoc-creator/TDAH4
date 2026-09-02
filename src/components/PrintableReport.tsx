import React from 'react';
import {
  FullAssessmentResult,
  MultiInformantComparison,
  ScaleType,
} from '../types';
import Markdown from 'react-markdown';

interface PrintableReportProps {
  result: FullAssessmentResult | null;
  aiNarrative: string | null;
  comparisonResult?: MultiInformantComparison | null;
  aiJointNarrative?: string | null;
  isComparisonPrint?: boolean;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  result,
  aiNarrative,
  comparisonResult,
  aiJointNarrative,
  isComparisonPrint,
}) => {
  // If printing Joint Comparison Report
  if (isComparisonPrint && comparisonResult) {
    const { assessment1, assessment2, jointAnalysis, chartData } = comparisonResult;
    const isDocenteVsPadres = comparisonResult.comparisonType === 'DOCENTE_VS_PADRES';

    return (
      <div className="hidden print:block p-8 max-w-4xl mx-auto bg-white text-slate-900 text-xs leading-relaxed space-y-6">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              Informe Oficial de Evaluación Comparativa y Análisis Conjunto TDAH
            </h1>
            <p className="text-sm font-bold text-indigo-900">
              Escala Conners 4ta Edición (Conners 4™) — Integración Multi-Informante (Docente vs. Padres)
            </p>
            <p className="text-[11px] text-slate-600">
              Criterios diagnósticos DSM-5-TR | Baremos Estandarizados (Media=50, DE=10) | Validación de Criterio C
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-600">
            <div>Fecha: <strong>{new Date().toLocaleDateString()}</strong></div>
            <div>Tipo: <strong>{isDocenteVsPadres ? 'Multi-Informante' : 'Evolución'}</strong></div>
          </div>
        </div>

        {/* Student & Informants Data */}
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 space-y-2">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            I. Datos Generales e Informantes
          </h2>
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div><strong>Alumno/a:</strong> {jointAnalysis.studentName}</div>
            <div><strong>Edad:</strong> {jointAnalysis.studentAge} años</div>
            <div><strong>Escuela:</strong> {assessment1.studentInfo.schoolName || 'N/A'}</div>
            <div><strong>Evaluador 1:</strong> {jointAnalysis.evaluator1Title} ({jointAnalysis.evaluation1Date})</div>
            <div><strong>Evaluador 2:</strong> {jointAnalysis.evaluator2Title} ({jointAnalysis.evaluation2Date})</div>
            <div><strong>Modalidad:</strong> {jointAnalysis.comparisonType}</div>
          </div>
        </div>

        {/* Joint Diagnostic Synthesis */}
        <div className="border-l-4 border-indigo-700 pl-4 py-1.5 bg-indigo-50/40 rounded-r-lg">
          <div className="text-xs font-bold text-slate-600">Dictamen Diagnóstico Integrado (DSM-5-TR):</div>
          <div className="text-base font-extrabold text-indigo-950">{jointAnalysis.jointPresentation}</div>
          <div className="text-xs font-bold text-rose-700 mt-0.5">
            NIVEL DE GRAVEDAD: {jointAnalysis.severityLevel}
          </div>
          <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
            {jointAnalysis.severityRationale}
          </p>
          <div className="text-[11px] font-semibold text-slate-800 mt-1.5">
            <strong>Criterio C DSM-5-TR:</strong> {jointAnalysis.criterionCExplanation}
          </div>
        </div>

        {/* Comparative Scales Table */}
        <div className="space-y-2">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            II. Tabla Comparativa de Puntuaciones T Estandarizadas
          </h2>
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-left">
                <th className="border border-slate-300 p-1.5">Escala / Dimensión</th>
                <th className="border border-slate-300 p-1.5 text-center">
                  {assessment1.formType === 'TEACHER' ? 'Docente (Escuela)' : 'Eval 1'}
                </th>
                <th className="border border-slate-300 p-1.5 text-center">
                  {assessment2.formType === 'PARENT' ? 'Padres (Hogar)' : 'Eval 2'}
                </th>
                <th className="border border-slate-300 p-1.5 text-center">Diferencia (Δ)</th>
                <th className="border border-slate-300 p-1.5">Interpretación Transituacional</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.scaleKey} className={row.diffAbs >= 15 ? 'bg-amber-50/50' : ''}>
                  <td className="border border-slate-300 p-1.5 font-medium">{row.scaleName}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold text-indigo-900">
                    T={row.tScore1} ({row.classification1})
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold text-emerald-900">
                    T={row.tScore2} ({row.classification2})
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold">
                    {row.diff > 0 ? `+${row.diff}` : row.diff}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-slate-700">
                    {row.diffAbs >= 15
                      ? row.tScore1 > row.tScore2
                        ? 'Mayor afectación escolar (discrepancia sustancial)'
                        : 'Mayor afectación en el hogar (discrepancia sustancial)'
                      : row.diffAbs >= 10
                      ? 'Diferencia contextual moderada'
                      : 'Alta concordancia transituacional'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Qualitative Synthesis of Convergences & Divergences */}
        <div className="grid grid-cols-2 gap-4 text-[11px]">
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1">
            <h3 className="font-bold text-emerald-900 uppercase">Convergencias Transituacionales</h3>
            <p className="text-slate-700">{jointAnalysis.convergenceSummary}</p>
          </div>
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1">
            <h3 className="font-bold text-amber-900 uppercase">Discrepancias Contextuales</h3>
            <p className="text-slate-700">{jointAnalysis.divergenceSummary}</p>
          </div>
        </div>

        {/* Coordinated Action Plan */}
        <div className="space-y-3">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            III. Plan de Acción Integrado (Escuela, Hogar y Clínica)
          </h2>
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div className="border border-slate-200 rounded p-2.5 space-y-1 bg-indigo-50/30">
              <strong className="text-indigo-950 block border-b border-indigo-100 pb-0.5">Adaptaciones de Aula:</strong>
              <ul className="list-disc pl-3.5 space-y-1 text-slate-700">
                {jointAnalysis.schoolActionPlan.slice(0, 4).map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="border border-slate-200 rounded p-2.5 space-y-1 bg-emerald-50/30">
              <strong className="text-emerald-950 block border-b border-emerald-100 pb-0.5">Pautas para el Hogar:</strong>
              <ul className="list-disc pl-3.5 space-y-1 text-slate-700">
                {jointAnalysis.homeActionPlan.slice(0, 4).map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="border border-slate-200 rounded p-2.5 space-y-1 bg-purple-50/30">
              <strong className="text-purple-950 block border-b border-purple-100 pb-0.5">Seguimiento Clínico:</strong>
              <ul className="list-disc pl-3.5 space-y-1 text-slate-700">
                {jointAnalysis.multidisciplinaryClinicalPlan.slice(0, 4).map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Joint Narrative if generated */}
        {aiJointNarrative && (
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              IV. Informe Cualitativo Especializado con IA (Gemini 3.7 Flash)
            </h2>
            <div className="prose prose-xs max-w-none text-[11px] leading-relaxed">
              <Markdown>{aiJointNarrative}</Markdown>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[11px]">
          <div className="border-t border-slate-400 pt-2">
            <p className="font-bold">Orientador/a / Psicopedagogo/a</p>
            <p className="text-slate-500">Departamento de Orientación Escolar</p>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <p className="font-bold">Especialista en Neuropsicología / Psiquiatría</p>
            <p className="text-slate-500">Equipo Clínico Evaluador</p>
          </div>
        </div>
      </div>
    );
  }

  // If printing Single Assessment Report
  if (!result) return null;

  const {
    studentInfo,
    scaleResults,
    dsmEvaluation,
    validityIndices,
    criticalItems,
    qualitativeReport,
    openEndedResponses,
    completedAt,
  } = result;

  const isTeacher = result.formType === 'TEACHER';

  return (
    <div className="hidden print:block p-8 max-w-4xl mx-auto bg-white text-slate-900 text-xs leading-relaxed space-y-6">
      {/* Official Header */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
            Informe Oficial de Evaluación Psicométrica y Cualitativa TDAH
          </h1>
          <p className="text-sm font-bold text-indigo-900">
            Escala Conners 4ta Edición (Conners 4™) — {isTeacher ? 'Folleto de Docentes (106 ítems)' : 'Folleto de Padres de Familia (114 ítems)'}
          </p>
          <p className="text-[11px] text-slate-600">
            Autor: C. Keith Conners, PhD | Criterios diagnósticos DSM-5-TR | Baremos Estandarizados (Media=50, DE=10)
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          <div>Fecha Emisión: <strong>{new Date(completedAt).toLocaleDateString()}</strong></div>
          <div>Folio: <strong>{result.id}</strong></div>
        </div>
      </div>

      {/* Student & Informant Demographics Table */}
      <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 space-y-2">
        <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
          I. Datos de Identificación ({isTeacher ? 'Ámbito Escolar / Docente' : 'Ámbito Familiar / Padres'})
        </h2>
        <div className="grid grid-cols-3 gap-3 text-[11px]">
          <div><strong>Alumno/a:</strong> {studentInfo.studentName || 'N/A'} {studentInfo.studentLastName || ''}</div>
          <div><strong>Edad:</strong> {studentInfo.age} años</div>
          <div><strong>Género:</strong> {studentInfo.gender === 'M' ? 'Masculino' : studentInfo.gender === 'F' ? 'Femenino' : 'Otro'}</div>
          <div><strong>Grado / Curso:</strong> {studentInfo.grade || 'N/A'}</div>
          <div><strong>Centro Educativo:</strong> {studentInfo.schoolName || 'N/A'}</div>
          <div><strong>ID / Expediente:</strong> {studentInfo.studentId || 'N/A'}</div>
          <div><strong>Informante:</strong> {studentInfo.evaluatorFirstName} {studentInfo.evaluatorLastName || ''}</div>
          <div>
            <strong>Relación / Rol:</strong>{' '}
            {isTeacher
              ? studentInfo.evaluatorRole
              : studentInfo.relationshipWithChild === 'BIOLOGICAL_PARENT'
              ? 'Padre/Madre Biológico'
              : 'Tutor / Familiar'}
          </div>
          <div><strong>Fecha Evaluación:</strong> {studentInfo.evaluationDate}</div>
        </div>
      </div>

      {/* DSM-5-TR Preliminary Summary */}
      <div className="border-l-4 border-indigo-700 pl-4 py-1">
        <div className="text-xs font-bold text-slate-600">Conclusión Diagnóstica Preliminar (DSM-5-TR):</div>
        <div className="text-sm font-extrabold text-indigo-950">{dsmEvaluation.presentation}</div>
        <p className="text-[11px] text-slate-700 mt-0.5">{dsmEvaluation.qualitativeSummary}</p>
        <p className="text-[10px] text-slate-500 mt-1 italic">{dsmEvaluation.pervasiveMultiSettingNotes}</p>
      </div>

      {/* Standard Psychometric Table */}
      <div className="space-y-2">
        <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800">
          II. Resumen Psicométrico de Escalas Estandarizadas Conners 4™
        </h2>
        <table className="w-full border-collapse border border-slate-300 text-[11px]">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-left">
              <th className="border border-slate-300 p-1.5">Escala Evaluada</th>
              <th className="border border-slate-300 p-1.5 text-center">PD</th>
              <th className="border border-slate-300 p-1.5 text-center">Punt. T</th>
              <th className="border border-slate-300 p-1.5 text-center">Percentil</th>
              <th className="border border-slate-300 p-1.5 text-center">IC 95%</th>
              <th className="border border-slate-300 p-1.5">Clasificación Clínica</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(scaleResults) as ScaleType[]).map((k) => {
              const s = scaleResults[k];
              const isElevated = s.tScore >= 65;
              return (
                <tr key={k} className={isElevated ? 'bg-amber-50/60 font-semibold' : ''}>
                  <td className="border border-slate-300 p-1.5">{s.name}</td>
                  <td className="border border-slate-300 p-1.5 text-center">{s.rawScore}/{s.maxRawScore}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold text-indigo-900">{s.tScore}</td>
                  <td className="border border-slate-300 p-1.5 text-center">{s.percentile}%</td>
                  <td className="border border-slate-300 p-1.5 text-center">{s.ci95Low}-{s.ci95High}</td>
                  <td className="border border-slate-300 p-1.5">{s.classification}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Qualitative Interpretation Sections */}
      <div className="space-y-3">
        <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
          III. Análisis Cualitativo del Perfil Conductual
        </h2>

        <div className="space-y-2 text-[11px]">
          <div>
            <strong>1. Resumen Ejecutivo:</strong> {qualitativeReport.executiveSummary}
          </div>
          <div>
            <strong>2. Atención Focalizada y Función Ejecutiva:</strong> {qualitativeReport.cognitiveAttentionProfile}
          </div>
          <div>
            <strong>3. Control Motor e Impulsividad:</strong> {qualitativeReport.motorImpulsivityProfile}
          </div>
          <div>
            <strong>4. Regulación Emocional y Afectividad:</strong> {qualitativeReport.emotionalRegulationProfile}
          </div>
          <div>
            <strong>5. Dimensión Social / Pares:</strong> {qualitativeReport.socialPeerProfile}
          </div>
          <div>
            <strong>6. Impacto en {isTeacher ? 'el Aula / Rendimiento' : 'el Hogar / Familia'}:</strong> {qualitativeReport.settingImpactSummary}
          </div>
        </div>
      </div>

      {/* Open-Ended Responses Section */}
      {(openEndedResponses?.item107_115_seriousProblems || openEndedResponses?.item108_116_otherConcerns || openEndedResponses?.item109_117_strengths) && (
        <div className="space-y-2 border border-slate-300 rounded-lg p-3 bg-slate-50">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            IV. Observaciones Abiertas del Evaluador
          </h2>
          {openEndedResponses.item107_115_seriousProblems && (
            <div className="text-[11px]">
              <strong>Problemas e interferencia funcional:</strong> {openEndedResponses.item107_115_seriousProblems}
            </div>
          )}
          {openEndedResponses.item108_116_otherConcerns && (
            <div className="text-[11px]">
              <strong>Otras preocupaciones:</strong> {openEndedResponses.item108_116_otherConcerns}
            </div>
          )}
          {openEndedResponses.item109_117_strengths && (
            <div className="text-[11px]">
              <strong>Fortalezas y habilidades observadas:</strong> {openEndedResponses.item109_117_strengths}
            </div>
          )}
        </div>
      )}

      {/* AI Narrative if present */}
      {aiNarrative && (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            V. Síntesis Clínica Especializada con IA
          </h2>
          <div className="prose prose-xs max-w-none text-[11px]">
            <Markdown>{aiNarrative}</Markdown>
          </div>
        </div>
      )}

      {/* Signatures Section */}
      <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[11px]">
        <div className="border-t border-slate-400 pt-2">
          <p className="font-bold">{studentInfo.evaluatorFirstName} {studentInfo.evaluatorLastName || ''}</p>
          <p className="text-slate-500">{isTeacher ? studentInfo.evaluatorRole : 'Familiar / Evaluador'}</p>
        </div>
        <div className="border-t border-slate-400 pt-2">
          <p className="font-bold">Especialista / Profesional Revisor</p>
          <p className="text-slate-500">Psicopedagogía / Neuropsicología Clínica</p>
        </div>
      </div>
    </div>
  );
};

