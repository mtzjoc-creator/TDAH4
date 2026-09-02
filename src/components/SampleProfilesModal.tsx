import React, { useState } from 'react';
import { Sparkles, X, GraduationCap, Home, CheckCircle2 } from 'lucide-react';
import { RatingValue, StudentInfo, FormType, OpenEndedResponses } from '../types';
import { getItemsForForm } from '../data/conners4Items';

interface SampleProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProfile: (
    studentInfo: StudentInfo,
    responses: Record<string, RatingValue>,
    openEnded: OpenEndedResponses
  ) => void;
}

export const SampleProfilesModal: React.FC<SampleProfilesModalProps> = ({
  isOpen,
  onClose,
  onLoadProfile,
}) => {
  const [selectedForm, setSelectedForm] = useState<FormType>('TEACHER');

  if (!isOpen) return null;

  const loadCase = (
    type: 'combined' | 'inattentive' | 'hyperactive' | 'typical',
    form: FormType
  ) => {
    const items = getItemsForForm(form);
    const responses: Record<string, RatingValue> = {};
    let info: StudentInfo;
    let openEnded: OpenEndedResponses = {
      item107_115_seriousProblems: '',
      item108_116_otherConcerns: '',
      item109_117_strengths: '',
    };

    const isTeacher = form === 'TEACHER';

    if (type === 'combined') {
      info = {
        studentName: 'Lucas',
        studentLastName: 'Mendoza Gutiérrez',
        age: 9,
        gender: 'M',
        grade: '4º Grado de Primaria',
        schoolName: 'Colegio San Gabriel',
        studentId: 'EXP-2026-042',
        formType: form,
        evaluatorFirstName: isTeacher ? 'Laura' : 'Elena',
        evaluatorLastName: isTeacher ? 'Morales' : 'Gutiérrez',
        evaluatorRole: 'Profesor/a Titular de Aula',
        relationshipWithChild: 'BIOLOGICAL_PARENT',
        subjectTaught: 'Lengua y Matemáticas',
        howLongTaught: '8 meses',
        evaluationDate: new Date().toISOString().split('T')[0],
        observationPeriod: 'Últimos 6 meses',
        reasonForEvaluation:
          'Dificultades severas de atención, constantes interrupciones, inquietud motriz y dificultades para finalizar tareas.',
      };

      openEnded = {
        item107_115_seriousProblems: isTeacher
          ? 'No logra permanecer sentado durante las explicaciones, pierde sus útiles a diario y tiene roces en el recreo por no esperar turno.'
          : 'Las rutinas de la tarde son muy difíciles, olvida la mochila en la escuela y le cuesta mucho conciliar el sueño por hiperactividad.',
        item108_116_otherConcerns:
          'Presenta baja tolerancia a la frustración cuando se equivoca en tareas complejas.',
        item109_117_strengths:
          'Tiene una excelente imaginación, gran habilidad para armar piezas de construcción y empatía con niños pequeños.',
      };

      items.forEach((item) => {
        if (
          item.scales.includes('INATTENTION') ||
          item.scales.includes('DSM_INATTENTIVE')
        ) {
          responses[item.id] = (Math.random() > 0.2 ? 3 : 2) as RatingValue;
        } else if (
          item.scales.includes('HYPERACTIVITY') ||
          item.scales.includes('DSM_HYPERACTIVE_IMPULSIVE')
        ) {
          responses[item.id] = (Math.random() > 0.25 ? 3 : 2) as RatingValue;
        } else if (item.scales.includes('IMPULSIVITY')) {
          responses[item.id] = (Math.random() > 0.2 ? 3 : 2) as RatingValue;
        } else if (item.scales.includes('EMOTIONAL_DYSREGULATION')) {
          responses[item.id] = (Math.random() > 0.4 ? 2 : 1) as RatingValue;
        } else if (
          item.scales.includes('IMP_ACADEMIC') ||
          item.scales.includes('IMP_CLASSROOM') ||
          item.scales.includes('IMP_FAMILY')
        ) {
          responses[item.id] = 3;
        } else if (item.isCritical) {
          responses[item.id] = 0;
        } else {
          responses[item.id] = (Math.random() > 0.6 ? 1 : 0) as RatingValue;
        }
      });
    } else if (type === 'inattentive') {
      info = {
        studentName: 'Sofía',
        studentLastName: 'Valenzuela Ríos',
        age: 11,
        gender: 'F',
        grade: '6º Grado de Primaria',
        schoolName: 'Instituto Las Condes',
        studentId: 'EXP-2026-088',
        formType: form,
        evaluatorFirstName: isTeacher ? 'Carlos' : 'Mariana',
        evaluatorLastName: isTeacher ? 'Restrepo' : 'Ríos',
        evaluatorRole: 'Profesor/a Titular de Aula',
        relationshipWithChild: 'BIOLOGICAL_PARENT',
        subjectTaught: 'Ciencias y Lenguaje',
        howLongTaught: '1 año escolar',
        evaluationDate: new Date().toISOString().split('T')[0],
        observationPeriod: 'Últimos 6 meses',
        reasonForEvaluation:
          'Lentitud marcada para procesar consignas, ensoñación despierta, olvido de tareas y bajo rendimiento escolar.',
      };

      openEnded = {
        item107_115_seriousProblems: isTeacher
          ? 'Deja la mitad de los exámenes en blanco por falta de tiempo; se distrae con facilidad ante cualquier estímulo visual.'
          : 'Pasa hasta 4 horas intentando hacer la tarea de 30 minutos porque se queda mirando la pared o jugando con cualquier objeto.',
        item108_116_otherConcerns:
          'Muestra timidez excesiva y aislamiento voluntario en momentos de trabajo en equipo.',
        item109_117_strengths:
          'Es muy dulce, atenta con los animales, dibuja con mucho detalle y tiene gran sensibilidad artística.',
      };

      items.forEach((item) => {
        if (
          item.scales.includes('INATTENTION') ||
          item.scales.includes('DSM_INATTENTIVE') ||
          item.scales.includes('IMP_ACADEMIC')
        ) {
          responses[item.id] = (Math.random() > 0.15 ? 3 : 2) as RatingValue;
        } else if (
          item.scales.includes('HYPERACTIVITY') ||
          item.scales.includes('IMPULSIVITY')
        ) {
          responses[item.id] = (Math.random() > 0.8 ? 1 : 0) as RatingValue;
        } else if (item.scales.includes('ANXIOUS_THOUGHTS')) {
          responses[item.id] = (Math.random() > 0.4 ? 2 : 1) as RatingValue;
        } else {
          responses[item.id] = 0;
        }
      });
    } else if (type === 'hyperactive') {
      info = {
        studentName: 'Joaquín',
        studentLastName: 'Benítez Pérez',
        age: 8,
        gender: 'M',
        grade: '3º Grado de Primaria',
        schoolName: 'Escuela Los Robles',
        studentId: 'EXP-2026-114',
        formType: form,
        evaluatorFirstName: isTeacher ? 'Marcela' : 'Rodrigo',
        evaluatorLastName: isTeacher ? 'Ríos' : 'Benítez',
        evaluatorRole: 'Profesor/a Titular de Aula',
        relationshipWithChild: 'BIOLOGICAL_PARENT',
        subjectTaught: 'Educación Básica',
        howLongTaught: '6 meses',
        evaluationDate: new Date().toISOString().split('T')[0],
        observationPeriod: 'Últimos 6 meses',
        reasonForEvaluation:
          'Inquietud motriz constante, no aguanta sentado, precipitación de respuestas e impulsividad conductual.',
      };

      openEnded = {
        item107_115_seriousProblems: isTeacher
          ? 'Corre en pasillos, responde antes de terminar la pregunta, se levanta repetidamente sin permiso.'
          : 'Trepa por los muebles, no mide el peligro físico y tiene dificultades para esperar su turno en juegos.',
        item108_116_otherConcerns: 'Riesgo de accidentes por impulsividad.',
        item109_117_strengths: 'Gran energía, entusiasmo, liderazgo en deportes y excelente motricidad gruesa.',
      };

      items.forEach((item) => {
        if (
          item.scales.includes('HYPERACTIVITY') ||
          item.scales.includes('IMPULSIVITY') ||
          item.scales.includes('DSM_HYPERACTIVE_IMPULSIVE')
        ) {
          responses[item.id] = (Math.random() > 0.15 ? 3 : 2) as RatingValue;
        } else if (
          item.scales.includes('INATTENTION') ||
          item.scales.includes('DSM_INATTENTIVE')
        ) {
          responses[item.id] = (Math.random() > 0.6 ? 1 : 0) as RatingValue;
        } else if (item.scales.includes('DSM_ODD')) {
          responses[item.id] = (Math.random() > 0.4 ? 2 : 1) as RatingValue;
        } else {
          responses[item.id] = 0;
        }
      });
    } else {
      // Typical Development / Subclinical
      info = {
        studentName: 'Martina',
        studentLastName: 'Soto Navarro',
        age: 10,
        gender: 'F',
        grade: '5º Grado de Primaria',
        schoolName: 'Colegio Monteverde',
        studentId: 'EXP-2026-205',
        formType: form,
        evaluatorFirstName: isTeacher ? 'Gonzalo' : 'Patricia',
        evaluatorLastName: isTeacher ? 'López' : 'Navarro',
        evaluatorRole: 'Profesor/a Titular de Aula',
        relationshipWithChild: 'BIOLOGICAL_PARENT',
        subjectTaught: 'Docente General',
        howLongTaught: '1 año',
        evaluationDate: new Date().toISOString().split('T')[0],
        observationPeriod: 'Últimos 6 meses',
        reasonForEvaluation:
          'Evaluación rutinaria de tamizaje para descartar dificultades de atención.',
      };

      openEnded = {
        item107_115_seriousProblems: 'Ninguno significativo.',
        item108_116_otherConcerns: 'Ninguna preocupación clínica relevante.',
        item109_117_strengths: 'Excelente compañera, organizada y con buen rendimiento académico.',
      };

      items.forEach((item) => {
        responses[item.id] = (Math.random() > 0.85 ? 1 : 0) as RatingValue;
      });
    }

    onLoadProfile(info, responses, openEnded);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Casos Clínicos Preconfigurados
              </span>
            </div>
            <h3 className="text-xl font-bold">Cargar Perfil Conners 4™ de Ejemplo</h3>
            <p className="text-xs text-slate-300 mt-1">
              Permite probar instantáneamente el cálculo de baremos, matriz DSM-5 e informe cualitativo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Switcher */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Seleccionar Protocolo:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedForm('TEACHER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedForm === 'TEACHER'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Docente (106 ítems)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedForm('PARENT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedForm === 'PARENT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Padres de Familia (114 ítems)</span>
            </button>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Case 1: Combined */}
          <button
            type="button"
            onClick={() => loadCase('combined', selectedForm)}
            className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-300 text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-rose-200 text-rose-900">
                TDAH Combinado (Severo)
              </span>
              <span className="text-[10px] text-rose-700 font-bold">Lucas (9 años)</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700">
              Inatención + Hiperactividad Marcada
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Puntuaciones T ≥ 70 en Inatención, Hiperactividad e Impulsividad, con deterioro funcional escolar y familiar.
            </p>
          </button>

          {/* Case 2: Inattentive */}
          <button
            type="button"
            onClick={() => loadCase('inattentive', selectedForm)}
            className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-indigo-200 text-indigo-900">
                TDAH Inatento Puro
              </span>
              <span className="text-[10px] text-indigo-700 font-bold">Sofía (11 años)</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
              Desatención y Función Ejecutiva
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inatención elevada (T &gt; 70) con niveles normales de hiperactividad motriz. Dificultad marcada en memoria de trabajo.
            </p>
          </button>

          {/* Case 3: Hyperactive */}
          <button
            type="button"
            onClick={() => loadCase('hyperactive', selectedForm)}
            className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-900">
                TDAH Hiperactivo-Impulsivo
              </span>
              <span className="text-[10px] text-amber-700 font-bold">Joaquín (8 años)</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700">
              Inquietud y Desinhibición
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hiperactividad e impulsividad elevadas (T &gt; 68) con rasgos oposicionistas leves y dificultad para respetar turnos.
            </p>
          </button>

          {/* Case 4: Typical */}
          <button
            type="button"
            onClick={() => loadCase('typical', selectedForm)}
            className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                Desarrollo Típico (Sin TDAH)
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">Martina (10 años)</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
              Puntuaciones Dentro de la Media
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Todas las escalas en rango promedio (T 40-55). Sin criterios sintomáticos DSM-5 ni alertas clínicas.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
