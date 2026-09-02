import {
  ClinicalBand,
  ComparisonLineChartPoint,
  ConnersItem,
  CriticalItemResult,
  DsmEvaluation,
  FormType,
  FullAssessmentResult,
  JointEvaluationAnalysis,
  MultiInformantComparison,
  OpenEndedResponses,
  PedagogicalRecommendation,
  QualitativeInterpretationReport,
  RatingValue,
  ScaleResult,
  ScaleType,
  SeverityLevel,
  StudentInfo,
  ValidityIndices,
} from '../types';
import { getItemsForForm, getScalesForForm, SCALE_DEFINITIONS } from '../data/conners4Items';

// Normative parameters (Mean and SD) by scale based on Conners 4 Standardization
const TEACHER_NORMATIVE_DATA: Record<
  ScaleType,
  { mean: number; sd: number; reliability: number }
> = {
  INATTENTION: { mean: 7.2, sd: 5.6, reliability: 0.94 },
  HYPERACTIVITY: { mean: 4.8, sd: 4.3, reliability: 0.93 },
  IMPULSIVITY: { mean: 4.1, sd: 3.8, reliability: 0.91 },
  EMOTIONAL_DYSREGULATION: { mean: 3.4, sd: 3.5, reliability: 0.91 },
  DEPRESSED_MOOD: { mean: 1.9, sd: 2.4, reliability: 0.89 },
  ANXIOUS_THOUGHTS: { mean: 2.5, sd: 2.9, reliability: 0.88 },
  PEER_RELATIONS: { mean: 3.1, sd: 3.4, reliability: 0.90 },
  DSM_INATTENTIVE: { mean: 4.5, sd: 4.0, reliability: 0.95 },
  DSM_HYPERACTIVE_IMPULSIVE: { mean: 4.2, sd: 3.9, reliability: 0.94 },
  DSM_ODD: { mean: 2.8, sd: 3.2, reliability: 0.92 },
  DSM_CONDUCT: { mean: 0.9, sd: 1.8, reliability: 0.88 },
  IMP_ACADEMIC: { mean: 3.0, sd: 3.2, reliability: 0.93 },
  IMP_PEER: { mean: 2.3, sd: 2.7, reliability: 0.90 },
  IMP_CLASSROOM: { mean: 3.2, sd: 3.4, reliability: 0.92 },
  IMP_FAMILY: { mean: 3.0, sd: 3.2, reliability: 0.90 }, // fallback
};

const PARENT_NORMATIVE_DATA: Record<
  ScaleType,
  { mean: number; sd: number; reliability: number }
> = {
  INATTENTION: { mean: 8.5, sd: 5.9, reliability: 0.93 },
  HYPERACTIVITY: { mean: 5.8, sd: 4.7, reliability: 0.92 },
  IMPULSIVITY: { mean: 4.9, sd: 4.1, reliability: 0.90 },
  EMOTIONAL_DYSREGULATION: { mean: 4.2, sd: 3.9, reliability: 0.91 },
  DEPRESSED_MOOD: { mean: 2.4, sd: 2.8, reliability: 0.89 },
  ANXIOUS_THOUGHTS: { mean: 3.2, sd: 3.4, reliability: 0.89 },
  PEER_RELATIONS: { mean: 3.6, sd: 3.7, reliability: 0.89 },
  DSM_INATTENTIVE: { mean: 5.1, sd: 4.2, reliability: 0.94 },
  DSM_HYPERACTIVE_IMPULSIVE: { mean: 4.8, sd: 4.1, reliability: 0.93 },
  DSM_ODD: { mean: 3.4, sd: 3.6, reliability: 0.92 },
  DSM_CONDUCT: { mean: 1.1, sd: 2.0, reliability: 0.88 },
  IMP_ACADEMIC: { mean: 3.4, sd: 3.4, reliability: 0.92 },
  IMP_PEER: { mean: 2.7, sd: 2.9, reliability: 0.89 },
  IMP_CLASSROOM: { mean: 3.0, sd: 3.2, reliability: 0.90 }, // fallback
  IMP_FAMILY: { mean: 4.0, sd: 3.8, reliability: 0.92 },
};

function approximatePercentile(z: number): number {
  if (z < -3.0) return 1;
  if (z > 3.0) return 99;
  const b1 = 0.31938153;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (z >= 0) {
    const t = 1.0 / (1.0 + p * z);
    const val =
      1.0 -
      c *
        Math.exp((-z * z) / 2.0) *
        t *
        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
    return Math.min(99, Math.max(1, Math.round(val * 100)));
  } else {
    const t = 1.0 / (1.0 - p * z);
    const val =
      c *
      Math.exp((-z * z) / 2.0) *
      t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
    return Math.min(99, Math.max(1, Math.round(val * 100)));
  }
}

