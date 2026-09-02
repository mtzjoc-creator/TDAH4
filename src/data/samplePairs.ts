import { FullAssessmentResult, RatingValue, StudentInfo, OpenEndedResponses } from '../types';
import { runFullAssessment, compareTwoAssessments } from '../utils/scoringEngine';
import { getItemsForForm } from './conners4Items';

// Generator helper for sample profiles
function buildSampleAssessment(
  studentInfo: StudentInfo,
  elevatedItemIds: string[],
  moderateItemIds: string[],
  openEnded: OpenEndedResponses
): FullAssessmentResult {
  const items = getItemsForForm(studentInfo.formType);
  const responses: Record<string, RatingValue> = {};

  items.forEach((item) => {
    if (elevatedItemIds.includes(item.id)) {
      responses[item.id] = 3; // Muy a menudo
    } else if (moderateItemIds.includes(item.id)) {
      responses[item.id] = 2; // A menudo
    } else if (item.scales.includes('INATTENTION') && Math.random() > 0.4) {
      responses[item.id] = 2;
    } else if (item.scales.includes('HYPERACTIVITY') && Math.random() > 0.5) {
      responses[item.id] = 1;
    } else {
      responses[item.id] = 0;
    }
  });

  return runFullAssessment(studentInfo, responses, openEnded, studentInfo.formType);
}

// 1. Mateo: 9 años - Docente vs Padres (Presentación Combinada Grave)
export function getMateoTeacherAssessment(): FullAssessmentResult {
  const info: StudentInfo = {
    studentName: 'Mateo',
    studentLastName: 'Gómez Navarro',
    age: 9,
    gender: 'M',
    grade: '4º de Primaria',
    schoolName: 'Colegio San Agustín',
    studentId: 'MAT-2026-09',
    formType: 'TEACHER',
    evaluatorFirstName: 'Laura',
    evaluatorLastName: 'Sánchez',
    evaluatorRole: 'Profesor/a Titular de Aula',
    subjectTaught: 'Lengua, Matemáticas y Ciencias',
    howLongTaught: '1 año lectivo completo',
    evaluationDate: '2026-09-01',
    observationPeriod: 'Últimos 6 meses',
    reasonForEvaluation:
      'Dificultad severa para permanecer sentado, interrupciones continuas en clase y tareas incompletas.',
  };

  const elevated = [
    'T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10',
    'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'T17', 'T18', 'T19', 'T20',
    'T21', 'T22', 'T23', 'T24', 'T25', 'T26', 'T27', 'T28', 'T29', 'T30',
    'T31', 'T32', 'T33', 'T34', 'T35', 'T36', 'T37', 'T38', 'T39', 'T40',
    'T41', 'T42', 'T43', 'T44', 'T45', 'T46', 'T47', 'T48', 'T49', 'T50',
    'T51', 'T52', 'T53', 'T54', 'T55', 'T56', 'T57', 'T58', 'T59', 'T60',
    'T61', 'T62', 'T63', 'T64', 'T65', 'T66', 'T67', 'T68', 'T69', 'T70',
    'T81', 'T82', 'T83', 'T84', 'T85', 'T86', 'T87', 'T88', 'T89', 'T90',
    'T91', 'T92', 'T93', 'T94', 'T95', 'T96', 'T97', 'T98', 'T99', 'T100',
  ];

  const openEnded: OpenEndedResponses = {
    item107_115_seriousProblems:
      'Mateo se levanta continuamente de su asiento, interrumpe las explicaciones y no logra terminar las fichas de trabajo individual sin supervisión individualizada constante.',
    item108_116_otherConcerns:
      'Frustración explosiva cuando pierde en juegos de patio y desorden extremo en su mochila y pupitre.',
    item109_117_strengths:
      'Muy noble, entusiasta, excelente razonamiento verbal y alta creatividad cuando el tema es de su interés.',
  };

  return buildSampleAssessment(info, elevated, ['T71', 'T72', 'T73'], openEnded);
}

