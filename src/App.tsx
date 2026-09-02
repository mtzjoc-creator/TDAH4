/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FullAssessmentResult,
  RatingValue,
  StudentInfo,
  FormType,
  OpenEndedResponses,
  MultiInformantComparison,
} from './types';
import { runFullAssessment, compareTwoAssessments } from './utils/scoringEngine';
import { getItemsForForm } from './data/conners4Items';
import { loadSamplePair, getMateoTeacherAssessment, getMateoParentAssessment } from './data/samplePairs';
import { Header } from './components/Header';
import { StudentInfoForm } from './components/StudentInfoForm';
import { EvaluationFlow } from './components/EvaluationFlow';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { SampleProfilesModal } from './components/SampleProfilesModal';
import { AssessmentHistoryModal } from './components/AssessmentHistoryModal';
import { ManualGuideModal } from './components/ManualGuideModal';
import { PrintableReport } from './components/PrintableReport';
import confetti from 'canvas-confetti';
import {
  History,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Home,
  GitCompare,
  Plus,
} from 'lucide-react';

const STORAGE_KEY_SAVED_ASSESSMENTS = 'conners4_saved_assessments_v2';
const STORAGE_KEY_CURRENT_DRAFT = 'conners4_current_draft_v2';

const DEFAULT_STUDENT_INFO: StudentInfo = {
  studentName: '',
  studentLastName: '',
  age: 9,
  gender: 'M',
  grade: '4º Grado de Primaria',
  schoolName: '',
  studentId: '',
  formType: 'TEACHER',
  evaluatorFirstName: '',
  evaluatorLastName: '',
  evaluatorRole: 'Profesor/a Titular de Aula',
  relationshipWithChild: 'BIOLOGICAL_PARENT',
  subjectTaught: 'Lengua y Matemáticas',
  howLongTaught: 'Últimos 6 meses',
  evaluationDate: new Date().toISOString().split('T')[0],
  observationPeriod: 'Últimos 6 meses (Recomendado)',
  reasonForEvaluation: 'Observación sistemática de conductas atencionales y autorregulación.',
};