export function computeScaleResults(
  responses: Record<string, RatingValue>,
  formType: FormType = 'TEACHER'
): Record<ScaleType, ScaleResult> {
  const items = getItemsForForm(formType);
  const activeScales = getScalesForForm(formType);
  const normative = formType === 'TEACHER' ? TEACHER_NORMATIVE_DATA : PARENT_NORMATIVE_DATA;

  const scaleScores: Record<
    ScaleType,
    { raw: number; max: number; count: number; answered: number }
  > = {
    INATTENTION: { raw: 0, max: 0, count: 0, answered: 0 },
    HYPERACTIVITY: { raw: 0, max: 0, count: 0, answered: 0 },
    IMPULSIVITY: { raw: 0, max: 0, count: 0, answered: 0 },
    EMOTIONAL_DYSREGULATION: { raw: 0, max: 0, count: 0, answered: 0 },
    DEPRESSED_MOOD: { raw: 0, max: 0, count: 0, answered: 0 },
    ANXIOUS_THOUGHTS: { raw: 0, max: 0, count: 0, answered: 0 },
    PEER_RELATIONS: { raw: 0, max: 0, count: 0, answered: 0 },
    DSM_INATTENTIVE: { raw: 0, max: 0, count: 0, answered: 0 },
    DSM_HYPERACTIVE_IMPULSIVE: { raw: 0, max: 0, count: 0, answered: 0 },
    DSM_ODD: { raw: 0, max: 0, count: 0, answered: 0 },
    DSM_CONDUCT: { raw: 0, max: 0, count: 0, answered: 0 },
    IMP_ACADEMIC: { raw: 0, max: 0, count: 0, answered: 0 },
    IMP_PEER: { raw: 0, max: 0, count: 0, answered: 0 },
    IMP_CLASSROOM: { raw: 0, max: 0, count: 0, answered: 0 },
    IMP_FAMILY: { raw: 0, max: 0, count: 0, answered: 0 },
  };

  // Iterate over items and calculate scores
  items.forEach((item) => {
    const resp = responses[item.id];
    const isAnswered = resp !== undefined;
    const scoreVal = isAnswered ? resp : 0;

    // Check if inverted item for scoring
    const isInverted =
      (formType === 'TEACHER' && (item.id === 'T56' || item.id === 'T106' || item.id === 'T1' || item.id === 'T11')) ||
      (formType === 'PARENT' && (item.id === 'P63' || item.id === 'P114' || item.id === 'P1' || item.id === 'P35' || item.id === 'P43' || item.id === 'P85'));

    const effectiveScore = isInverted ? ((3 - scoreVal) as RatingValue) : scoreVal;

    item.scales.forEach((scale) => {
      scaleScores[scale].raw += effectiveScore;
      scaleScores[scale].max += 3;
      scaleScores[scale].count += 1;
      if (isAnswered) {
        scaleScores[scale].answered += 1;
      }
    });
  });

  const results: Partial<Record<ScaleType, ScaleResult>> = {};

  (Object.keys(scaleScores) as ScaleType[]).forEach((scale) => {
    const data = scaleScores[scale];
    const norm = normative[scale] || TEACHER_NORMATIVE_DATA[scale];
    const def = SCALE_DEFINITIONS[scale];

    // Compute standard T-Score (Mean=50, SD=10)
    const z = data.count > 0 && norm.sd > 0 ? (data.raw - norm.mean) / norm.sd : 0;
    let tScore = Math.round(50 + 10 * z);
    tScore = Math.max(30, Math.min(90, tScore)); // Bound within standard psychometric limits

    const percentile = approximatePercentile(z);

    // Standard Error of Measurement: SEM = 10 * sqrt(1 - reliability)
    const sem = 10 * Math.sqrt(1 - (norm?.reliability || 0.9));
    const ci95Low = Math.max(30, Math.round(tScore - 1.96 * sem));
    const ci95High = Math.min(90, Math.round(tScore + 1.96 * sem));

    let clinicalBand: ScaleResult['clinicalBand'] = 'TYPICAL';
    let classification = 'Puntuación Promedio / Típica';
    const settingWord = formType === 'TEACHER' ? 'el entorno escolar/aula' : 'el hogar y entorno familiar';
    let interpretation = `Las conductas observadas en el área de ${def.shortName} se encuentran dentro del rango normativo esperado para ${settingWord}.`;

    if (tScore >= 70) {
      clinicalBand = 'VERY_ELEVATED';
      classification = 'Muy Elevada (Clínicamente Significativa)';
      interpretation = `Nivel sustancialmente superior al promedio normativo (T ≥ 70). Indica dificultades severas y marcadas en ${def.shortName} con alto impacto funcional en ${settingWord}.`;
    } else if (tScore >= 65) {
      clinicalBand = 'ELEVATED';
      classification = 'Elevada (Preocupación Clínica)';
      interpretation = `Nivel significativamente elevado (T 65-69). Refleja conductas atípicas en ${def.shortName} que ameritan intervención focalizada y valoración diagnóstica integral.`;
    } else if (tScore >= 60) {
      clinicalBand = 'BORDERLINE';
      classification = 'Límite / Ligeramente Elevada';
      interpretation = `Nivel límite (T 60-64). Indica presencia moderada de dificultades en ${def.shortName}, lo que sugiere seguimiento preventivo y ajustes cotidianos en ${settingWord}.`;
    }

    results[scale] = {
      scale,
      name: def.name,
      shortName: def.shortName,
      category: def.category,
      rawScore: data.raw,
      maxRawScore: data.max,
      tScore,
      percentile,
      ci95Low,
      ci95High,
      classification,
      clinicalBand,
      interpretation,
      itemsCount: data.count,
      answeredCount: data.answered,
    };
  });

  return results as Record<ScaleType, ScaleResult>;
}

export function evaluateDsmCriteria(
  responses: Record<string, RatingValue>,
  formType: FormType = 'TEACHER'
): DsmEvaluation {
  const items = getItemsForForm(formType);
  const settingName = formType === 'TEACHER' ? 'el aula escolar' : 'el hogar/familia';

  let inattentionCount = 0;
  let hyperactiveImpulsiveCount = 0;
  let oddCount = 0;
  let conductCount = 0;

  items.forEach((item) => {
    const score = responses[item.id] || 0;
    const isSymptomPresent = score >= 2; // Bastante o Mucho/Siempre

    if (isSymptomPresent && item.dsmCode) {
      if (item.dsmCode.startsWith('DSM-IN-')) {
        inattentionCount++;
      } else if (item.dsmCode.startsWith('DSM-HI-')) {
        hyperactiveImpulsiveCount++;
      } else if (item.dsmCode.startsWith('DSM-ODD-')) {
        oddCount++;
      } else if (item.dsmCode.startsWith('DSM-CD-') || item.scales.includes('DSM_CONDUCT')) {
        conductCount++;
      }
    }
  });

  // Cap at 9 symptoms max for DSM ADHD criteria
  const inattentionSymptomTotal = Math.min(9, inattentionCount);
  const hyperactiveImpulsiveSymptomTotal = Math.min(9, hyperactiveImpulsiveCount);

  // DSM-5-TR threshold for children/adolescents: at least 6 out of 9 symptoms
  const inattentionEligible = inattentionSymptomTotal >= 6;
  const hyperactiveImpulsiveEligible = hyperactiveImpulsiveSymptomTotal >= 6;
  const oddEligible = oddCount >= 4;
  const conductEligible = conductCount >= 3;

  let presentation: DsmEvaluation['presentation'] = 'No cumple criterios clínicos suficientes';
  let qualitativeSummary = '';

  if (inattentionEligible && hyperactiveImpulsiveEligible) {
    presentation = 'Presentación Combinada';
    qualitativeSummary = `El evaluador (${formType === 'TEACHER' ? 'Docente' : 'Padre/Madre/Tutor'}) reporta simultáneamente 6 o más síntomas clínicos de inatención (${inattentionSymptomTotal}/9) y 6 o más de hiperactividad/impulsividad (${hyperactiveImpulsiveSymptomTotal}/9), cumpliendo el umbral sintomático para TDAH Presentación Combinada según el DSM-5-TR en ${settingName}.`;
  } else if (inattentionEligible) {
    presentation = 'Predominio Inatento';
    qualitativeSummary = `Se reportan 6 o más síntomas clínicos de inatención (${inattentionSymptomTotal}/9), con sintomatología hiperactiva/impulsiva por debajo del umbral clínico (${hyperactiveImpulsiveSymptomTotal}/9), compatible con TDAH Predominio Inatento en ${settingName}.`;
  } else if (hyperactiveImpulsiveEligible) {
    presentation = 'Predominio Hiperactivo/Impulsivo';
    qualitativeSummary = `Se reportan 6 o más síntomas clínicos de hiperactividad e impulsividad (${hyperactiveImpulsiveSymptomTotal}/9), con nivel inatento por debajo del umbral (${inattentionSymptomTotal}/9), compatible con TDAH Predominio Hiperactivo/Impulsivo en ${settingName}.`;
  } else if (inattentionSymptomTotal >= 4 || hyperactiveImpulsiveSymptomTotal >= 4) {
    presentation = 'Subclínico / En observación';
    qualitativeSummary = `Se observa una presencia moderada de manifestaciones sintomáticas (Inatención: ${inattentionSymptomTotal}/9, Hiperactividad/Impulsividad: ${hyperactiveImpulsiveSymptomTotal}/9). Aunque no alcanza el corte estricto de 6 síntomas, genera interferencia relevante y requiere seguimiento en ${settingName}.`;
  } else {
    presentation = 'No cumple criterios clínicos suficientes';
    qualitativeSummary = `Las respuestas registradas no alcanzan el umbral sintomático del DSM-5-TR en ${settingName} (Inatención: ${inattentionSymptomTotal}/9, Hiperactividad/Impulsividad: ${hyperactiveImpulsiveSymptomTotal}/9).`;
  }

  return {
    presentation,
    inattentionCount: inattentionSymptomTotal,
    inattentionEligible,
    hyperactiveImpulsiveCount: hyperactiveImpulsiveSymptomTotal,
    hyperactiveImpulsiveEligible,
    oddCount,
    oddEligible,
    conductCount,
    conductEligible,
    qualitativeSummary,
    pervasiveMultiSettingNotes: `Nota diagnóstica DSM-5-TR (Criterio C): Se requiere verificar la presencia de síntomas en dos o más entornos (p. ej., hogar y escuela). Esta evaluación documenta específicamente las manifestaciones en ${settingName}.`,
  };
}

