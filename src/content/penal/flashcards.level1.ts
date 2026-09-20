import type { EstimatedMinutes, Flashcard } from '@/domain/types';
import { base } from '../helpers';

interface CardInput {
  id: string;
  objectiveId: string;
  topic: string;
  subtopic: string;
  anchor: string;
  front: string;
  back: string;
  minutes?: EstimatedMinutes;
}

function card(input: CardInput): Flashcard {
  return {
    ...base(
      {
        id: input.id,
        title: input.front,
        topic: input.topic,
        subtopic: input.subtopic,
        track: 'penal',
        level: 1,
        priority: 'critical',
        estimatedMinutes: input.minutes ?? 2,
        stage: 'technical',
        objectiveId: input.objectiveId,
        difficulty: 'intro',
        anchor: input.anchor,
        tags: ['penal-esencial', 'flashcard'],
      },
      'flashcard',
    ),
    type: 'flashcard',
    front: input.front,
    back: input.back,
  };
}

/** Flashcards Nivel 1: recuperación activa de las definiciones rápidas de `PENAL_MD §54` y afines. */
export const PENAL_FLASHCARDS_LEVEL_1: Flashcard[] = [
  card({
    id: 'F-PEN-002-1',
    objectiveId: 'LO-PEN-002',
    topic: 'Teoría del delito',
    subtopic: 'Estructura',
    anchor: 'pen-s3-estructura',
    front: '¿Qué requiere una conducta para ser punible?',
    back: 'Que sea típica, antijurídica y culpable (artículo 9 del Código Penal).',
  }),
  card({
    id: 'F-PEN-003-1',
    objectiveId: 'LO-PEN-003',
    topic: 'Teoría del delito',
    subtopic: 'Tipicidad',
    anchor: 'pen-s54-tipicidad',
    front: '¿Qué es tipicidad?',
    back: 'Adecuación de los hechos a la descripción legal de un delito.',
  }),
  card({
    id: 'F-PEN-003-2',
    objectiveId: 'LO-PEN-003',
    topic: 'Teoría del delito',
    subtopic: 'Antijuridicidad',
    anchor: 'pen-s54-antijuridicidad',
    front: '¿Qué es antijuridicidad?',
    back: 'Lesión o puesta en peligro efectiva del bien jurídico, sin justa causa.',
  }),
  card({
    id: 'F-PEN-003-3',
    objectiveId: 'LO-PEN-003',
    topic: 'Teoría del delito',
    subtopic: 'Culpabilidad',
    anchor: 'pen-s54-culpabilidad',
    front: '¿Qué es culpabilidad?',
    back:
      'Juicio de reproche personal que permite atribuir responsabilidad penal, proscribiendo responsabilidad objetiva.',
  }),
  card({
    id: 'F-PEN-004-1',
    objectiveId: 'LO-PEN-004',
    topic: 'Teoría del delito',
    subtopic: 'Dolo',
    anchor: 'pen-s54-dolo',
    front: '¿Qué es dolo?',
    back:
      'Conocimiento de los hechos constitutivos del delito y voluntad de realizarlos, incluyendo los supuestos legales de previsión probable dejada al azar.',
  }),
  card({
    id: 'F-PEN-004-2',
    objectiveId: 'LO-PEN-004',
    topic: 'Teoría del delito',
    subtopic: 'Culpa',
    anchor: 'pen-s54-culpa',
    front: '¿Qué es culpa?',
    back:
      'Resultado derivado de infracción al deber objetivo de cuidado que debía preverse o que, previsto, se confió poder evitar.',
  }),
  card({
    id: 'F-PEN-004-3',
    objectiveId: 'LO-PEN-004',
    topic: 'Teoría del delito',
    subtopic: 'Preterintención',
    anchor: 'pen-s5-preterintencion',
    front: '¿Qué es preterintención?',
    back: 'El resultado producido, aunque previsible, excede la intención inicial del agente.',
  }),
  card({
    id: 'F-PEN-005-1',
    objectiveId: 'LO-PEN-005',
    topic: 'Teoría del delito',
    subtopic: 'Tentativa',
    anchor: 'pen-s54-tentativa',
    front: '¿Qué es tentativa?',
    back:
      'Inicio de ejecución idóneo e inequívoco sin consumación por causa ajena a la voluntad del agente.',
  }),
  card({
    id: 'F-PEN-006-1',
    objectiveId: 'LO-PEN-006',
    topic: 'Teoría del delito',
    subtopic: 'Coautoría',
    anchor: 'pen-s54-coautoria',
    front: '¿Qué es coautoría?',
    back: 'Realización conjunta con acuerdo común y división del trabajo criminal relevante.',
  }),
  card({
    id: 'F-PEN-006-2',
    objectiveId: 'LO-PEN-006',
    topic: 'Teoría del delito',
    subtopic: 'Complicidad',
    anchor: 'pen-s59-coautor-complice',
    front: 'Coautor y cómplice: ¿cuál es la diferencia básica?',
    back: 'El primero integra la ejecución conjunta; el segundo contribuye a una conducta ajena.',
  }),
  card({
    id: 'F-PEN-007-1',
    objectiveId: 'LO-PEN-007',
    topic: 'Proceso penal',
    subtopic: 'Etapas',
    anchor: 'pen-s12-formula',
    front: 'Recita la secuencia del proceso penal acusatorio',
    back:
      'Noticia criminal → indagación → imputación → investigación → acusación → preparatoria → juicio oral → sentencia → ejecución.',
  }),
  card({
    id: 'F-PEN-008-1',
    objectiveId: 'LO-PEN-008',
    topic: 'Proceso penal',
    subtopic: 'Jueces',
    anchor: 'pen-s15-corta',
    front: 'Juez de garantías y juez de conocimiento: ¿qué hace cada uno?',
    back:
      'El de garantías controla la afectación de derechos fundamentales en etapas preliminares; el de conocimiento conduce el juzgamiento y decide responsabilidad con la prueba practicada en juicio.',
  }),
  card({
    id: 'F-PEN-009-1',
    objectiveId: 'LO-PEN-009',
    topic: 'Proceso penal',
    subtopic: 'Flagrancia',
    anchor: 'pen-s54-flagrancia',
    front: '¿Qué es flagrancia?',
    back:
      'Situación definida legalmente en la que una persona es sorprendida en comisión o en circunstancias inmediatas que permiten su aprehensión bajo los supuestos del Código.',
  }),
  card({
    id: 'F-PEN-009-2',
    objectiveId: 'LO-PEN-009',
    topic: 'Proceso penal',
    subtopic: 'Captura',
    anchor: 'pen-s16-plazo',
    front: '¿Cuál es el plazo máximo del Código para poner al capturado ante el juez de garantías?',
    back: 'Máximo de 36 horas, para control de legalidad y decisiones posteriores.',
  }),
  card({
    id: 'F-PEN-010-1',
    objectiveId: 'LO-PEN-010',
    topic: 'Proceso penal',
    subtopic: 'Imputación',
    anchor: 'pen-s54-imputacion',
    front: '¿Qué es imputación?',
    back:
      'Comunicación formal de los hechos jurídicamente relevantes atribuidos y de la calidad de imputado.',
  }),
  card({
    id: 'F-PEN-010-2',
    objectiveId: 'LO-PEN-010',
    topic: 'Proceso penal',
    subtopic: 'Acusación',
    anchor: 'pen-s54-acusacion',
    front: '¿Qué es acusación?',
    back:
      'Acto por el que Fiscalía lleva el caso a juicio al considerar satisfecho el estándar legal para acusar.',
  }),
  card({
    id: 'F-PEN-010-3',
    objectiveId: 'LO-PEN-010',
    topic: 'Proceso penal',
    subtopic: 'Distinción',
    anchor: 'pen-s59-imputacion-acusacion',
    front: 'Imputación y acusación: ¿cuál es la diferencia básica?',
    back: 'La primera comunica vinculación; la segunda lleva el asunto a juicio.',
  }),
  card({
    id: 'F-PEN-011-1',
    objectiveId: 'LO-PEN-011',
    topic: 'Proceso penal',
    subtopic: 'Medida de aseguramiento',
    anchor: 'pen-s54-medida',
    front: '¿Qué es una medida de aseguramiento?',
    back:
      'Medida cautelar destinada a fines procesales y de protección legalmente definidos; no es pena.',
  }),
  card({
    id: 'F-PEN-011-2',
    objectiveId: 'LO-PEN-011',
    topic: 'Proceso penal',
    subtopic: 'Distinción',
    anchor: 'pen-s59-captura-medida',
    front: 'Captura y medida de aseguramiento: ¿cuál es la diferencia básica?',
    back:
      'La captura es aprehensión; la medida es una decisión cautelar posterior con requisitos propios.',
  }),
  card({
    id: 'F-PEN-012-1',
    objectiveId: 'LO-PEN-012',
    topic: 'Juicio',
    subtopic: 'Teoría del caso',
    anchor: 'pen-s54-teoria',
    front: '¿Qué es teoría del caso?',
    back: 'Explicación coherente de hechos, derecho y prueba que sostiene la posición de una parte.',
  }),
  card({
    id: 'F-PEN-013-1',
    objectiveId: 'LO-PEN-013',
    topic: 'Juicio',
    subtopic: 'Estándar probatorio',
    anchor: 'pen-s54-estandar',
    front: '¿Qué estándar se requiere para condenar?',
    back: 'Conocimiento más allá de toda duda razonable, basado en prueba debatida en juicio.',
  }),
  card({
    id: 'F-PEN-014-1',
    objectiveId: 'LO-PEN-014',
    topic: 'Garantías',
    subtopic: 'Hábeas corpus',
    anchor: 'pen-s54-habeas',
    front: '¿Qué es hábeas corpus?',
    back:
      'Derecho fundamental y acción constitucional para proteger libertad frente a privación ilegal o prolongación ilegal.',
  }),
  card({
    id: 'F-PEN-014-2',
    objectiveId: 'LO-PEN-014',
    topic: 'Garantías',
    subtopic: 'Distinción',
    anchor: 'pen-s59-habeas-tutela',
    front: 'Hábeas corpus y tutela: ¿cuál es la diferencia básica?',
    back: 'El primero protege específicamente libertad frente a privación ilegal o prolongada.',
  }),
  card({
    id: 'F-PEN-015-1',
    objectiveId: 'LO-PEN-015',
    topic: 'Ejecución de penas',
    subtopic: 'Competencia',
    anchor: 'pen-s54-ejecucion',
    front: '¿Qué hace un juez de ejecución?',
    back:
      'Controla legalidad de la ejecución de la pena y resuelve los asuntos que la ley le asigna una vez existe condena ejecutoriada.',
  }),
  card({
    id: 'F-PEN-016-1',
    objectiveId: 'LO-PEN-016',
    topic: 'Ejecución de penas',
    subtopic: 'Libertad condicional',
    anchor: 'pen-s42-respuesta',
    front: '¿Cumplir 3/5 de la pena da libertad automática?',
    back:
      'No. Es un requisito importante, pero deben verificarse los demás requisitos legales y la valoración del juez.',
  }),
  card({
    id: 'F-PEN-016-2',
    objectiveId: 'LO-PEN-016',
    topic: 'Ejecución de penas',
    subtopic: 'Redención',
    anchor: 'pen-s43-redencion',
    front: '¿Cómo opera la redención de pena?',
    back:
      'Permite redimir parte de la pena con actividades reconocidas legalmente (trabajo, estudio o enseñanza), sujetas a certificación y evaluación; el juez de ejecución la reconoce.',
  }),
  card({
    id: 'F-PEN-011-3',
    objectiveId: 'LO-PEN-011',
    topic: 'Proceso penal',
    subtopic: 'Distinción',
    anchor: 'pen-s59-detencion-pena',
    front: 'Detención preventiva y pena: ¿cuál es la diferencia básica?',
    back: 'La primera es cautelar; la segunda surge de condena.',
  }),
];
