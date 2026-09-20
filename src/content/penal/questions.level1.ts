import type { Difficulty, EstimatedMinutes, Question, QuestionType } from '@/domain/types';
import { base } from '../helpers';

interface QuestionInput {
  id: string;
  objectiveId: string;
  title: string;
  topic: string;
  subtopic: string;
  anchor: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  question: string;
  /**
   * La opción correcta se indica con `correct` (índice). Se asignan ids a, b, c, d.
   * Las opciones se redactan con longitud y especificidad comparables: la correcta nunca debe
   * poder deducirse por ser la más larga (contrato §12.3).
   */
  options: string[];
  correct: number;
  explanation: string;
  /** Explicación por opción incorrecta, en el mismo orden que `options` ('' en la correcta). */
  wrong: string[];
  deeperDetail?: string;
  minutes?: EstimatedMinutes;
  tags?: string[];
}

const OPTION_IDS = ['a', 'b', 'c', 'd', 'e'];

function question(input: QuestionInput): Question {
  const options = input.options.map((text, index) => ({ id: OPTION_IDS[index], text }));
  const wrongAnswerExplanations: Record<string, string> = {};
  input.wrong.forEach((text, index) => {
    if (index !== input.correct && text) wrongAnswerExplanations[OPTION_IDS[index]] = text;
  });
  return {
    ...base(
      {
        id: input.id,
        title: input.title,
        topic: input.topic,
        subtopic: input.subtopic,
        track: 'penal',
        level: 1,
        priority: 'critical',
        estimatedMinutes: input.minutes ?? 2,
        stage: 'technical',
        objectiveId: input.objectiveId,
        difficulty: input.difficulty,
        anchor: input.anchor,
        tags: input.tags ?? ['penal-esencial'],
      },
      'question',
    ),
    type: 'question',
    questionType: input.questionType,
    question: input.question,
    options,
    correctOptionId: OPTION_IDS[input.correct],
    explanation: input.explanation,
    wrongAnswerExplanations,
    ...(input.deeperDetail ? { deeperDetail: input.deeperDetail } : {}),
    questionScope: { track: 'penal', level: 1, objectiveId: input.objectiveId },
  };
}

/**
 * Banco Penal Nivel 1: 2-4 preguntas útiles por LearningObjective (contrato §23, P0-A).
 * Ni las opciones ni las explicaciones introducen figuras de Nivel 2/3 (contrato §12.3).
 */