export function evaluateValidity(
  responses: Record<string, RatingValue>,
  formType: FormType = 'TEACHER'
): ValidityIndices {
  const items = getItemsForForm(formType);
  let omittedCount = 0;
  let maxScoreCount = 0;
  const notes: string[] = [];

  items.forEach((item) => {
    if (responses[item.id] === undefined) {
      omittedCount++;
    } else if (responses[item.id] === 3) {
      maxScoreCount++;
    }
  });

  // Calculate Inconsistency pairs
  let inconsistencyDiff = 0;
  let pairCount = 0;

  items.forEach((item) => {
    if (item.inconsistencyPairId && item.id < item.inconsistencyPairId) {
      const respA = responses[item.id];
      const respB = responses[item.inconsistencyPairId];
      if (respA !== undefined && respB !== undefined) {
        pairCount++;
        // If pair is inverse vs direct
        const isInvertedPair =
          (formType === 'TEACHER' && (item.id === 'T1' || item.id === 'T56')) ||
          (formType === 'PARENT' && (item.id === 'P1' || item.id === 'P63'));

        if (isInvertedPair) {
          // If A is 3 (Very true) and B is 3 (Very true for inverted), discrepancy is high
          inconsistencyDiff += Math.abs(respA - (3 - respB));
        } else {
          inconsistencyDiff += Math.abs(respA - respB);
        }
      }
    }
  });

  const inconsistencyElevated = inconsistencyDiff >= 8;
  const negativeImpressionElevated = maxScoreCount >= (formType === 'TEACHER' ? 42 : 46);

  if (omittedCount > 0) {
    notes.push(
      `Se registraron ${omittedCount} ítems omitidos (${Math.round((omittedCount / items.length) * 100)}% de la prueba).`
    );
  }

  if (inconsistencyElevated) {
    notes.push(
      'Índice de Inconsistencia (INC) elevado: Se detectaron discrepancias entre pares de ítems con contenido similar.'
    );
  }

  if (negativeImpressionElevated) {
    notes.push(
      'Índice de Impresión Negativa (NI) elevado: Frecuencia inusualmente alta de puntuaciones máximas severas (3).'
    );
  }

  if (notes.length === 0) {
    notes.push(
      `Protocolo válido y confiable (${items.length - omittedCount}/${items.length} ítems respondidos, consistencia interna adecuada).`
    );
  }

  return {
    negativeImpressionScore: maxScoreCount,
    negativeImpressionElevated,
    inconsistencyScore: inconsistencyDiff,
    inconsistencyElevated,
    omittedCount,
    validityNotes: notes,
  };
}

export function extractCriticalItems(
  responses: Record<string, RatingValue>,
  formType: FormType = 'TEACHER'
): CriticalItemResult[] {
  const items = getItemsForForm(formType);
  const criticalResults: CriticalItemResult[] = [];

  items.forEach((item) => {
    if (item.isCritical) {
      const score = responses[item.id] ?? 0;
      if (score > 0) {
        criticalResults.push({
          itemNumber: item.number,
          text: item.text,
          score,
          category: item.criticalCategory || item.category,
        });
      }
    }
  });

  return criticalResults.sort((a, b) => b.score - a.score);
}

export function extractTopObservedBehaviors(
  responses: Record<string, RatingValue>,
  formType: FormType = 'TEACHER'
): Array<{ id: string; text: string; score: RatingValue; scale: string }> {
  const items = getItemsForForm(formType);
  const behaviors: Array<{ id: string; text: string; score: RatingValue; scale: string }> = [];

  items.forEach((item) => {
    const score = responses[item.id] ?? 0;
    if (score >= 2) {
      const primaryScale = item.scales[0] || 'INATTENTION';
      behaviors.push({
        id: item.id,
        text: item.text,
        score,
        scale: SCALE_DEFINITIONS[primaryScale]?.shortName || primaryScale,
      });
    }
  });

  return behaviors.sort((a, b) => b.score - a.score);
}

