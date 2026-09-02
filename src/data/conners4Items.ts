import { ScaleType, FormType, ConnersItem } from '../types';
import { TEACHER_ITEMS } from './teacherItems';
import { PARENT_ITEMS } from './parentItems';

export { TEACHER_ITEMS } from './teacherItems';
export { PARENT_ITEMS } from './parentItems';

export const SCALE_DEFINITIONS: Record<
  ScaleType,
  {
    name: string;
    shortName: string;
    description: string;
    category: 'CONTENT' | 'DSM' | 'IMPAIRMENT';
  }
> = {
  INATTENTION: {
    name: 'Inatención y Disfunción Ejecutiva',
    shortName: 'Inatención / Func. Ejecutiva',
    description: 'Dificultad para mantener el foco, organización deficiente, olvidos frecuentes, desorganización temporal y problemas para completar tareas.',
    category: 'CONTENT',
  },
  HYPERACTIVITY: {
    name: 'Hiperactividad',
    shortName: 'Hiperactividad',
    description: 'Actividad motora excesiva, intranquilidad física, dificultad para permanecer sentado y necesidad constante de movimiento (como accionado por un motor).',
    category: 'CONTENT',
  },
  IMPULSIVITY: {
    name: 'Impulsividad',
    shortName: 'Impulsividad',
    description: 'Déficit en el control inhibitorio, precipitación de respuestas, interrupciones recurrentes e invasión en actividades o conversaciones ajenas.',
    category: 'CONTENT',
  },
  EMOTIONAL_DYSREGULATION: {
    name: 'Desregulación Emocional',
    shortName: 'Desreg. Emocional',
    description: 'Labilidad afectiva, baja tolerancia a la frustración, arrebatos de ira repentinos y lentitud para recuperar la calma tras un disgusto.',
    category: 'CONTENT',
  },
  DEPRESSED_MOOD: {
    name: 'Estado de Ánimo Depresivo',
    shortName: 'Ánimo Depresivo',
    description: 'Manifestaciones de tristeza, desánimo, desamparo, baja autoestima o anhedonia observables por el evaluador.',
    category: 'CONTENT',
  },
  ANXIOUS_THOUGHTS: {
    name: 'Pensamientos Ansiosos',
    shortName: 'Ansiedad',
    description: 'Preocupaciones recurrentes, tensión física/nerviosismo, temores anticipatorios al error o miedo al juicio negativo/vergüenza.',
    category: 'CONTENT',
  },
  PEER_RELATIONS: {
    name: 'Relaciones con Iguales',
    shortName: 'Relaciones con Pares',
    description: 'Dificultades en la socialización con compañeros, roces frecuentes, aislamiento o dificultad para forjar y conservar amistades.',
    category: 'CONTENT',
  },
  DSM_INATTENTIVE: {
    name: 'Criterios DSM-5-TR: Inatención',
    shortName: 'DSM-5-TR Inatención',
    description: 'Concordancia con los 9 criterios sintomáticos oficiales del DSM-5-TR para la presentación con predominio de inatención.',
    category: 'DSM',
  },
  DSM_HYPERACTIVE_IMPULSIVE: {
    name: 'Criterios DSM-5-TR: Hiperactividad/Impulsividad',
    shortName: 'DSM-5-TR Hiperactividad/Impulsividad',
    description: 'Concordancia con los 9 criterios sintomáticos oficiales del DSM-5-TR para la presentación hiperactiva/impulsiva.',
    category: 'DSM',
  },
  DSM_ODD: {
    name: 'Criterios DSM-5-TR: Trastorno Negativista Desafiante (TND/ODD)',
    shortName: 'DSM-5-TR Negativista Desafiante',
    description: 'Patrón de enfado/irritabilidad, discusiones, actitud desafiante y rencor hacia figuras de autoridad o pares.',
    category: 'DSM',
  },
  DSM_CONDUCT: {
    name: 'Criterios DSM-5-TR: Trastorno de la Conducta (TC)',
    shortName: 'DSM-5-TR Trastorno Conducta',
    description: 'Patrón repetitivo y persistente de transgresión de los derechos básicos de otros o de normas sociales mayores.',
    category: 'DSM',
  },
  IMP_ACADEMIC: {
    name: 'Deterioro en el Rendimiento Académico / Escolar',
    shortName: 'Deterioro Académico',
    description: 'Impacto directo en la finalización de trabajos, entrega de asignaciones, calificaciones y errores por descuido.',
    category: 'IMPAIRMENT',
  },
  IMP_PEER: {
    name: 'Deterioro en la Interacción Social con Compañeros',
    shortName: 'Deterioro Social/Pares',
    description: 'Conflictos, quejas continuas de otros niños, roces en el recreo o dificultades para sostener el juego estructurado.',
    category: 'IMPAIRMENT',
  },
  IMP_CLASSROOM: {
    name: 'Deterioro en el Clima y Convivencia de Aula (Docentes)',
    shortName: 'Deterioro en el Aula',
    description: 'Impacto en la dinámica escolar, interrupciones constantes de la clase y demanda intensiva de atención docente.',
    category: 'IMPAIRMENT',
  },
  IMP_FAMILY: {
    name: 'Deterioro en la Vida y Dinámica Familiar (Padres)',
    shortName: 'Deterioro Familiar',
    description: 'Impacto en la convivencia del hogar, discusiones familiares, retrasos a compromisos, estrés y desorganización en casa.',
    category: 'IMPAIRMENT',
  },
};

export function getItemsForForm(formType: FormType): ConnersItem[] {
  return formType === 'TEACHER' ? TEACHER_ITEMS : PARENT_ITEMS;
}

export function getScalesForForm(formType: FormType): ScaleType[] {
  if (formType === 'TEACHER') {
    return [
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
      'IMP_CLASSROOM',
    ];
  } else {
    return [
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
      'IMP_FAMILY',
    ];
  }
}
