import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route: Health Check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // API Route: Deep Qualitative Psychoeducational Report Interpretation
  app.post("/api/interpret-qualitative", async (req, res) => {
    try {
      const {
        studentInfo,
        scores,
        dsmSummary,
        contentScales,
        criticalItems,
        topObservedBehaviors,
        openEndedResponses,
      } = req.body;

      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          narrative: null,
          source: "offline_engine",
          message:
            "El motor de interpretación clínica determinó el perfil cuantitativo y cualitativo mediante baremos estandarizados Conners-4.",
        });
      }

      const isTeacher = studentInfo.formType === "TEACHER";
      const informantType = isTeacher ? "Docente / Escuela" : "Padres de Familia / Hogar";
      const settingName = isTeacher ? "Escuela y Aula de Clases" : "Hogar y Dinámica Familiar";

      const prompt = `
Actúa como un Neuropsicólogo Clínico y Especialista en Psicopedagogía y Evaluación Infanto-Juvenil experto en la escala Conners 4ta Edición (Conners 4™) y los criterios diagnósticos del DSM-5-TR para TDAH.

A continuación se presentan los resultados estandarizados de la evaluación Conners 4™ (${isTeacher ? "Folleto de Respuestas para Docentes / Teachers - 106 ítems" : "Folleto de Respuestas para Padres de Familia / Parents - 114 ítems"}):

DATOS DEL ALUMNO / HIJO(A):
- Nombre / Identificador: ${studentInfo.studentName || "Estudiante Evaluado"} ${studentInfo.studentLastName || ""}
- Edad: ${studentInfo.age} años
- Grado / Curso: ${studentInfo.grade || "No especificado"}
- Género: ${studentInfo.gender === "M" ? "Masculino" : studentInfo.gender === "F" ? "Femenino" : "Otro"}
- Evaluador / Informante: ${studentInfo.evaluatorFirstName || ""} ${studentInfo.evaluatorLastName || ""} (${informantType} - ${isTeacher ? (studentInfo.evaluatorRole || "Docente") : (studentInfo.relationshipWithChild || "Padre/Madre/Tutor")})
- Fecha de evaluación: ${studentInfo.evaluationDate || new Date().toLocaleDateString()}
${isTeacher ? `- Asignatura(s) impartida(s): ${studentInfo.subjectTaught || "General"} | Tiempo de docencia: ${studentInfo.howLongTaught || "6+ meses"}` : ""}

PUNTUACIONES T (T-Scores, Media=50, DE=10) Y NIVELES CLÍNICOS:
${contentScales
  .map(
    (s: any) =>
      `- ${s.name}: Puntuación T = ${s.tScore} (${s.classification}) [PD: ${s.rawScore}/${s.maxRawScore}, Percentil: ${s.percentile}%]`,
  )
  .join("\n")}

EVALUACIÓN DE CRITERIOS DSM-5-TR EN ESTE ENTORNO (${settingName.toUpperCase()}):
- Criterios de Inatención detectados: ${dsmSummary.inattentionCount}/9 (${dsmSummary.inattentionEligible ? "Cumple umbral sintomático clínico" : "No alcanza umbral"})
- Criterios de Hiperactividad/Impulsividad detectados: ${dsmSummary.hyperactiveImpulsiveCount}/9 (${dsmSummary.hyperactiveImpulsiveEligible ? "Cumple umbral sintomático clínico" : "No alcanza umbral"})
- Clasificación DSM-5-TR en este contexto: ${dsmSummary.presentation}

CONDUCTAS OBSERVADAS CON MAYOR FRECUENCIA/SEVERIDAD (Puntuadas con 2 = Bastante o 3 = Siempre/Completamente):
${topObservedBehaviors.length > 0 ? topObservedBehaviors.map((b: any) => `* [${b.scale}] ${b.text} (Puntuación: ${b.score}/3)`).join("\n") : "No se registraron conductas de intensidad moderada/alta."}

CONDUCTAS CRÍTICAS / DE RIESGO:
${criticalItems && criticalItems.length > 0 ? criticalItems.map((c: any) => `* ${c.text}: ${c.score > 0 ? `PRESENTE (Puntuación: ${c.score}/3 - ${c.category})` : "Ausente"}`).join("\n") : "Ninguna conducta crítica reportada."}

DETERIORO FUNCIONAL:
- Rendimiento Académico / Tareas: T = ${scores.academicImpairment?.tScore ?? 50} (${scores.academicImpairment?.classification ?? "Promedio"})
- Relaciones con Compañeros / Amigos: T = ${scores.peerImpairment?.tScore ?? 50} (${scores.peerImpairment?.classification ?? "Promedio"})
${isTeacher ? `- Clima y Dinámica de Aula: T = ${scores.classroomImpairment?.tScore ?? 50} (${scores.classroomImpairment?.classification ?? "Promedio"})` : `- Dinámica y Vida Familiar: T = ${scores.familyImpairment?.tScore ?? 50} (${scores.familyImpairment?.classification ?? "Promedio"})`}

${openEndedResponses?.item107_115_seriousProblems ? `RESPUESTA ABIERTA - PROBLEMAS SERIOS REPORTADOS: "${openEndedResponses.item107_115_seriousProblems}"` : ""}
${openEndedResponses?.item108_116_otherConcerns ? `RESPUESTA ABIERTA - OTRAS PREOCUPACIONES: "${openEndedResponses.item108_116_otherConcerns}"` : ""}
${openEndedResponses?.item109_117_strengths ? `RESPUESTA ABIERTA - FORTALEZAS Y HABILIDADES: "${openEndedResponses.item109_117_strengths}"` : ""}

INSTRUCCIONES PARA EL INFORME CUALITATIVO:
Genera un INFORME CUALITATIVO DE EVALUACIÓN CLÍNICA Y PSICOPEDAGÓGICA profesional, estructurado, riguroso y empático, adaptado específicamente a la fuente de información (${isTeacher ? "PERSPECTIVA DOCENTE / ÁMBITO ESCOLAR" : "PERSPECTIVA FAMILIAR / ÁMBITO DEL HOGAR"}).

Utiliza formato Markdown claro con los siguientes títulos de sección:

1. **RESUMEN EJECUTIVO DEL PERFIL CONDUCTUAL**: Síntesis diagnóstica de la presentación predominante (inatenta, hiperactiva-impulsiva o combinada) y su grado de afectación en ${settingName}.
2. **ANÁLISIS CUALITATIVO POR DOMINIOS CLÍNICOS**:
   - Atención Sostenida y Funcionamiento Ejecutivo (organización, memoria de trabajo, finalización de tareas).
   - Control Motor e Inhibición de la Conducta (inquietud física, precipitación de respuestas, interrupciones).
   - Regulación Emocional y Tolerancia a la Frustración (reactividad afectiva, labilidad, enfado).
   - Habilidades Sociales y Relación con Iguales.
3. **IMPACTO FUNCIONAL Y VULNERABILIDADES EN ${settingName.toUpperCase()}**: Detalle de cómo estas conductas interfieren en el día a día.
4. **PLAN DE INTERVENCIÓN Y RECOMENDACIONES PERSONALIZADAS**:
   ${isTeacher ? "- Medidas y adaptaciones curriculares y de aula para el equipo docente (ubicación, instrucciones, pausas, refuerzo positivo)." : "- Pautas de crianza, estructura en el hogar, rutinas diarias, acompañamiento en tareas y co-regulación emocional para los padres."}
5. **ALINEACIÓN Y COLABORACIÓN ESCUELA-FAMILIA**: Pautas para mantener coherencia entre el hogar y la institución educativa.
6. **CONSIDERACIONES DIAGNÓSTICAS DSM-5-TR Y PASOS A SEGUIR**: Recordatorio del Criterio C (presencia de síntomas en 2 o más entornos) y derivación a Neuropediatría / Psiquiatría Infanto-Juvenil si procede.

Mantén un lenguaje clínico claro, constructivo y libre de estigmas, orientado a potenciar las fortalezas del alumno.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      return res.json({
        narrative: response.text,
        source: "gemini_ai",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error generating qualitative narrative:", error);
      return res.status(500).json({
        error: "No se pudo generar la interpretación con IA en este momento.",
        details: error?.message || "Error desconocido",
      });
    }
  });

  // API Route: Joint Multi-Informant / Longitudinal Comparison Interpretation
  app.post("/api/interpret-joint-comparison", async (req, res) => {
    try {
      const {
        studentInfo,
        comparisonType,
        jointAnalysis,
        chartData,
        assessment1,
        assessment2,
      } = req.body;

      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          narrative: null,
          source: "offline_engine",
          message:
            "El motor psicométrico analizó los baremos conjuntos y el Criterio C del DSM-5-TR de forma determinista.",
        });
      }

      const prompt = `
