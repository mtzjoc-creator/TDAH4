import React, { useState } from 'react';
import { StudentInfo, FormType } from '../types';
import {
  User,
  GraduationCap,
  Home,
  Calendar,
  UserCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  School,
} from 'lucide-react';

interface StudentInfoFormProps {
  studentInfo: StudentInfo;
  onChange: (info: StudentInfo) => void;
  onFormTypeChange?: (type: FormType) => void;
}

export const StudentInfoForm: React.FC<StudentInfoFormProps> = ({
  studentInfo,
  onChange,
  onFormTypeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handleChange = (field: keyof StudentInfo, value: any) => {
    onChange({
      ...studentInfo,
      [field]: value,
    });
  };

  const handleFormTypeSwitch = (type: FormType) => {
    if (onFormTypeChange) {
      onFormTypeChange(type);
    } else {
      handleChange('formType', type);
    }
  };

  const isTeacher = studentInfo.formType === 'TEACHER';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm mb-6 overflow-hidden">
      {/* Protocol Selection Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Protocolo Conners 4™ Oficial
              </span>
              <span className="text-xs text-slate-300 font-medium">
                C. Keith Conners, PhD
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Selección de Instrumento de Evaluación
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Seleccione el folleto según la fuente de observación (Docentes para ámbito escolar o Padres para dinámica familiar)
            </p>
          </div>

          {/* Form Type Segmented Switcher */}
          <div className="flex bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 shadow-inner self-start sm:self-center">
            <button
              type="button"
              id="btn-select-form-teacher"
              onClick={() => handleFormTypeSwitch('TEACHER')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isTeacher
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Docentes (106 ítems)</span>
            </button>
            <button
              type="button"
              id="btn-select-form-parent"
              onClick={() => handleFormTypeSwitch('PARENT')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                !isTeacher
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Padres de Familia (114 ítems)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header Bar Accordion */}
      <button
        type="button"
        id="btn-toggle-student-info"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between border-b border-slate-200 text-left transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              isTeacher ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">
                {isTeacher
                  ? 'Ficha del Alumno y Datos del Docente / Evaluador Escolar'
                  : 'Ficha del Hijo(a) y Datos del Padre / Madre / Tutor'}
              </h2>
              {studentInfo.studentName && (
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    isTeacher
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {studentInfo.studentName} {studentInfo.studentLastName || ''} ({studentInfo.age} años)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Datos sociodemográficos requeridos por el manual oficial Conners 4™ para baremación
            </p>
          </div>
        </div>
        <div className="text-slate-400 hover:text-slate-600">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded Form Contents */}
      {isExpanded && (
        <div className="p-5 space-y-6 text-sm bg-white">
          {/* Section 1: Child / Student Information */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                1. Información del Alumno / Hijo(a) Evaluado
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre(s) *
                </label>
                <input
                  id="input-student-name"
                  type="text"
                  placeholder="Ej. Mateo Alejandro"
                  value={studentInfo.studentName}
                  onChange={(e) => handleChange('studentName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Apellido(s) *
                </label>
                <input
                  id="input-student-lastname"
                  type="text"
                  placeholder="Ej. Ramírez Santos"
                  value={studentInfo.studentLastName || ''}
                  onChange={(e) => handleChange('studentLastName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Edad (6 a 18 años) *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="input-student-age"
                    type="number"
                    min="6"
                    max="18"
                    value={studentInfo.age}
                    onChange={(e) =>
                      handleChange(
                        'age',
                        Math.max(6, Math.min(18, parseInt(e.target.value) || 6))
                      )
                    }
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-bold text-indigo-700"
                  />
                  <span className="text-xs text-slate-500">años cumplidos</span>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Género *
                </label>
                <select
                  id="select-student-gender"
                  value={studentInfo.gender}
                  onChange={(e) => handleChange('gender', e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="M">Masculino / Varón</option>
                  <option value="F">Femenino / Mujer</option>
                  <option value="OTHER">Otro / No binario</option>
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grado / Curso Escolar
                </label>
                <input
                  id="input-student-grade"
                  type="text"
                  placeholder="Ej. 4º Grado de Primaria"
                  value={studentInfo.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* School Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Centro Educativo / Escuela
                </label>
                <input
                  id="input-school-name"
                  type="text"
                  placeholder="Ej. Colegio San Agustín"
                  value={studentInfo.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* ID / Expediente */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID o Matrícula (Opcional)
                </label>
                <input
                  id="input-student-id"
                  type="text"
                  placeholder="Ej. EXP-2026-089"
                  value={studentInfo.studentId || ''}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-xs"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  id="input-student-birthdate"
                  type="date"
                  value={studentInfo.birthDate || ''}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Informant / Evaluator Information */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                2. Información del Informante ({isTeacher ? 'Docente' : 'Padres de Familia'})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Informant First Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Informante *
                </label>
                <input
                  id="input-evaluator-firstname"
                  type="text"
                  placeholder={isTeacher ? 'Ej. Prof. Laura' : 'Ej. María'}
                  value={studentInfo.evaluatorFirstName}
                  onChange={(e) => handleChange('evaluatorFirstName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Informant Last Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Apellido del Informante
                </label>
                <input
                  id="input-evaluator-lastname"
                  type="text"
                  placeholder="Ej. González Vega"
                  value={studentInfo.evaluatorLastName || ''}
                  onChange={(e) => handleChange('evaluatorLastName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Specific Field: Teacher Role vs Parent Relationship */}
              {isTeacher ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rol / Cargo en el Centro
                    </label>
                    <select
                      id="select-evaluator-role"
                      value={studentInfo.evaluatorRole}
                      onChange={(e) => handleChange('evaluatorRole', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    >
                      <option value="Profesor/a Titular de Aula">Profesor/a Titular de Aula</option>
                      <option value="Profesor/a Especialista">Profesor/a Especialista (Música/EF/Idiomas)</option>
                      <option value="Orientador/a / Psicopedagogo/a">Orientador/a / Psicopedagogo/a</option>
                      <option value="Tutor/a de Apoyo / PIE">Tutor/a de Apoyo a la Integración</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Asignatura(s) impartida(s)
                    </label>
                    <input
                      id="input-teacher-subject"
                      type="text"
                      placeholder="Ej. Lengua, Matemáticas, Ciencias"
                      value={studentInfo.subjectTaught || ''}
                      onChange={(e) => handleChange('subjectTaught', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ¿Cuánto tiempo le ha enseñado?
                    </label>
                    <input
                      id="input-teacher-howlong"
                      type="text"
                      placeholder="Ej. 1 año escolar / 6 meses"
                      value={studentInfo.howLongTaught || ''}
                      onChange={(e) => handleChange('howLongTaught', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Relación con el/la hijo(a) *
                    </label>
                    <select
                      id="select-parent-relationship"
                      value={studentInfo.relationshipWithChild || 'BIOLOGICAL_PARENT'}
                      onChange={(e) => handleChange('relationshipWithChild', e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white font-medium"
                    >
                      <option value="BIOLOGICAL_PARENT">Padre o Madre Biológico(a)</option>
                      <option value="NON_BIOLOGICAL_PARENT">Padre o Madre No Biológico(a) (Adoptivo/Padrastro)</option>
                      <option value="OTHER_GUARDIAN">Otro pariente o Tutor Legal (Abuelo/Tío/Tutor)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Evaluation Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Evaluación
                </label>
                <input
                  id="input-evaluation-date"
                  type="date"
                  value={studentInfo.evaluationDate}
                  onChange={(e) => handleChange('evaluationDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Reason */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de Consulta / Observación Principal
                </label>
                <input
                  id="input-reason-evaluation"
                  type="text"
                  placeholder="Ej. Sospecha de TDAH por dificultad atencional e inquietud motora"
                  value={studentInfo.reasonForEvaluation || ''}
                  onChange={(e) => handleChange('reasonForEvaluation', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
