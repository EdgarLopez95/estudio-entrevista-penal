import type { StarStory } from '@/domain/types';
import { base } from '../helpers';

/**
 * Las cinco historias STAR de `ENTREVISTA_MD §42`. No hay más: son atajos cognitivos
 * reutilizables, no guiones que memorizar (contrato §12.5).
 */
export const STAR_STORIES: StarStory[] = [
  {
    ...base(
      {
        id: 'STAR-A',
        title: 'Más de 200 trámites acumulados en Juzgado Tercero',
        topic: 'Historias STAR',
        subtopic: 'Logro / iniciativa',
        track: 'interview',
        level: 1,
        priority: 'high',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-012',
        difficulty: 'media',
        anchor: 'ent-s42-a',
        tags: ['star', 'logro', 'volumen', 'organización'],
      },
      'star-story',
    ),
    type: 'star-story',
    situation: 'Más de 200 trámites acumulados en Juzgado Tercero.',
    task: 'Poner al día los cierres y paz y salvos pendientes.',
    action: 'Revisar expedientes, proyectar actuaciones y evacuar el acumulado durante tu permanencia.',
    result: 'Trabajo completado, buenos comentarios y posteriores oportunidades de reemplazo.',
    learning:
      'No fue solamente sacar volumen: implicaba revisar cada expediente y verificar que el trámite correspondiera correctamente.',
    competencies: ['logro', 'iniciativa', 'organización', 'volumen', 'disciplina'],
    usefulFor: [
      'Cuéntame de un logro del que estés orgullosa',
      'Preguntas de organización y volumen de trabajo',
      'Por qué deberíamos contratarte (evidencia de resultados)',
    ],
    servesPromptIds: ['P-INT-007', 'P-INT-009', 'P-INT-012'],
  },
  {
    ...base(
      {
        id: 'STAR-B',
        title: 'Tutela fuera de término y conversación con el juez',
        topic: 'Historias STAR',
        subtopic: 'Error / aprendizaje',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-012',
        difficulty: 'media',
        anchor: 'ent-s42-b',
        tags: ['star', 'error', 'accountability', 'aprendizaje'],
      },
      'star-story',
    ),
    type: 'star-story',
    situation:
      'Una tutela quedó fuera de término al inicio de una experiencia por una inducción insuficiente.',
    task: 'Asumir el error y solucionar la situación.',
    action:
      'Hablaste con el juez, reconociste el error, solucionaste y reforzaste control de términos.',
    result: 'Mantuvo su confianza y después asumiste mayores responsabilidades.',
    learning:
      'Reconocer rápido un error y corregir el proceso es mucho más importante que intentar ocultarlo.',
    competencies: ['error', 'fracaso', 'accountability', 'resiliencia', 'aprendizaje'],
    usefulFor: [
      'Cuéntame de un error que hayas cometido',
      'Cómo reaccionas ante una crítica',
      'Qué harías si te equivocas en una audiencia',
    ],
    servesPromptIds: ['P-INT-006', 'P-INT-012'],
  },
  {
    ...base(
      {
        id: 'STAR-C',
        title: 'Juez que cuestionó tu presencia frente a otros',
        topic: 'Historias STAR',
        subtopic: 'Conflicto con autoridad',
        track: 'interview',
        level: 1,
        priority: 'high',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-012',
        difficulty: 'media',
        anchor: 'ent-s42-c',
        tags: ['star', 'conflicto', 'comunicación', 'autoridad'],
      },
      'star-story',
    ),
    type: 'star-story',
    situation: 'Un juez cuestionó fuertemente tu presencia en el juzgado frente a otros.',
    action:
      'Mantuviste tono respetuoso, explicaste el origen institucional de tu práctica y no respondiste de forma agresiva.',
    result: 'Manejaste la situación sin escalar el conflicto.',
    learning:
      'Comunicación asertiva no significa evitar un desacuerdo, sino saber expresarlo sin perder el respeto.',
    competencies: ['comunicación', 'conflicto', 'control emocional', 'autoridad'],
    usefulFor: [
      'Situación difícil con un superior',
      'Eres una persona conflictiva o muy directa',
      'Comunicación bajo presión',
    ],
    servesPromptIds: ['P-INT-012', 'P-INT-201'],
  },
  {
    ...base(
      {
        id: 'STAR-D',
        title: 'Volumen diario y plazos legales en TransUnion',
        topic: 'Historias STAR',
        subtopic: 'Presión y volumen',
        track: 'interview',
        level: 1,
        priority: 'critical',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-012',
        difficulty: 'media',
        anchor: 'ent-s42-d',
        tags: ['star', 'presión', 'términos', 'productividad'],
      },
      'star-story',
    ),
    type: 'star-story',
    situation: 'TransUnion, alto volumen diario y plazos legales.',
    action: 'Priorización por términos, revisión de antecedentes, coordinación con pares/revisores.',
    result: 'Capacidad sostenida de producir respuestas jurídicas en alto volumen.',
    competencies: ['presión', 'organización', 'productividad', 'deadline management'],
    usefulFor: [
      'Cómo manejas la presión y los plazos',
      'Cómo priorizas cuando tienes demasiado trabajo',
      'Qué pasa si aquí también hay mucha carga laboral',
    ],
    servesPromptIds: ['P-INT-007', 'P-INT-012'],
  },
  {
    ...base(
      {
        id: 'STAR-E',
        title: 'Contacto diario con población privada de la libertad',
        topic: 'Historias STAR',
        subtopic: 'Empatía / cliente difícil',
        track: 'interview',
        level: 1,
        priority: 'high',
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: 'LO-INT-012',
        difficulty: 'media',
        anchor: 'ent-s42-e',
        tags: ['star', 'empatía', 'comunicación', 'penal'],
      },
      'star-story',
    ),
    type: 'star-story',
    situation: 'Contacto diario con personas privadas de la libertad.',
    action: 'No te limitabas a entregar documentos; escuchabas dudas y explicabas su contenido.',
    result: 'Fortaleciste comunicación jurídica en lenguaje comprensible y empatía.',
    competencies: ['servicio al cliente', 'comunicación', 'Penal', 'trato humano'],
    usefulFor: [
      'Qué experiencia concreta tienes en Derecho Penal',
      'Cómo manejas un cliente difícil',
      'Por qué Derecho Penal (componente humano)',
    ],
    servesPromptIds: ['P-INT-002', 'P-INT-003', 'P-INT-012', 'P-INT-204'],
  },
];