export function getMateoParentAssessment(): FullAssessmentResult {
  const info: StudentInfo = {
    studentName: 'Mateo',
    studentLastName: 'Gómez Navarro',
    age: 9,
    gender: 'M',
    grade: '4º de Primaria',
    schoolName: 'Colegio San Agustín',
    studentId: 'MAT-2026-09',
    formType: 'PARENT',
    evaluatorFirstName: 'Carlos',
    evaluatorLastName: 'Gómez',
    evaluatorRole: 'Padre',
    relationshipWithChild: 'BIOLOGICAL_PARENT',
    subjectTaught: '',
    howLongTaught: '',
    evaluationDate: '2026-09-02',
    observationPeriod: 'Vida cotidiana y últimos 6 meses',
    reasonForEvaluation:
      'Batallas diarias de más de 3 horas para hacer deberes en casa, olvidos diarios y energía física desbordante.',
  };

  const elevated = [
    'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10',
    'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20',
    'P21', 'P22', 'P23', 'P24', 'P25', 'P26', 'P27', 'P28', 'P29', 'P30',
    'P31', 'P32', 'P33', 'P34', 'P35', 'P36', 'P37', 'P38', 'P39', 'P40',
    'P41', 'P42', 'P43', 'P44', 'P45', 'P46', 'P47', 'P48', 'P49', 'P50',
    'P51', 'P52', 'P53', 'P54', 'P55', 'P56', 'P57', 'P58', 'P59', 'P60',
    'P61', 'P62', 'P63', 'P64', 'P65', 'P66', 'P67', 'P68', 'P69', 'P70',
    'P81', 'P82', 'P83', 'P84', 'P85', 'P86', 'P87', 'P88', 'P89', 'P90',
    'P91', 'P92', 'P93', 'P94', 'P95', 'P96', 'P97', 'P98', 'P99', 'P100',
  ];

  const openEnded: OpenEndedResponses = {
    item107_115_seriousProblems:
      'La hora de los deberes es una lucha diaria agotadora. Pierde chaquetas, estuches y olvida apuntar las tareas en la agenda.',
    item108_116_otherConcerns:
      'Dificultad para relajarse antes de dormir y constantes roces con su hermano menor por impulsividad motora.',
    item109_117_strengths:
      'Cariñoso, apasionado de la robótica y los dinosaurios, protector y siempre dispuesto a ayudar en la cocina.',
  };

  return buildSampleAssessment(info, elevated, ['P71', 'P72', 'P73'], openEnded);
}

// 2. Sofía: 10 años - Docente vs Padres (Predominio Inatento Moderado)
export function getSofiaTeacherAssessment(): FullAssessmentResult {
  const info: StudentInfo = {
    studentName: 'Sofía',
    studentLastName: 'Mendoza Ruiz',
    age: 10,
    gender: 'F',
    grade: '5º de Primaria',
    schoolName: 'Instituto Cervantes',
    studentId: 'SOF-2026-10',
    formType: 'TEACHER',
    evaluatorFirstName: 'María Elena',
    evaluatorLastName: 'Pardo',
    evaluatorRole: 'Tutora y Profesora de Lengua',
    subjectTaught: 'Lengua y Literatura',
    howLongTaught: '1 año',
    evaluationDate: '2026-09-01',
    observationPeriod: 'Últimos 6 meses',
    reasonForEvaluation:
      'Lentitud extrema en la ejecución, ensoñación despierta (daydreaming) y descenso en calificaciones.',
  };

  const inattentionOnly = [
    'T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10',
    'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'T17', 'T18', 'T19', 'T20',
    'T51', 'T52', 'T53', 'T54', 'T55', 'T56', 'T57', 'T58', 'T59', 'T60',
    'T81', 'T82', 'T83', 'T84', 'T85', 'T86', 'T87', 'T88', 'T89', 'T90',
    'T91', 'T92', 'T93', 'T94', 'T95',
  ];

  const openEnded: OpenEndedResponses = {
    item107_115_seriousProblems:
      'Sofía parece estar "en las nubes". Rara vez finaliza los exámenes a tiempo porque se distrae con cualquier detalle o se queda mirando por la ventana.',
    item108_116_otherConcerns:
      'Ansiedad ante las evaluaciones orales y timidez para pedir ayuda al docente.',
    item109_117_strengths:
      'Excelente conducta en el aula, educada, silenciosa y muy dotada para el dibujo artístico.',
  };

  return buildSampleAssessment(info, inattentionOnly, ['T31', 'T32'], openEnded);
}

export function getSofiaParentAssessment(): FullAssessmentResult {
  const info: StudentInfo = {
    studentName: 'Sofía',
    studentLastName: 'Mendoza Ruiz',
    age: 10,
    gender: 'F',
    grade: '5º de Primaria',
    schoolName: 'Instituto Cervantes',
    studentId: 'SOF-2026-10',
    formType: 'PARENT',
    evaluatorFirstName: 'Ana',
    evaluatorLastName: 'Ruiz',
    evaluatorRole: 'Madre',
    relationshipWithChild: 'BIOLOGICAL_PARENT',
    subjectTaught: '',
    howLongTaught: '',
    evaluationDate: '2026-09-02',
    observationPeriod: 'Últimos 6 meses',
    reasonForEvaluation:
      'Olvida las tareas que debe llevar al colegio y necesita recordatorios continuos para vestirse o lavarse los dientes.',
  };

  const inattentionOnly = [
    'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10',
    'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20',
    'P51', 'P52', 'P53', 'P54', 'P55', 'P56', 'P57', 'P58', 'P59', 'P60',
    'P81', 'P82', 'P83', 'P84', 'P85', 'P86', 'P87', 'P88', 'P89', 'P90',
  ];

  const openEnded: OpenEndedResponses = {
    item107_115_seriousProblems:
      'Le toma el triple de tiempo vestirse y prepararse por la mañana porque se evade con sus pensamientos.',
    item108_116_otherConcerns:
      'Se siente abrumada cuando le damos más de dos instrucciones seguidas.',
    item109_117_strengths:
      'Muy sensible, cariñosa, pacífica y con una imaginación narrativa extraordinaria.',
  };

  return buildSampleAssessment(info, inattentionOnly, ['P31', 'P32'], openEnded);
}