const DEFAULT_OPEN_ENDED: OpenEndedResponses = {
  item107_115_seriousProblems: '',
  item108_116_otherConcerns: '',
  item109_117_strengths: '',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'assessment' | 'results' | 'comparison' | 'history' | 'guide'
  >('assessment');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(DEFAULT_STUDENT_INFO);
  const [responses, setResponses] = useState<Record<string, RatingValue>>({});
  const [openEndedResponses, setOpenEndedResponses] =
    useState<OpenEndedResponses>(DEFAULT_OPEN_ENDED);
  const [assessmentResult, setAssessmentResult] =
    useState<FullAssessmentResult | null>(null);
  const [savedAssessments, setSavedAssessments] = useState<
    FullAssessmentResult[]
  >([]);

  // Multi-informant & Longitudinal Comparison State
  const [activeComparison, setActiveComparison] =
    useState<MultiInformantComparison | null>(null);
  const [isGeneratingJointAi, setIsGeneratingJointAi] =
    useState<boolean>(false);
  const [aiJointNarrative, setAiJointNarrative] = useState<string | null>(null);
  const [isComparisonPrintMode, setIsComparisonPrintMode] =
    useState<boolean>(false);

  // Modals state
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // AI Narrative State (Individual)
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Load saved assessments and draft from localStorage on mount (seed with initial sample pair if empty)
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem(STORAGE_KEY_SAVED_ASSESSMENTS);
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAssessments(parsed);
        } else {
          // Seed with Mateo teacher and parent assessments for quick demonstration
          const mateoT = getMateoTeacherAssessment();
          const mateoP = getMateoParentAssessment();
          const initialSaved = [mateoT, mateoP];
          setSavedAssessments(initialSaved);
          localStorage.setItem(
            STORAGE_KEY_SAVED_ASSESSMENTS,
            JSON.stringify(initialSaved)
          );
        }
      } else {
        const mateoT = getMateoTeacherAssessment();
        const mateoP = getMateoParentAssessment();
        const initialSaved = [mateoT, mateoP];
        setSavedAssessments(initialSaved);
        localStorage.setItem(
          STORAGE_KEY_SAVED_ASSESSMENTS,
          JSON.stringify(initialSaved)
        );
      }

      const draftStr = localStorage.getItem(STORAGE_KEY_CURRENT_DRAFT);
      if (draftStr) {
        const parsed = JSON.parse(draftStr);
        if (parsed.studentInfo) setStudentInfo(parsed.studentInfo);
        if (parsed.responses) setResponses(parsed.responses);
        if (parsed.openEndedResponses) setOpenEndedResponses(parsed.openEndedResponses);
      }
    } catch (e) {
      console.error('Error loading stored assessments:', e);
    }
  }, []);

  // Save current draft automatically
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_CURRENT_DRAFT,
        JSON.stringify({ studentInfo, responses, openEndedResponses })
      );
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  }, [studentInfo, responses, openEndedResponses]);

  const showNotification = (
    message: string,
    type: 'success' | 'info' | 'error' = 'success'
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const currentFormItems = getItemsForForm(studentInfo.formType);
  const answeredCount = Object.keys(responses).filter((k) =>
    currentFormItems.some((i) => i.id === k)
  ).length;
  const totalItemsCount = currentFormItems.length;
  const completionPercentage = Math.round(
    (answeredCount / totalItemsCount) * 100
  );

  // Handle single item response
  const handleResponseChange = (itemId: string, value: RatingValue) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleOpenEndedChange = (
    field: keyof OpenEndedResponses,
    value: string
  ) => {
    setOpenEndedResponses((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Bulk set responses
  const handleBulkSetResponses = (
    newResponses: Record<string, RatingValue>
  ) => {
    setResponses(newResponses);
  };

  // Switch form type (Teacher vs Parent)
  const handleFormTypeChange = (type: FormType) => {
    setStudentInfo((prev) => ({
      ...prev,
      formType: type,
    }));
    setResponses({});
    setAssessmentResult(null);
    setAiNarrative(null);
    showNotification(
      `Folleto cambiado a: ${
        type === 'TEACHER'
          ? 'Docente (106 ítems)'
          : 'Padres de Familia (114 ítems)'
      }`,
      'info'
    );
  };

  // Process assessment and calculate qualitative results
  const handleGenerateResults = () => {
    if (answeredCount === 0) {
      showNotification(
        'Por favor califique al menos algunas conductas observadas antes de generar el informe.',
        'error'
      );
      return;
    }

    const res = runFullAssessment(
      studentInfo,
      responses,
      openEndedResponses,
      studentInfo.formType
    );
    setAssessmentResult(res);
    setCurrentTab('results');

    if (completionPercentage >= 80) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {
        // ignore
      }
    }

    showNotification('¡Resultados e interpretación cualitativa calculados con éxito!');
  };

  // Load sample case profile
  const handleLoadSampleProfile = (
    info: StudentInfo,
    sampleResponses: Record<string, RatingValue>,
    sampleOpenEnded: OpenEndedResponses
  ) => {
    setStudentInfo(info);
    setResponses(sampleResponses);
    setOpenEndedResponses(sampleOpenEnded);
    const res = runFullAssessment(
      info,
      sampleResponses,
      sampleOpenEnded,
      info.formType
    );
    setAssessmentResult(res);
    setAiNarrative(null);
    setCurrentTab('results');
    showNotification(
      `Caso de muestra cargado: ${info.studentName} (${res.dsmEvaluation.presentation})`
    );
  };

  // Reset evaluation form
  const handleReset = () => {
    if (
      window.confirm(
        '¿Deseas reiniciar todas las respuestas y comenzar una nueva evaluación?'
      )
    ) {
      setResponses({});
      setOpenEndedResponses(DEFAULT_OPEN_ENDED);
      setAssessmentResult(null);
      setAiNarrative(null);
      setStudentInfo(DEFAULT_STUDENT_INFO);
      localStorage.removeItem(STORAGE_KEY_CURRENT_DRAFT);
      setCurrentTab('assessment');
      showNotification('Cuestionario reiniciado con éxito.', 'info');
    }
  };

  // Save assessment to local archive
  const handleSaveToHistory = () => {
    if (!assessmentResult) return;

    const updated = [
      assessmentResult,
      ...savedAssessments.filter((a) => a.id !== assessmentResult.id),
    ];
    setSavedAssessments(updated);
    try {
      localStorage.setItem(
        STORAGE_KEY_SAVED_ASSESSMENTS,
        JSON.stringify(updated)
      );
      showNotification('Evaluación guardada en el historial con éxito.');
    } catch (e) {
      showNotification(
        'No se pudo guardar en el almacenamiento local.',
        'error'
      );
    }
  };

  // Load past assessment from history
  const handleLoadSavedAssessment = (assessment: FullAssessmentResult) => {
    setStudentInfo(assessment.studentInfo);
    setResponses(assessment.responses);
    setOpenEndedResponses(assessment.openEndedResponses || DEFAULT_OPEN_ENDED);
    setAssessmentResult(assessment);
    setAiNarrative(null);
    setCurrentTab('results');
    showNotification(
      `Evaluación cargada: ${assessment.studentInfo.studentName}`
    );
  };

  // Delete past assessment from history
  const handleDeleteSavedAssessment = (id: string) => {
    const updated = savedAssessments.filter((a) => a.id !== id);
    setSavedAssessments(updated);
    try {
      localStorage.setItem(
        STORAGE_KEY_SAVED_ASSESSMENTS,
        JSON.stringify(updated)
      );
      showNotification('Registro eliminado del historial.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Compare two assessments (e.g. Docente vs Padres or Pre vs Post)
  const handleCompareTwoAssessments = (id1: string, id2: string) => {
    const a1 = savedAssessments.find((a) => a.id === id1);
    const a2 = savedAssessments.find((a) => a.id === id2);

    if (!a1 || !a2) {
      showNotification('No se encontraron las dos evaluaciones para comparar.', 'error');
      return;
    }

    const comparison = compareTwoAssessments(a1, a2);
    setActiveComparison(comparison);
    setAiJointNarrative(null);
    setCurrentTab('comparison');
    setIsHistoryModalOpen(false);
    showNotification(
      `Comparativa generada: ${comparison.jointAnalysis.studentName} (${comparison.jointAnalysis.jointPresentation})`
    );
  };

  // Switch first assessment in comparison
  const handleSelectAssessment1 = (id: string) => {
    if (!activeComparison) return;
    const a1 = savedAssessments.find((a) => a.id === id);
    if (!a1) return;
    const updated = compareTwoAssessments(a1, activeComparison.assessment2);
    setActiveComparison(updated);
    setAiJointNarrative(null);
  };

  // Switch second assessment in comparison
  const handleSelectAssessment2 = (id: string) => {
    if (!activeComparison) return;
    const a2 = savedAssessments.find((a) => a.id === id);
    if (!a2) return;
    const updated = compareTwoAssessments(activeComparison.assessment1, a2);
    setActiveComparison(updated);
    setAiJointNarrative(null);
  };

  // Load a predefined high-fidelity sample pair
  const handleLoadSamplePair = (pairKey: 'mateo' | 'sofia' | 'lucas') => {
    const pair = loadSamplePair(pairKey);
    const updatedHistory = [
      pair.assessment1,
      pair.assessment2,
      ...savedAssessments.filter(
        (a) => a.id !== pair.assessment1.id && a.id !== pair.assessment2.id
      ),
    ];
    setSavedAssessments(updatedHistory);
    try {
      localStorage.setItem(
        STORAGE_KEY_SAVED_ASSESSMENTS,
        JSON.stringify(updatedHistory)
      );
    } catch (e) {
      console.error(e);
    }

    const comparison = compareTwoAssessments(pair.assessment1, pair.assessment2);
    setActiveComparison(comparison);
    setAiJointNarrative(null);
    setCurrentTab('comparison');
    showNotification(
      `Caso comparativo cargado: ${comparison.jointAnalysis.studentName} (${comparison.jointAnalysis.jointPresentation})`
    );
  };

  // Open comparison tab, ensuring comparison data is available
  const handleOpenComparisonTab = () => {
    if (!activeComparison) {
      // If we have at least 2 saved assessments, compare the first 2
      if (savedAssessments.length >= 2) {
        const c = compareTwoAssessments(savedAssessments[0], savedAssessments[1]);
        setActiveComparison(c);
      } else {
        // Load default Mateo pair
        const pair = loadSamplePair('mateo');
        const c = compareTwoAssessments(pair.assessment1, pair.assessment2);
        setActiveComparison(c);
      }
    }
    setCurrentTab('comparison');
  };

  // Call Server Gemini API for Deep AI Qualitative Report (Single Form)
  const handleGenerateAiReport = async () => {
    if (!assessmentResult) return;

    setIsGeneratingAi(true);
    try {
      const payload = {
        studentInfo: assessmentResult.studentInfo,
        scores: assessmentResult.scaleResults,
        dsmSummary: assessmentResult.dsmEvaluation,
        contentScales: Object.values(assessmentResult.scaleResults),
        criticalItems: assessmentResult.criticalItems,
        topObservedBehaviors: assessmentResult.topObservedBehaviors,
        openEndedResponses: assessmentResult.openEndedResponses,
      };

      const resp = await fetch('/api/interpret-qualitative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error('Error al conectar con el servidor de análisis');
      }

      const data = await resp.json();
      if (data.narrative) {
        setAiNarrative(data.narrative);
        showNotification(
          '¡Informe cualitativo formal generado con éxito mediante IA!'
        );
      } else {
        // Fallback: use offline structured narrative
        setAiNarrative(
          `## INFORME PSICOPEDAGÓGICO CUALITATIVO (MOTOR ESTANDARIZADO)\n\n` +
            `**Alumno:** ${assessmentResult.studentInfo.studentName || 'Estudiante'} (${assessmentResult.studentInfo.age} años)\n` +
            `**Protocolo:** ${assessmentResult.formType === 'TEACHER' ? 'Docente (Escolar)' : 'Padres (Hogar)'}\n` +
            `**Clasificación DSM-5-TR:** ${assessmentResult.dsmEvaluation.presentation}\n\n` +
            `### 1. Resumen Ejecutivo\n${assessmentResult.qualitativeReport.executiveSummary}\n\n` +
            `### 2. Funcionamiento Atencional y Ejecutivo\n${assessmentResult.qualitativeReport.cognitiveAttentionProfile}\n\n` +
            `### 3. Control Motor e Inhibición\n${assessmentResult.qualitativeReport.motorImpulsivityProfile}\n\n` +
            `### 4. Regulación Emocional\n${assessmentResult.qualitativeReport.emotionalRegulationProfile}\n\n` +
            `### 5. Medidas y Recomendaciones Personalizadas\n` +
            assessmentResult.qualitativeReport.pedagogicalAccommodations
              .map(
                (a) =>
                  `* **${a.title} (${a.area})**: ${a.strategies.join('; ')}`
              )
              .join('\n')
        );
        showNotification('Informe cualitativo estructurado generado.');
      }
    } catch (err: any) {
      console.error(err);
      showNotification(
        'No se pudo conectar con el modelo de IA. Se utiliza el informe clínico base.',
        'error'
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Call Server Gemini API for Joint Multi-Informant Report
  const handleGenerateJointAiReport = async () => {
    if (!activeComparison) return;

    setIsGeneratingJointAi(true);
    try {
      const payload = {
        studentInfo: activeComparison.assessment1.studentInfo,
        comparisonType: activeComparison.comparisonType,
        jointAnalysis: activeComparison.jointAnalysis,
        chartData: activeComparison.chartData,
        assessment1: activeComparison.assessment1,
        assessment2: activeComparison.assessment2,
      };

      const resp = await fetch('/api/interpret-joint-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error('Error al generar el informe conjunto con IA');
      }

      const data = await resp.json();
      if (data.narrative) {
        setAiJointNarrative(data.narrative);
        showNotification(
          '¡Informe conjunto integrado generado con éxito mediante Gemini 3.7!'
        );
      }
    } catch (err: any) {
      console.error(err);
      showNotification(
        'No se pudo conectar con el modelo de IA. Se muestra el análisis estructurado estándar.',
        'error'
      );
    } finally {
      setIsGeneratingJointAi(false);
    }
  };

  const handlePrint = () => {
    setIsComparisonPrintMode(currentTab === 'comparison');
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-sm font-semibold text-white border ${
              notification.type === 'error'
                ? 'bg-rose-600 border-rose-500'
                : notification.type === 'info'
                ? 'bg-slate-800 border-slate-700'
                : 'bg-emerald-600 border-emerald-500'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'comparison') {
            handleOpenComparisonTab();
          } else {
            setCurrentTab(tab);
          }
        }}
        completionPercentage={completionPercentage}
        hasResults={assessmentResult !== null}
        formType={studentInfo.formType}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onReset={handleReset}
        onPrint={handlePrint}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0">
        {/* TAB 1: EVALUATION ASSESSMENT VIEW */}
        {currentTab === 'assessment' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Student & Informant Form */}
            <StudentInfoForm
              studentInfo={studentInfo}
              onChange={setStudentInfo}
              onFormTypeChange={handleFormTypeChange}
            />

            {/* Questionnaire & Rating Flow */}
            <EvaluationFlow
              formType={studentInfo.formType}
              responses={responses}
              openEndedResponses={openEndedResponses}
              onResponseChange={handleResponseChange}
              onOpenEndedChange={handleOpenEndedChange}
              onBulkSetResponses={handleBulkSetResponses}
              onGenerateResults={handleGenerateResults}
              studentName={studentInfo.studentName}
            />
          </div>
        )}

        {/* TAB 2: RESULTS & QUALITATIVE REPORT VIEW */}
        {currentTab === 'results' && assessmentResult && (
          <div className="animate-in fade-in duration-200">
            <ResultsDashboard
              result={assessmentResult}
              onEditResponses={() => setCurrentTab('assessment')}
              onSaveAssessment={handleSaveToHistory}
              onPrint={handlePrint}
              onGenerateAiReport={handleGenerateAiReport}
              isGeneratingAi={isGeneratingAi}
              aiNarrative={aiNarrative}
              onNavigateToComparison={() => {
                // If saved assessments has another form, compare them
                const other = savedAssessments.find(
                  (a) =>
                    a.id !== assessmentResult.id &&
                    a.studentInfo.studentName?.toLowerCase() ===
                      assessmentResult.studentInfo.studentName?.toLowerCase()
                ) || savedAssessments.find((a) => a.id !== assessmentResult.id);

                if (other) {
                  handleCompareTwoAssessments(assessmentResult.id, other.id);
                } else {
                  handleOpenComparisonTab();
                }
              }}
            />
          </div>
        )}

        {/* TAB 3: COMPARISON & JOINT ANALYSIS VIEW */}
        {currentTab === 'comparison' && activeComparison && (
          <div className="animate-in fade-in duration-200">
            <ComparisonDashboard
              comparison={activeComparison}
              savedAssessments={savedAssessments}
              onSelectAssessment1={handleSelectAssessment1}
              onSelectAssessment2={handleSelectAssessment2}
              onLoadPredefinedPair={handleLoadSamplePair}
              onPrint={handlePrint}
              onGenerateAiJointReport={handleGenerateJointAiReport}
              isGeneratingAi={isGeneratingJointAi}
              aiJointNarrative={aiJointNarrative}
            />
          </div>
        )}

        {/* TAB 4: SAVED ASSESSMENTS ARCHIVE VIEW */}
        {currentTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  Historial de Evaluaciones Conners 4™
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro local de evaluaciones docentes y de padres. Puedes seleccionar dos para compararlas visualmente.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <GitCompare className="w-4 h-4 text-indigo-600" />
                  Comparador Multi-Informante
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('assessment')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Evaluación
                </button>
              </div>
            </div>

            {savedAssessments.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <History className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700">Sin evaluaciones guardadas</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Al completar un cuestionario, haz clic en "Guardar en Historial" desde la pestaña de resultados para archivarlo aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAssessments.map((a) => {
                  const isAteacher = a.formType === 'TEACHER';
                  return (
                    <div
                      key={a.id}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-base">
                              {a.studentInfo.studentName || 'Estudiante'} {a.studentInfo.studentLastName || ''}
                            </h4>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                                isAteacher
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {isAteacher ? 'Docente (106)' : 'Padres (114)'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {a.studentInfo.age} años • {a.studentInfo.schoolName || 'Escuela no especificada'}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                          {new Date(a.completedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs font-semibold text-indigo-950">
                        {a.dsmEvaluation.presentation}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <span className="text-slate-500">
                          Informante: {a.studentInfo.evaluatorFirstName || 'N/D'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoadSavedAssessment(a)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
                          >
                            Ver Informe
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSavedAssessment(a.id)}
                            className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MANUAL GUIDE VIEW */}
        {currentTab === 'guide' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-indigo-700 mb-1">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Documentación Técnica y Psicométrica
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Manual Conners 4ta Edición (Conners 4™) — Docente y Padres
              </h2>
              <p className="text-xs text-slate-500">
                Guía oficial de administración, puntuación, comparación visual e interpretación cualitativa (Multi-Health Systems / MHS)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-700" />
                    Folleto de Docentes (Teacher - 106 ítems)
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Centrado en el contexto escolar: atención en clases, seguimiento de instrucciones grupales, finalización de tareas escritas, control de impulsos en pasillos/recreo y convivencia escolar.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                  <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-emerald-700" />
                    Folleto de Padres de Familia (Parent - 114 ítems)
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Centrado en la dinámica del hogar y la vida cotidiana: rutinas de aseo/comida/sueño, acompañamiento en tareas escolares en casa, salidas a lugares públicos, juego libre y relación con hermanos y tutores.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                  <h3 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                    <GitCompare className="w-4 h-4 text-purple-700" />
                    Evaluación Comparativa Multi-Informante (Criterio C DSM-5-TR)
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Permite cotejar las valoraciones de profesores y padres en un gráfico de líneas superpuesto para determinar concordancias o discrepancias contextuales, asegurando que los síntomas se manifiesten en dos o más entornos (escuela y hogar).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Escala de Calificación de 4 Puntos (0 a 3)
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li><strong>0 = Nunca / Rara vez:</strong> Nada cierto sobre el alumno/hijo en el último mes.</li>
                    <li><strong>1 = Ocasionalmente:</strong> Solo un poco cierto sobre el alumno/hijo en el último mes.</li>
                    <li><strong>2 = A menudo / Frecuente:</strong> Bastante cierto sobre el alumno/hijo en el último mes.</li>
                    <li><strong>3 = Muy a menudo / Siempre:</strong> Completamente cierto sobre el alumno/hijo en el último mes.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <h3 className="font-bold text-amber-950 text-sm">
                    Puntos de Corte Clínico (Puntuaciones T)
                  </h3>
                  <ul className="space-y-1 text-xs text-amber-900">
                    <li><strong>T &lt; 60:</strong> Rango Promedio / Típico (sin preocupación clínica).</li>
                    <li><strong>T 60-64:</strong> Nivel Límite / Ligeramente Elevado (alerta preventiva).</li>
                    <li><strong>T 65-69:</strong> Nivel Elevado (preocupación clínica significativa).</li>
                    <li><strong>T ≥ 70:</strong> Nivel Muy Elevado (severidad clínica y alto impacto).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Printable Report View (Visible only when printing) */}
      <PrintableReport
        result={assessmentResult}
        aiNarrative={aiNarrative}
        comparisonResult={activeComparison}
        aiJointNarrative={aiJointNarrative}
        isComparisonPrint={isComparisonPrintMode}
      />

      {/* Modals */}
      <SampleProfilesModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onLoadProfile={handleLoadSampleProfile}
      />

      <AssessmentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedAssessments={savedAssessments}
        onLoadAssessment={handleLoadSavedAssessment}
        onDeleteAssessment={handleDeleteSavedAssessment}
        onCompareTwoAssessments={handleCompareTwoAssessments}
      />

      <ManualGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}