Actúa como un Neuropsicólogo Clínico y Especialista en Psicopedagogía y Evaluación Infanto-Juvenil de máximo nivel, experto en la escala Conners 4ta Edición (Conners 4™) y los criterios diagnósticos del DSM-5-TR.

A continuación se presentan los datos psicométricos de una COMPARATIVA MULTI-INFORMANTE Y/O LONGITUDINAL de dos evaluaciones realizadas al mismo estudiante:

DATOS DEL ALUMNO:
- Nombre: ${studentInfo.studentName || "Estudiante"} ${studentInfo.studentLastName || ""}
- Edad: ${studentInfo.age} años | Grado: ${studentInfo.grade || "No especificado"} | Escuela: ${studentInfo.schoolName || "No especificada"}

INFORMANTES Y FECHAS:
- Evaluación 1: ${assessment1.formType === "TEACHER" ? "Folleto Docente (Escuela)" : "Folleto Padres (Hogar)"} — Evaluador: ${assessment1.studentInfo.evaluatorFirstName} (${assessment1.studentInfo.evaluatorRole || "Informante"}) — Fecha: ${assessment1.studentInfo.evaluationDate}
- Evaluación 2: ${assessment2.formType === "TEACHER" ? "Folleto Docente (Escuela)" : "Folleto Padres (Hogar)"} — Evaluador: ${assessment2.studentInfo.evaluatorFirstName} (${assessment2.studentInfo.evaluatorRole || "Informante"}) — Fecha: ${assessment2.studentInfo.evaluationDate}

