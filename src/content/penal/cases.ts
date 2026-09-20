import type { CaseResource, Level } from '@/domain/types';
import { base } from '../helpers';
import { trace } from '../sources/traceability';

interface CaseInput {
  id: string;
  title: string;
  subtopic: string;
  objectiveId: string;
  level: Level;
  anchorFacts: string;
  facts: string;
  legalProblem: string;
  missingInfo: { anchor: string; items: string[] };
  figure: { anchor: string; prompt: string; items: string[] };
  analysis: { anchor: string; prompt: string; items: string[] };
  preliminaryConclusion: string;
  tags?: string[];
}

/**
 * Casos abiertos: análisis por elementos. Ningún paso finge sentencia ni se marca
 * correcto/incorrecto; los "Elementos que debías considerar" salen exclusivamente de la
 * fuente (contrato §12.4).
 */
function buildCase(input: CaseInput): CaseResource {
  return {
    ...base(
      {
        id: input.id,
        title: input.title,
        topic: 'Casos',
        subtopic: input.subtopic,
        track: 'penal',
        level: input.level,
        priority: input.level === 1 ? 'high' : 'medium',
        estimatedMinutes: 10,
        stage: 'technical',
        objectiveId: input.objectiveId,
        difficulty: 'alta',
        anchor: input.anchorFacts,
        tags: input.tags ?? ['caso'],
      },
      'case',
    ),
    type: 'case',
    facts: input.facts,
    legalProblem: input.legalProblem,
    steps: [
      {
        id: 'hechos',
        kind: 'open',
        label: 'Hechos',
        prompt:
          'Ordena los hechos: qué pasó exactamente, quién hizo qué, cuándo, dónde, con qué medio y a quién.',
        elementsToConsider: [
          { id: 'h1', text: '¿Qué pasó exactamente?' },
          { id: 'h2', text: '¿Quién hizo qué?' },
          { id: 'h3', text: '¿Cuándo? ¿Dónde? ¿Con qué medio? ¿A quién?' },
        ],
      },
      {
        id: 'problema',
        kind: 'open',
        label: 'Problema jurídico',
        prompt: 'Formula el problema jurídico que plantea el caso, sin adelantar la conclusión.',
        elementsToConsider: [{ id: 'p1', text: input.legalProblem }],
      },
      {
        id: 'faltante',
        kind: 'open',
        label: 'Información faltante',
        prompt: '¿Qué información te falta para poder analizar el caso con responsabilidad?',
        elementsToConsider: input.missingInfo.items.map((text, index) => ({
          id: `f${index + 1}`,
          text,
        })),
      },
      {
        id: 'figura',
        kind: 'open',
        label: 'Figura aplicable',
        prompt: input.figure.prompt,
        elementsToConsider: input.figure.items.map((text, index) => ({
          id: `g${index + 1}`,
          text,
        })),
      },
      {
        id: 'analisis',
        kind: 'open',
        label: 'Análisis',
        prompt: input.analysis.prompt,
        elementsToConsider: input.analysis.items.map((text, index) => ({
          id: `a${index + 1}`,
          text,
        })),
      },
      {
        id: 'conclusion',
        kind: 'open',
        label: 'Conclusión preliminar',
        prompt:
          'Enuncia una conclusión preliminar y di expresamente qué verificarías antes de afirmar algo más.',
        elementsToConsider: [
          { id: 'c1', text: input.preliminaryConclusion },
          {
            id: 'c2',
            text:
              'Para una actuación real siempre debe verificarse el texto vigente de la norma y la jurisprudencia aplicable.',
          },
        ],
      },
    ],
    preliminaryConclusion: input.preliminaryConclusion,
  };
}

