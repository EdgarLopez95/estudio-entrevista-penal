import type {
  Difficulty,
  EstimatedMinutes,
  Flashcard,
  Lesson,
  Level,
  Priority,
  Question,
  QuestionType,
} from '@/domain/types';
import { base } from '../helpers';

/**
 * Penal Nivel 2 y Nivel 3 (P0-B). Cada objetivo tiene lección + flashcard, y Nivel 2 añade una
 * pregunta por objetivo. Nada de esto entra en Core Readiness ni se muestra como deuda
 * (contrato §8.2, §14).
 */

interface UnitInput {
  objectiveId: string;
  level: 2 | 3;
  priority: Priority;
  topic: string;
  subtopic: string;
  title: string;
  anchor: string;
  minutes?: EstimatedMinutes;
  essentialIdea: string;
  explanation: string[];
  whatToRemember: string[];
  difference?: { a: string; b: string; distinction: string };
  card: { front: string; back: string; anchor?: string };
  question?: {
    anchor?: string;
    questionType: QuestionType;
    difficulty: Difficulty;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    wrong: string[];
  };
}

const OPTION_IDS = ['a', 'b', 'c', 'd'];

function suffix(objectiveId: string): string {
  return objectiveId.replace('LO-PEN-', '');
}

function buildUnit(input: UnitInput): {
  lesson: Lesson;
  card: Flashcard;
  question?: Question;
} {
  const code = suffix(input.objectiveId);
  const level: Level = input.level;
  const questionId = `Q-PEN-${code}-1`;

  const lesson: Lesson = {
    ...base(
      {
        id: `L-PEN-${code}`,
        title: input.title,
        topic: input.topic,
        subtopic: input.subtopic,
        track: 'penal',
        level,
        priority: input.priority,
        estimatedMinutes: input.minutes ?? 5,
        stage: 'technical',
        objectiveId: input.objectiveId,
        difficulty: 'media',
        anchor: input.anchor,
        tags: [`nivel${input.level}`],
      },
      'lesson',
    ),
    type: 'lesson',
    essentialIdea: input.essentialIdea,
    explanation: input.explanation,
    whatToRemember: input.whatToRemember,
    ...(input.difference ? { difference: input.difference } : {}),
    checkQuestionIds: input.question ? [questionId] : [],
  };

  const card: Flashcard = {
    ...base(
      {
        id: `F-PEN-${code}-1`,
        title: input.card.front,
        topic: input.topic,
        subtopic: input.subtopic,
        track: 'penal',
        level,
        priority: input.priority,
        estimatedMinutes: 2,
        stage: 'technical',
        objectiveId: input.objectiveId,
        difficulty: 'media',
        anchor: input.card.anchor ?? input.anchor,
        tags: [`nivel${input.level}`, 'flashcard'],
      },
      'flashcard',
    ),
    type: 'flashcard',
    front: input.card.front,
    back: input.card.back,
  };

  let question: Question | undefined;
  if (input.question) {
    const q = input.question;
    const options = q.options.map((text, index) => ({ id: OPTION_IDS[index], text }));
    const wrongAnswerExplanations: Record<string, string> = {};
    q.wrong.forEach((text, index) => {
      if (index !== q.correct && text) wrongAnswerExplanations[OPTION_IDS[index]] = text;
    });
    question = {
      ...base(
        {
          id: questionId,
          title: input.title,
          topic: input.topic,
          subtopic: input.subtopic,
          track: 'penal',
          level,
          priority: input.priority,
          estimatedMinutes: 2,
          stage: 'technical',
          objectiveId: input.objectiveId,
          difficulty: q.difficulty,
          anchor: q.anchor ?? input.anchor,
          tags: [`nivel${input.level}`],
        },
        'question',
      ),
      type: 'question',
      questionType: q.questionType,
      question: q.question,
      options,
      correctOptionId: OPTION_IDS[q.correct],
      explanation: q.explanation,
      wrongAnswerExplanations,
      questionScope: { track: 'penal', level, objectiveId: input.objectiveId },
    };
  }

  return { lesson, card, ...(question ? { question } : {}) };
}