export function generateQualitativeReport(
  scaleResults: Record<ScaleType, ScaleResult>,
  dsmEvaluation: DsmEvaluation,
  criticalItems: CriticalItemResult[],
  studentInfo: StudentInfo,
  openEnded?: OpenEndedResponses
): QualitativeInterpretationReport {
  const isTeacher = studentInfo.formType === 'TEACHER';
  const name = studentInfo.studentName || 'El alumno';
  const informantTitle = isTeacher
    ? `${studentInfo.evaluatorRole || 'Docente titular'} (${studentInfo.evaluatorFirstName} ${studentInfo.evaluatorLastName || ''})`
    : `Familiar/Tutor (${studentInfo.evaluatorFirstName} ${studentInfo.evaluatorLastName || ''})`;

  const inattT = scaleResults.INATTENTION?.tScore ?? 50;
  const hypT = scaleResults.HYPERACTIVITY?.tScore ?? 50;
  const impT = scaleResults.IMPULSIVITY?.tScore ?? 50;
  const emoT = scaleResults.EMOTIONAL_DYSREGULATION?.tScore ?? 50;
  const peerT = scaleResults.PEER_RELATIONS?.tScore ?? 50;
  const depT = scaleResults.DEPRESSED_MOOD?.tScore ?? 50;
  const anxT = scaleResults.ANXIOUS_THOUGHTS?.tScore ?? 50;
  const acadT = scaleResults.IMP_ACADEMIC?.tScore ?? 50;
  const settingT = isTeacher
    ? (scaleResults.IMP_CLASSROOM?.tScore ?? 50)
    : (scaleResults.IMP_FAMILY?.tScore ?? 50);

  // Executive Summary
  let executiveSummary = '';
  if (dsmEvaluation.presentation === 'Presentación Combinada') {
    executiveSummary = `El perfil psicométrico obtenido a partir de la observación de ${informantTitle} indica una elevación clínicamente significativa tanto en el dominio de inatención y disfunción ejecutiva (T = ${inattT}) como en hiperactividad (T = ${hypT}) e impulsividad (T = ${impT}). El estudiante cumple con los criterios sintomáticos del DSM-5-TR para una Presentación Combinada (${dsmEvaluation.inattentionCount}/9 síntomas de inatención y ${dsmEvaluation.hyperactiveImpulsiveCount}/9 síntomas de hiperactividad/impulsividad). Este patrón genera un impacto directo en el desempeño escolar y en la dinámica ${isTeacher ? 'del aula' : 'familiar y del hogar'}.`;
  } else if (dsmEvaluation.presentation === 'Predominio Inatento') {
    executiveSummary = `El perfil de evaluación reportado por ${informantTitle} se caracteriza por un predominio marcado de dificultades en atención focalizada, memoria de trabajo y organización ejecutiva (T = ${inattT}), con sintomatología motora e impulsiva dentro de rangos promedio o límite (Hiperactividad T = ${hypT}, Impulsividad T = ${impT}). Cumple con los criterios de Inatención del DSM-5-TR (${dsmEvaluation.inattentionCount}/9 síntomas), evidenciando lentitud en el inicio de tareas, olvidos frecuentes y distracción ante estímulos cotidianos.`;
  } else if (dsmEvaluation.presentation === 'Predominio Hiperactivo/Impulsivo') {
    executiveSummary = `La evaluación completada por ${informantTitle} refleja elevaciones clínicas en inquietud psicomotriz (T = ${hypT}) y control inhibitorio (T = ${impT}), con una atención sostenida relativamente preservada (T = ${inattT}). Se alcanzan ${dsmEvaluation.hyperactiveImpulsiveCount}/9 síntomas de hiperactividad/impulsividad del DSM-5-TR, manifestándose como constante necesidad de movimiento, precipitación al hablar e interrupciones.`;
  } else {
    executiveSummary = `Los resultados cuantitativos y cualitativos reportados por ${informantTitle} sitúan las conductas observadas en rangos adaptativos o límite en la mayoría de escalas. No se alcanzan los criterios clínicos diagnósticos completos del DSM-5-TR en este contexto específico, sugiriendo monitoreo preventivo.`;
  }

  // Cognitive Profile
  let cognitiveAttentionProfile = '';
  if (inattT >= 65) {
    cognitiveAttentionProfile = `${name} presenta dificultades sustanciales para sostener la concentración durante periodos prolongados, cometiendo errores por descuido en actividades cotidianas. Se observa lentitud para iniciar deberes, desorganización espacial y temporal (pérdida de útiles o tareas) y susceptibilidad a la interferencia por distractores del entorno.`;
  } else if (inattT >= 60) {
    cognitiveAttentionProfile = `Se registran fluctuaciones moderadas en la atención sostenida. Si bien logra completar actividades cortas o de alto interés, se distrae con facilidad ante tareas monótonas o que exigen esfuerzo mental sostenido.`;
  } else {
    cognitiveAttentionProfile = `El funcionamiento atencional y de organización se encuentra dentro de los parámetros esperados para su edad cronológica, completando instrucciones y gestionando sus tareas con autonomía habitual.`;
  }

  // Motor / Impulsivity Profile
  let motorImpulsivityProfile = '';
  if (hypT >= 65 || impT >= 65) {
    motorImpulsivityProfile = `Se observa una necesidad constante de descarga motora (levantarse del asiento, manipular objetos, tamborileo) y dificultad para mantener la autorregulación. A nivel inhibitorio, se aprecia impulsividad verbal (contestar antes de tiempo, hablar en exceso) e impulsividad conductual (actuar sin anticipar consecuencias).`;
  } else {
    motorImpulsivityProfile = `El control motor e inhibitorio es adecuado. ${name} logra respetar turnos de participación y adaptarse a las normas de quietud requeridas en actividades estructuradas.`;
  }

  // Emotional Profile
  let emotionalRegulationProfile = '';
  if (emoT >= 65) {
    emotionalRegulationProfile = `Manifiesta una marcada labilidad emocional y baja tolerancia a la frustración, con reacciones de enojo o irritabilidad desproporcionadas ante correcciones o límites, requiriendo apoyo externo para calmarse.`;
  } else if (anxT >= 65 || depT >= 65) {
    emotionalRegulationProfile = `Se evidencian indicadores afectivos internalizantes (preocupaciones recurrentes, temor al error, tensión o desánimo) que pueden interferir con su autoconfianza y bienestar socioemocional.`;
  } else {
    emotionalRegulationProfile = `La regulación emocional y el estado de ánimo se ubican en niveles típicos y equilibrados, mostrando respuestas afectivas acordes a las situaciones cotidianas.`;
  }

  // Social Profile
  let socialPeerProfile = '';
  if (peerT >= 65) {
    socialPeerProfile = `Se identifican fricciones recurrentes con compañeros o pares, dificultades para compartir y quejas sobre su comportamiento, lo que incrementa el riesgo de aislamiento o rechazo social.`;
  } else {
    socialPeerProfile = `Sus habilidades de interacción social con iguales son satisfactorias, logrando establecer vínculos positivos y participar en juegos grupales de forma constructiva.`;
  }

  // Setting Impact Summary
  let settingImpactSummary = '';
  if (isTeacher) {
    settingImpactSummary = `En el ámbito escolar, el rendimiento académico muestra una afectación (T = ${acadT}) vinculada a trabajos incompletos, tareas olvidadas y ritmo de ejecución variable. En la dinámica del aula (T = ${settingT}), el comportamiento genera una demanda alta de supervisión directa por parte del equipo docente.`;
  } else {
    settingImpactSummary = `En el entorno del hogar y la vida familiar (T = ${settingT}), se reporta una sobrecarga significativa vinculada a discusiones en rutinas diarias (levantarse, tareas escolares, acostarse), desorganización de horarios y estrés familiar general.`;
  }

  // Accommodations (Pedagogical / Family)
  const pedagogicalAccommodations: PedagogicalRecommendation[] = isTeacher
    ? [
        {
          area: 'Estructuración del Entorno y Ubicación',
          icon: 'Layout',
          title: 'Ubicación Estratégica en el Aula',
          description: 'Optimizar el puesto del alumno para reducir distractores y favorecer la supervisión.',
          strategies: [
            'Ubicar al estudiante en las primeras filas, cerca del docente y lejos de puertas o ventanas.',
            'Sentarlo junto a compañeros modelo que presenten hábitos de trabajo ordenados y tranquilos.',
            'Mantener la mesa de trabajo despejada únicamente con los materiales necesarios para la actividad en curso.',
          ],
        },
        {
          area: 'Metodología y Entrega de Instrucciones',
          icon: 'BookOpen',
          title: 'Fragmentación de Tareas y Claves Visuales',
          description: 'Adaptar el formato de presentación para evitar la saturación cognitiva.',
          strategies: [
            'Dividir trabajos extensos o exámenes en bloques más cortos y de entrega secuencial.',
            'Dar instrucciones de una en una, solicitando que el alumno parafrasee lo que debe realizar.',
            'Usar apoyos visuales (listas de cotejo, temporizadores visuales como Time Timer).',
          ],
        },
        {
          area: 'Manejo Conductual y Descarga Motora',
          icon: 'Activity',
          title: 'Refuerzo Positivo y Pausas Activas',
          description: 'Canalizar la necesidad de movimiento y fomentar conductas adaptativas.',
          strategies: [
            'Asignar roles funcionales en el aula que impliquen movimiento legítimo (repartir material, borrar la pizarra).',
            'Permitir herramientas de autorregulación sensorial (cojines dinámicos o bandas elásticas en las patas de la silla).',
            'Implementar economía de fichas o refuerzo contingente inmediato ante logros atencionales específicos.',
          ],
        },
      ]
    : [
        {
          area: 'Estructura y Rutinas en el Hogar',
          icon: 'Home',
          title: 'Horarios Visuales y Predicibilidad',
          description: 'Establecer rutinas consistentes para disminuir la fricción en el día a día familiar.',
          strategies: [
            'Diseñar un panel visual con la rutina vespertina: merienda, deberes, juego libre, cena e higiene.',
            'Avisar con 5 y 2 minutos de anticipación antes de realizar una transición o terminar una actividad placentera.',
            'Crear un espacio de estudio fijo, ordenado, bien iluminado y sin pantallas alrededor.',
          ],
        },
        {
          area: 'Acompañamiento en Deberes y Organización',
          icon: 'CheckSquare',
          title: 'Técnica de Bloques Cortos de Estudio',
          description: 'Acompañar sin generar dependencia ni sobrecarga emocional.',
          strategies: [
            'Implementar bloques de estudio de 15-20 minutos con 3-5 minutos de descanso activo (Técnica Pomodoro adaptada).',
            'Revisar la mochila y la agenda todas las noches junto al alumno, marcando lo preparado para el día siguiente.',
            'Felicitar el esfuerzo y el proceso de trabajo antes que el resultado numérico final.',
          ],
        },
        {
          area: 'Co-regulación y Disciplina Positiva',
          icon: 'HeartHandshake',
          title: 'Gestión de Frustración y Calma',
          description: 'Pautas para manejar arrebatos y momentos de desborde emocional.',
          strategies: [
            'Mantener un tono de voz neutral y calmado durante episodios de frustración; evitar discusiones en el pico del enfado.',
            'Establecer un "rincón de la calma" con cojines y lecturas para bajar el ritmo antes de dialogar.',
            'Dedicar al menos 15 minutos diarios de atención individual de calidad en una actividad elegida por el hijo.',
          ],
        },
      ];

  // Family Guidance
  const familyGuidance = isTeacher
    ? [
        'Mantener una libreta o canal de comunicación semanal entre escuela y familia para alinear pautas.',
        'Sugerir a la familia un horario fijo de tareas en casa coordinado con el ritmo escolar.',
        'Compartir con los padres los avances positivos y fortalezas del alumno, no únicamente incidentes.',
      ]
    : [
        'Coordinar con los docentes para conocer el sistema de tareas y apoyos visuales usados en clase.',
        'Cuidar la higiene del sueño: apagar pantallas al menos 60 minutos antes de dormir para favorecer la melatonina.',
        'Validar las emociones de su hijo/a recordándole que su dificultad no es falta de voluntad sino de autorregulación.',
      ];

  // Clinical Next Steps
  const clinicalNextSteps: string[] = [
    'Remitir este informe estandarizado Conners 4 al especialista de salud mental infanto-juvenil (Neuropediatra o Psiquiatra Infantil).',
    'Realizar una valoración neuropsicológica completa (atención, funciones ejecutivas y WISC-V) para descartar comorbilidades.',
  ];

  if (criticalItems.length > 0) {
    clinicalNextSteps.unshift(
      'ALERTA CLÍNICA PRIORITARIA: Se han reportado ítems críticos de riesgo que requieren abordaje preventivo inmediato por orientación/psicología.'
    );
  }

  return {
    executiveSummary,
    cognitiveAttentionProfile,
    motorImpulsivityProfile,
    emotionalRegulationProfile,
    socialPeerProfile,
    settingImpactSummary,
    pedagogicalAccommodations,
    familyGuidance,
    clinicalNextSteps,
  };
}