export const PENAL_QUESTIONS_LEVEL_1: Question[] = [
  // LO-PEN-002 -------------------------------------------------------------
  question({
    id: 'Q-PEN-002-1',
    objectiveId: 'LO-PEN-002',
    title: 'Elementos de la conducta punible',
    topic: 'Teoría del delito',
    subtopic: 'Estructura',
    anchor: 'pen-s3-estructura',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Qué debe reunir una conducta para ser punible?',
    options: [
      'Que sea típica, antijurídica y culpable, en ese orden de análisis',
      'Que sea típica y haya producido un resultado material lesivo comprobado',
      'Que sea antijurídica y que la víctima la haya puesto en conocimiento',
      'Que sea típica y que el autor haya empleado violencia sobre la víctima',
    ],
    correct: 0,
    explanation:
      'El artículo 9 del Código Penal establece que la conducta punible debe ser típica, antijurídica y culpable.',
    wrong: [
      '',
      'El resultado no basta: el ordenamiento proscribe la responsabilidad objetiva y exige también antijuridicidad y culpabilidad.',
      'La denuncia pone hechos en conocimiento de la autoridad, pero no es un elemento de la conducta punible.',
      'La violencia puede ser un elemento de tipos concretos, no un requisito general de la conducta punible.',
    ],
  }),
  question({
    id: 'Q-PEN-002-2',
    objectiveId: 'LO-PEN-002',
    title: 'Ausencia de un elemento',
    topic: 'Teoría del delito',
    subtopic: 'Estructura',
    anchor: 'pen-s3-culpabilidad',
    questionType: 'application',
    difficulty: 'media',
    question:
      'Se produjo un resultado lesivo, pero no puede formularse un reproche personal al autor. ¿Qué elemento falta?',
    options: [
      'La tipicidad, porque los hechos no encajan en la descripción legal',
      'La culpabilidad, porque no puede reprocharse personalmente el hecho',
      'La antijuridicidad, porque no se lesionó el bien jurídico protegido',
      'Ninguno, porque el resultado lesivo es suficiente para responder',
    ],
    correct: 1,
    explanation:
      'La culpabilidad es la que permite formular un reproche personal al autor. Sin ella no hay conducta punible.',
    wrong: [
      'La tipicidad se refiere al encaje de los hechos en la descripción legal, no al reproche personal.',
      '',
      'La antijuridicidad se refiere a la lesión o puesta en peligro del bien jurídico sin justa causa.',
      'No hay responsabilidad objetiva: no basta con que se haya producido un resultado.',
    ],
  }),

  // LO-PEN-003 -------------------------------------------------------------
  question({
    id: 'Q-PEN-003-1',
    objectiveId: 'LO-PEN-003',
    title: 'Qué es tipicidad',
    topic: 'Teoría del delito',
    subtopic: 'Tipicidad',
    anchor: 'pen-s54-tipicidad',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Qué es la tipicidad?',
    options: [
      'La lesión o puesta en peligro del bien jurídico, sin justa causa',
      'El juicio de reproche personal que se formula contra el autor',
      'La adecuación de los hechos a la descripción legal de un delito',
      'La comprobación de que el autor conocía y quería el resultado',
    ],
    correct: 2,
    explanation: 'Tipicidad es la adecuación de los hechos a la descripción legal de un delito.',
    wrong: [
      'Esa es la antijuridicidad.',
      'Ese es el juicio de culpabilidad.',
      '',
      'Conocer y querer el resultado corresponde al dolo, no a la tipicidad.',
    ],
  }),
  question({
    id: 'Q-PEN-003-2',
    objectiveId: 'LO-PEN-003',
    title: 'Tipicidad frente a antijuridicidad',
    topic: 'Teoría del delito',
    subtopic: 'Distinción',
    anchor: 'pen-s59-tipicidad-antijuridicidad',
    questionType: 'distinction',
    difficulty: 'media',
    question: '¿Cuál es la diferencia básica entre tipicidad y antijuridicidad?',
    options: [
      'La primera exige conducta dolosa y la segunda admite también la culposa',
      'La primera es el encaje en el tipo y la segunda la lesión sin justa causa',
      'La primera la valora el juez y la segunda la define siempre la Fiscalía',
      'La primera se analiza en el juicio y la segunda en la etapa de indagación',
    ],
    correct: 1,
    explanation: 'Encaje en tipo frente a lesión o puesta en peligro del bien jurídico sin justa causa.',
    wrong: [
      'Dolo y culpa son modalidades de la conducta; no separan tipicidad de antijuridicidad.',
      '',
      'Ambos elementos se analizan jurídicamente en el caso; no se reparten entre autoridades.',
      'No es una diferencia de etapa procesal, sino de contenido del análisis.',
    ],
  }),
  question({
    id: 'Q-PEN-003-3',
    objectiveId: 'LO-PEN-003',
    title: 'Justa causa y antijuridicidad',
    topic: 'Teoría del delito',
    subtopic: 'Antijuridicidad',
    anchor: 'pen-s3-antijuridicidad',
    questionType: 'application',
    difficulty: 'media',
    question:
      'En el análisis de antijuridicidad, ¿qué resulta determinante además de la lesión o puesta en peligro del bien jurídico?',
    options: [
      'Que la conducta se haya realizado sin una justa causa que la ampare',
      'Que el autor registre antecedentes penales por hechos anteriores',
      'Que la víctima haya presentado denuncia dentro del término legal',
      'Que el resultado producido sea irreversible o de imposible reparación',
    ],
    correct: 0,
    explanation:
      'La conducta típica debe lesionar o poner efectivamente en peligro el bien jurídico sin justa causa.',
    wrong: [
      '',
      'Los antecedentes no integran el análisis de antijuridicidad.',
      'La denuncia es una forma de poner hechos en conocimiento de la autoridad, no un elemento del análisis.',
      'La irreversibilidad del resultado no es lo que define la antijuridicidad.',
    ],
  }),

  // LO-PEN-004 -------------------------------------------------------------
  question({
    id: 'Q-PEN-004-1',
    objectiveId: 'LO-PEN-004',
    title: 'Qué es dolo',
    topic: 'Teoría del delito',
    subtopic: 'Dolo',
    anchor: 'pen-s5-dolo',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Cuándo existe dolo?',
    options: [
      'Cuando el resultado era previsible y el agente confió en poder evitarlo',
      'Cuando el agente conoce los hechos de la infracción y quiere realizarlos',
      'Cuando el resultado producido excede la intención inicial del agente',
      'Cuando el agente infringe el deber objetivo de cuidado que le era exigible',
    ],
    correct: 1,
    explanation:
      'Dolo es conocimiento de los hechos constitutivos del delito y voluntad de realizarlos, incluidos los supuestos legales de previsión probable dejada al azar.',
    wrong: [
      'Eso describe la culpa.',
      '',
      'Eso describe la preterintención.',
      'La infracción al deber objetivo de cuidado es el núcleo de la culpa.',
    ],
    deeperDetail:
      'El Código también contempla el supuesto en el que la realización se prevé como probable y el agente deja su no producción librada al azar.',
  }),
  question({
    id: 'Q-PEN-004-2',
    objectiveId: 'LO-PEN-004',
    title: 'Dolo frente a culpa',
    topic: 'Teoría del delito',
    subtopic: 'Distinción',
    anchor: 'pen-s5-respuesta',
    questionType: 'distinction',
    difficulty: 'media',
    question: '¿Qué distingue la culpa del dolo?',
    options: [
      'Que en la culpa el resultado deriva de infringir el deber objetivo de cuidado',
      'Que la culpa solo opera en delitos que afectan el patrimonio de la víctima',
      'Que en la culpa el agente quiere el resultado pero no alcanza a consumarlo',
      'Que la culpa únicamente puede debatirse durante la audiencia de juicio oral',
    ],
    correct: 0,
    explanation:
      'En el dolo hay conocimiento y voluntad; en la culpa el resultado deriva de la infracción al deber objetivo de cuidado.',
    wrong: [
      '',
      'La culpa no se limita a una categoría de bienes jurídicos.',
      'Querer el resultado sin lograrlo se analiza como tentativa en conducta dolosa, no como culpa.',
      'La modalidad de la conducta no depende de la etapa procesal.',
    ],
  }),
  question({
    id: 'Q-PEN-004-3',
    objectiveId: 'LO-PEN-004',
    title: 'Punibilidad de culpa y preterintención',
    topic: 'Teoría del delito',
    subtopic: 'Modalidades',
    anchor: 'pen-s5-modalidades',
    questionType: 'application',
    difficulty: 'media',
    question: '¿Cuándo son punibles la culpa y la preterintención?',
    options: [
      'Siempre que se produzca un resultado lesivo para el bien jurídico',
      'Cuando la persona afectada lo solicite dentro del proceso penal',
      'Cuando la ley lo establece expresamente para esa conducta punible',
      'Cuando el juez valore que la sanción resulta necesaria y proporcional',
    ],
    correct: 2,
    explanation: 'La culpa y la preterintención solo son punibles cuando la ley expresamente lo establece.',
    wrong: [
      'El resultado por sí solo no convierte una conducta culposa en punible.',
      'La voluntad de la víctima no determina la punibilidad de la modalidad.',
      '',
      'No depende de una valoración de proporcionalidad del juez, sino de previsión legal expresa.',
    ],
  }),

  // LO-PEN-005 -------------------------------------------------------------
  question({
    id: 'Q-PEN-005-1',
    objectiveId: 'LO-PEN-005',
    title: 'Elementos de la tentativa',
    topic: 'Teoría del delito',
    subtopic: 'Tentativa',
    anchor: 'pen-s7-tentativa',
    questionType: 'recall',
    difficulty: 'media',
    question: '¿Qué elementos exige la tentativa?',
    options: [
      'Inicio de ejecución idóneo e inequívoco y no consumación por causa ajena',
      'Actos preparatorios acompañados de una intención manifestada a terceros',
      'Consumación parcial de la conducta con un resultado lesivo de menor entidad',
      'Acuerdo previo entre dos o más personas para ejecutar la conducta punible',
    ],
    correct: 0,
    explanation:
      'Tentativa es inicio de ejecución idóneo e inequívoco sin consumación por causa ajena a la voluntad del agente.',
    wrong: [
      '',
      'Los actos preparatorios no equivalen al inicio de ejecución.',
      'La tentativa se caracteriza precisamente por la falta de consumación.',
      'El acuerdo entre varias personas corresponde al análisis de coautoría o participación.',
    ],
  }),
  question({
    id: 'Q-PEN-005-2',
    objectiveId: 'LO-PEN-005',
    title: 'Preparación frente a ejecución',
    topic: 'Teoría del delito',
    subtopic: 'Distinción',
    anchor: 'pen-s7-diferencia',
    questionType: 'distinction',
    difficulty: 'media',
    question: '¿Cuándo pasa una conducta de preparación a tentativa?',
    options: [
      'Cuando el sujeto manifiesta su intención delictiva ante otra persona',
      'Cuando el sujeto consigue los medios que necesita para el delito',
      'Cuando supera la preparación e inicia actos idóneos e inequívocos',
      'Cuando la noticia criminal llega a conocimiento de la autoridad',
    ],
    correct: 2,
    explanation:
      'El paso se produce al superar la mera preparación e iniciar actos idóneos e inequívocamente dirigidos a la consumación.',
    wrong: [
      'Manifestar una intención no equivale a iniciar la ejecución.',
      'Conseguir medios suele ser todavía preparación.',
      '',
      'El conocimiento de la autoridad es un hecho procesal, no un elemento de la tentativa.',
    ],
  }),
  question({
    id: 'Q-PEN-005-3',
    objectiveId: 'LO-PEN-005',
    title: 'Causa de la no consumación',
    topic: 'Teoría del delito',
    subtopic: 'Tentativa',
    anchor: 'pen-s7-respuesta',
    questionType: 'application',
    difficulty: 'media',
    question: 'Para que haya tentativa, ¿a qué debe deberse que el delito no se consume?',
    options: [
      'A circunstancias ajenas a la voluntad del agente que la impidieron',
      'A que el propio agente decidió detenerse antes de consumar el hecho',
      'A que la persona afectada decidió no presentar denuncia por el hecho',
      'A que el medio empleado era inidóneo desde el comienzo de la acción',
    ],
    correct: 0,
    explanation: 'La consumación no ocurre por circunstancias ajenas a la voluntad del agente.',
    wrong: [
      '',
      'Si el propio agente decide no consumar, el supuesto ya no responde a circunstancias ajenas a su voluntad.',
      'La denuncia no incide en la estructura de la tentativa.',
      'La tentativa exige actos idóneos; la inidoneidad afecta ese requisito.',
    ],
  }),

  // LO-PEN-006 -------------------------------------------------------------
  question({
    id: 'Q-PEN-006-1',
    objectiveId: 'LO-PEN-006',
    title: 'Qué es coautoría',
    topic: 'Teoría del delito',
    subtopic: 'Coautoría',
    anchor: 'pen-s54-coautoria',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Qué caracteriza la coautoría?',
    options: [
      'Prestar ayuda posterior al hecho ajeno con concierto previo o concomitante',
      'Inducir o determinar a otra persona a realizar la conducta antijurídica',
      'Realización conjunta con acuerdo común y división del trabajo relevante',
      'Realizar la conducta utilizando a otra persona como simple instrumento',
    ],
    correct: 2,
    explanation:
      'La coautoría es realización conjunta con acuerdo común y división del trabajo criminal relevante.',
    wrong: [
      'Eso corresponde a la complicidad.',
      'Eso corresponde al determinador.',
      '',
      'Actuar a través de otro como instrumento corresponde a la autoría.',
    ],
  }),
  question({
    id: 'Q-PEN-006-2',
    objectiveId: 'LO-PEN-006',
    title: 'Coautor frente a cómplice',
    topic: 'Teoría del delito',
    subtopic: 'Distinción',
    anchor: 'pen-s8-respuesta',
    questionType: 'distinction',
    difficulty: 'media',
    question: '¿Cuál es la diferencia entre coautor y cómplice?',
    options: [
      'El coautor integra la ejecución conjunta; el cómplice contribuye a conducta ajena',
      'El coautor actúa siempre con dolo mientras el cómplice responde a título de culpa',
      'El coautor responde en la etapa de juicio y el cómplice durante la investigación',
      'El coautor recibe siempre la misma calificación jurídica que el determinador',
    ],
    correct: 0,
    explanation:
      'El coautor interviene en la ejecución dentro de un acuerdo común con aporte relevante; el cómplice contribuye a la conducta ajena. La calificación depende del papel concreto en el hecho.',
    wrong: [
      '',
      'La distinción no se construye sobre la modalidad subjetiva de la conducta.',
      'No es una diferencia de etapa procesal.',
      'El determinador induce o determina a otro; es una figura distinta.',
    ],
  }),
  question({
    id: 'Q-PEN-006-3',
    objectiveId: 'LO-PEN-006',
    title: 'Determinador',
    topic: 'Teoría del delito',
    subtopic: 'Participación',
    anchor: 'pen-s8-determinador',
    questionType: 'application',
    difficulty: 'media',
    question:
      'Una persona convence a otra para que realice la conducta, sin intervenir en su ejecución. ¿Qué figura se analiza?',
    options: [
      'Coautor, por el acuerdo común y el aporte a la ejecución',
      'Determinador, por inducir a otro a la conducta antijurídica',
      'Cómplice, por contribuir de forma accesoria al hecho ajeno',
      'Autor, por realizar la conducta a través de un instrumento',
    ],
    correct: 1,
    explanation: 'El determinador induce o determina a otro a realizar la conducta antijurídica.',
    wrong: [
      'El coautor interviene en la ejecución con aporte relevante dentro de un acuerdo común.',
      '',
      'El cómplice contribuye a la realización de la conducta o presta ayuda posterior con concierto previo o concomitante.',
      'La autoría por instrumento supone utilizar a otro como medio, no convencer a quien decide y ejecuta.',
    ],
  }),

  // LO-PEN-007 -------------------------------------------------------------
  question({
    id: 'Q-PEN-007-1',
    objectiveId: 'LO-PEN-007',
    title: 'Secuencia del proceso',
    topic: 'Proceso penal',
    subtopic: 'Etapas',
    anchor: 'pen-s12-formula',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Cuál es la secuencia básica del proceso penal acusatorio?',
    options: [
      'Noticia criminal, imputación, indagación, acusación, juicio oral y sentencia',
      'Noticia criminal, indagación, imputación, acusación, preparatoria y juicio oral',
      'Denuncia, medida de aseguramiento, acusación, sentencia y ejecución de la pena',
      'Indagación, juicio oral, acusación, audiencia preparatoria y luego sentencia',
    ],
    correct: 1,
    explanation:
      'La fórmula es: noticia criminal, indagación, imputación, investigación, acusación, preparatoria, juicio oral, sentencia y ejecución.',
    wrong: [
      'La indagación precede a la imputación, no al contrario.',
      '',
      'La medida de aseguramiento es una decisión cautelar, no una etapa de la secuencia.',
      'La acusación y la preparatoria son anteriores al juicio oral.',
    ],
  }),
  question({
    id: 'Q-PEN-007-2',
    objectiveId: 'LO-PEN-007',
    title: 'Qué inicia el juicio',
    topic: 'Proceso penal',
    subtopic: 'Etapas',
    anchor: 'pen-s12-juicio',
    questionType: 'distinction',
    difficulty: 'media',
    question: '¿Con qué acto comienza la etapa de juicio?',
    options: [
      'Con la indagación, que arranca con la noticia criminal',
      'Con la captura de la persona señalada en los hechos',
      'Con la imputación ante el juez de control de garantías',
      'Con la acusación ante el juez competente del juzgamiento',
    ],
    correct: 3,
    explanation: 'La etapa de juicio comienza con la acusación.',
    wrong: [
      'La indagación comienza con la noticia criminal y pertenece a la investigación.',
      'La captura es una aprehensión, no el inicio de una etapa del proceso.',
      'La imputación marca el paso a la investigación propiamente dicha.',
      '',
    ],
  }),

  // LO-PEN-008 -------------------------------------------------------------
  question({
    id: 'Q-PEN-008-1',
    objectiveId: 'LO-PEN-008',
    title: 'Funciones del juez de garantías',
    topic: 'Proceso penal',
    subtopic: 'Jueces',
    anchor: 'pen-s15-garantias',
    questionType: 'recall',
    difficulty: 'media',
    question: '¿Cuál de estas solicitudes resuelve el juez de control de garantías?',
    options: [
      'La valoración definitiva de la prueba practicada en el juicio oral',
      'El control de legalidad de la captura y la medida de aseguramiento',
      'La sentencia condenatoria o absolutoria que cierra el juzgamiento',
      'El reconocimiento de la redención de pena durante su cumplimiento',
    ],
    correct: 1,
    explanation:
      'El juez de control de garantías resuelve, entre otros, el control de legalidad de la captura y las medidas de aseguramiento.',
    wrong: [
      'Valorar la prueba practicada en juicio corresponde al juez de conocimiento.',
      '',
      'La sentencia corresponde al juez de conocimiento.',
      'La redención la reconoce el juez de ejecución de penas.',
    ],
  }),
  question({
    id: 'Q-PEN-008-2',
    objectiveId: 'LO-PEN-008',
    title: 'Garantías frente a conocimiento',
    topic: 'Proceso penal',
    subtopic: 'Distinción',
    anchor: 'pen-s15-corta',
    questionType: 'distinction',
    difficulty: 'media',
    question: '¿Qué distingue al juez de conocimiento del juez de control de garantías?',
    options: [
      'Que conduce el juzgamiento y decide responsabilidad con la prueba del juicio',
      'Que autoriza y controla las actuaciones de investigación de la Fiscalía',
      'Que resuelve las audiencias preliminares de la actuación penal en curso',
      'Que vigila la legalidad del cumplimiento de la pena ya impuesta en firme',
    ],
    correct: 0,
    explanation:
      'El juez de garantías controla la afectación de derechos fundamentales en etapas preliminares; el de conocimiento conduce el juzgamiento y decide responsabilidad.',
    wrong: [
      '',
      'Los controles sobre actuaciones de investigación corresponden al juez de garantías.',
      'Las audiencias preliminares son competencia del juez de garantías.',
      'El control del cumplimiento de la pena corresponde al juez de ejecución.',
    ],
  }),

  // LO-PEN-009 -------------------------------------------------------------
  question({
    id: 'Q-PEN-009-1',
    objectiveId: 'LO-PEN-009',
    title: 'Regla general de la captura',
    topic: 'Proceso penal',
    subtopic: 'Captura',
    anchor: 'pen-s16-captura',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Qué exige como regla general la captura?',
    options: [
      'Orden escrita de juez de control de garantías, salvo excepciones legales',
      'Autorización verbal del fiscal que dirige la investigación del caso',
      'Denuncia previa de la víctima ratificada ante la autoridad judicial',
      'Sentencia condenatoria en firme contra la persona que se aprehende',
    ],
    correct: 0,
    explanation:
      'Como regla general la captura requiere orden escrita de un juez de control de garantías, salvo las excepciones legales como la flagrancia.',
    wrong: [
      '',
      'La Fiscalía no sustituye la orden judicial que la regla general exige.',
      'La denuncia no reemplaza la orden judicial.',
      'La captura no presupone condena: opera en etapas anteriores.',
    ],
  }),
  question({
    id: 'Q-PEN-009-2',
    objectiveId: 'LO-PEN-009',
    title: 'Plazo para poner a disposición del juez',
    topic: 'Proceso penal',
    subtopic: 'Captura',
    anchor: 'pen-s16-plazo',
    questionType: 'application',
    difficulty: 'media',
    question:
      '¿Cuál es el plazo máximo que el Código señala para poner a la persona capturada a disposición del juez de control de garantías?',
    options: ['12 horas', '24 horas', '36 horas', '72 horas'],
    correct: 2,
    explanation:
      'El Código señala un máximo de 36 horas para poner a la persona capturada a disposición del juez de control de garantías, para control de legalidad y decisiones posteriores.',
    wrong: [
      'El plazo del Código es más amplio que ese.',
      'El plazo del Código es más amplio que ese.',
      '',
      'Ese plazo excede el máximo que señala el Código.',
    ],
  }),
  question({
    id: 'Q-PEN-009-3',
    objectiveId: 'LO-PEN-009',
    title: 'Aprehensión en flagrancia',
    topic: 'Proceso penal',
    subtopic: 'Flagrancia',
    anchor: 'pen-s17-cualquiera',
    questionType: 'application',
    difficulty: 'media',
    question: '¿Puede una persona particular aprehender a quien es sorprendido en flagrancia?',
    options: [
      'No: la aprehensión material queda reservada a la autoridad en todo caso',
      'Sí, pero debe entregarlo inmediatamente a la autoridad según el procedimiento',
      'Sí, y puede retenerlo mientras obtiene una declaración sobre los hechos',
      'No, salvo que cuente con orden escrita previa del juez de garantías',
    ],
    correct: 1,
    explanation:
      'El Código permite que cualquier persona aprehenda a quien sea sorprendido en flagrancia, pero debe entregarlo inmediatamente a la autoridad.',
    wrong: [
      'El Código sí lo permite en el supuesto de flagrancia.',
      '',
      'No existe una facultad de retención para obtener declaraciones.',
      'La flagrancia es precisamente una excepción a la exigencia de orden previa.',
    ],
  }),

  // LO-PEN-010 -------------------------------------------------------------
  question({
    id: 'Q-PEN-010-1',
    objectiveId: 'LO-PEN-010',
    title: 'Qué es la imputación',
    topic: 'Proceso penal',
    subtopic: 'Imputación',
    anchor: 'pen-s18-imputacion',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Qué es la formulación de imputación?',
    options: [
      'La decisión de la Fiscalía de llevar el caso a la etapa de juicio',
      'Una declaración judicial provisional sobre la responsabilidad penal',
      'La comunicación de la calidad de imputado y de los hechos relevantes',
      'La solicitud con la que se pide restringir la libertad del procesado',
    ],
    correct: 2,
    explanation:
      'La imputación es un acto de comunicación mediante el cual la Fiscalía informa a una persona su calidad de imputado y los hechos jurídicamente relevantes atribuidos.',
    wrong: [
      'Llevar el caso a juicio corresponde a la acusación.',
      'La imputación no declara responsabilidad: mantiene la presunción de inocencia.',
      '',
      'La restricción de la libertad se solicita mediante medida de aseguramiento, que es una decisión distinta.',
    ],
  }),
  question({
    id: 'Q-PEN-010-2',
    objectiveId: 'LO-PEN-010',
    title: 'Estándar de la acusación',
    topic: 'Proceso penal',
    subtopic: 'Acusación',
    anchor: 'pen-s19-acusacion',
    questionType: 'distinction',
    difficulty: 'alta',
    question: '¿Qué nivel de soporte exige la acusación?',
    options: [
      'Probabilidad de verdad sobre la conducta y la participación del imputado',
      'Conocimiento más allá de toda duda razonable sobre la responsabilidad',
      'Inferencia razonable de autoría junto a una finalidad cautelar concreta',
      'La simple existencia de una noticia criminal recibida por la autoridad',
    ],
    correct: 0,
    explanation:
      'Para acusar, la Fiscalía debe poder afirmar con probabilidad de verdad que la conducta existió y que el imputado es autor o partícipe.',
    wrong: [
      '',
      'Ese es el estándar de la condena, no de la acusación.',
      'Esa es la exigencia propia de la medida de aseguramiento.',
      'La noticia criminal solo da inicio a la indagación.',
    ],
  }),
  question({
    id: 'Q-PEN-010-3',
    objectiveId: 'LO-PEN-010',
    title: 'Imputación y culpabilidad',
    topic: 'Proceso penal',
    subtopic: 'Imputación',
    anchor: 'pen-s18-respuesta',
    questionType: 'application',
    difficulty: 'media',
    question: '¿La imputación demuestra que la persona es culpable?',
    options: [
      'Sí, porque supone que la Fiscalía ya cuenta con prueba suficiente',
      'No: vincula al proceso pero mantiene la presunción de inocencia',
      'Sí, salvo que la defensa lo controvierta en esa misma audiencia',
      'No, porque la imputación la decreta el juez de conocimiento',
    ],
    correct: 1,
    explanation:
      'La imputación vincula formalmente a la persona al proceso en esa calidad, pero mantiene la presunción de inocencia.',
    wrong: [
      'La imputación no supone prueba suficiente de responsabilidad.',
      '',
      'La presunción de inocencia no depende de que la defensa la invoque en audiencia.',
      'La imputación se formula ante juez de control de garantías.',
    ],
  }),

  // LO-PEN-011 -------------------------------------------------------------
  question({
    id: 'Q-PEN-011-1',
    objectiveId: 'LO-PEN-011',
    title: 'Naturaleza de la medida',
    topic: 'Proceso penal',
    subtopic: 'Medida de aseguramiento',
    anchor: 'pen-s54-medida',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Qué es una medida de aseguramiento?',
    options: [
      'Una pena anticipada que se aplica a los delitos de mayor gravedad',
      'Una sanción que impone el juez de conocimiento al dictar sentencia',
      'Una medida cautelar con fines procesales y de protección legalmente definidos',
      'Una decisión administrativa que adopta la Fiscalía durante la investigación',
    ],
    correct: 2,
    explanation:
      'Es una medida cautelar destinada a fines procesales y de protección legalmente definidos; no es pena.',
    wrong: [
      'No es una pena anticipada.',
      'La pena es consecuencia de la sentencia condenatoria; la medida es anterior y cautelar.',
      '',
      'La decreta el juez de control de garantías, no es una decisión administrativa.',
    ],
  }),
  question({
    id: 'Q-PEN-011-2',
    objectiveId: 'LO-PEN-011',
    title: 'Requisitos del artículo 308',
    topic: 'Proceso penal',
    subtopic: 'Medida de aseguramiento',
    anchor: 'pen-s21-requisitos',
    questionType: 'application',
    difficulty: 'alta',
    question: 'Además de la inferencia razonable de autoría o participación, ¿qué se exige?',
    options: [
      'Una finalidad como evitar obstrucción, proteger o asegurar comparecencia',
      'Que la pena prevista para el delito supere un mínimo de cuatro años',
      'Que la persona haya sido capturada en situación de flagrancia previa',
      'Que la víctima del delito solicite expresamente la detención del imputado',
    ],
    correct: 0,
    explanation:
      'El artículo 308 exige inferencia razonable con elementos obtenidos legalmente y una finalidad constitucional o procesal concreta.',
    wrong: [
      '',
      'La procedencia de la detención preventiva tiene requisitos específicos propios; no se resume en ese umbral.',
      'La flagrancia no es requisito de la medida de aseguramiento.',
      'La solicitud de la víctima no sustituye los requisitos legales.',
    ],
    deeperDetail:
      'Además, la detención preventiva intramural tiene requisitos específicos de procedencia.',
  }),
  question({
    id: 'Q-PEN-011-3',
    objectiveId: 'LO-PEN-011',
    title: 'Imputación y privación de la libertad',
    topic: 'Proceso penal',
    subtopic: 'Medida de aseguramiento',
    anchor: 'pen-s21-respuesta',
    questionType: 'application',
    difficulty: 'media',
    question: 'Si hay imputación, ¿hay automáticamente privación de la libertad?',
    options: [
      'Sí: la imputación implica detención mientras avanza la investigación',
      'No: son decisiones distintas y la restricción exige requisitos propios',
      'Sí, salvo que el imputado acepte los cargos en esa misma audiencia',
      'No, porque la libertad solo puede restringirse después de la sentencia',
    ],
    correct: 1,
    explanation:
      'Imputación y medida de aseguramiento son decisiones distintas; la restricción de la libertad exige solicitud, fundamento y cumplimiento de requisitos ante el juez de control de garantías.',
    wrong: [
      'La imputación no implica por sí misma detención.',
      '',
      'La privación de la libertad no depende de esa condición.',
      'La ley prevé medidas cautelares anteriores a la sentencia, con requisitos propios.',
    ],
  }),

  // LO-PEN-012 -------------------------------------------------------------
  question({
    id: 'Q-PEN-012-1',
    objectiveId: 'LO-PEN-012',
    title: 'Qué integra la teoría del caso',
    topic: 'Juicio',
    subtopic: 'Teoría del caso',
    anchor: 'pen-s54-teoria',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Qué integra una teoría del caso?',
    options: [
      'Los hechos, el derecho aplicable y la prueba que los sostiene',
      'Los hechos del caso y la jurisprudencia que resulte aplicable',
      'La narración completa de todo lo que consta en el expediente',
      'Las conclusiones del informe técnico aportado por el perito',
    ],
    correct: 0,
    explanation:
      'Es la explicación coherente de hechos, derecho y prueba que sostiene la posición de una parte.',
    wrong: [
      '',
      'Falta el componente probatorio, que es esencial.',
      'Una narración completa del expediente no es una teoría del caso.',
      'Un informe técnico puede ser un insumo, no la teoría.',
    ],
  }),
  question({
    id: 'Q-PEN-012-2',
    objectiveId: 'LO-PEN-012',
    title: 'Preguntas que debe responder',
    topic: 'Juicio',
    subtopic: 'Teoría del caso',
    anchor: 'pen-s25-teoria',
    questionType: 'application',
    difficulty: 'media',
    question: '¿Cuáles son las tres preguntas que debe responder una teoría del caso?',
    options: [
      'Quién denunció los hechos, en qué fecha y ante qué autoridad lo hizo',
      'Qué ocurrió, qué significa jurídicamente y con qué prueba se demuestra',
      'Qué pena corresponde, en qué grado y con qué circunstancias atenuantes',
      'Qué audiencias ya se celebraron y cuáles faltan por celebrarse todavía',
    ],
    correct: 1,
    explanation:
      'Debe responder qué ocurrió, por qué jurídicamente significa lo que se sostiene y con qué prueba se puede demostrar.',
    wrong: [
      'Esos son datos del trámite, no la estructura de la teoría.',
      '',
      'La dosificación de la pena es un análisis distinto.',
      'El estado de las audiencias no define la teoría del caso.',
    ],
  }),

  // LO-PEN-013 -------------------------------------------------------------
  question({
    id: 'Q-PEN-013-1',
    objectiveId: 'LO-PEN-013',
    title: 'Estándar de condena',
    topic: 'Juicio',
    subtopic: 'Estándar probatorio',
    anchor: 'pen-s54-estandar',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Qué estándar se requiere para condenar?',
    options: [
      'Inferencia razonable de autoría o participación en la conducta',
      'Probabilidad de verdad sobre el delito y sobre la participación',
      'Conocimiento más allá de toda duda razonable, con prueba del juicio',
      'Certeza absoluta sobre todos los hechos que obran en el expediente',
    ],
    correct: 2,
    explanation:
      'Para condenar se exige conocimiento más allá de toda duda razonable, fundado en las pruebas debatidas en juicio.',
    wrong: [
      'Esa es la exigencia de la medida de aseguramiento.',
      'Esa es la exigencia para presentar acusación.',
      '',
      'El estándar legal se formula sobre la existencia del delito y la responsabilidad, no como certeza de todo el expediente.',
    ],
  }),
  question({
    id: 'Q-PEN-013-2',
    objectiveId: 'LO-PEN-013',
    title: 'Dos estándares distintos',
    topic: 'Juicio',
    subtopic: 'Distinción',
    anchor: 'pen-s31-respuesta',
    questionType: 'distinction',
    difficulty: 'media',
    question: '¿Probabilidad de verdad y más allá de toda duda razonable son lo mismo?',
    options: [
      'Sí: son dos maneras de nombrar el mismo estándar probatorio',
      'No: la primera permite acusar y la segunda es la exigida para condenar',
      'Sí, aunque la segunda solo se aplica a los delitos más graves',
      'No: la primera opera en el juicio y la segunda en la investigación',
    ],
    correct: 1,
    explanation:
      'La probabilidad de verdad es el estándar para presentar acusación; la condena exige conocimiento más allá de toda duda razonable a partir de la prueba debatida en juicio.',
    wrong: [
      'Son estándares distintos y con funciones distintas.',
      '',
      'El estándar de condena no varía según la gravedad del delito.',
      'La relación con las etapas es la inversa.',
    ],
  }),

  // LO-PEN-014 -------------------------------------------------------------
  question({
    id: 'Q-PEN-014-1',
    objectiveId: 'LO-PEN-014',
    title: 'Qué protege el hábeas corpus',
    topic: 'Garantías',
    subtopic: 'Hábeas corpus',
    anchor: 'pen-s37-habeas',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿En qué supuestos procede el hábeas corpus?',
    options: [
      'Privación con violación de garantías o prolongación ilegal de la misma',
      'Cualquier vulneración de un derecho fundamental de la persona procesada',
      'Incumplimiento de los términos previstos para la audiencia de juicio oral',
      'Desacuerdo de la defensa con la medida de aseguramiento que se impuso',
    ],
    correct: 0,
    explanation:
      'Protege la libertad personal cuando alguien es privado de ella con violación de garantías constitucionales o legales, o cuando la privación se prolonga ilegalmente.',
    wrong: [
      '',
      'La protección general de derechos fundamentales corresponde a la tutela cuando se cumplen sus requisitos.',
      'El hábeas corpus se define por la afectación de la libertad, no por el incumplimiento de términos en general.',
      'El desacuerdo con una decisión se controvierte por los mecanismos procesales correspondientes.',
    ],
  }),
  question({
    id: 'Q-PEN-014-2',
    objectiveId: 'LO-PEN-014',
    title: 'Término de decisión',
    topic: 'Garantías',
    subtopic: 'Hábeas corpus',
    anchor: 'pen-s37-plazo',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿En qué término exige la Constitución que se decida el hábeas corpus?',
    options: ['24 horas', '36 horas', '48 horas', '10 días'],
    correct: 1,
    explanation: 'La Constitución exige decisión dentro de 36 horas.',
    wrong: [
      'El término constitucional es algo más amplio.',
      '',
      'El término constitucional es más breve.',
      'Ese plazo corresponde a otros trámites, no al hábeas corpus.',
    ],
  }),
  question({
    id: 'Q-PEN-014-3',
    objectiveId: 'LO-PEN-014',
    title: 'Hábeas corpus y tutela',
    topic: 'Garantías',
    subtopic: 'Distinción',
    anchor: 'pen-s37-tutela',
    questionType: 'distinction',
    difficulty: 'media',
    question: '¿Qué diferencia al hábeas corpus de la tutela?',
    options: [
      'Que la tutela solo protege derechos de contenido patrimonial',
      'Que el hábeas corpus lo resuelve directamente la Fiscalía',
      'Que el hábeas corpus es específico y preferente para la libertad',
      'Que la tutela no exige ningún requisito de procedencia legal',
    ],
    correct: 2,
    explanation:
      'La tutela es un mecanismo general de protección de derechos fundamentales; el hábeas corpus es específico y preferente frente a la privación ilegal o prolongada de la libertad.',
    wrong: [
      'La tutela protege derechos fundamentales, no solo patrimoniales.',
      'El hábeas corpus es una acción constitucional que se resuelve judicialmente.',
      '',
      'La tutela procede cuando se cumplen sus requisitos.',
    ],
  }),

  // LO-PEN-015 -------------------------------------------------------------
  question({
    id: 'Q-PEN-015-1',
    objectiveId: 'LO-PEN-015',
    title: 'Función del juez de ejecución',
    topic: 'Ejecución de penas',
    subtopic: 'Competencia',
    anchor: 'pen-s54-ejecucion',
    questionType: 'recall',
    difficulty: 'intro',
    question: '¿Qué hace un juez de ejecución de penas?',
    options: [
      'Decide si la persona cometió el delito que se le atribuye',
      'Controla la legalidad de la ejecución y resuelve lo que la ley le asigna',
      'Practica y valora la prueba durante la audiencia de juicio oral',
      'Autoriza las capturas solicitadas durante la investigación penal',
    ],
    correct: 1,
    explanation:
      'Controla la legalidad de la ejecución de la pena y resuelve los asuntos que la ley le asigna una vez existe condena ejecutoriada.',
    wrong: [
      'No vuelve a juzgar si la persona cometió el delito.',
      '',
      'La práctica de la prueba en juicio corresponde al juez de conocimiento.',
      'El control de legalidad de la captura corresponde al juez de garantías.',
    ],
  }),
  question({
    id: 'Q-PEN-015-2',
    objectiveId: 'LO-PEN-015',
    title: 'Juzgar frente a ejecutar',
    topic: 'Ejecución de penas',
    subtopic: 'Distinción',
    anchor: 'pen-s55-juzgar-ejecutar',
    questionType: 'distinction',
    difficulty: 'media',
    question: '¿Qué diferencia hay entre juzgar y ejecutar una pena?',
    options: [
      'Juzgar determina responsabilidad e impone sanción; ejecutar parte de la sentencia',
      'Juzgar corresponde a la Fiscalía como titular de la acción penal del Estado',
      'Juzgar ocurre en audiencias preliminares y ejecutar durante el juicio oral',
      'No hay diferencia real: es el mismo juez con dos denominaciones distintas',
    ],
    correct: 0,
    explanation:
      'El juez de conocimiento determina responsabilidad y, si corresponde, impone sanción; el de ejecución parte de una sentencia ya ejecutoriada y controla la legalidad de su cumplimiento.',
    wrong: [
      '',
      'La Fiscalía investiga y acusa; no juzga.',
      'Las audiencias preliminares corresponden al juez de garantías y el juicio oral al de conocimiento.',
      'Son competencias distintas.',
    ],
  }),

  // LO-PEN-016 -------------------------------------------------------------
  question({
    id: 'Q-PEN-016-1',
    objectiveId: 'LO-PEN-016',
    title: 'Las tres quintas partes',
    topic: 'Ejecución de penas',
    subtopic: 'Libertad condicional',
    anchor: 'pen-s42-respuesta',
    questionType: 'application',
    difficulty: 'media',
    question: '¿Cumplir 3/5 de la pena da libertad automática?',
    options: [
      'Sí: es el único requisito que exige la ley para concederla',
      'No: es un requisito importante, pero hay otros y una valoración judicial',
      'Sí, salvo que existan sanciones disciplinarias en el establecimiento',
      'No, porque ese porcentaje corresponde a la prisión domiciliaria',
    ],
    correct: 1,
    explanation:
      'El cumplimiento de las tres quintas partes es un requisito importante, pero no el único: deben verificarse los demás requisitos legales y la valoración que corresponde al juez.',
    wrong: [
      'No es el único requisito.',
      '',
      'La respuesta no se reduce a una sola condición adicional.',
      'El artículo 64 se refiere a la libertad condicional.',
    ],
  }),
  question({
    id: 'Q-PEN-016-2',
    objectiveId: 'LO-PEN-016',
    title: 'Otros requisitos del artículo 64',
    topic: 'Ejecución de penas',
    subtopic: 'Libertad condicional',
    anchor: 'pen-s42-condicional',
    questionType: 'recall',
    difficulty: 'media',
    question: '¿Cuál de estos elementos exige el artículo 64 además del tiempo cumplido?',
    options: [
      'Arraigo familiar y social de la persona condenada',
      'Haber aceptado los cargos en la audiencia de imputación',
      'Que la conducta punible haya sido de modalidad culposa',
      'Que la víctima manifieste su conformidad con la salida',
    ],
    correct: 0,
    explanation:
      'Exige, entre otros elementos, adecuado desempeño y comportamiento durante el tratamiento penitenciario y arraigo familiar y social, además de los requisitos de reparación o garantía salvo los supuestos legales.',
    wrong: [
      '',
      'La aceptación de cargos no es un requisito del artículo 64.',
      'La modalidad de la conducta no es el criterio que fija esa norma.',
      'La conformidad de la víctima no es el requisito legal previsto.',
    ],
  }),
  question({
    id: 'Q-PEN-016-3',
    objectiveId: 'LO-PEN-016',
    title: 'Redención de pena',
    topic: 'Ejecución de penas',
    subtopic: 'Redención',
    anchor: 'pen-s43-redencion',
    questionType: 'recall',
    difficulty: 'media',
    question: '¿Qué permite la redención de pena?',
    options: [
      'Extinguir la condena de forma directa y sin verificación posterior',
      'Sustituir la pena privativa de la libertad por una sanción económica',
      'Redimir parte de la pena con actividades legalmente reconocidas y certificadas',
      'Suspender la actuación penal antes de que se dicte la sentencia de fondo',
    ],
    correct: 2,
    explanation:
      'La legislación penitenciaria permite redimir parte de la pena mediante actividades como trabajo, estudio o enseñanza, sujetas a certificación y evaluación. El juez de ejecución la reconoce al verificar los requisitos.',
    wrong: [
      'La redención exige verificación de requisitos por el juez de ejecución.',
      'La redención no consiste en una conversión económica de la pena.',
      '',
      'La redención opera durante la ejecución de una condena, no antes de la sentencia.',
    ],
  }),
];