DICTAMEN PRELIMINAR DEL MOTOR PSICOMÉTRICO:
- TIPO DE TDAH DETERMINADO: ${jointAnalysis.jointPresentation}
- NIVEL DE GRAVEDAD CLÍNICO: ${jointAnalysis.severityLevel}
- FUNDAMENTACIÓN DE GRAVEDAD: ${jointAnalysis.severityRationale}
- CRITERIO C DSM-5-TR (Presencia en 2+ entornos): ${jointAnalysis.criterionCStatus} (${jointAnalysis.criterionCExplanation})
- IMPACTO EN LA ESCUELA: ${jointAnalysis.schoolFunctionalImpact}
- IMPACTO EN EL HOGAR: ${jointAnalysis.homeFunctionalImpact}

TABLA COMPARATIVA DE PUNTUACIONES T (Media=50, DE=10):
${chartData
  .map(
    (c: any) =>
      `- ${c.scaleName}: Eval 1 (${assessment1.formType}) T = ${c.tScore1} (${c.classification1}) vs Eval 2 (${assessment2.formType}) T = ${c.tScore2} (${c.classification2}) | Diferencia = ${c.diff > 0 ? "+" + c.diff : c.diff} pts T`,
  )
  .join("\n")}

CONVERGENCIAS Y DISCREPANCIAS NOTABLES:
- Síntesis de Convergencia: ${jointAnalysis.convergenceSummary}
- Síntesis de Divergencia: ${jointAnalysis.divergenceSummary}

INSTRUCCIONES PARA EL INFORME CONJUNTO:
Genera un INFORME CLÍNICO Y PSICOPEDAGÓGICO DE INTEGRACIÓN MULTI-INFORMANTE Y EVOLUCIÓN exhaustivo, formal, interdisciplinario y con redacción impecable.

Estructura el informe en Markdown con las siguientes secciones numeradas:

1. **SÍNTESIS DIAGNÓSTICA CONJUNTA, TIPO Y NIVEL DE GRAVEDAD**
   - Declaración clara del tipo de presentación (Combinada, Inatenta o Hiperactiva/Impulsiva) y del Nivel de Gravedad (Leve, Moderado o Grave).
   - Justificación psicométrica basada en la acumulación de síntomas y puntuaciones T estandarizadas.
2. **VERIFICACIÓN DEL CRITERIO C DEL DSM-5-TR (GENERALIZACIÓN MULTI-ENTORNO)**
   - Explicación de cómo se manifiestan las conductas tanto en el aula/colegio como en la vida cotidiana/hogar.
   - Análisis de si las dificultades son transituacionales o situacionales.
3. **ANÁLISIS COMPARATIVO DE CONVERGENCIAS Y DIVERGENCIAS (ESCUELA VS. HOGAR)**
   - Explicación clínica de por qué ciertas escalas coinciden o divergen (por ejemplo, diferencias en demandas cognitivas, estructura ambiental, tolerancia o momentos del día).
4. **VALORACIÓN DEL IMPACTO FUNCIONAL Y DETERIORO**
   - Análisis del rendimiento académico, clima de aula, relaciones con iguales y dinámica familiar.
5. **PLAN DE ACCIÓN INTEGRAL Y COORDINADO (ESCUELA + FAMILIA + CLÍNICA)**
   - Medidas de adaptación académica y de aula para el profesorado.
   - Pautas de manejo conductual y rutinas para la familia en casa.
   - Recomendaciones de seguimiento con Neuropediatría, Psicología y Orientación Escolar.

Utiliza un tono profesional, científico, claro y esperanzador, libre de estigmas y enfocado en el potencial de desarrollo del estudiante.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      return res.json({
        narrative: response.text,
        source: "gemini_ai",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error generating joint comparison narrative:", error);
      return res.status(500).json({
        error: "No se pudo generar el informe conjunto con IA en este momento.",
        details: error?.message || "Error desconocido",
      });
    }
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor Conners-4 TDAH iniciado en http://0.0.0.0:${PORT}`);
  });
}

startServer();
