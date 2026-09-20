import type { InterviewPrompt } from '@/domain/types';
import { base } from '../helpers';
import { trace } from '../sources/traceability';

function kp(id: string, text: string, essential = true) {
  return { id, text, essential };
}

/**
 * Prompts orales de Nivel 1. Práctica por defecto para entrevista (contrato §7.4):
 * pregunta -> responder en voz alta -> autoevaluación -> key points -> modelo opcional.
 * Todo `keyPoint`, `avoid` y `recommendedAnswer` proviene de un fragmento fuente verificado.
 */
export const INTERVIEW_PROMPTS_LEVEL_1: InterviewPrompt[] = [
  {
    ...base(
      {
        id: 'P-INT-001',
        title: 'Háblame de ti',
        topic: 'Presentación',
        subtopic: 'Apertura',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-001',
        difficulty: 'intro',
        anchor: 'ent-s3-respuesta',
        tags: ['top10', 'presentación', 'apertura'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: 'Háblame de ti.',
    ideaThatMustLand:
      'Ya eres profesional, tu interés penal tiene experiencia detrás y el cambio tiene una lógica profesional.',
    structure: [
      {
        label: 'Pasado',
        hint: 'Juzgados de Ejecución de Penas de Palmira: auxiliar jurídica y después funciones como Oficial Mayor.',
      },
      {
        label: 'Presente',
        hint: 'TransUnion: tutelas, derechos de petición y requerimientos, principalmente habeas data.',
      },
      {
        label: 'Por qué este siguiente paso',
        hint: 'Volver a acercar la carrera al área Penal dentro de una práctica especializada.',
      },
    ],
    keyPoints: [
      kp('kp1', 'Abogada con alrededor de tres años de experiencia en funciones jurídicas'),
      kp('kp2', 'Juzgados de Ejecución de Penas y Medidas de Seguridad de Palmira'),
      kp('kp3', 'Primero auxiliar jurídica y después cubriendo funciones como Oficial Mayor'),
      kp('kp4', 'Expedientes penales, población privada de la libertad, tutelas, habeas corpus y autos'),
      kp('kp5', 'Esa experiencia confirmó el interés por el Derecho Penal'),
      kp('kp6', 'Actualmente TransUnion: tutelas, derechos de petición y requerimientos, habeas data'),
      kp('kp7', 'TransUnion fortaleció análisis jurídico, redacción y cumplimiento de términos', false),
      kp('kp8', 'Cierre: quiere volver a acercar su carrera al área Penal'),
    ],
    avoid: [
      'Contar tu historia personal completa',
      'Decir que odias tu trabajo actual',
      'Decir que "te explotan"',
      'Empezar hablando de salario',
      'Hablar más de dos minutos',
    ],
    recommendedAnswer: [
      'Soy abogada, con alrededor de tres años de experiencia en funciones jurídicas. Una parte muy importante de mi formación profesional se dio en los Juzgados de Ejecución de Penas y Medidas de Seguridad de Palmira, primero como auxiliar jurídica y posteriormente cubriendo funciones como Oficial Mayor. Allí trabajé con expedientes penales, población privada de la libertad, acciones de tutela, habeas corpus, autos y diferentes actuaciones relacionadas con la ejecución de la pena. Esa experiencia fue la que realmente confirmó mi interés por el Derecho Penal.',
      'Actualmente trabajo en TransUnion en gestión de tutelas, derechos de petición y requerimientos, principalmente en habeas data, lo que me ha fortalecido mucho en análisis jurídico, redacción y cumplimiento de términos. Ahora quiero volver a acercar mi carrera al área Penal y desarrollar experiencia más profunda dentro de una práctica jurídica especializada.',
    ],
    relatedStarStoryIds: [],
    followUps: [],
  },
  {
    ...base(
      {
        id: 'P-INT-002',
        title: '¿Por qué Derecho Penal?',
        topic: 'Motivación',
        subtopic: 'Elección de área',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-002',
        difficulty: 'intro',
        anchor: 'ent-s4-respuesta',
        tags: ['top10', 'motivación'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Por qué Derecho Penal?',
    ideaThatMustLand:
      'El interés se volvió claro con experiencia real en juzgados de ejecución de penas, no en la universidad.',
    keyPoints: [
      kp('kp1', 'El interés se aclaró trabajando en los juzgados de ejecución de penas'),
      kp('kp2', 'Dejó de verlo solo desde la universidad: expedientes reales y decisiones judiciales'),
      kp('kp3', 'Interacción directa con personas privadas de la libertad'),
      kp('kp4', 'Le atrae la combinación de análisis jurídico y componente humano'),
      kp('kp5', 'Quiere construir su carrera en Penal de forma más profunda'),
      kp(
        'kp6',
        'Opcional: el trabajo final del Diplomado en Sistema Penal Oral Acusatorio trató medidas privativas de la libertad, reinserción, debido proceso y dignidad humana',
        false,
      ),
    ],
    avoid: ['Responder solo con interés académico, sin la experiencia que lo respalda'],
    recommendedAnswer: [
      'Mi interés por Penal se volvió mucho más claro cuando trabajé en los juzgados de ejecución de penas. Ahí dejé de verlo solamente desde la universidad y empecé a conocer expedientes reales, decisiones judiciales y, sobre todo, a interactuar directamente con personas privadas de la libertad. Me gustó mucho la combinación entre análisis jurídico y el componente humano del Derecho Penal. Fue la experiencia profesional en la que más sentí afinidad con el área y por eso quiero construir mi carrera en Penal de una forma más profunda.',
    ],
    relatedStarStoryIds: ['STAR-E'],
    followUps: [
      {
        id: 'P-INT-002-f1',
        prompt: '¿Qué esperas aprender aquí?',
        ideaThatMustLand:
          'Litigio penal, estrategia de caso, preparación de audiencias, manejo de evidencia y relación con clientes, sobre una base judicial y procesal que ya tiene.',
        source: trace('ent-s33-respuesta'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-INT-003',
        title: '¿Qué experiencia concreta tienes en Derecho Penal?',
        topic: 'Experiencia real',
        subtopic: 'Experiencia penal',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-003',
        difficulty: 'media',
        anchor: 'ent-s5-respuesta',
        tags: ['top10', 'cross-track', 'experiencia-real'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Qué experiencia concreta tienes en Derecho Penal?',
    ideaThatMustLand:
      'Base procesal, judicial, documental y humana real en ejecución de penas, sin afirmar litigio que no ha hecho.',
    keyPoints: [
      kp('kp1', 'Juzgados Segundo y Tercero de Ejecución de Penas y Medidas de Seguridad de Palmira'),
      kp('kp2', 'Expedientes de personas condenadas'),
      kp('kp3', 'Elaboración y proyección de autos y otros documentos judiciales'),
      kp('kp4', 'Acciones de tutela y habeas corpus'),
      kp('kp5', 'Seguimiento procesal, notificaciones y atención directa a población privada de la libertad'),
      kp('kp6', 'Visitaba los patios de la cárcel y explicaba a los internos los documentos notificados', false),
      kp('kp7', 'Exposición a temas de cumplimiento y extinción de la pena', false),
      kp('kp8', 'Aclara que todavía no ha litigado en audiencias representando clientes'),
      kp('kp9', 'Cierre: base procesal, judicial, documental y humana útil para entrar a una práctica penal'),
    ],
    avoid: [
      'Afirmar experiencia de litigio penal en audiencias que no ha tenido',
      'Describir el cierre de expedientes como "borrar antecedentes"',
    ],
    recommendedAnswer: [
      'Mi experiencia penal se concentra principalmente en los Juzgados Segundo y Tercero de Ejecución de Penas y Medidas de Seguridad de Palmira. Trabajé con expedientes de personas condenadas, elaboración y proyección de autos y otros documentos judiciales, acciones de tutela y habeas corpus, seguimiento procesal, notificaciones y atención directa a personas privadas de la libertad. En una de esas etapas visitaba los patios de la cárcel y explicaba a los internos los documentos que se les notificaban. También tuve exposición a temas de cumplimiento y extinción de la pena.',
      'Mi experiencia no ha sido todavía como litigante penal en audiencias representando clientes, y no diría lo contrario. Lo que sí tengo es una base procesal, judicial, documental y humana muy útil para entrar a una práctica penal y desarrollar esa siguiente etapa.',
    ],
    relatedStarStoryIds: ['STAR-A', 'STAR-E'],
    followUps: [
      {
        id: 'P-INT-003-f1',
        prompt: '¿Qué hacías exactamente en ejecución de penas?',
        ideaThatMustLand:
          'Expedientes de personas condenadas y actuaciones posteriores a la sentencia: proyección de documentos, seguimiento, apoyo a acciones constitucionales y notificaciones, con contacto directo con personas privadas de la libertad.',
        source: trace('pen-s55-que-hacias'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-INT-004',
        title: '¿Has litigado?',
        topic: 'Experiencia real',
        subtopic: 'Litigio y audiencias',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-004',
        difficulty: 'alta',
        anchor: 'ent-s6-respuesta',
        tags: ['top10', 'difícil', 'brecha'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Tienes experiencia litigando o asistiendo a audiencias?',
    ideaThatMustLand:
      'Claridad total sobre la brecha, y a la vez el valor de la base judicial que sí tiene.',
    keyPoints: [
      kp('kp1', 'No tiene todavía experiencia sustancial actuando como apoderada en audiencias penales'),
      kp('kp2', 'Prefiere ser completamente clara con eso'),
      kp('kp3', 'Su experiencia penal ha estado del lado judicial y de ejecución de penas'),
      kp('kp4', 'Revisión de expedientes, elaboración de documentos, acciones constitucionales, seguimiento'),
      kp('kp5', 'Le interesa esta oportunidad para convertir esa base en experiencia práctica de litigio'),
      kp('kp6', 'Quiere aprender ese componente de profesionales con mayor trayectoria', false),
    ],
    avoid: [
      '"Sí, claro, yo he litigado" si no puede defender después qué audiencias llevó, en qué calidad, qué solicitó y cuál fue el resultado',
      'Decir "He litigado" sin poder demostrar actuaciones reales como apoderada',
    ],
    recommendedAnswer: [
      'No tengo todavía experiencia sustancial actuando como apoderada en audiencias penales, y prefiero ser completamente clara con eso. Mi experiencia penal ha estado más del lado judicial y de ejecución de penas: revisión de expedientes, elaboración de documentos, acciones constitucionales, seguimiento y atención de población privada de la libertad. Precisamente una de las razones por las que me interesa esta oportunidad es poder convertir esa base en experiencia práctica de litigio y aprender ese componente de profesionales con mayor trayectoria.',
    ],
    relatedStarStoryIds: [],
    followUps: [
      {
        id: 'P-INT-004-f1',
        prompt: '¿Qué harías si te asignan una audiencia mañana sobre un tema que no dominas?',
        ideaThatMustLand:
          'Identificar objetivo y rol, revisar el expediente completo, norma y jurisprudencia, organizar una teoría clara y validar con el abogado responsable lo que no domina.',
        source: trace('ent-s38-respuesta'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-INT-005',
        title: '¿Por qué quieres salir de tu trabajo actual?',
        topic: 'Cambio laboral',
        subtopic: 'Salida de TransUnion',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-005',
        difficulty: 'alta',
        anchor: 'ent-s7-respuesta',
        tags: ['top10', 'difícil', 'cambio-laboral'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Por qué quieres salir de TransUnion?',
    ideaThatMustLand:
      'El motivo es de dirección profesional hacia Penal, no una queja sobre el empleador actual.',
    keyPoints: [
      kp('kp1', 'Reconoce el valor de TransUnion: análisis de casos, redacción jurídica y términos exigentes'),
      kp('kp2', 'Ha aprendido sobre tutela, habeas data y trabajo en entorno corporativo', false),
      kp('kp3', 'Quiere que el siguiente paso tenga relación más directa con el Derecho Penal'),
      kp('kp4', 'Busca ampliar el tipo de asuntos que maneja y seguir aprendiendo'),
      kp('kp5', 'No quiere quedarse en una función muy especializada y repetitiva'),
    ],
    avoid: [
      '"Me tienen explotada"',
      '"Me siento como una máquina"',
      '"Mis compañeros no trabajan y me ponen lo de ellos"',
      '"Trabajo 14 horas porque allá todo es horrible"',
      'Convertir la entrevista en una queja',
    ],
    recommendedAnswer: [
      'TransUnion me ha dado una experiencia muy valiosa en análisis de casos, redacción jurídica y manejo de términos muy exigentes. He aprendido bastante sobre tutela, habeas data y trabajo en un entorno corporativo. Sin embargo, en este momento quiero que mi siguiente paso tenga una relación más directa con el Derecho Penal, que es el área en la que quiero construir mi carrera. También busco una posición donde pueda ampliar el tipo de asuntos que manejo y seguir aprendiendo, no quedarme únicamente en una función muy especializada y repetitiva.',
    ],
    relatedStarStoryIds: ['STAR-D'],
    followUps: [
      {
        id: 'P-INT-005-f1',
        prompt: 'Y en cuanto a carga laboral, ¿cómo ha sido?',
        ideaThatMustLand:
          'El volumen es alto y le ha enseñado organización y trabajo bajo presión; a largo plazo quiere profundizar en análisis jurídico, estrategia y crecimiento.',
        source: trace('ent-s7-carga'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-INT-006',
        title: 'Cuéntame de un error',
        topic: 'Conductual',
        subtopic: 'Error y aprendizaje',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-006',
        difficulty: 'media',
        anchor: 'ent-s14-respuesta',
        tags: ['top10', 'star', 'error'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: 'Cuéntame de un error que hayas cometido.',
    ideaThatMustLand:
      'Reconocer rápido el error y corregir el proceso importa más que ocultarlo; el juez siguió confiando en ella.',
    keyPoints: [
      kp('kp1', 'Inicio de una experiencia en el juzgado: la inducción de tutelas no dejó claro el manejo de un término'),
      kp('kp2', 'Una tutela no se respondió a tiempo'),
      kp('kp3', 'En lugar de justificarse, llamó al juez y explicó exactamente qué había ocurrido'),
      kp('kp4', 'Reconoció su responsabilidad e indicó qué estaba haciendo para solucionarlo'),
      kp('kp5', 'Reforzó su sistema de control de términos'),
      kp('kp6', 'Resultado: el juez siguió confiando y después le dio responsabilidades mayores, hasta Oficial Mayor'),
      kp('kp7', 'Aprendizaje explícito sobre reconocer y corregir'),
    ],
    avoid: ['Justificarse en lugar de asumir el error', 'Elegir un error irrelevante o inventado'],
    recommendedAnswer: [
      'Al inicio de una de mis experiencias en el juzgado, durante la inducción de tutelas no me quedó suficientemente claro el manejo de un término y una tutela no se respondió a tiempo. El juez se molestó, y yo entendía la razón. En lugar de tratar de justificarme, lo llamé, le expliqué exactamente qué había ocurrido, reconocí mi responsabilidad y le indiqué qué estaba haciendo para solucionarlo. Después reforcé mi sistema de control de términos para que no volviera a ocurrir. Lo que más valoro de esa experiencia es que el juez siguió confiando en mi trabajo y posteriormente me dio responsabilidades mayores, hasta llegar a cubrir funciones como Oficial Mayor. Aprendí que reconocer rápido un error y corregir el proceso es mucho más importante que intentar ocultarlo.',
    ],
    relatedStarStoryIds: ['STAR-B'],
    followUps: [],
  },
  {
    ...base(
      {
        id: 'P-INT-007',
        title: 'Cuéntame de una situación de presión',
        topic: 'Conductual',
        subtopic: 'Presión y términos',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-007',
        difficulty: 'media',
        anchor: 'ent-s16-respuesta',
        tags: ['top10', 'presión', 'términos'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Cómo manejas la presión y los plazos?',
    ideaThatMustLand:
      'Tiene un método concreto: priorizar por vencimiento y riesgo jurídico, dejar trazabilidad y escalar a tiempo.',
    keyPoints: [
      kp('kp1', 'Está acostumbrada a trabajar con términos'),
      kp('kp2', 'TransUnion: volumen alto diario de tutelas, derechos de petición y requerimientos'),
      kp('kp3', 'En los juzgados también trabajó con actuaciones sometidas a término', false),
      kp('kp4', 'Método: identificar qué tiene vencimiento más cercano y mayor riesgo jurídico'),
      kp('kp5', 'Organizar el trabajo por prioridad y dejar trazabilidad de lo pendiente'),
      kp('kp6', 'Escalar oportunamente si una dificultad puede comprometer un término'),
      kp('kp7', 'Opcional, si piden cifras: aproximadamente 23 respuestas diarias, con días de 28 a 30', false),
    ],
    avoid: ['Convertir la respuesta en una competencia de sobrecarga'],
    recommendedAnswer: [
      'Estoy bastante acostumbrada a trabajar con términos. En TransUnion manejo diariamente un volumen alto de tutelas, derechos de petición y requerimientos, y en los juzgados también trabajé con actuaciones sometidas a término. Mi forma de manejarlo es identificar primero qué tiene vencimiento más cercano y qué tiene mayor riesgo jurídico, organizar el trabajo por prioridad y dejar trazabilidad de lo que está pendiente. Si aparece una dificultad que puede comprometer un término, prefiero escalarla oportunamente en lugar de esperar hasta el último momento.',
    ],
    relatedStarStoryIds: ['STAR-D', 'STAR-A'],
    followUps: [
      {
        id: 'P-INT-007-f1',
        prompt: '¿Cómo priorizas cuando tienes demasiado trabajo?',
        ideaThatMustLand:
          'Separar urgente de importante por términos y consecuencias jurídicas, mover primero lo que depende de terceros y comunicar antes de que el volumen se convierta en incumplimiento.',
        source: trace('ent-s18-respuesta'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-INT-008',
        title: '¿Cuál es tu principal debilidad?',
        topic: 'Autoevaluación',
        subtopic: 'Brecha profesional',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-008',
        difficulty: 'alta',
        anchor: 'ent-s13-respuesta',
        tags: ['top10', 'difícil', 'brecha'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Cuál es tu mayor debilidad?',
    ideaThatMustLand:
      'La brecha es concreta y está identificada: experiencia penal judicial, todavía no litigio como apoderada.',
    keyPoints: [
      kp('kp1', 'Nombra la brecha real frente a una práctica penal privada'),
      kp('kp2', 'Su experiencia penal ha sido principalmente judicial y de ejecución de penas'),
      kp('kp3', 'Todavía no ha litigado como apoderada en audiencias'),
      kp('kp4', 'La tiene muy identificada'),
      kp('kp5', 'Busca un lugar donde aprovechar su base y desarrollar con acompañamiento esa parte práctica'),
    ],
    avoid: ['"Soy perfeccionista": suena preparada y aporta poco'],
    recommendedAnswer: [
      'Mi principal brecha frente a una práctica penal privada es que mi experiencia penal ha sido principalmente judicial y de ejecución de penas, no todavía litigando como apoderada en audiencias. Lo tengo muy identificado. Por eso, cuando evalúo oportunidades, busco precisamente un lugar donde pueda aprovechar la base que ya tengo en Penal y desarrollar con acompañamiento esa parte práctica y estratégica.',
    ],
    relatedStarStoryIds: [],
    followUps: [
      {
        id: 'P-INT-008-f1',
        prompt: 'Y si te pido una debilidad más operativa, ¿cuál sería?',
        ideaThatMustLand:
          'Excel no es su herramienta de mayor dominio; cuando necesita una herramienta nueva documenta el proceso y practica hasta manejarla con autonomía.',
        source: trace('ent-s13-excel'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-INT-009',
        title: '¿Por qué deberíamos contratarte?',
        topic: 'Propuesta de valor',
        subtopic: 'Cierre',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-009',
        difficulty: 'media',
        anchor: 'ent-s11-respuesta',
        tags: ['top10', 'valor'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Por qué deberíamos contratarte?',
    ideaThatMustLand:
      'Aporta base jurídica real desde el primer día y sabe exactamente qué le falta por aprender.',
    keyPoints: [
      kp('kp1', 'Para un perfil junior, no llega solo con interés académico en Penal'),
      kp('kp2', 'Ya conoce el entorno judicial penal'),
      kp('kp3', 'Ha trabajado con expedientes y población privada de la libertad'),
      kp('kp4', 'Experiencia redactando documentos jurídicos y trabajando con términos exigentes'),
      kp('kp5', 'Sabe cuál es su brecha y tiene disposición de aprenderla'),
      kp('kp6', 'Puede aportar desde el primer día y crecer dentro del equipo'),
    ],
    avoid: ['"Yo me sé todo de Penal"', '"Acepto cualquier cosa con tal de trabajar en Penal"'],
    recommendedAnswer: [
      'Porque para un perfil junior no llegaría solamente con interés académico en Penal. Ya conozco el entorno judicial penal, he trabajado con expedientes y población privada de la libertad, tengo experiencia redactando documentos jurídicos y estoy acostumbrada a trabajar con términos exigentes. Además, sé cuál es mi brecha: todavía quiero desarrollar más experiencia de litigio penal, y precisamente tengo la disposición de aprenderla. Creo que puedo aportar una base jurídica real desde el primer día y, al mismo tiempo, crecer dentro del equipo.',
    ],
    relatedStarStoryIds: ['STAR-A'],
    followUps: [
      {
        id: 'P-INT-009-f1',
        prompt: '¿Qué te diferencia de otros abogados junior?',
        ideaThatMustLand:
          'Su interés por Penal ya viene con experiencia en juzgados de ejecución de penas y contacto real con población privada de la libertad, más velocidad de análisis y redacción bajo términos.',
        source: trace('ent-s32-respuesta'),
      },
      {
        id: 'P-INT-009-f2',
        prompt: '¿Cuál es tu mayor fortaleza?',
        ideaThatMustLand:
          'Responsabilidad con los asuntos asignados, especialmente cuando hay términos: revisar, priorizar y hacer seguimiento antes de que el término la alcance.',
        source: trace('ent-s12-fortaleza'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-INT-010',
        title: '¿Cuál es tu expectativa salarial?',
        topic: 'Condiciones',
        subtopic: 'Salario',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-010',
        difficulty: 'alta',
        anchor: 'ent-s35-respuesta',
        tags: ['top10', 'difícil', 'salario', 'condiciones'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Cuál es tu expectativa salarial?',
    ideaThatMustLand:
      'Alrededor de $4.500.000 mensuales en adelante, evaluando el paquete completo antes de decidir.',
    keyPoints: [
      kp('kp1', 'Fundamenta la cifra en experiencia jurídica, responsabilidad del cargo y el cambio que busca'),
      kp('kp2', 'Expectativa alrededor de $4.500.000 mensuales en adelante'),
      kp('kp3', 'Quiere entender tipo de contrato, responsabilidades, horario y paquete completo'),
      kp('kp4', 'Evalúa la propuesta de manera integral, no solo por la cifra'),
    ],
    avoid: [
      'Empezar la entrevista hablando de salario',
      'Negociar contra ella misma en el primer minuto',
      'Presentar $4.500.000 como techo',
    ],
    recommendedAnswer: [
      'Por mi experiencia jurídica, la responsabilidad del cargo y el cambio que estoy buscando, mi expectativa está alrededor de $4.500.000 mensuales en adelante. De todas formas, me interesa entender primero el tipo de contrato, las responsabilidades, el horario y el paquete completo para evaluar la propuesta de manera integral.',
    ],
    relatedStarStoryIds: [],
    followUps: [
      {
        id: 'P-INT-010-f1',
        prompt: '¿Cuánto ganas actualmente?',
        ideaThatMustLand:
          'Puede no revelarlo: enfocar la conversación en la expectativa y en el valor de la posición, a partir de aproximadamente $4.500.000 según condiciones generales.',
        source: trace('ent-s35-actual'),
      },
      {
        id: 'P-INT-010-f2',
        prompt: '¿Aceptarías menos de $4.500.000 porque es Penal?',
        ideaThatMustLand:
          'Penal tiene valor profesional para ella, pero el cambio debe ser sostenible: conocer primero la propuesta completa antes de decidir por la cifra.',
        source: trace('ent-s36-respuesta'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-INT-010B',
        title: '¿Tienes disponibilidad inmediata?',
        topic: 'Condiciones',
        subtopic: 'Disponibilidad',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-010',
        difficulty: 'media',
        anchor: 'ent-s34-respuesta',
        tags: ['disponibilidad', 'condiciones'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Tienes disponibilidad inmediata?',
    ideaThatMustLand:
      'Interés real y fecha cercana, con una transición responsable: no promete una fecha que no pueda cumplir.',
    keyPoints: [
      kp('kp1', 'Expresa interés real en la posición'),
      kp('kp2', 'Podría coordinar una fecha de ingreso cercana'),
      kp('kp3', 'Actualmente está vinculada laboralmente'),
      kp('kp4', 'Quiere hacer una transición responsable y entregar correctamente sus asuntos'),
      kp('kp5', 'Se ofrece a revisar una fecha concreta si el despacho la necesita'),
    ],
    avoid: ['Mentir sobre la disponibilidad', 'Prometer una fecha que después no pueda cumplir'],
    recommendedAnswer: [
      'Tengo un interés real en la posición y podría coordinar una fecha de ingreso cercana. Actualmente estoy vinculada laboralmente, así que quisiera hacer una transición responsable y entregar correctamente mis asuntos. Si ustedes tienen una necesidad concreta de fecha, puedo revisarla y decirles con precisión qué tan pronto podría incorporarme.',
    ],
    relatedStarStoryIds: [],
    followUps: [],
  },
  {
    ...base(
      {
        id: 'P-INT-011',
        title: '¿Por qué has tenido varios contratos temporales?',
        topic: 'Trayectoria',
        subtopic: 'Contratos y juzgados',
        track: 'interview',
        level: 1,
        priority: 'high',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-011',
        difficulty: 'alta',
        anchor: 'ent-s8-respuesta',
        tags: ['difícil', 'trayectoria'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Por qué has tenido varios contratos temporales?',
    ideaThatMustLand:
      'La temporalidad vino de la naturaleza de las vinculaciones, no del desempeño; ahora busca estabilidad.',
    keyPoints: [
      kp('kp1', 'La razón principal no ha sido desempeño'),
      kp('kp2', 'La práctica del Juzgado Tercero terminó porque correspondía a una etapa universitaria'),
      kp('kp3', 'En el Juzgado Segundo cubrió reemplazos por vacaciones e incapacidades'),
      kp('kp4', 'La duración estaba ligada al regreso de los titulares'),
      kp('kp5', 'Llegó a esas oportunidades porque ya conocían su trabajo y confiaron en ella'),
      kp('kp6', 'Su experiencia actual también ha tenido modalidad temporal', false),
      kp('kp7', 'Ahora busca construir una trayectoria más estable y de largo plazo'),
    ],
    avoid: ['Justificarse durante cinco minutos'],
    recommendedAnswer: [
      'En mi trayectoria hay varias experiencias temporales, pero la razón principal no ha sido desempeño. La práctica del Juzgado Tercero terminó porque correspondía a una etapa universitaria. Más adelante, en el Juzgado Segundo, cubrí reemplazos por vacaciones e incapacidades, por lo que la duración estaba ligada al regreso de los titulares. De hecho, llegué a esas oportunidades porque ya conocían mi trabajo anterior y confiaron en mí para asumir nuevas funciones. Mi experiencia actual también ha tenido una modalidad de contratación temporal. Justamente ahora estoy buscando una oportunidad donde pueda construir una trayectoria más estable y de largo plazo.',
    ],
    relatedStarStoryIds: [],
    followUps: [
      {
        id: 'P-INT-011-f1',
        prompt: '¿Por qué no te quedaste en los juzgados?',
        ideaThatMustLand:
          'Las oportunidades estaban ligadas a prácticas o reemplazos y no existía vacante estable; siguió siendo tenida en cuenta para reemplazos.',
        source: trace('ent-s9-respuesta'),
      },
      {
        id: 'P-INT-011-f2',
        prompt: 'Veo periodos sin empleo. ¿Qué pasó?',
        ideaThatMustLand:
          'Transiciones reales entre oportunidades, incluido el traslado de Palmira a Bogotá; no problemas de desempeño. Respuesta corta y factual.',
        source: trace('ent-s10-respuesta'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-INT-012',
        title: 'Recuperar la historia STAR correcta',
        topic: 'Historias STAR',
        subtopic: 'Recuperación',
        track: 'interview',
        level: 1,
        priority: 'high',
        estimatedMinutes: 10,
        stage: 'initial',
        objectiveId: 'LO-INT-012',
        difficulty: 'media',
        anchor: 'ent-s1-star',
        tags: ['star', 'recuperación'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt:
      'Te piden un ejemplo concreto de una competencia (logro, error, conflicto, presión o empatía). ¿Qué historia usas y cómo la cuentas en Situación, Tarea, Acción y Resultado?',
    ideaThatMustLand:
      'Con cinco historias reales se cubren casi todas las preguntas conductuales: lo que se entrena es elegir rápido y contar en STAR, no memorizar discursos.',
    keyPoints: [
      kp('kp1', 'Logro, iniciativa, organización o volumen: los más de 200 trámites del Juzgado Tercero'),
      kp('kp2', 'Error, accountability o aprendizaje: la tutela fuera de término y la conversación con el juez'),
      kp('kp3', 'Conflicto o autoridad: el juez que cuestionó su presencia'),
      kp('kp4', 'Presión y deadlines: el volumen diario y los plazos legales en TransUnion'),
      kp('kp5', 'Empatía o cliente difícil: el contacto diario con población privada de la libertad'),
      kp('kp6', 'Cuenta la historia con estructura Situación, Tarea, Acción y Resultado'),
    ],
    avoid: [
      'Memorizar decenas de discursos independientes en lugar de reutilizar las cinco historias',
      'Contar una historia sin resultado',
    ],
    recommendedAnswer: [
      'Yale recomienda responder las preguntas conductuales con estructura STAR: Situación, Tarea, Acción y Resultado.',
    ],
    relatedStarStoryIds: ['STAR-A', 'STAR-B', 'STAR-C', 'STAR-D', 'STAR-E'],
    followUps: [],
  },
];

/** Prompts orales cross-track de Nivel 1 (Apéndice A, sección C). */
export const CROSS_PROMPTS_LEVEL_1: InterviewPrompt[] = [
  {
    ...base(
      {
        id: 'P-X-001',
        title: 'Conectar ejecución de penas con litigio penal sin exagerar',
        topic: 'Cross-track',
        subtopic: 'Experiencia y candidatura',
        track: 'cross-track',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-X-001',
        difficulty: 'alta',
        anchor: 'ent-s5-brecha',
        tags: ['cross-track', 'difícil', 'brecha'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt:
      'Tu experiencia penal es de ejecución de penas, no de litigio. ¿Por qué deberíamos considerarte para una práctica penal privada?',
    ideaThatMustLand:
      'La base judicial, procesal, documental y humana es real y transferible; la brecha de litigio se nombra sin disfrazarla.',
    keyPoints: [
      kp('kp1', 'Nombra la base real: procesal, judicial, documental y humana'),
      kp('kp2', 'No afirma haber litigado en audiencias representando clientes'),
      kp('kp3', 'Conecta con juzgados de ejecución de penas y contacto con población privada de la libertad'),
      kp('kp4', 'Añade velocidad de análisis y redacción bajo términos del trabajo actual'),
      kp('kp5', 'Cierra con motivación clara por desarrollar la parte de litigio que le falta'),
      kp('kp6', 'Si le preguntan por algo que nunca ha hecho: dice que no lo ha hecho, explica lo que sí ha trabajado y cómo lo verificaría'),
    ],
    avoid: [
      'Convertir experiencia transferible en litigio directo',
      'Fingir experiencia para cubrir la brecha',
    ],
    recommendedAnswer: [
      'Mi experiencia no ha sido todavía como litigante penal en audiencias representando clientes, y no diría lo contrario. Lo que sí tengo es una base procesal, judicial, documental y humana muy útil para entrar a una práctica penal y desarrollar esa siguiente etapa.',
      'Probablemente mi diferencial es que mi interés por Penal ya viene acompañado de experiencia dentro de juzgados de ejecución de penas y contacto real con población privada de la libertad. Además, mi trabajo actual me ha exigido desarrollar mucha velocidad de análisis y redacción bajo términos.',
    ],
    relatedStarStoryIds: ['STAR-E', 'STAR-A'],
    followUps: [
      {
        id: 'P-X-001-f1',
        prompt: 'Te pregunto por una actuación penal que nunca has hecho. ¿Cómo respondes?',
        ideaThatMustLand:
          'No ha tenido esa actuación como apoderada; nombra la experiencia real relacionada, explica el concepto y dice que revisaría expediente, norma vigente y estrategia con el abogado responsable.',
        source: trace('pen-s56-brecha'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-X-002',
        title: 'Hábeas corpus desde experiencia y concepto',
        topic: 'Cross-track',
        subtopic: 'Hábeas corpus',
        track: 'cross-track',
        level: 1,
        priority: 'high',
        estimatedMinutes: 5,
        stage: 'any',
        objectiveId: 'LO-X-002',
        difficulty: 'media',
        anchor: 'pen-s37-respuesta',
        tags: ['cross-track', 'hábeas corpus', 'experiencia-real'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt:
      'Mencionas que trabajaste con hábeas corpus. ¿Qué es y en qué se diferencia de una tutela?',
    ideaThatMustLand:
      'Garantía reforzada de la libertad personal, distinta de la tutela por su objeto específico y por su término especialmente breve.',
    keyPoints: [
      kp('kp1', 'En los juzgados tuvo contacto con acciones de habeas corpus'),
      kp('kp2', 'Es derecho fundamental y acción constitucional'),
      kp('kp3', 'Protege la libertad personal frente a privación con violación de garantías o prolongación ilegal'),
      kp('kp4', 'La tutela es un mecanismo general de protección de derechos fundamentales'),
      kp('kp5', 'El hábeas corpus es el mecanismo específico y preferente para la libertad'),
      kp('kp6', 'Término especialmente breve: decisión dentro de 36 horas'),
    ],
    avoid: ['Presentarlo como equivalente a la tutela'],
    recommendedAnswer: [
      'En los juzgados tuve contacto con acciones de habeas corpus. Lo entiendo como una garantía reforzada de la libertad personal, distinta de la tutela por su objeto específico y por el término especialmente breve para resolverla.',
    ],
    relatedStarStoryIds: [],
    followUps: [],
  },
  {
    ...base(
      {
        id: 'P-X-003',
        title: 'Responder sin inventar artículo',
        topic: 'Cross-track',
        subtopic: 'Criterio jurídico',
        track: 'cross-track',
        level: 1,
        priority: 'high',
        estimatedMinutes: 5,
        stage: 'technical',
        objectiveId: 'LO-X-003',
        difficulty: 'media',
        anchor: 'ent-s44-formula',
        tags: ['cross-track', 'criterio', 'no-inventar'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt:
      '¿Qué artículo regula los requisitos de la medida de aseguramiento? Si no recuerdas el número, responde igual.',
    ideaThatMustLand:
      'No dar un número equivocado: explicar el concepto con criterio y decir cómo verificaría el texto vigente.',
    keyPoints: [
      kp('kp1', 'No quisiera darte un número de artículo equivocado'),
      kp('kp2', 'Afirma que el concepto sí lo tiene claro y lo explica'),
      kp('kp3', 'Para el análisis: inferencia razonable de autoría o participación'),
      kp('kp4', 'Y una finalidad cautelar concreta: obstrucción, protección de víctima/comunidad o comparecencia'),
      kp('kp5', 'Revisaría si la medida es necesaria, proporcional y legalmente procedente para ese delito'),
      kp('kp6', 'Para una actuación real verificaría el texto vigente antes de fundamentarla'),
    ],
    avoid: [
      'Inventar artículos, jurisprudencia, cifras o experiencias',
      'Decir "No sé" y quedarse ahí',
    ],
    recommendedAnswer: [
      'No quisiera darte un número de artículo equivocado. El concepto sí lo tengo claro: [explicas el concepto]. Para una actuación real verificaría el texto vigente antes de fundamentarla.',
      'No recuerdo el número exacto del artículo sobre medida de aseguramiento, pero el análisis requiere una inferencia razonable de autoría o participación y además una finalidad cautelar concreta, como evitar obstrucción, proteger a la víctima/comunidad o asegurar comparecencia. Después revisaría si la medida solicitada es necesaria, proporcional y legalmente procedente para ese delito.',
    ],
    relatedStarStoryIds: [],
    followUps: [
      {
        id: 'P-X-003-f1',
        prompt: '¿Y si no sabes la respuesta jurídica a una pregunta de un cliente?',
        ideaThatMustLand:
          'No improvisa: delimita el problema, revisa norma y antecedentes, y consulta con el abogado responsable antes de dar una posición.',
        source: trace('ent-s21-respuesta'),
      },
    ],
  },
];

/** Prompts orales de Penal Nivel 1 (Apéndice A: práctica "Oral" u "Oral cross-track"). */
export const PENAL_PROMPTS_LEVEL_1: InterviewPrompt[] = [
  {
    ...base(
      {
        id: 'P-PEN-001',
        title: 'Experiencia propia en ejecución de penas',
        topic: 'Ejecución de penas',
        subtopic: 'Experiencia real',
        track: 'penal',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'any',
        objectiveId: 'LO-PEN-001',
        difficulty: 'media',
        anchor: 'pen-s55-que-hacias',
        tags: ['penal-esencial', 'experiencia-real', 'ejecución'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Qué hacías exactamente en ejecución de penas?',
    ideaThatMustLand:
      'Expedientes de personas condenadas y actuaciones posteriores a la sentencia, con contacto directo con población privada de la libertad.',
    keyPoints: [
      kp('kp1', 'Expedientes de personas condenadas y actuaciones posteriores a la sentencia'),
      kp('kp2', 'Proyectaba documentos y realizaba seguimiento'),
      kp('kp3', 'Apoyaba acciones constitucionales y notificaciones'),
      kp('kp4', 'Contacto con personas privadas de la libertad'),
      kp('kp5', 'Trámites de cierre de expedientes una vez verificado el cumplimiento'),
      kp(
        'kp6',
        'Lo explica jurídicamente: revisaba expedientes para proyectar actuaciones asociadas al cierre y cumplimiento de la pena',
        false,
      ),
    ],
    avoid: [
      'Simplificarlo como "yo borraba antecedentes": no describe jurídicamente lo que hacía y puede ser incorrecto',
    ],
    recommendedAnswer: [
      'Trabajaba con expedientes de personas condenadas y actuaciones posteriores a la sentencia. Proyectaba documentos, realizaba seguimiento, apoyaba acciones constitucionales y notificaciones, y tenía contacto con personas privadas de la libertad. En una de mis experiencias también trabajé en trámites de cierre de expedientes una vez se verificaba el cumplimiento correspondiente.',
    ],
    relatedStarStoryIds: ['STAR-A', 'STAR-E'],
    followUps: [
      {
        id: 'P-PEN-001-f1',
        prompt: '¿Qué aprendiste trabajando dentro de la cárcel?',
        ideaThatMustLand:
          'Que el Derecho Penal no termina con una sentencia: la ejecución exige control judicial, respeto de derechos, acceso a información y perspectiva de resocialización.',
        source: trace('pen-s55-carcel'),
      },
      {
        id: 'P-PEN-001-f2',
        prompt: '¿Qué era un paz y salvo en tu trabajo?',
        ideaThatMustLand:
          'La forma práctica del despacho para referirse a actuaciones de cierre de personas que ya habían cumplido su condena, verificando y proyectando el trámite final.',
        source: trace('pen-s55-pazysalvo'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-PEN-014',
        title: 'Explicar hábeas corpus en voz alta',
        topic: 'Garantías',
        subtopic: 'Hábeas corpus',
        track: 'penal',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'technical',
        objectiveId: 'LO-PEN-014',
        difficulty: 'media',
        anchor: 'pen-s37-habeas',
        tags: ['penal-esencial', 'hábeas corpus'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Qué es el hábeas corpus?',
    ideaThatMustLand:
      'Derecho fundamental y acción constitucional que protege la libertad personal frente a privación ilegal o prolongación ilegal.',
    keyPoints: [
      kp('kp1', 'Derecho fundamental y acción constitucional'),
      kp('kp2', 'Protege la libertad personal'),
      kp('kp3', 'Opera cuando hay privación con violación de garantías constitucionales o legales'),
      kp('kp4', 'O cuando la privación se prolonga ilegalmente'),
      kp('kp5', 'Está definido por la Ley 1095 de 2006', false),
      kp('kp6', 'La Constitución exige decisión dentro de 36 horas'),
    ],
    avoid: ['Confundirlo con la tutela'],
    recommendedAnswer: [
      'Derecho fundamental y acción constitucional para proteger libertad frente a privación ilegal o prolongación ilegal.',
    ],
    relatedStarStoryIds: [],
    followUps: [],
  },
  {
    ...base(
      {
        id: 'P-PEN-015',
        title: 'Explicar el juez de ejecución de penas',
        topic: 'Ejecución de penas',
        subtopic: 'Juez de ejecución',
        track: 'penal',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'technical',
        objectiveId: 'LO-PEN-015',
        difficulty: 'media',
        anchor: 'pen-s39-respuesta',
        tags: ['penal-esencial', 'ejecución', 'fortaleza'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: '¿Qué hace un Juez de Ejecución de Penas y Medidas de Seguridad?',
    ideaThatMustLand:
      'No vuelve a juzgar el delito: controla la legalidad de la ejecución de una sentencia en firme.',
    keyPoints: [
      kp('kp1', 'No vuelve a juzgar si la persona cometió el delito'),
      kp('kp2', 'Controla la legalidad de la forma en que se ejecuta una sentencia ya en firme'),
      kp('kp3', 'Resuelve los asuntos que la ley le atribuye durante el cumplimiento de la pena'),
      kp('kp4', 'Ejemplos: libertad posterior a sentencia, redención, mecanismos sustitutivos', false),
      kp('kp5', 'También acumulación jurídica de penas, favorabilidad y extinción de la condena', false),
      kp('kp6', 'La Ley 65 de 1993 señala que garantizan la legalidad de la ejecución de la sanción penal', false),
    ],
    avoid: ['Describirlo como si volviera a decidir sobre responsabilidad'],
    recommendedAnswer: [
      'El juez de ejecución no vuelve a juzgar si la persona cometió el delito. Su función central es controlar la legalidad de la forma en que se ejecuta una sentencia que ya está en firme y resolver los asuntos que la ley le atribuye durante el cumplimiento de la pena.',
    ],
    relatedStarStoryIds: [],
    followUps: [
      {
        id: 'P-PEN-015-f1',
        prompt: '¿Qué diferencia hay entre juzgar y ejecutar una pena?',
        ideaThatMustLand:
          'El juez de conocimiento determina responsabilidad e impone sanción; el de ejecución parte de una sentencia ejecutoriada y controla la legalidad de su cumplimiento.',
        source: trace('pen-s55-juzgar-ejecutar'),
      },
    ],
  },
  {
    ...base(
      {
        id: 'P-PEN-017',
        title: 'Razonar una respuesta técnica que no recuerdas',
        topic: 'Método',
        subtopic: 'Criterio jurídico',
        track: 'penal',
        level: 1,
        priority: 'high',
        estimatedMinutes: 5,
        stage: 'technical',
        objectiveId: 'LO-PEN-017',
        difficulty: 'media',
        anchor: 'pen-s57-patron',
        tags: ['penal-esencial', 'método', 'criterio'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt:
      'Te hacen una pregunta técnica cuyo detalle no recuerdas. Razónala en voz alta usando el patrón concepto, requisito, finalidad y aplicación.',
    ideaThatMustLand:
      'El criterio jurídico se demuestra razonando con el patrón concepto → requisito → finalidad → aplicación, no recitando artículos.',
    keyPoints: [
      kp('kp1', 'Empieza por el concepto que sí tiene claro'),
      kp('kp2', 'Enuncia los requisitos que exige la figura'),
      kp('kp3', 'Explica la finalidad de la figura'),
      kp('kp4', 'Aplica al caso concreto que le plantean'),
      kp('kp5', 'Dice cómo verificaría la norma vigente antes de una actuación real'),
      kp('kp6', 'No improvisa números de artículo'),
    ],
    avoid: ['Inventar artículos o jurisprudencia', 'Quedarse en "no sé"'],
    recommendedAnswer: [
      'Concepto → requisito → finalidad → aplicación al caso.',
      'No recuerdo el número exacto del artículo sobre medida de aseguramiento, pero el análisis requiere una inferencia razonable de autoría o participación y además una finalidad cautelar concreta, como evitar obstrucción, proteger a la víctima/comunidad o asegurar comparecencia. Después revisaría si la medida solicitada es necesaria, proporcional y legalmente procedente para ese delito.',
    ],
    relatedStarStoryIds: [],
    followUps: [],
  },
];
