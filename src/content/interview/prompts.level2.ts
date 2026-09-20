import type { InterviewPrompt } from '@/domain/types';
import { base } from '../helpers';
import { trace } from '../sources/traceability';

/**
 * Nivel 2 — muy conveniente (P0-B). Disponible como siguiente opción, nunca como deuda
 * y nunca dentro de una sesión cuyo `maxLevel` sea 1 (contrato §8.2, §8.4).
 */

interface Level2Input {
  id: string;
  title: string;
  subtopic: string;
  prompt: string;
  objectiveId: string;
  anchor: string;
  idea: string;
  keyPoints: string[];
  avoid: string[];
  answer: string[];
  stars?: string[];
  tags?: string[];
  followUps?: { id: string; prompt: string; idea: string; anchor: string }[];
}

function level2(input: Level2Input): InterviewPrompt {
  return {
    ...base(
      {
        id: input.id,
        title: input.title,
        topic: 'Entrevista Nivel 2',
        subtopic: input.subtopic,
        track: 'interview',
        level: 2,
        priority: 'medium',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: input.objectiveId,
        difficulty: 'media',
        anchor: input.anchor,
        tags: input.tags ?? ['nivel2'],
      },
      'interview-prompt',
    ),
    type: 'interview-prompt',
    prompt: input.prompt,
    ideaThatMustLand: input.idea,
    keyPoints: input.keyPoints.map((text, index) => ({
      id: `kp${index + 1}`,
      text,
      essential: index < 3,
    })),
    avoid: input.avoid,
    recommendedAnswer: input.answer,
    relatedStarStoryIds: input.stars ?? [],
    followUps: (input.followUps ?? []).map((f) => ({
      id: f.id,
      prompt: f.prompt,
      ideaThatMustLand: f.idea,
      source: trace(f.anchor),
    })),
  };
}