export function buildFullAssessment(
  studentInfo: StudentInfo,
  responses: Record<string, RatingValue>,
  openEndedResponses: OpenEndedResponses = {},
  formType: FormType = studentInfo.formType || 'TEACHER'
): FullAssessmentResult {
  const finalFormType = formType;
  const items = getItemsForForm(finalFormType);
  const totalItems = items.length;
  const answeredCount = Object.keys(responses).length;
  const completionPercentage = Math.round((answeredCount / totalItems) * 100);

  const scaleResults = computeScaleResults(responses, finalFormType);
  const dsmEvaluation = evaluateDsmCriteria(responses, finalFormType);
  const validityIndices = evaluateValidity(responses, finalFormType);
  const criticalItems = extractCriticalItems(responses, finalFormType);
  const topObservedBehaviors = extractTopObservedBehaviors(responses, finalFormType);
  const qualitativeReport = generateQualitativeReport(
    scaleResults,
    dsmEvaluation,
    criticalItems,
    studentInfo,
    openEndedResponses
  );

  return {
    id: `c4_${finalFormType.toLowerCase()}_${Date.now()}`,
    formType: finalFormType,
    studentInfo: { ...studentInfo, formType: finalFormType },
    responses,
    openEndedResponses,
    completionPercentage,
    completedAt: new Date().toISOString(),
    scaleResults,
    dsmEvaluation,
    validityIndices,
    criticalItems,
    qualitativeReport,
    topObservedBehaviors,
  };
}

