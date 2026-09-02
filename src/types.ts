export type RatingValue = 0 | 1 | 2 | 3;

export type FormType = 'TEACHER' | 'PARENT';

export type ScaleType =
  | 'INATTENTION'
  | 'HYPERACTIVITY'
  | 'IMPULSIVITY'
  | 'EMOTIONAL_DYSREGULATION'
  | 'DEPRESSED_MOOD'
  | 'ANXIOUS_THOUGHTS'
  | 'PEER_RELATIONS'
  | 'DSM_INATTENTIVE'
  | 'DSM_HYPERACTIVE_IMPULSIVE'
  | 'DSM_ODD'
  | 'DSM_CONDUCT'
  | 'IMP_ACADEMIC'
  | 'IMP_PEER'
  | 'IMP_CLASSROOM' // Teacher specific
  | 'IMP_FAMILY';   // Parent specific

export type ClinicalBand = 'TYPICAL' | 'BORDERLINE' | 'ELEVATED' | 'VERY_ELEVATED';

export interface ConnersItem {
  id: string;
  number: number;
  text: string;
  category: string;
  scales: ScaleType[];
  dsmCode?: string; // e.g. 'DSM-IN-1' ... 'DSM-IN-9', 'DSM-HI-1' ... 'DSM-HI-9', 'DSM-ODD-1' ...
  isCritical?: boolean;
  criticalCategory?: string;
  inconsistencyPairId?: string; // id of paired item
}

export interface StudentInfo {
  // Student / Child info
  studentName: string;
  studentLastName?: string;
  studentId?: string;
  birthDate?: string;
  age: number;
  gender: 'M' | 'F' | 'OTHER';
  genderOther?: string;
  grade: string;
  schoolName: string;
  
  // Informant / Evaluator info
  formType: FormType;
  evaluatorFirstName: string;
  evaluatorLastName?: string;
  evaluatorId?: string;
  evaluationDate: string;

  // Teacher specific fields
  subjectTaught?: string;
  howLongTaught?: string; // e.g. "1 año, 3 meses"
  evaluatorRole: string; // 'Profesor/a Titular de Aula', 'Profesor/a Especialista', etc.
  observationPeriod?: string;

  // Parent specific fields
  relationshipWithChild?: 'BIOLOGICAL_PARENT' | 'NON_BIOLOGICAL_PARENT' | 'OTHER_GUARDIAN';
  relationshipOther?: string;

  // Reason
  reasonForEvaluation?: string;
}

export interface OpenEndedResponses {
  item107_115_seriousProblems?: string; // Teacher 107 / Parent 115 (Serious problems at school/home/work/friends)
  item108_116_otherConcerns?: string;   // Teacher 108 / Parent 116 (Other concerns)
  item109_117_strengths?: string;       // Teacher 109 / Parent 117 (Strengths and skills)
}

export interface ScaleResult {
  scale: ScaleType;
  name: string;
  shortName: string;
  category: 'CONTENT' | 'DSM' | 'IMPAIRMENT';
  rawScore: number;
  maxRawScore: number;
  tScore: number;
  percentile: number;
  ci95Low: number;
  ci95High: number;
  classification: string;
  clinicalBand: ClinicalBand;
  interpretation: string;
  itemsCount: number;
  answeredCount: number;
}

export interface DsmEvaluation {
  presentation: 'Predominio Inatento' | 'Predominio Hiperactivo/Impulsivo' | 'Presentación Combinada' | 'No cumple criterios clínicos suficientes' | 'Subclínico / En observación';
  inattentionCount: number;
  inattentionEligible: boolean;
  hyperactiveImpulsiveCount: number;
  hyperactiveImpulsiveEligible: boolean;
  oddCount: number;
  oddEligible: boolean;
  conductCount: number;
  conductEligible: boolean;
  qualitativeSummary: string;
  pervasiveMultiSettingNotes?: string;
}

export interface ValidityIndices {
  negativeImpressionScore: number;
  negativeImpressionElevated: boolean;
  inconsistencyScore: number;
  inconsistencyElevated: boolean;
  omittedCount: number;
  validityNotes: string[];
}