export const INTERVIEW_PROMPTS_LEVEL_2: InterviewPrompt[] = [
  level2({
    id: 'P-INT-201',
    title: 'Situación difícil con un superior',
    subtopic: 'Conflicto',
    prompt: 'Cuéntame de una situación difícil con un superior.',
    objectiveId: 'LO-INT-201',
    anchor: 'ent-s15-respuesta',
    idea: 'Mantuvo la calma frente a una figura de autoridad sin perder el respeto ni escalar el conflicto.',
    keyPoints: [
      'Un juez cuestionó fuertemente su presencia delante de otras personas',
      'Sabía que su ingreso se había tramitado institucionalmente',
      'Entendió que responder en el mismo tono empeoraría la situación',
      'Mantuvo tono respetuoso y respondió únicamente lo que le preguntaba',
      'Explicó que estaba allí por el consultorio jurídico de la universidad',
      'Aprendizaje: comunicación asertiva es expresar el desacuerdo sin perder el respeto',
    ],
    avoid: ['Describir al juez como "iracundo", "maleducado" o similares'],
    answer: [
      'Durante mi práctica en un juzgado tuve una situación en la que un juez cuestionó de manera muy fuerte mi presencia allí delante de otras personas. Yo sabía que mi ingreso se había tramitado institucionalmente, pero entendí que responder en el mismo tono solo iba a empeorar la situación. Mantuve un tono respetuoso, respondí únicamente lo que me preguntaba y expliqué que estaba allí por medio del consultorio jurídico de la universidad. Esa experiencia me enseñó que puedo mantener la calma frente a una figura de autoridad incluso cuando la conversación es incómoda. Para mí, comunicación asertiva no significa evitar un desacuerdo, sino saber expresarlo sin perder el respeto.',
    ],
    stars: ['STAR-C'],
  }),
  level2({
    id: 'P-INT-202',
    title: 'Reacción ante una crítica',
    subtopic: 'Retroalimentación',
    prompt: '¿Cómo reaccionas a una crítica sobre tu trabajo?',
    objectiveId: 'LO-INT-202',
    anchor: 'ent-s30-respuesta',
    idea: 'Distingue fondo, forma y proceso; aplica la observación válida y explica su razonamiento con respeto.',
    keyPoints: [
      'Primero entiende si la observación es de fondo jurídico, de redacción o de proceso',
      'Si es válida, la aplica y la incorpora para no repetirla',
      'Prefiere una corrección clara a seguir cometiendo un error por no preguntar',
      'Considera válido explicar su razonamiento cuando el punto jurídico es discutible, con respeto',
    ],
    avoid: ['Defenderse emocionalmente'],
    answer: [
      'Primero intento entender si la observación se refiere al fondo jurídico, a la forma de redactar o al proceso de trabajo. Si la observación es válida, la aplico y la incorporo para no repetirla. Prefiero una corrección clara a seguir cometiendo un error por no preguntar. También considero válido explicar mi razonamiento cuando existe un punto jurídico discutible, siempre con respeto.',
    ],
    followUps: [
      {
        id: 'P-INT-202-f1',
        prompt: '¿Eres una persona conflictiva o muy directa?',
        idea: 'Expresa posiciones con claridad sin ser irrespetuosa, y cambia de posición ante un argumento mejor.',
        anchor: 'ent-s31-respuesta',
      },
    ],
  }),
  level2({
    id: 'P-INT-203',
    title: 'Decisión profesional difícil',
    subtopic: 'Criterio',
    prompt: '¿Cuál ha sido una decisión profesional difícil?',
    objectiveId: 'LO-INT-203',
    anchor: 'ent-s28-respuesta',
    idea: 'Responsabilidad también es saber cuándo una función no tiene condiciones adecuadas para asumirse seriamente.',
    keyPoints: [
      'La firma donde trabajaba entró en una situación difícil',
      'Le ofrecieron mucha mayor responsabilidad sobre muchos procesos sin mejora proporcional de condiciones',
      'Evaluó que aceptar solo por conservar el vínculo no era la mejor decisión profesional',
      'Prefirió cerrar la etapa en buenos términos',
      'Aprendizaje sobre condiciones adecuadas para asumir una función',
    ],
    avoid: ['Mencionar cifras salariales', 'Atacar a la empresa salvo que lo pidan'],
    answer: [
      'Cuando la firma en la que trabajaba entró en una situación difícil, me ofrecieron asumir una responsabilidad mucho mayor sobre una cantidad muy alta de procesos sin una mejora proporcional de las condiciones. En ese momento evalué que aceptar solo por conservar el vínculo no era la mejor decisión profesional. Preferí cerrar la etapa en buenos términos. Aprendí que responsabilidad también es saber cuándo una función no tiene condiciones adecuadas para ser asumida seriamente.',
    ],
  }),
  level2({
    id: 'P-INT-204',
    title: 'Cliente difícil',
    subtopic: 'Atención',
    prompt: '¿Cómo manejas un cliente difícil?',
    objectiveId: 'LO-INT-204',
    anchor: 'ent-s23-respuesta',
    idea: 'Separa la emoción del problema jurídico y explica el escenario en lenguaje comprensible.',
    keyPoints: [
      'Separa la emoción del problema jurídico',
      'Escucha lo que la persona necesita',
      'Verifica qué parte de la expectativa es jurídicamente posible',
      'Explica el escenario en un lenguaje que la persona pueda entender',
      'Su experiencia con población privada de la libertad le enseñó que muchas veces la persona necesita entender qué significa el documento',
    ],
    avoid: ['Responder solo con lenguaje técnico'],
    answer: [
      'Primero separo la emoción del problema jurídico. Escucho lo que la persona necesita, verifico qué parte de su expectativa es jurídicamente posible y explico el escenario en un lenguaje que pueda entender. Mi experiencia atendiendo población privada de la libertad me enseñó mucho en ese sentido: muchas veces una persona no necesita solamente recibir un documento, necesita entender qué significa y qué puede pasar después.',
    ],
    stars: ['STAR-E'],
  }),
  level2({
    id: 'P-INT-205',
    title: 'Trabajo en equipo',
    subtopic: 'Equipo',
    prompt: '¿Cómo trabajas en equipo?',
    objectiveId: 'LO-INT-205',
    anchor: 'ent-s29-respuesta',
    idea: 'Autonomía sin aislamiento: resuelve lo que está a su alcance y llega con dudas concretas.',
    keyPoints: [
      'Le gusta trabajar con autonomía, pero no confunde autonomía con aislamiento',
      'Resuelve primero lo que está dentro de su alcance',
      'Cuando necesita información o validación llega con una duda concreta',
      'En TransUnion trabaja coordinadamente con pares y revisores',
    ],
    avoid: ['Presentarse como alguien que trabaja sola'],
    answer: [
      'Me gusta trabajar con autonomía, pero no confundo autonomía con trabajar aislada. Normalmente intento resolver primero lo que está dentro de mi alcance y, cuando necesito información o validación, llego a la persona correspondiente con una duda concreta. En TransUnion, por ejemplo, trabajo coordinadamente con pares y revisores porque una respuesta jurídica puede requerir verificar información antes de presentarse.',
    ],
  }),
  level2({
    id: 'P-INT-206',
    title: 'Dilemas éticos',
    subtopic: 'Ética',
    prompt:
      '¿Qué haces si un cliente o un superior te pide algo que consideras jurídicamente incorrecto?',
    objectiveId: 'LO-INT-206',
    anchor: 'ent-s20-respuesta',
    idea: 'Cumplir una instrucción nunca significa dejar de aplicar criterio profesional y deberes éticos.',
    keyPoints: [
      'Confirma primero los hechos y la norma aplicable',
      'Explica el riesgo jurídico de forma clara y respetuosa',
      'Propone una alternativa legal',
      'Escala al abogado responsable si excede su nivel de decisión',
      'Cumplir una instrucción no sustituye el criterio profesional ni los deberes éticos',
    ],
    avoid: ['Ejecutar sin advertir el riesgo jurídico'],
    answer: [
      'Primero confirmaría los hechos y la norma aplicable. Si considero que existe un riesgo jurídico, lo explicaría de forma clara y respetuosa, indicando por qué no recomiendo esa actuación y proponiendo una alternativa legal. Si el asunto excede mi nivel de decisión, lo escalaría al abogado responsable. Para mí cumplir una instrucción nunca significa dejar de aplicar criterio profesional y deberes éticos.',
    ],
    tags: ['nivel2', 'ética'],
    followUps: [
      {
        id: 'P-INT-206-f1',
        prompt: '¿Qué harías si consideras que tu cliente está mintiendo?',
        idea: 'No construiría una actuación sobre información falsa: explicaría su deber profesional y usaría legítimamente las herramientas del ordenamiento.',
        anchor: 'ent-s25-respuesta',
      },
      {
        id: 'P-INT-206-f2',
        prompt: '¿Te sentirías cómoda trabajando con una persona acusada de un delito grave?',
        idea: 'Sí: separa la opinión personal del deber profesional; acceso a la justicia, debido proceso y dignidad no dependen de aprobar la conducta.',
        anchor: 'ent-s24-respuesta',
      },
    ],
  }),
  level2({
    id: 'P-INT-207',
    title: 'Carga laboral en el nuevo rol',
    subtopic: 'Condiciones',
    prompt: '¿Qué pasa si aquí también hay mucha carga laboral?',
    objectiveId: 'LO-INT-207',
    anchor: 'ent-s37-respuesta',
    idea: 'No busca un trabajo sin presión: busca un entorno donde la presión tenga gestión profesional.',
    keyPoints: [
      'Está acostumbrada a trabajar con carga y con términos',
      'Entiende que en Penal pueden existir urgencias reales',
      'Le importa que exista organización clara, prioridades definidas y posibilidad de escalar',
      'No busca un trabajo sin presión, sino presión con gestión profesional',
    ],
    avoid: ['Prometer disponibilidad ilimitada', 'Quejarse del empleo actual'],
    answer: [
      'Estoy acostumbrada a trabajar con carga y con términos, y entiendo que en Penal pueden existir urgencias reales. Lo importante para mí es que exista una organización clara de los asuntos, prioridades definidas y un equipo en el que sea posible escalar cuando una situación lo requiere. No busco un trabajo sin presión; busco un entorno donde la presión tenga una gestión profesional.',
    ],
  }),
  level2({
    id: 'P-INT-208',
    title: 'Dónde te ves en cinco años',
    subtopic: 'Proyección',
    prompt: '¿Dónde te ves en cinco años?',
    objectiveId: 'LO-INT-208',
    anchor: 'ent-s27-respuesta',
    idea: 'Consolidada como penalista con litigio y estrategia, construyendo esa experiencia desde esta oportunidad.',
    keyPoints: [
      'Consolidada como abogada penalista',
      'Experiencia mucho más fuerte en litigio, estrategia de casos y audiencias',
      'Continuar formación de posgrado y asumir mayor responsabilidad',
      'Busca ahora una oportunidad para construir esa experiencia de forma seria y sostenida',
    ],
    avoid: ['Hablar de ser jueza o fiscal: la pregunta busca cómo encaja ESTA oportunidad'],
    answer: [
      'Me gustaría estar consolidada como abogada penalista, con experiencia mucho más fuerte en litigio, estrategia de casos y actuación en audiencias. También quiero continuar mi formación de posgrado y asumir progresivamente asuntos de mayor responsabilidad. Lo que busco ahora es una oportunidad que me permita construir esa experiencia de manera seria y sostenida.',
    ],
  }),
  level2({
    id: 'P-INT-209',
    title: 'Cómo aprende algo que no sabe',
    subtopic: 'Aprendizaje',
    prompt: '¿Cómo aprendes algo que no sabes?',
    objectiveId: 'LO-INT-209',
    anchor: 'ent-s19-respuesta',
    idea: 'Método real: revisar, intentar, consultar con una duda concreta y documentar la respuesta.',
    keyPoints: [
      'Revisa el procedimiento y sus notas',
      'Intenta resolverlo por su cuenta para ubicar exactamente la duda',
      'Consulta a quien conoce el proceso explicando qué revisó y qué intentó',
      'Documenta la respuesta para no volver a preguntar lo mismo',
      'Así aprendió varias plataformas, en los juzgados y en TransUnion',
    ],
    avoid: ['Presentarse como alguien que pregunta sin haber intentado'],
    answer: [
      'Primero reviso el procedimiento y mis notas; después intento resolverlo por mi cuenta para entender dónde exactamente está la duda. Si no logro solucionarlo, consulto a un compañero o a la persona que conoce el proceso y le explico qué revisé y qué intenté. Cuando me dan la respuesta la documento para no volver a preguntar lo mismo. Así aprendí varias plataformas que no conocía, tanto en los juzgados como en TransUnion.',
    ],
  }),
  level2({
    id: 'P-INT-210',
    title: 'Preguntas al despacho',
    subtopic: 'Cierre de entrevista',
    prompt: '¿Tienes alguna pregunta para nosotros?',
    objectiveId: 'LO-INT-210',
    anchor: 'ent-s41-p1',
    idea: 'Elegir dos o tres preguntas útiles, sin convertir la primera parte en una negociación.',
    keyPoints: [
      'Qué tipo de asuntos penales manejaría y cómo sería un día normal en el cargo',
      'Cómo funciona el acompañamiento o revisión de escritos y la preparación para audiencias',
      'Si la posición se enfoca en investigación y redacción, clientes, audiencias o una combinación',
      'Qué esperan que asuma de manera autónoma después de los primeros seis meses',
      'Si la posición se abrió por crecimiento del equipo o por reemplazo',
      'Cuando corresponda: tipo de contrato, rango salarial y horario habitual',
    ],
    avoid: [
      'Hacer diez preguntas en una entrevista corta',
      'Convertir la primera parte de la entrevista en una negociación',
    ],
    answer: [
      '¿Qué tipo de asuntos penales manejaría principalmente la persona que ingrese y cómo sería un día normal en el cargo?',
      'Para un abogado junior, ¿cómo funciona el acompañamiento o revisión de escritos y la preparación para audiencias?',
    ],
    tags: ['nivel2', 'preguntas-al-despacho'],
    followUps: [
      {
        id: 'P-INT-210-f1',
        prompt: '¿Qué sabes de nuestro despacho?',
        idea: 'La convocatoria no muestra claramente la razón social: puede decirlo y convertirlo en interés por conocer las líneas de práctica penal del equipo.',
        anchor: 'ent-s40-respuesta',
      },
    ],
  }),
];