export const runFullAssessment = buildFullAssessment;

export function compareTwoAssessments(
  assessment1: FullAssessmentResult,
  assessment2: FullAssessmentResult
): MultiInformantComparison {
  const isDocenteVsPadres =
    (assessment1.formType === 'TEACHER' && assessment2.formType === 'PARENT') ||
    (assessment1.formType === 'PARENT' && assessment2.formType === 'TEACHER');

  const isLongitudinal =
    assessment1.formType === assessment2.formType;

  const comparisonType = isDocenteVsPadres
    ? 'DOCENTE_VS_PADRES'
    : isLongitudinal
    ? 'LONGITUDINAL'
    : 'GENERAL_COMPARISON';

  // Ensure teacher is first if comparing teacher vs parent
  const teacherAssessment =
    assessment1.formType === 'TEACHER'
      ? assessment1
      : assessment2.formType === 'TEACHER'
      ? assessment2
      : null;

  const parentAssessment =
    assessment1.formType === 'PARENT'
      ? assessment1
      : assessment2.formType === 'PARENT'
      ? assessment2
      : null;

  const a1 = teacherAssessment || assessment1;
  const a2 = (teacherAssessment && parentAssessment) ? parentAssessment : assessment2;

  const allScalesToCompare: ScaleType[] = [
    'INATTENTION',
    'HYPERACTIVITY',
    'IMPULSIVITY',
    'EMOTIONAL_DYSREGULATION',
    'DEPRESSED_MOOD',
    'ANXIOUS_THOUGHTS',
    'PEER_RELATIONS',
    'DSM_INATTENTIVE',
    'DSM_HYPERACTIVE_IMPULSIVE',
    'DSM_ODD',
    'DSM_CONDUCT',
    'IMP_ACADEMIC',
    'IMP_PEER',
  ];

  const chartData: ComparisonLineChartPoint[] = allScalesToCompare.map((scaleKey) => {
    const res1 = a1.scaleResults[scaleKey];
    const res2 = a2.scaleResults[scaleKey];
    const def = SCALE_DEFINITIONS[scaleKey];

    const t1 = res1?.tScore ?? 50;
    const t2 = res2?.tScore ?? 50;
    const diff = t2 - t1;
    const diffAbs = Math.abs(diff);

    return {
      scaleKey,
      scaleName: def?.shortName || scaleKey,
      category: def?.category || 'CONTENT',
      tScore1: t1,
      tScore2: t2,
      diff,
      diffAbs,
      band1: res1?.clinicalBand || 'TYPICAL',
      band2: res2?.clinicalBand || 'TYPICAL',
      classification1: res1?.classification || 'Promedio',
      classification2: res2?.classification || 'Promedio',
    };
  });

  // Calculate DSM symptom indicators
  const inatt1 = a1.dsmEvaluation.inattentionCount;
  const inatt2 = a2.dsmEvaluation.inattentionCount;
  const hi1 = a1.dsmEvaluation.hyperactiveImpulsiveCount;
  const hi2 = a2.dsmEvaluation.hyperactiveImpulsiveCount;

  const tInatt1 = a1.scaleResults.INATTENTION.tScore;
  const tInatt2 = a2.scaleResults.INATTENTION.tScore;
  const tHyp1 = a1.scaleResults.HYPERACTIVITY.tScore;
  const tHyp2 = a2.scaleResults.HYPERACTIVITY.tScore;
  const tImp1 = a1.scaleResults.IMPULSIVITY.tScore;
  const tImp2 = a2.scaleResults.IMPULSIVITY.tScore;

  // Max nuclear T scores
  const maxInattentionT = Math.max(tInatt1, tInatt2);
  const maxHypImpT = Math.max(tHyp1, tHyp2, tImp1, tImp2);

  // Cross-setting presence for DSM Criterion C
  const inattentionMultiSetting =
    (inatt1 >= 6 || tInatt1 >= 65) && (inatt2 >= 4 || tInatt2 >= 60) ||
    (inatt2 >= 6 || tInatt2 >= 65) && (inatt1 >= 4 || tInatt1 >= 60);

  const hyperImpulsiveMultiSetting =
    ((hi1 >= 6 || tHyp1 >= 65 || tImp1 >= 65) && (hi2 >= 4 || tHyp2 >= 60 || tImp2 >= 60)) ||
    ((hi2 >= 6 || tHyp2 >= 65 || tImp2 >= 65) && (hi1 >= 4 || tHyp1 >= 60 || tImp1 >= 60));

  let criterionCStatus: JointEvaluationAnalysis['criterionCStatus'] = 'NO_CUMPLIDO';
  let criterionCExplanation = '';

  if (isDocenteVsPadres) {
    if (inattentionMultiSetting || hyperImpulsiveMultiSetting) {
      criterionCStatus = 'CUMPLIDO_GENERALIZADO';
      criterionCExplanation =
        'Criterio C DSM-5-TR Cumplido: Los síntomas atencionales e hiperactivos/impulsivos se manifiestan con significación clínica en DOS O MÁS ENTORNOS DIFERENTES (Escuela y Hogar).';
    } else if (
      tInatt1 >= 65 || tHyp1 >= 65 || tImp1 >= 65 ||
      tInatt2 >= 65 || tHyp2 >= 65 || tImp2 >= 65
    ) {
      criterionCStatus = 'PARCIAL_UN_ENTORNO';
      criterionCExplanation =
        'Criterio C Parcial: La sintomatología se manifiesta principalmente en un solo entorno con menor o nula afectación en el otro. Se requiere indagar factores contextuales, estilo de estructuración o demandas académicas.';
    } else {
      criterionCStatus = 'NO_CUMPLIDO';
      criterionCExplanation =
        'Criterio C No Cumplido: No se detecta presencia sintomática clínicamente significativa en múltiples entornos.';
    }
  } else {
    criterionCExplanation =
      'Comparativa Longitudinal / Temporal: Evaluación de la evolución de puntuaciones a lo largo del tiempo o entre diferentes momentos de intervención.';
  }

  // Determine Joint TDAH Presentation Subtype
  let jointPresentation: JointEvaluationAnalysis['jointPresentation'] =
    'Sin evidencia clínica suficiente';

  const hasSignificantInattention =
    (inatt1 >= 6 && inatt2 >= 4) || (inatt2 >= 6 && inatt1 >= 4) || maxInattentionT >= 65;
  const hasSignificantHypImp =
    (hi1 >= 6 && hi2 >= 4) || (hi2 >= 6 && hi1 >= 4) || maxHypImpT >= 65;

  if (hasSignificantInattention && hasSignificantHypImp) {
    jointPresentation = 'Presentación Combinada';
  } else if (hasSignificantInattention && !hasSignificantHypImp) {
    jointPresentation = 'Predominio Inatento';
  } else if (!hasSignificantInattention && hasSignificantHypImp) {
    jointPresentation = 'Predominio Hiperactivo/Impulsivo';
  } else if (maxInattentionT >= 60 || maxHypImpT >= 60 || inatt1 >= 4 || inatt2 >= 4 || hi1 >= 4 || hi2 >= 4) {
    jointPresentation = 'Subclínico / En observación';
  } else {
    jointPresentation = 'Sin evidencia clínica suficiente';
  }

  // Determine Joint Severity Level (Nivel de Gravedad DSM-5-TR)
  let severityLevel: SeverityLevel = 'TÍPICO';
  let severityRationale = '';

  const academicT = Math.max(a1.scaleResults.IMP_ACADEMIC?.tScore || 50, a2.scaleResults.IMP_ACADEMIC?.tScore || 50);
  const peerT = Math.max(a1.scaleResults.IMP_PEER?.tScore || 50, a2.scaleResults.IMP_PEER?.tScore || 50);
  const settingT = Math.max(
    a1.scaleResults.IMP_CLASSROOM?.tScore || 50,
    a2.scaleResults.IMP_FAMILY?.tScore || 50,
    a1.scaleResults.IMP_FAMILY?.tScore || 50,
    a2.scaleResults.IMP_CLASSROOM?.tScore || 50
  );

  const veryElevatedScalesCount = chartData.filter(
    (c) => c.tScore1 >= 70 || c.tScore2 >= 70
  ).length;
  const elevatedScalesCount = chartData.filter(
    (c) => (c.tScore1 >= 65 && c.tScore1 < 70) || (c.tScore2 >= 65 && c.tScore2 < 70)
  ).length;

  if (
    jointPresentation !== 'Sin evidencia clínica suficiente' &&
    (veryElevatedScalesCount >= 3 || maxInattentionT >= 70 || maxHypImpT >= 70 || academicT >= 70 || settingT >= 70)
  ) {
    severityLevel = 'GRAVE';
    severityRationale =
      'GRAVE (SEVERO): Múltiples síntomas exceden ampliamente el umbral diagnóstico con puntuaciones T ≥ 70 (Muy Elevadas) en escalas nucleares y severo deterioro funcional en el rendimiento escolar, la convivencia en el aula y la dinámica familiar.';
  } else if (
    jointPresentation !== 'Sin evidencia clínica suficiente' &&
    (elevatedScalesCount >= 2 || maxInattentionT >= 65 || maxHypImpT >= 65 || academicT >= 65 || peerT >= 65)
  ) {
    severityLevel = 'MODERADO';
    severityRationale =
      'MODERADO: Presencia de síntomas y deterioro funcional intermedios entre "leve" y "grave" (Puntuaciones T entre 65 y 69). Produce interferencia evidente y persistente en el aprendizaje y la conducta pero responde a adaptaciones y apoyos coordinados.';
  } else if (
    jointPresentation !== 'Sin evidencia clínica suficiente' ||
    maxInattentionT >= 60 ||
    maxHypImpT >= 60
  ) {
    severityLevel = 'LEVE';
    severityRationale =
      'LEVE: Pocos o ningún síntoma en exceso de los requeridos para el diagnóstico; puntuaciones T en rango límite (60-64) o elevación en un solo dominio. El deterioro en el funcionamiento escolar y social es mínimo o se encuentra parcialmente compensado.';
  } else {
    severityLevel = 'TÍPICO';
    severityRationale =
      'TÍPICO / PROMEDIO: Puntuaciones dentro del rango normativo esperado para el grupo de edad y sexo de referencia, sin evidencia de afectación clínica.';
  }

  // Functional impacts
  const schoolImpact = a1.formType === 'TEACHER' ? a1.scaleResults.IMP_ACADEMIC?.classification : a2.scaleResults.IMP_ACADEMIC?.classification;
  const homeImpact = a1.formType === 'PARENT' ? a1.scaleResults.IMP_FAMILY?.classification : a2.scaleResults.IMP_FAMILY?.classification;

  const schoolFunctionalImpact: JointEvaluationAnalysis['schoolFunctionalImpact'] =
    (schoolImpact === 'Muy Elevada' ? 'Grave' : schoolImpact === 'Elevada' ? 'Moderado' : schoolImpact === 'Límite' ? 'Leve' : 'Mínimo/Típico');
  const homeFunctionalImpact: JointEvaluationAnalysis['homeFunctionalImpact'] =
    (homeImpact === 'Muy Elevada' ? 'Grave' : homeImpact === 'Elevada' ? 'Moderado' : homeImpact === 'Límite' ? 'Leve' : 'Mínimo/Típico');

  // Discrepancy analysis
  const discrepancies: JointEvaluationAnalysis['discrepancies'] = chartData.map((cd) => {
    let meaning = 'Concordancia estrecha entre ambas fuentes (diferencia < 10 puntos T).';
    if (cd.diffAbs >= 15) {
      if (cd.tScore1 > cd.tScore2) {
        meaning = `Discrepancia acusada: ${a1.studentInfo.evaluatorRole || a1.formType} observa significativamente mayor intensidad (+${cd.diffAbs} pts T) que ${a2.studentInfo.evaluatorRole || a2.formType}.`;
      } else {
        meaning = `Discrepancia acusada: ${a2.studentInfo.evaluatorRole || a2.formType} observa significativamente mayor intensidad (+${cd.diffAbs} pts T) que ${a1.studentInfo.evaluatorRole || a1.formType}.`;
      }
    } else if (cd.diffAbs >= 10) {
      meaning = `Diferencia moderada (${cd.diffAbs} pts T). Refleja diferencias en las demandas cognitivas o grados de estructuración entre entornos.`;
    }
    return {
      scale: cd.scaleKey,
      scaleName: cd.scaleName,
      score1: cd.tScore1,
      score2: cd.tScore2,
      difference: cd.diff,
      clinicalMeaning: meaning,
    };
  });

  // Convergence summary
  const highlyCorrelatedScales = chartData.filter((c) => c.diffAbs < 8 && (c.tScore1 >= 60 || c.tScore2 >= 60));
  const divergentScales = chartData.filter((c) => c.diffAbs >= 12);

  const convergenceSummary =
    highlyCorrelatedScales.length > 0
      ? `Se observa alta concordancia entre ambos evaluadores en: ${highlyCorrelatedScales.map((s) => s.scaleName).join(', ')}, lo que refuerza la robustez de los hallazgos clínicos.`
      : 'Ambas evaluaciones muestran variaciones moderadas entre escalas, reflejando respuestas contextuales específicas.';

  const divergenceSummary =
    divergentScales.length > 0
      ? `Discrepancias notables identificadas en: ${divergentScales.map((s) => `${s.scaleName} (Δ ${s.diffAbs} pts T)`).join(', ')}. Sugiere que las demandas de atención sostenida y control inhibitorio varían de forma sustancial entre la escuela y el hogar.`
      : 'No se registran discrepancias clínicas extremas; el perfil global muestra alta consistencia transituacional.';

  // Joint recommendations
  const schoolActionPlan: string[] = [
    'Ubicación preferencial en el aula: Situar al alumno en las primeras filas, cerca del docente y lejos de puertas o ventanas.',
    'Segmentación de tareas complejas en pasos breves y secuenciados con retroalimentación inmediata.',
    'Pausas activas programadas y roles de apoyo (repartir material, borrar pizarra) para canalizar la necesidad motora.',
    'Uso de apoyos visuales: horario gráfico en el pupitre, lista de verificación de materiales y cronómetro de trabajo.',
    'Adaptación en pruebas escritas: tiempo adicional (25-30%), formato simplificado y lectura previa de instrucciones.',
  ];

  const homeActionPlan: string[] = [
    'Establecer rutinas fijas y altamente estructuradas para las tareas, la alimentación y la hora de dormir.',
    'Ambiente de estudio libre de distracciones (escritorio despejado, sin pantallas ni juguetes a la vista).',
    'Técnica de refuerzo positivo inmediato y elogio descriptivo ante el esfuerzo y la autorregulación.',
    'Anticipación de transiciones y cambios de actividad con avisos previos de 5 y 2 minutos.',
    'Co-regulación emocional: modelo de calma, validación de la frustración y técnica de tiempo fuera positivo o rincón de la calma.',
  ];

  const multidisciplinaryClinicalPlan: string[] = [
    'Derivación o consulta de seguimiento con Neuropediatría / Psiquiatría Infanto-Juvenil para valoración integral y estudio comórbido.',
    'Coordinación mensual entre el Orientador/Psicopedagogo del centro escolar y el terapeuta externo.',
    'Reevaluación psicométrica Conners 4™ de control en 6 meses para monitorizar la curva de evolución.',
    'Apoyo en psicoeducación sobre TDAH tanto para la familia como para el equipo docente.',
  ];

  const executiveJointSummary =
    `La integración de ambas evaluaciones (${a1.formType === 'TEACHER' ? 'Docente' : 'Evaluación 1'} vs. ${a2.formType === 'PARENT' ? 'Padres de Familia' : 'Evaluación 2'}) determina un perfil compatible con **${jointPresentation.toUpperCase()}** con un nivel de gravedad clínico **${severityLevel}**. ` +
    (isDocenteVsPadres
      ? `${criterionCExplanation} `
      : `En el seguimiento longitudinal, las variaciones muestran la trayectoria de adaptación del alumno. `) +
    `El impacto funcional se cataloga como **${schoolFunctionalImpact}** en el ámbito escolar y **${homeFunctionalImpact}** en el entorno familiar.`;

  const jointAnalysis: JointEvaluationAnalysis = {
    studentName: a1.studentInfo.studentName || 'Estudiante Evaluado',
    studentAge: a1.studentInfo.age || 9,
    evaluation1Date: a1.studentInfo.evaluationDate,
    evaluation2Date: a2.studentInfo.evaluationDate,
    evaluator1Title: a1.formType === 'TEACHER' ? `Docente (${a1.studentInfo.evaluatorFirstName || 'Profesor'})` : `Padres (${a1.studentInfo.evaluatorFirstName || 'Familia'})`,
    evaluator2Title: a2.formType === 'PARENT' ? `Padres (${a2.studentInfo.evaluatorFirstName || 'Familia'})` : a2.formType === 'TEACHER' ? `Docente (${a2.studentInfo.evaluatorFirstName || 'Profesor'})` : `Evaluación 2`,
    comparisonType,
    jointPresentation,
    severityLevel,
    severityRationale,
    criterionCStatus,
    criterionCExplanation,
    sharedInattentionSymptoms: Math.min(inatt1, inatt2),
    sharedHyperactiveImpulsiveSymptoms: Math.min(hi1, hi2),
    schoolFunctionalImpact,
    homeFunctionalImpact,
    convergenceSummary,
    divergenceSummary,
    discrepancies,
    schoolActionPlan,
    homeActionPlan,
    multidisciplinaryClinicalPlan,
    executiveJointSummary,
  };

  return {
    assessment1: a1,
    assessment2: a2,
    comparisonType,
    chartData,
    jointAnalysis,
  };
}

export function compareMultiInformants(
  teacherResult: FullAssessmentResult,
  parentResult: FullAssessmentResult
): MultiInformantComparison {
  return compareTwoAssessments(teacherResult, parentResult);
}