export interface CriticalItemResult {
  itemNumber: number;
  text: string;
  score: RatingValue;
  category: string;
}

export interface PedagogicalRecommendation {
  area: string;
  icon: string;
  title: string;
  description: string;
  strategies: string[];
}

export interface QualitativeInterpretationReport {
  executiveSummary: string;
  cognitiveAttentionProfile: string;
  motorImpulsivityProfile: string;
  emotionalRegulationProfile: string;
  socialPeerProfile: string;
  settingImpactSummary: string; // Academic/Classroom for Teacher, Home/Family for Parents
  pedagogicalAccommodations: PedagogicalRecommendation[];
  familyGuidance: string[];
  clinicalNextSteps: string[];
  aiGeneratedNarrative?: string;
}

export interface FullAssessmentResult {
  id: string;
  formType: FormType;
  studentInfo: StudentInfo;
  responses: Record<string, RatingValue>;
  openEndedResponses: OpenEndedResponses;
  completionPercentage: number;
  completedAt: string;
  scaleResults: Record<ScaleType, ScaleResult>;
  dsmEvaluation: DsmEvaluation;
  validityIndices: ValidityIndices;
  criticalItems: CriticalItemResult[];
  qualitativeReport: QualitativeInterpretationReport;
  topObservedBehaviors: Array<{
    id: string;
    text: string;
    score: RatingValue;
    scale: string;
  }>;
}

export type SeverityLevel = 'TÍPICO' | 'LEVE' | 'MODERADO' | 'GRAVE';

export interface ComparisonLineChartPoint {
  scaleKey: ScaleType;
  scaleName: string;
  category: 'CONTENT' | 'DSM' | 'IMPAIRMENT';
  tScore1: number;
  tScore2: number;
  diff: number;
  diffAbs: number;
  band1: ClinicalBand;
  band2: ClinicalBand;
  classification1: string;
  classification2: string;
}

export interface JointEvaluationAnalysis {
  studentName: string;
  studentAge: number;
  evaluation1Date: string;
  evaluation2Date: string;
  evaluator1Title: string;
  evaluator2Title: string;
  comparisonType: 'DOCENTE_VS_PADRES' | 'LONGITUDINAL' | 'GENERAL_COMPARISON';
  
  // Joint diagnostic determination
  jointPresentation: 'Presentación Combinada' | 'Predominio Inatento' | 'Predominio Hiperactivo/Impulsivo' | 'Subclínico / En observación' | 'Sin evidencia clínica suficiente';
  severityLevel: SeverityLevel;
  severityRationale: string;
  
  // DSM-5-TR Cross-setting analysis (Criterio C)
  criterionCStatus: 'CUMPLIDO_GENERALIZADO' | 'PARCIAL_UN_ENTORNO' | 'NO_CUMPLIDO';
  criterionCExplanation: string;
  sharedInattentionSymptoms: number;
  sharedHyperactiveImpulsiveSymptoms: number;
  
  // Impairment cross-setting analysis
  schoolFunctionalImpact: 'Mínimo/Típico' | 'Leve' | 'Moderado' | 'Grave';
  homeFunctionalImpact: 'Mínimo/Típico' | 'Leve' | 'Moderado' | 'Grave';
  
  // Convergence and divergence analysis
  convergenceSummary: string;
  divergenceSummary: string;
  discrepancies: Array<{
    scale: ScaleType;
    scaleName: string;
    score1: number;
    score2: number;
    difference: number;
    clinicalMeaning: string;
  }>;
  
  // Joint recommendations
  schoolActionPlan: string[];
  homeActionPlan: string[];
  multidisciplinaryClinicalPlan: string[];
  
  // Synthesis
  executiveJointSummary: string;
  aiGeneratedJointNarrative?: string;
}

export interface MultiInformantComparison {
  assessment1: FullAssessmentResult;
  assessment2: FullAssessmentResult;
  comparisonType: 'DOCENTE_VS_PADRES' | 'LONGITUDINAL' | 'GENERAL_COMPARISON';
  chartData: ComparisonLineChartPoint[];
  jointAnalysis: JointEvaluationAnalysis;
}