export const PENAL_CASES: CaseResource[] = [
  buildCase({
    id: 'C-PEN-002',
    title: 'Tentativa de homicidio o lesiones',
    subtopic: 'Tentativa',
    objectiveId: 'LO-PEN-005',
    level: 1,
    anchorFacts: 'pen-s50-hipotesis',
    facts: 'Una persona ataca a otra con arma blanca y la víctima sobrevive.',
    legalProblem:
      '¿El hecho se analiza como tentativa de homicidio o como lesiones? No basta con mirar el resultado.',
    missingInfo: {
      anchor: 'pen-s50-analizar',
      items: [
        'Intención inferible',
        'Zona del cuerpo atacada',
        'Arma utilizada',
        'Número e intensidad de ataques',
        'Expresiones previas y comportamiento posterior',
        'Contexto',
        'Idoneidad de los actos',
        'Prueba disponible',
      ],
    },
    figure: {
      anchor: 'pen-s7-tentativa',
      prompt: '¿Qué figura aplicarías y qué elementos exige?',
      items: [
        'Tentativa: inicio de ejecución con actos idóneos e inequívocamente dirigidos a consumar',
        'La consumación no ocurre por circunstancias ajenas a la voluntad del agente',
        'Los actos preparatorios no equivalen al inicio de ejecución',
      ],
    },
    analysis: {
      anchor: 'pen-s50-idea',
      prompt: 'Analiza el caso por elementos, sin concluir prematuramente.',
      items: [
        'La diferencia puede depender, entre otros elementos, de la intención demostrable y las circunstancias objetivas',
      ],
    },
    preliminaryConclusion:
      'Con la información disponible no puede afirmarse la calificación: dependería de la intención demostrable y de las circunstancias objetivas acreditadas.',
    tags: ['caso', 'tentativa'],
  }),
  buildCase({
    id: 'C-PEN-003',
    title: 'Legalidad de una captura',
    subtopic: 'Captura',
    objectiveId: 'LO-PEN-009',
    level: 1,
    anchorFacts: 'pen-s51-hipotesis',
    facts:
      'La Policía captura a una persona varias horas después de un hurto porque un testigo dice reconocerla.',
    legalProblem: '¿La captura fue legal? El análisis de legalidad es distinto del de culpabilidad.',
    missingInfo: {
      anchor: 'pen-s51-preguntar',
      items: [
        '¿Existía orden judicial?',
        'Si alegan flagrancia, ¿qué modalidad?',
        '¿Hubo inmediatez?',
        '¿Cómo ocurrió la individualización?',
        '¿Qué elementos conectan a la persona con el hecho?',
        '¿Cuándo fue puesta ante juez?',
        '¿Se respetaron derechos del capturado?',
      ],
    },
    figure: {
      anchor: 'pen-s16-captura',
      prompt: '¿Qué exige la captura como regla general y cuál es la excepción?',
      items: [
        'Regla general: orden escrita de juez de control de garantías',
        'Excepción legal: flagrancia',
        'Máximo de 36 horas para poner a disposición del juez, para control de legalidad',
      ],
    },
    analysis: {
      anchor: 'pen-s51-cierre',
      prompt: 'Analiza la legalidad sin pronunciarte sobre responsabilidad.',
      items: ['El análisis de legalidad de captura es distinto del análisis de culpabilidad'],
    },
    preliminaryConclusion:
      'Faltan datos determinantes: sin conocer si existía orden, qué modalidad de flagrancia se alega, si hubo inmediatez y cuándo fue puesta ante el juez, no puede afirmarse la legalidad ni la ilegalidad.',
    tags: ['caso', 'captura'],
  }),
  buildCase({
    id: 'C-PEN-004',
    title: 'Solicitud de detención intramural',
    subtopic: 'Medida de aseguramiento',
    objectiveId: 'LO-PEN-011',
    level: 1,
    anchorFacts: 'pen-s52-hipotesis',
    facts: 'Fiscalía demuestra inferencia razonable de participación y pide detención intramural.',
    legalProblem:
      '¿Procede la medida solicitada? No basta con decir que si hay evidencia, la persona va a la cárcel.',
    missingInfo: {
      anchor: 'pen-s52-preguntar',
      items: [
        '¿Qué elementos sostienen la inferencia razonable?',
        '¿Qué finalidad del artículo 308 se invoca?',
        '¿Riesgo de obstrucción?',
        '¿Peligro para víctima o comunidad?',
        '¿Riesgo de no comparecer?',
        '¿Es necesaria? ¿Es proporcional?',
        '¿Procede detención intramural para ese delito?',
        '¿Hay medida menos restrictiva suficiente?',
      ],
    },
    figure: {
      anchor: 'pen-s21-requisitos',
      prompt: '¿Qué exige el artículo 308?',
      items: [
        'Inferencia razonable de autoría o participación con elementos obtenidos legalmente',
        'Una finalidad constitucional o procesal concreta',
        'La detención preventiva intramural tiene requisitos específicos de procedencia',
      ],
    },
    analysis: {
      anchor: 'pen-s21-medida',
      prompt: 'Analiza necesidad y proporcionalidad antes de concluir.',
      items: ['La medida de aseguramiento no es una pena anticipada'],
    },
    preliminaryConclusion:
      'La inferencia razonable no basta: habría que verificar la finalidad invocada, la necesidad, la proporcionalidad y si procede la detención intramural para ese delito.',
    tags: ['caso', 'medida de aseguramiento'],
  }),
  buildCase({
    id: 'C-PEN-005',
    title: 'Solicitud de libertad condicional',
    subtopic: 'Libertad condicional',
    objectiveId: 'LO-PEN-016',
    level: 1,
    anchorFacts: 'pen-s53-hipotesis',
    facts: 'Una persona ya cumplió 3/5 de la pena.',
    legalProblem: '¿Procede la libertad condicional? No es automática.',
    missingInfo: {
      anchor: 'pen-s53-revisar',
      items: [
        'Tiempo cumplido',
        'Redenciones reconocidas',
        'Conducta penitenciaria',
        'Arraigo',
        'Reparación o garantía en los términos aplicables',
        'Exclusiones legales',
        'Valoración judicial',
      ],
    },
    figure: {
      anchor: 'pen-s42-condicional',
      prompt: '¿Qué exige el artículo 64?',
      items: [
        'Haber cumplido 3/5 partes de la pena',
        'Adecuado desempeño y comportamiento durante el tratamiento penitenciario',
        'Arraigo familiar y social',
        'Requisitos relacionados con reparación o garantía, salvo los supuestos legales',
      ],
    },
    analysis: {
      anchor: 'pen-s42-respuesta',
      prompt: 'Explica por qué el tiempo cumplido no resuelve el caso.',
      items: [
        'El cumplimiento de las tres quintas partes es un requisito importante, pero no es el único',
      ],
    },
    preliminaryConclusion:
      'Con el solo cumplimiento de las 3/5 partes no puede concederse: deben verificarse los demás requisitos legales y la valoración que corresponde al juez.',
    tags: ['caso', 'libertad condicional', 'ejecución'],
  }),
  buildCase({
    id: 'C-PEN-201',
    title: 'Riña y legítima defensa',
    subtopic: 'Ausencia de responsabilidad',
    objectiveId: 'LO-PEN-201',
    level: 2,
    anchorFacts: 'pen-s49-hipotesis',
    facts: 'A golpea a B. B responde usando fuerza y causa una lesión grave.',
    legalProblem:
      '¿Puede excluirse la responsabilidad de B por legítima defensa? No basta con que A pegara primero.',
    missingInfo: {
      anchor: 'pen-s49-analizar',
      items: [
        '¿Quién inició la agresión?',
        '¿La agresión era actual o inminente?',
        '¿La respuesta buscaba defender un derecho?',
        '¿Era necesaria?',
        '¿Hubo exceso?',
        '¿Qué lesiones existen y con qué incapacidad o secuela?',
        '¿Qué prueba hay: testigos, videos, historia clínica, peritaje?',
      ],
    },
    figure: {
      anchor: 'pen-s10-legitima',
      prompt: '¿Qué exige la legítima defensa?',
      items: [
        'Defender un derecho propio o ajeno frente a una agresión injusta, actual o inminente',
        'Dentro de los requisitos de necesidad y proporcionalidad que exige el ordenamiento',
      ],
    },
    analysis: {
      anchor: 'pen-s49-nunca',
      prompt: 'Evita la respuesta simplificada y analiza por elementos.',
      items: ['Nunca respondas "Es legítima defensa porque él pegó primero": es demasiado simple'],
    },
    preliminaryConclusion:
      'No puede afirmarse la legítima defensa sin analizar actualidad o inminencia de la agresión, necesidad, proporcionalidad y un posible exceso, con la prueba disponible.',
    tags: ['caso', 'legítima defensa', 'nivel2'],
  }),
];

/** Prioridad inicial de casos declarada por el contrato §12.4. */
export const CASE_PRIORITY_ORDER = ['C-PEN-201', 'C-PEN-002', 'C-PEN-003', 'C-PEN-004', 'C-PEN-005'];

/** Aviso permanente del corpus jurídico (contrato §1). */
export const LEGAL_NOTICE = trace('pen-aviso');