// 3. Lucas: 8 años - Evaluación Temporal Longitudinal (Pre vs Post Intervención)
export function getLucasPreAssessment(): FullAssessmentResult {
  const info: StudentInfo = {
    studentName: 'Lucas',
    studentLastName: 'Valdés Ortiz',
    age: 8,
    gender: 'M',
    grade: '3º de Primaria',
    schoolName: 'Colegio Ramón y Cajal',
    studentId: 'LUC-2026-08-PRE',
    formType: 'TEACHER',
    evaluatorFirstName: 'Javier',
    evaluatorLastName: 'Ortuño',
    evaluatorRole: 'Tutor de 3º',
    subjectTaught: 'Tutoría General',
    howLongTaught: 'Inicio de curso',
    evaluationDate: '2026-03-10',
    observationPeriod: 'Línea de base pre-intervención',
    reasonForEvaluation: 'Evaluación psicométrica inicial antes de adaptaciones metodológicas.',
  };

  const elevated = [
    'T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10',
    'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'T17', 'T18', 'T19', 'T20',
    'T21', 'T22', 'T23', 'T24', 'T25', 'T26', 'T27', 'T28', 'T29', 'T30',
    'T31', 'T32', 'T33', 'T34', 'T35', 'T36', 'T37', 'T38', 'T39', 'T40',
    'T51', 'T52', 'T53', 'T54', 'T55', 'T56', 'T57', 'T58', 'T59', 'T60',
    'T61', 'T62', 'T63', 'T64', 'T65', 'T66', 'T67', 'T68', 'T69', 'T70',
    'T81', 'T82', 'T83', 'T84', 'T85', 'T86', 'T87', 'T88', 'T89', 'T90',
  ];

  const openEnded: OpenEndedResponses = {
    item107_115_seriousProblems:
      'Incapacidad de mantener la atención durante más de 5 minutos seguidos y constante movimiento corporal.',
    item108_116_otherConcerns: 'Riesgo de fracaso en lectoescritura.',
    item109_117_strengths: 'Rápida intuición y entusiasmo social.',
  };

  return buildSampleAssessment(info, elevated, [], openEnded);
}

export function getLucasPostAssessment(): FullAssessmentResult {
  const info: StudentInfo = {
    studentName: 'Lucas',
    studentLastName: 'Valdés Ortiz',
    age: 8,
    gender: 'M',
    grade: '3º de Primaria',
    schoolName: 'Colegio Ramón y Cajal',
    studentId: 'LUC-2026-08-POST',
    formType: 'TEACHER',
    evaluatorFirstName: 'Javier',
    evaluatorLastName: 'Ortuño',
    evaluatorRole: 'Tutor de 3º',
    subjectTaught: 'Tutoría General',
    howLongTaught: '6 meses de seguimiento',
    evaluationDate: '2026-09-02',
    observationPeriod: 'Reevaluación tras 6 meses de adaptaciones',
    reasonForEvaluation: 'Seguimiento de eficacia de medidas de aula y entrenamiento autoinstruccional.',
  };

  // Substantial improvement in post-assessment
  const moderate = ['T01', 'T02', 'T05', 'T11', 'T21', 'T22', 'T31'];

  const openEnded: OpenEndedResponses = {
    item107_115_seriousProblems:
      'Notable evolución: con la tabla de rutinas visuales y pausas activas, logra completar el 85% de las tareas de clase.',
    item108_116_otherConcerns: 'Aún precisa supervisión en transiciones entre materias.',
    item109_117_strengths: 'Mayor autoestima, excelente integración con compañeros y autonomía creciente.',
  };

  return buildSampleAssessment(info, [], moderate, openEnded);
}

export function loadSamplePair(pairKey: 'mateo' | 'sofia' | 'lucas'): {
  assessment1: FullAssessmentResult;
  assessment2: FullAssessmentResult;
} {
  switch (pairKey) {
    case 'mateo':
      return {
        assessment1: getMateoTeacherAssessment(),
        assessment2: getMateoParentAssessment(),
      };
    case 'sofia':
      return {
        assessment1: getSofiaTeacherAssessment(),
        assessment2: getSofiaParentAssessment(),
      };
    case 'lucas':
      return {
        assessment1: getLucasPreAssessment(),
        assessment2: getLucasPostAssessment(),
      };
  }
}