const UNITS: UnitInput[] = [
  {
    objectiveId: 'LO-PEN-201',
    level: 2,
    priority: 'high',
    topic: 'Teoría del delito',
    subtopic: 'Ausencia de responsabilidad',
    title: 'Causales de ausencia de responsabilidad',
    anchor: 'pen-s10-causales',
    essentialIdea:
      'El artículo 32 reúne varias causales: para entrevista basta reconocerlas y explicar bien legítima defensa y estado de necesidad.',
    explanation: [
      'Entre las causales se reconocen caso fortuito o fuerza mayor; consentimiento válidamente emitido cuando el bien jurídico sea disponible; estricto cumplimiento de un deber legal; cumplimiento de orden legítima de autoridad competente dentro de los límites legales; ejercicio legítimo de un derecho, actividad lícita o cargo público; legítima defensa; estado de necesidad; insuperable coacción ajena y miedo insuperable.',
      'Legítima defensa: actuar para defender un derecho propio o ajeno frente a una agresión injusta, actual o inminente, dentro de los requisitos de necesidad y proporcionalidad que exige el ordenamiento.',
      'Estado de necesidad: actuar para proteger un derecho propio o ajeno frente a un peligro actual o inminente que no puede evitarse de otra forma, bajo las condiciones establecidas por la ley.',
    ],
    whatToRemember: [
      'No recitar solo "agresión injusta": añadir actualidad o inminencia, necesidad y proporcionalidad',
      'El estado de necesidad exige que el peligro no pueda evitarse de otra forma',
    ],
    card: {
      front: '¿Qué es la legítima defensa?',
      back:
        'Causal de ausencia de responsabilidad: defender un derecho propio o ajeno frente a una agresión injusta, actual o inminente, con necesidad y proporcionalidad.',
      anchor: 'pen-s10-legitima',
    },
    question: {
      anchor: 'pen-s10-legitima',
      questionType: 'distinction',
      difficulty: 'media',
      question: '¿Qué elementos debe incluir una explicación completa de legítima defensa?',
      options: [
        'Que exista una agresión injusta, sin ningún elemento adicional',
        'Agresión injusta, actual o inminente, con necesidad y proporcionalidad',
        'Que la persona agredida no registre antecedentes penales previos',
        'Que la agresión haya sido denunciada antes ante la autoridad',
      ],
      correct: 1,
      explanation:
        'No basta recitar "agresión injusta": la figura exige actualidad o inminencia y los requisitos de necesidad y proporcionalidad que exige el ordenamiento.',
      wrong: [
        'Es una explicación incompleta.',
        '',
        'Los antecedentes no integran la causal.',
        'La denuncia previa no es un requisito de la causal.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-202',
    level: 2,
    priority: 'medium',
    topic: 'Teoría del delito',
    subtopic: 'Inimputabilidad',
    title: 'Inimputabilidad',
    anchor: 'pen-s11-inimputabilidad',
    essentialIdea:
      'Inimputable es quien al ejecutar la conducta típica y antijurídica no podía comprender su ilicitud o determinarse conforme a esa comprensión.',
    explanation: [
      'Las causas son las reconocidas legalmente.',
      'Inimputabilidad no significa automáticamente que "no pasó nada": el ordenamiento contempla medidas de seguridad y un tratamiento jurídico distinto.',
    ],
    whatToRemember: [
      'Dos capacidades: comprender la ilicitud o determinarse conforme a ella',
      'Existen medidas de seguridad y un tratamiento jurídico distinto',
    ],
    card: {
      front: '¿Qué significa que una persona sea inimputable?',
      back:
        'Que al ejecutar la conducta típica y antijurídica no tenía capacidad de comprender su ilicitud o de determinarse de acuerdo con esa comprensión, por causas reconocidas legalmente.',
    },
    question: {
      anchor: 'pen-s11-noconfundir',
      questionType: 'application',
      difficulty: 'media',
      question: '¿Qué consecuencia tiene declarar la inimputabilidad?',
      options: [
        'Que la actuación termina sin ninguna consecuencia jurídica posible',
        'Que se aplica de forma automática la pena mínima prevista por la ley',
        'Que se contemplan medidas de seguridad y un tratamiento jurídico distinto',
        'Que el asunto pasa de inmediato al juez de ejecución de penas y medidas',
      ],
      correct: 2,
      explanation:
        'Inimputabilidad no significa que "no pasó nada": el ordenamiento contempla medidas de seguridad y un tratamiento jurídico distinto.',
      wrong: [
        'No equivale a ausencia de consecuencias jurídicas.',
        'No opera como una regla de dosificación de la pena.',
        '',
        'El juez de ejecución interviene cuando existe condena ejecutoriada.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-203',
    level: 2,
    priority: 'medium',
    topic: 'Proceso penal',
    subtopic: 'Noticia criminal',
    title: 'Denuncia y querella',
    anchor: 'pen-s13-respuesta',
    minutes: 2,
    essentialIdea:
      'La querella funciona como requisito de procedibilidad para determinados delitos y debe presentarla quien esté legitimado.',
    explanation: [
      'La noticia criminal es la información que pone en conocimiento de la autoridad la posible comisión de una conducta punible y puede llegar por diferentes vías.',
      'Ambas pueden poner hechos en conocimiento de la autoridad, pero la querella opera como requisito de procedibilidad, salvo las excepciones legales.',
    ],
    whatToRemember: [
      'Denuncia: comunicación de hechos que pueden constituir delito',
      'Querella: requisito de procedibilidad para determinados delitos, presentada por quien está legitimado',
    ],
    difference: {
      a: 'Denuncia',
      b: 'Querella',
      distinction: 'La querella es requisito de procedibilidad y exige legitimación.',
    },
    card: {
      front: '¿Denuncia y querella son lo mismo?',
      back:
        'No. La querella funciona como requisito de procedibilidad para determinados delitos y debe presentarla quien esté legitimado, salvo excepciones legales.',
    },
    question: {
      questionType: 'distinction',
      difficulty: 'media',
      question: '¿Qué caracteriza a la querella frente a la denuncia?',
      options: [
        'Que únicamente puede presentarse ante un juez de la República',
        'Que es requisito de procedibilidad y la presenta quien está legitimado',
        'Que suspende los términos de la investigación mientras se resuelve',
        'Que obliga a solicitar una medida de aseguramiento en el caso',
      ],
      correct: 1,
      explanation:
        'La querella funciona como requisito de procedibilidad para determinados delitos y debe presentarla quien esté legitimado, salvo las excepciones legales.',
      wrong: [
        'La vía de presentación no es el rasgo que la distingue.',
        '',
        'No opera como una causal de suspensión de términos.',
        'No tiene relación con la imposición de medidas cautelares.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-204',
    level: 2,
    priority: 'high',
    topic: 'Proceso penal',
    subtopic: 'Sujetos',
    title: 'Indiciado, imputado, acusado y condenado',
    anchor: 'pen-s14-respuesta',
    essentialIdea:
      'El estado procesal determina derechos, cargas, actos procesales posibles y la etapa de la persecución penal.',
    explanation: [
      'Indiciado: persona respecto de la cual existen actuaciones de indagación pero aún no se le ha formulado imputación.',
      'Imputado: la calidad surge a partir de la formulación de imputación o de los eventos que la ley equipara.',
      'Acusado: persona respecto de quien la Fiscalía ha presentado y formulado acusación. Condenado: persona frente a la cual existe sentencia condenatoria en los términos legales.',
    ],
    whatToRemember: [
      'Cada calidad corresponde a un momento del proceso',
      'La calidad determina derechos y actos procesales posibles',
    ],
    card: {
      front: '¿Por qué importa distinguir indiciado, imputado, acusado y condenado?',
      back:
        'Porque el estado procesal determina derechos, cargas, actos procesales posibles y la etapa en la que se encuentra la persecución penal.',
    },
    question: {
      anchor: 'pen-s14-sujetos',
      questionType: 'recall',
      difficulty: 'media',
      question: '¿Quién es indiciado?',
      options: [
        'La persona a la que ya se le formuló imputación ante el juez',
        'La persona con actuaciones de indagación y sin imputación aún',
        'La persona contra la que se presentó el escrito de acusación',
        'La persona frente a la cual existe sentencia condenatoria firme',
      ],
      correct: 1,
      explanation:
        'Indiciado es la persona respecto de la cual existen actuaciones de indagación pero aún no se le ha formulado imputación.',
      wrong: [
        'Con la imputación la persona adquiere la calidad de imputado.',
        '',
        'Con la acusación adquiere la calidad de acusado.',
        'Con la sentencia condenatoria adquiere la calidad de condenado.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-205',
    level: 2,
    priority: 'high',
    topic: 'Proceso penal',
    subtopic: 'Hechos jurídicamente relevantes',
    title: 'Hechos jurídicamente relevantes',
    anchor: 'pen-s20-buena',
    essentialIdea:
      'Son los hechos concretos que permiten estructurar la hipótesis delictiva y que el procesado debe conocer para defenderse.',
    explanation: [
      'Contienen las circunstancias necesarias para encuadrar jurídicamente la conducta y permitir el ejercicio adecuado de defensa.',
      'No son una narración infinita del expediente, ni una lista de todas las pruebas, ni una conclusión jurídica sin hechos.',
    ],
    whatToRemember: [
      'Hechos concretos, no narración total del expediente',
      'Deben permitir encuadrar jurídicamente y ejercer defensa',
    ],
    card: {
      front: '¿Qué son los hechos jurídicamente relevantes?',
      back:
        'Hechos concretos que permiten estructurar la hipótesis delictiva y que el procesado debe conocer con claridad para poder ejercer su defensa.',
    },
    question: {
      anchor: 'pen-s20-hjr',
      questionType: 'application',
      difficulty: 'media',
      question: '¿Qué NO son los hechos jurídicamente relevantes?',
      options: [
        'Los hechos concretos que permiten encuadrar jurídicamente la conducta',
        'Una narración infinita del expediente o una conclusión sin hechos',
        'Las circunstancias que el procesado necesita para ejercer su defensa',
        'La base fáctica que permite estructurar la hipótesis delictiva',
      ],
      correct: 1,
      explanation:
        'No son una narración infinita del expediente, ni una lista de todas las pruebas, ni una conclusión jurídica sin hechos.',
      wrong: [
        'Eso sí son hechos jurídicamente relevantes.',
        '',
        'Eso sí son hechos jurídicamente relevantes.',
        'Eso sí son hechos jurídicamente relevantes.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-206',
    level: 2,
    priority: 'medium',
    topic: 'Proceso penal',
    subtopic: 'Acusación y descubrimiento',
    title: 'Audiencia de acusación y descubrimiento probatorio',
    anchor: 'pen-s23-descubrimiento',
    essentialIdea:
      'El descubrimiento busca que las partes conozcan oportunamente los elementos que se usarán y puedan contradecirlos.',
    explanation: [
      'En la audiencia de formulación de acusación pueden tratarse competencia, impedimentos y recusaciones, nulidades, observaciones al escrito, formulación de la acusación, reconocimiento de víctima e inicio o desarrollo del descubrimiento probatorio.',
      'La Fiscalía tiene deberes de descubrimiento que incluyen información favorable al acusado en los términos legales. Acusación no es juicio oral todavía.',
    ],
    whatToRemember: [
      'Acusación no es juicio oral todavía',
      'El descubrimiento garantiza contradicción, igualdad de armas y debido proceso',
    ],
    card: {
      front: '¿Por qué es importante el descubrimiento probatorio?',
      back:
        'Porque la defensa no puede ser sorprendida en juicio con material que debía haber sido descubierto previamente: es garantía de contradicción, igualdad de armas y debido proceso.',
      anchor: 'pen-s23-importancia',
    },
    question: {
      anchor: 'pen-s22-recuerda',
      questionType: 'distinction',
      difficulty: 'media',
      question: '¿La audiencia de formulación de acusación es el juicio oral?',
      options: [
        'Sí, es la primera sesión del juicio oral',
        'No: la acusación no es juicio oral todavía',
        'Sí, cuando el acusado acepta cargos',
        'No, porque el juicio oral ocurre antes de la acusación',
      ],
      correct: 1,
      explanation: 'Acusación no es juicio oral todavía.',
      wrong: [
        'Son momentos distintos del proceso.',
        '',
        'La aceptación de cargos no convierte la audiencia en juicio oral.',
        'El juicio oral es posterior a la acusación y a la preparatoria.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-207',
    level: 2,
    priority: 'medium',
    topic: 'Proceso penal',
    subtopic: 'Audiencia preparatoria',
    title: 'Audiencia preparatoria',
    anchor: 'pen-s24-corta',
    essentialIdea:
      'La preparatoria organiza probatoriamente el juicio: depura qué pruebas se practicarán y resuelve debates sobre admisión o exclusión.',
    explanation: [
      'Se revisa, entre otros, si el descubrimiento quedó completo, el descubrimiento de la defensa, la enunciación de pruebas, las estipulaciones probatorias, las solicitudes de prueba y los debates de pertinencia, admisibilidad y exclusión.',
      'Allí se define el material que llegará al juicio.',
    ],
    whatToRemember: [
      'Es una de las audiencias más importantes antes del juicio',
      'Define qué material probatorio llegará al juicio',
    ],
    card: {
      front: '¿Para qué sirve la audiencia preparatoria?',
      back:
        'Organiza probatoriamente el juicio: depura qué pruebas se practicarán y resuelve debates sobre su admisión o exclusión.',
    },
    question: {
      anchor: 'pen-s24-preparatoria',
      questionType: 'recall',
      difficulty: 'media',
      question: '¿Cuál de estos asuntos se resuelve en la audiencia preparatoria?',
      options: [
        'La valoración final de toda la prueba practicada en el juicio',
        'Los debates de pertinencia, admisibilidad y exclusión de prueba',
        'El control de legalidad de la captura de la persona procesada',
        'El reconocimiento de la redención de pena ya impuesta en firme',
      ],
      correct: 1,
      explanation:
        'En la preparatoria se revisan solicitudes de prueba y se resuelven debates de pertinencia, admisibilidad y exclusión.',
      wrong: [
        'La valoración final se hace en la sentencia.',
        '',
        'El control de legalidad de la captura es competencia del juez de garantías.',
        'La redención la reconoce el juez de ejecución.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-208',
    level: 2,
    priority: 'high',
    topic: 'Prueba',
    subtopic: 'EMP y prueba',
    title: 'EMP, evidencia física y prueba de juicio',
    anchor: 'pen-s26-frase',
    essentialIdea:
      'No todo elemento recogido durante la investigación es automáticamente prueba de juicio.',
    explanation: [
      'Antes del juicio se habla de elementos materiales probatorios, evidencia física e información legalmente obtenida.',
      'En sentido procesal estricto, la prueba adquiere esa calidad cuando se introduce y practica conforme a las reglas del juicio, con inmediación y contradicción, salvo figuras excepcionales como la prueba anticipada.',
    ],
    whatToRemember: [
      'EMP/evidencia: antes del juicio',
      'Prueba: introducida y practicada conforme a las reglas del juicio',
      'Excepción: prueba anticipada',
    ],
    difference: {
      a: 'EMP/evidencia',
      b: 'Prueba de juicio',
      distinction: 'La prueba debe incorporarse y practicarse conforme a reglas procesales.',
    },
    card: {
      front: '¿Todo elemento recogido en investigación es prueba de juicio?',
      back:
        'No. Debe ser incorporado y controvertido conforme a las reglas procesales, con inmediación y contradicción.',
    },
    question: {
      anchor: 'pen-s26-prueba',
      questionType: 'distinction',
      difficulty: 'media',
      question: '¿Cuándo un elemento adquiere la calidad de prueba en sentido procesal estricto?',
      options: [
        'Cuando la Fiscalía lo incorpora formalmente al expediente del caso',
        'Cuando se practica conforme al juicio, con inmediación y contradicción',
        'Cuando se recoge respetando íntegramente la cadena de custodia',
        'Cuando la defensa no formula oposición alguna a su recolección',
      ],
      correct: 1,
      explanation:
        'La prueba adquiere esa calidad al introducirse y practicarse conforme a las reglas del juicio, con inmediación y contradicción, salvo figuras excepcionales como la prueba anticipada.',
      wrong: [
        'La incorporación al expediente no equivale a práctica de la prueba en juicio.',
        '',
        'La cadena de custodia preserva identidad e integridad, pero no convierte el elemento en prueba de juicio.',
        'La ausencia de oposición no sustituye la práctica conforme a las reglas del juicio.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-209',
    level: 2,
    priority: 'medium',
    topic: 'Prueba',
    subtopic: 'Cadena de custodia',
    title: 'Cadena de custodia',
    anchor: 'pen-s27-cadena',
    essentialIdea:
      'Busca preservar identidad, integridad, autenticidad y condiciones de manejo de los elementos.',
    explanation: [
      'Cubre recolección, manejo, traslado, almacenamiento y análisis de los elementos.',
      'Una falla no hace automáticamente inexistente la evidencia: puede generar debates sobre autenticidad, integridad, credibilidad o valoración y, según el caso, sobre admisibilidad. Debe analizarse qué se rompió y qué efecto jurídico tiene.',
    ],
    whatToRemember: [
      'Preserva identidad, integridad y autenticidad',
      'Una falla no elimina automáticamente la evidencia: hay que analizar el efecto concreto',
    ],
    card: {
      front: '¿Una falla de cadena de custodia hace inexistente la evidencia?',
      back:
        'No automáticamente. Puede generar debates sobre autenticidad, integridad, credibilidad o valoración y, según el caso, sobre admisibilidad.',
      anchor: 'pen-s27-falla',
    },
    question: {
      anchor: 'pen-s27-falla',
      questionType: 'application',
      difficulty: 'media',
      question: 'Se alega una ruptura de cadena de custodia. ¿Cuál es la respuesta correcta?',
      options: [
        'La evidencia desaparece del proceso de forma automática',
        'Debe analizarse qué se rompió y qué efecto jurídico tiene',
        'La evidencia se mantiene sin consecuencia procesal alguna',
        'El asunto se remite al juez de ejecución de penas',
      ],
      correct: 1,
      explanation:
        'Debe analizarse concretamente qué se rompió y qué efecto jurídico tiene: autenticidad, integridad, credibilidad, valoración o admisibilidad.',
      wrong: [
        'No opera de forma automática.',
        '',
        'Sí puede haber consecuencias, según el caso.',
        'No es una cuestión de competencia del juez de ejecución.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-210',
    level: 2,
    priority: 'medium',
    topic: 'Prueba',
    subtopic: 'Cláusula de exclusión',
    title: 'Prueba ilícita y cláusula de exclusión',
    anchor: 'pen-s28-exclusion',
    essentialIdea:
      'Cuando un elemento se obtiene vulnerando derechos fundamentales debe analizarse la cláusula de exclusión y sus efectos sobre el material derivado.',
    explanation: [
      'El Código de Procedimiento Penal establece una cláusula de exclusión para prueba obtenida con violación de garantías fundamentales, en los términos constitucionales y legales.',
      'En entrevista no es necesario entrar en debates doctrinales entre "ilícita" e "ilegal" si no se piden.',
    ],
    whatToRemember: [
      'Cláusula de exclusión para prueba obtenida con violación de garantías fundamentales',
      'Analizar también los efectos sobre el material derivado, con sus reglas y excepciones',
    ],
    card: {
      front: '¿Qué pasa con un elemento obtenido vulnerando derechos fundamentales?',
      back:
        'Debe analizarse la cláusula de exclusión y los efectos que esa ilicitud pueda tener sobre el material derivado, según las reglas y excepciones del ordenamiento.',
      anchor: 'pen-s28-respuesta',
    },
    question: {
      anchor: 'pen-s28-respuesta',
      questionType: 'recall',
      difficulty: 'media',
      question: '¿Qué debe analizarse cuando la prueba se obtuvo con violación de garantías?',
      options: [
        'Únicamente la credibilidad del testigo que la aportó',
        'La cláusula de exclusión y el efecto sobre lo derivado',
        'La dosificación de la pena que correspondería imponer',
        'La competencia del juez de ejecución sobre el asunto',
      ],
      correct: 1,
      explanation:
        'Debe analizarse la cláusula de exclusión y los efectos que esa ilicitud pueda tener sobre el material derivado, según las reglas y excepciones reconocidas.',
      wrong: [
        'La credibilidad es un debate distinto del de exclusión.',
        '',
        'No es una cuestión de dosificación.',
        'No es una cuestión de competencia del juez de ejecución.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-211',
    level: 2,
    priority: 'medium',
    topic: 'Juicio',
    subtopic: 'Principios probatorios',
    title: 'Principios probatorios del juicio',
    anchor: 'pen-s29-inmediacion',
    essentialIdea:
      'Publicidad, contradicción, inmediación, concentración y oralidad rigen el juicio.',
    explanation: [
      'El juicio es público, salvo restricciones legalmente justificadas. Cada parte puede controvertir la evidencia y los medios de prueba de la contraparte.',
      'Inmediación: el juez que decide debe recibir y valorar la prueba practicada ante él, con las excepciones legales. El juicio busca desarrollarse con continuidad y unidad, y las principales actuaciones son orales.',
    ],
    whatToRemember: [
      'Inmediación: decide quien recibió la prueba',
      'Contradicción: cada parte puede controvertir la prueba de la contraparte',
    ],
    card: {
      front: '¿Qué exige el principio de inmediación?',
      back:
        'Que el juez que decide reciba y valore la prueba practicada ante él, con las excepciones legales.',
    },
    question: {
      questionType: 'recall',
      difficulty: 'media',
      question: '¿Qué principio exige que el juez que decide haya recibido la prueba?',
      options: ['Publicidad', 'Concentración', 'Inmediación', 'Oralidad'],
      correct: 2,
      explanation:
        'La inmediación exige que el juez que decide reciba y valore la prueba practicada ante él, con las excepciones legales.',
      wrong: [
        'La publicidad se refiere al carácter público del juicio.',
        'La concentración se refiere a continuidad y unidad del juicio.',
        '',
        'La oralidad se refiere a la forma de las actuaciones.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-212',
    level: 2,
    priority: 'medium',
    topic: 'Prueba',
    subtopic: 'Pertinencia y admisibilidad',
    title: 'Pertinencia y admisibilidad',
    anchor: 'pen-s30-pertinencia',
    essentialIdea:
      'Una prueba pertinente puede ser inadmisible: son dos filtros distintos.',
    explanation: [
      'Pertinencia: la prueba debe relacionarse con los hechos o circunstancias relevantes del caso o hacer más o menos probable un hecho jurídicamente importante.',
      'Admisibilidad: incluso una prueba pertinente puede restringirse cuando produzca grave perjuicio indebido, genere confusión, tenga escaso valor frente al efecto perjudicial, dilate injustificadamente o exista otra causal legal de exclusión o inadmisión.',
    ],
    whatToRemember: [
      'Pertinencia mira la relación con los hechos relevantes',
      'Admisibilidad mira restricciones legales aunque la prueba sea pertinente',
    ],
    difference: {
      a: 'Pertinencia',
      b: 'Admisibilidad',
      distinction: 'Relación con los hechos relevantes vs. restricciones legales a su ingreso.',
    },
    card: {
      front: '¿Puede una prueba pertinente ser inadmisible?',
      back:
        'Sí: puede restringirse cuando produzca grave perjuicio indebido, genere confusión, tenga escaso valor frente al efecto perjudicial, dilate injustificadamente o exista otra causal legal.',
      anchor: 'pen-s30-admisibilidad',
    },
    question: {
      anchor: 'pen-s30-admisibilidad',
      questionType: 'distinction',
      difficulty: 'media',
      question: '¿Qué analiza la admisibilidad que no analiza la pertinencia?',
      options: [
        'Si la prueba se relaciona con los hechos relevantes del caso',
        'Si hay restricciones legales a su ingreso aunque sea pertinente',
        'Si la persona que declara está diciendo o no la verdad',
        'Si la prueba fue recogida por la Fiscalía o por la defensa',
      ],
      correct: 1,
      explanation:
        'La admisibilidad analiza restricciones aunque la prueba sea pertinente: perjuicio indebido, confusión, escaso valor, dilación u otra causal legal.',
      wrong: [
        'Esa es la pertinencia.',
        '',
        'La credibilidad es un juicio de valoración distinto.',
        'El origen de la recolección no define la admisibilidad.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-213',
    level: 2,
    priority: 'medium',
    topic: 'Partes',
    subtopic: 'Víctima',
    title: 'Derechos de la víctima',
    anchor: 'pen-s35-victima',
    essentialIdea:
      'La víctima tiene derechos de información, participación, protección, verdad, justicia y reparación.',
    explanation: [
      'También tiene derecho a intervenir en momentos procesales definidos por la ley y la jurisprudencia.',
      'El abogado de víctima debe proteger sus intereses dentro del marco procesal, intervenir en los espacios reconocidos por la ley y asegurar que sus derechos sean considerados, sin sustituir las funciones constitucionales de la Fiscalía.',
    ],
    whatToRemember: [
      'La víctima no es una figura decorativa',
      'El abogado de víctima no sustituye a la Fiscalía',
    ],
    card: {
      front: '¿Cuál es el papel del abogado de víctima?',
      back:
        'Proteger los intereses de la víctima dentro del marco procesal e intervenir en los espacios reconocidos por la ley, sin sustituir las funciones constitucionales de la Fiscalía.',
      anchor: 'pen-s35-abogado',
    },
    question: {
      anchor: 'pen-s35-abogado',
      questionType: 'application',
      difficulty: 'media',
      question: '¿Qué NO puede hacer el abogado de víctima?',
      options: [
        'Intervenir en los espacios procesales reconocidos por la ley',
        'Sustituir las funciones constitucionales propias de la Fiscalía',
        'Procurar que se consideren verdad, justicia y reparación',
        'Proteger los intereses de la víctima en el marco procesal',
      ],
      correct: 1,
      explanation:
        'Debe actuar dentro del marco procesal sin sustituir las funciones constitucionales de la Fiscalía.',
      wrong: [
        'Sí puede hacerlo dentro del marco procesal.',
        '',
        'Sí puede hacerlo dentro del marco procesal.',
        'Sí puede hacerlo dentro del marco procesal.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-214',
    level: 2,
    priority: 'medium',
    topic: 'Partes',
    subtopic: 'Defensa técnica',
    title: 'Deberes de la defensa técnica',
    anchor: 'pen-s36-defensa',
    essentialIdea:
      'Conocer el expediente, guardar confidencialidad, asesorar con independencia, controvertir y proteger garantías, sin fabricar evidencia.',
    explanation: [
      'Toda persona investigada o procesada tiene derecho a defensa.',
      'El defensor debe conocer el expediente, guardar confidencialidad, asesorar de manera independiente, controvertir la teoría y prueba de la Fiscalía, proteger garantías, actuar éticamente y no fabricar evidencia ni inducir falsedad.',
    ],
    whatToRemember: [
      'Independencia y confidencialidad',
      'Nunca fabricar evidencia ni inducir falsedad',
    ],
    card: {
      front: '¿Cuáles son deberes centrales de la defensa técnica?',
      back:
        'Conocer el expediente, confidencialidad, asesoría independiente, controvertir la teoría y prueba de la Fiscalía, proteger garantías, actuar éticamente y no fabricar evidencia.',
    },
    question: {
      questionType: 'recall',
      difficulty: 'media',
      question: '¿Cuál de estas conductas está excluida de la defensa técnica?',
      options: [
        'Controvertir la prueba de la Fiscalía',
        'Asesorar de manera independiente',
        'Fabricar evidencia o inducir falsedad',
        'Guardar confidencialidad',
      ],
      correct: 2,
      explanation: 'El defensor no puede fabricar evidencia ni inducir falsedad.',
      wrong: ['Es un deber propio de la defensa.', 'Es un deber propio de la defensa.', '', 'Es un deber propio de la defensa.'],
    },
  },
  {
    objectiveId: 'LO-PEN-215',
    level: 2,
    priority: 'high',
    topic: 'Ejecución de penas',
    subtopic: 'Prisión domiciliaria',
    title: 'Prisión domiciliaria',
    anchor: 'pen-s40-domiciliaria',
    essentialIdea:
      'Es una forma sustitutiva de cumplimiento de la pena de prisión: sigue siendo privación de la libertad.',
    explanation: [
      'Procede cuando se cumplen los requisitos legales y no es lo mismo que detención domiciliaria preventiva, libertad condicional o suspensión de la ejecución de la pena.',
      'No significa libertad: se cumple en el lugar autorizado y bajo las condiciones y controles correspondientes.',
    ],
    whatToRemember: [
      'Es sustitutiva del cumplimiento, no una libertad',
      'No confundir con detención domiciliaria preventiva ni con libertad condicional',
    ],
    difference: {
      a: 'Prisión domiciliaria',
      b: 'Libertad condicional',
      distinction:
        'La primera sigue siendo privación de libertad; la segunda supone libertad sometida a condiciones.',
    },
    card: {
      front: '¿Prisión domiciliaria significa libertad?',
      back:
        'No. Sigue siendo una pena privativa de la libertad, aunque se cumple en el lugar autorizado y bajo condiciones y controles.',
      anchor: 'pen-s40-respuesta',
    },
    question: {
      anchor: 'pen-s59-domiciliaria-condicional',
      questionType: 'distinction',
      difficulty: 'media',
      question: '¿Cuál es la diferencia básica entre prisión domiciliaria y libertad condicional?',
      options: [
        'La primera sigue siendo privación de libertad; la segunda es libertad condicionada',
        'La primera la concede la Fiscalía y la segunda corresponde decidirla al juez',
        'La primera exige cumplir 3/5 de la pena y la segunda no exige tiempo previo',
        'No hay diferencia práctica: ambas permiten salir del establecimiento penitenciario',
      ],
      correct: 0,
      explanation:
        'La prisión domiciliaria sigue siendo privación de la libertad; la libertad condicional supone libertad sometida a condiciones.',
      wrong: [
        '',
        'No se distinguen por la autoridad que las concede.',
        'El requisito de las 3/5 partes corresponde a la libertad condicional.',
        'Son figuras distintas y no deben mezclarse.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-216',
    level: 2,
    priority: 'medium',
    topic: 'Ejecución de penas',
    subtopic: 'Suspensión',
    title: 'Suspensión de la ejecución de la pena',
    anchor: 'pen-s41-suspension',
    essentialIdea:
      'Procede bajo requisitos objetivos y subjetivos; uno central es que la pena impuesta no exceda el límite del artículo 63, actualmente cuatro años.',
    explanation: [
      'Además existen las demás condiciones y exclusiones legales.',
      'No debe confundirse con la libertad condicional: la suspensión opera bajo una estructura distinta y se analiza al imponer o ejecutar la sentencia según el caso.',
    ],
    whatToRemember: [
      'Límite del artículo 63: actualmente cuatro años',
      'No confundir con libertad condicional',
    ],
    card: {
      front: '¿Cuál es el límite central de pena para la suspensión de la ejecución?',
      back:
        'Que la pena impuesta no exceda el límite previsto por el artículo 63, actualmente cuatro años, además de las demás condiciones y exclusiones legales.',
    },
    question: {
      questionType: 'recall',
      difficulty: 'media',
      question:
        'Según el artículo 63, ¿cuál es actualmente el límite de pena para la suspensión de la ejecución?',
      options: ['Dos años', 'Tres años', 'Cuatro años', 'Cinco años'],
      correct: 2,
      explanation:
        'Uno de los requisitos centrales es que la pena impuesta no exceda el límite del artículo 63, actualmente cuatro años.',
      wrong: [
        'El límite actual del artículo 63 es más alto.',
        'El límite actual del artículo 63 es más alto.',
        '',
        'El límite actual del artículo 63 es más bajo.',
      ],
    },
  },
  {
    objectiveId: 'LO-PEN-217',
    level: 2,
    priority: 'high',
    topic: 'Principios',
    subtopic: 'Presunción de inocencia',
    title: 'Presunción de inocencia e in dubio pro reo',
    anchor: 'pen-s4-presuncion',
    essentialIdea:
      'La carga de probar la acusación no corresponde al acusado, y la duda razonable se resuelve en su favor.',
    explanation: [
      'Toda persona se presume inocente mientras no exista decisión judicial que establezca su responsabilidad.',
      'Si al momento de decidir permanece una duda razonable sobre la responsabilidad penal, debe resolverse en favor del acusado.',
    ],
    whatToRemember: [
      'La carga de la prueba no es del acusado',
      'La duda razonable se resuelve en favor del acusado',
    ],
    card: {
      front: '¿Qué dice el in dubio pro reo?',
      back:
        'Que si al momento de decidir permanece una duda razonable sobre la responsabilidad penal, debe resolverse en favor del acusado.',
      anchor: 'pen-s4-indubio',
    },
    question: {
      anchor: 'pen-s4-indubio',
      questionType: 'application',
      difficulty: 'media',
      question: 'Al momento de decidir permanece una duda razonable. ¿Qué corresponde?',
      options: [
        'Absolver o resolver en favor del acusado',
        'Condenar con la pena mínima',
        'Devolver el caso a la Fiscalía para nueva investigación',
        'Imponer medida de aseguramiento hasta aclarar la duda',
      ],
      correct: 0,
      explanation: 'La duda razonable debe resolverse en favor del acusado.',
      wrong: [
        '',
        'La duda no habilita una condena atenuada.',
        'La duda al decidir no se resuelve devolviendo la actuación.',
        'La medida de aseguramiento es cautelar y no sirve para superar la duda al decidir.',
      ],
    },
  },
  // ------------------------------- Nivel 3 -------------------------------
  {
    objectiveId: 'LO-PEN-301',
    level: 3,
    priority: 'medium',
    topic: 'Teoría del delito',
    subtopic: 'Concurso',
    title: 'Concurso de conductas punibles',
    anchor: 'pen-s9-concurso',
    essentialIdea:
      'Hay concurso cuando una misma acción u omisión infringe varias disposiciones, o varias acciones infringen una o varias.',
    explanation: [
      'No debe confundirse concurso de delitos con coautoría o participación.',
      'El primero se refiere a pluralidad de infracciones; el segundo, a pluralidad de personas o formas de intervención.',
    ],
    whatToRemember: [
      'Concurso = pluralidad de infracciones',
      'Coautoría/participación = pluralidad de personas o formas de intervención',
    ],
    difference: {
      a: 'Concurso de delitos',
      b: 'Coautoría o participación',
      distinction: 'Pluralidad de infracciones vs. pluralidad de personas o formas de intervención.',
    },
    card: {
      front: 'Concurso de delitos y coautoría: ¿qué los distingue?',
      back:
        'El concurso se refiere a pluralidad de infracciones; la coautoría o participación, a pluralidad de personas o formas de intervención.',
      anchor: 'pen-s9-clave',
    },
  },
  {
    objectiveId: 'LO-PEN-302',
    level: 3,
    priority: 'medium',
    topic: 'Teoría del delito',
    subtopic: 'Omisión',
    title: 'Posición de garante',
    anchor: 'pen-s6-garante',
    essentialIdea:
      'No cualquier omisión genera responsabilidad: debe existir un deber jurídico de impedir el resultado.',
    explanation: [
      'El Código contempla supuestos de posición de garante: asumir voluntariamente protección; comunidad estrecha de vida; actividad riesgosa emprendida conjuntamente; y creación previa de una situación antijurídica de riesgo.',
      'Debe analizarse el deber de garante y los elementos del tipo correspondiente.',
    ],
    whatToRemember: [
      'Se requiere deber jurídico concreto y posibilidad de actuar',
      'No toda omisión genera responsabilidad penal',
    ],
    card: {
      front: '¿No actuar puede generar responsabilidad penal?',
      back:
        'Sí, cuando existe un deber jurídico de impedir el resultado y la persona, pudiendo hacerlo, omite actuar. Debe analizarse el deber de garante y los elementos del tipo.',
      anchor: 'pen-s6-respuesta',
    },
  },
  {
    objectiveId: 'LO-PEN-303',
    level: 3,
    priority: 'medium',
    topic: 'Proceso penal',
    subtopic: 'Terminación anticipada',
    title: 'Preclusión',
    anchor: 'pen-s32-preclusion',
    minutes: 2,
    essentialIdea:
      'Termina la persecución penal respecto de los hechos y la persona y, en firme, produce efectos de cosa juzgada.',
    explanation: [
      'Procede por causales legales.',
      'Es una terminación anticipada del proceso cuando se configura una causal legal que impide continuar válidamente la persecución penal.',
    ],
    whatToRemember: [
      'Requiere causal legal',
      'En firme produce efectos de cosa juzgada',
    ],
    difference: {
      a: 'Preclusión',
      b: 'Absolución',
      distinction:
        'La preclusión termina anticipadamente; la absolución normalmente resulta del juzgamiento.',
    },
    card: {
      front: '¿Qué es la preclusión?',
      back:
        'Terminación anticipada del proceso cuando se configura una causal legal que impide continuar válidamente la persecución penal.',
      anchor: 'pen-s32-concepto',
    },
  },
  {
    objectiveId: 'LO-PEN-304',
    level: 3,
    priority: 'medium',
    topic: 'Proceso penal',
    subtopic: 'Política criminal',
    title: 'Principio de oportunidad',
    anchor: 'pen-s33-oportunidad',
    essentialIdea:
      'Facultad reglada de la Fiscalía para suspender, interrumpir o renunciar a la persecución penal en supuestos legales.',
    explanation: [
      'Opera bajo control judicial cuando corresponda.',
      'No es "la Fiscalía perdona lo que quiera": está sujeto a causales legales, política criminal, control, derechos de víctimas y límites expresos.',
    ],
    whatToRemember: [
      'Es una facultad reglada, no discrecional',
      'Tiene control y límites expresos',
    ],
    card: {
      front: '¿Qué es el principio de oportunidad?',
      back:
        'Facultad reglada de la Fiscalía para suspender, interrumpir o renunciar a la persecución penal en determinados supuestos legales y bajo control judicial cuando corresponda.',
    },
  },
  {
    objectiveId: 'LO-PEN-305',
    level: 3,
    priority: 'medium',
    topic: 'Proceso penal',
    subtopic: 'Terminación anticipada',
    title: 'Preacuerdos y aceptación de cargos',
    anchor: 'pen-s34-preacuerdos',
    essentialIdea:
      'Instrumentos de terminación anticipada con participación de la defensa y control del juez.',
    explanation: [
      'Permiten una terminación anticipada mediante acuerdos o aceptación en los términos regulados por la Ley 906.',
      'No son negociaciones completamente libres: deben respetar garantías fundamentales y límites legales.',
    ],
    whatToRemember: [
      'Debe existir defensor y control judicial',
      'No son negociaciones libres',
    ],
    card: {
      front: '¿Qué son los preacuerdos?',
      back:
        'Instrumentos de terminación anticipada entre Fiscalía e imputado o acusado, con participación de la defensa y control del juez, respetando garantías y límites legales.',
    },
  },
  {
    objectiveId: 'LO-PEN-306',
    level: 3,
    priority: 'medium',
    topic: 'Proceso penal',
    subtopic: 'Nulidades',
    title: 'Nulidad',
    anchor: 'pen-s46-nulidad',
    essentialIdea:
      'No toda irregularidad genera nulidad: debe existir afectación sustancial que la justifique.',
    explanation: [
      'Debe analizarse afectación real de garantías, trascendencia, posibilidad de saneamiento y los principios que gobiernan las nulidades.',
    ],
    whatToRemember: [
      'Afectación sustancial y trascendencia',
      'Posibilidad de saneamiento',
    ],
    card: {
      front: '¿Toda irregularidad genera nulidad?',
      back:
        'No. Debe existir una afectación sustancial que justifique retrotraer o invalidar la actuación conforme a los principios legales.',
    },
  },
  {
    objectiveId: 'LO-PEN-307',
    level: 3,
    priority: 'medium',
    topic: 'Proceso penal',
    subtopic: 'Recursos',
    title: 'Recursos básicos',
    anchor: 'pen-s47-recursos',
    minutes: 2,
    essentialIdea:
      'La reposición busca que el mismo funcionario reconsidere; la apelación, revisión por el superior funcional.',
    explanation: [
      'En el sistema oral muchos recursos se interponen y sustentan en audiencia.',
    ],
    whatToRemember: [
      'Reposición: mismo funcionario',
      'Apelación: superior funcional, en los casos previstos',
    ],
    difference: {
      a: 'Reposición',
      b: 'Apelación',
      distinction: 'Reconsideración por el mismo funcionario vs. revisión por el superior funcional.',
    },
    card: {
      front: 'Reposición y apelación: ¿cuál es la diferencia?',
      back:
        'La reposición busca que el mismo funcionario reconsidere su decisión; la apelación, revisión por el superior funcional en los casos previstos.',
      anchor: 'pen-s47-apelacion',
    },
  },
  {
    objectiveId: 'LO-PEN-308',
    level: 3,
    priority: 'medium',
    topic: 'Proceso penal',
    subtopic: 'Prescripción',
    title: 'Prescripción',
    anchor: 'pen-s45-prescripcion',
    essentialIdea:
      'Puede extinguirse la potestad de perseguir penalmente; la prescripción de la pena opera bajo reglas diferentes.',
    explanation: [
      'Si piden un cálculo exacto, no se improvisa: la fórmula depende del delito, pena máxima, actos interruptivos o suspensivos y reglas especiales.',
      'En entrevista se explica el concepto y se dice que se verificaría el artículo aplicable para el cálculo.',
    ],
    whatToRemember: [
      'Prescripción de la acción y prescripción de la pena son distintas',
      'No improvisar cálculos',
    ],
    card: {
      front: 'Te piden calcular una prescripción exacta. ¿Qué respondes?',
      back:
        'Que la fórmula depende del delito, pena máxima, actos interruptivos o suspensivos y reglas especiales; se explica el concepto y se verifica el artículo aplicable.',
      anchor: 'pen-s45-calculo',
    },
  },
];

const BUILT = UNITS.map(buildUnit);

export const PENAL_LESSONS_LEVEL_2_3: Lesson[] = BUILT.map((b) => b.lesson);
export const PENAL_FLASHCARDS_LEVEL_2_3: Flashcard[] = BUILT.map((b) => b.card);
export const PENAL_QUESTIONS_LEVEL_2: Question[] = BUILT.map((b) => b.question).filter(
  (q): q is Question => Boolean(q),
);
