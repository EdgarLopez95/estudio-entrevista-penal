import type { ChecklistResource, Level, Priority, Track } from '@/domain/types';
import { base } from './helpers';
import { trace } from './sources/traceability';

interface ChecklistInput {
  id: string;
  title: string;
  topic: string;
  subtopic: string;
  track: Track;
  level: Level;
  priority: Priority;
  objectiveId: string;
  anchor: string;
  intro: string;
  items: { anchor: string; text: string }[];
  tags?: string[];
}

function checklist(input: ChecklistInput): ChecklistResource {
  return {
    ...base(
      {
        id: input.id,
        title: input.title,
        topic: input.topic,
        subtopic: input.subtopic,
        track: input.track,
        level: input.level,
        priority: input.priority,
        estimatedMinutes: 5,
        stage: 'initial',
        objectiveId: input.objectiveId,
        difficulty: 'intro',
        anchor: input.anchor,
        tags: input.tags ?? ['checklist'],
      },
      'checklist',
    ),
    type: 'checklist',
    intro: input.intro,
    items: input.items.map((item, index) => ({
      id: `i${index + 1}`,
      text: item.text,
      source: trace(item.anchor),
    })),
  };
}

export const CHECKLISTS: ChecklistResource[] = [
  /**
   * Repaso antes de salir exige "2-3 preguntas al despacho" (contrato §12.7). El contenido
   * pertenece al objetivo Nivel 2 LO-INT-210, pero es un recurso NO evaluado: no hay
   * correcto/incorrecto ni feedback que exija conocimiento superior, así que no vulnera
   * Study-Practice Alignment. Registrado en design/decisions.md.
   */
  checklist({
    id: 'CHK-DESPACHO',
    title: 'Tus preguntas al despacho',
    topic: 'Cierre de entrevista',
    subtopic: 'Preguntas al despacho',
    track: 'interview',
    level: 2,
    priority: 'high',
    objectiveId: 'LO-INT-210',
    anchor: 'ent-s41-intro',
    intro: 'En una entrevista corta no hagas diez. Elige dos o tres y márcalas aquí.',
    items: [
      {
        anchor: 'ent-s41-p1',
        text:
          '¿Qué tipo de asuntos penales manejaría principalmente la persona que ingrese y cómo sería un día normal en el cargo?',
      },
      {
        anchor: 'ent-s41-p2',
        text:
          'Para un abogado junior, ¿cómo funciona el acompañamiento o revisión de escritos y la preparación para audiencias?',
      },
      {
        anchor: 'ent-s41-p3',
        text:
          '¿La posición está más enfocada en investigación y redacción, atención de clientes, asistencia a audiencias o una combinación de las tres?',
      },
      {
        anchor: 'ent-s41-p4',
        text:
          '¿Qué esperan que la persona que ingrese pueda asumir de manera autónoma después de los primeros seis meses?',
      },
      {
        anchor: 'ent-s41-p5',
        text: '¿La posición se abrió por crecimiento del equipo o por reemplazo?',
      },
      {
        anchor: 'ent-s41-condiciones',
        text: '¿Me podrían contar el tipo de contrato, rango salarial y horario habitual de la posición?',
      },
    ],
    tags: ['checklist', 'repaso-final', 'preguntas-al-despacho'],
  }),
  checklist({
    id: 'CHK-NO-DECIR',
    title: 'Lo que no conviene decir',
    topic: 'Cambio laboral',
    subtopic: 'Frases a evitar',
    track: 'interview',
    level: 1,
    priority: 'high',
    objectiveId: 'LO-INT-005',
    anchor: 'ent-s43-lista',
    intro:
      'Repásalas una vez antes de salir. Son verdaderas en tu experiencia privada, pero no ayudan en la entrevista.',
    items: [
      { anchor: 'ent-s43-lista', text: '"Me siento como una máquina en TransUnion."' },
      { anchor: 'ent-s43-lista', text: '"Mis compañeros no hacen nada." / "Me explotan."' },
      { anchor: 'ent-s43-lista', text: '"Quiero salir de ahí como sea."' },
      {
        anchor: 'ent-s43-lista',
        text: '"Acepto cualquier cosa con tal de trabajar en Penal." / "Yo me sé todo de Penal."',
      },
      {
        anchor: 'ent-s43-lista',
        text: '"He litigado", si no puedes demostrar actuaciones reales como apoderada.',
      },
      {
        anchor: 'ent-s43-nose',
        text:
          'Decir "No sé" y quedarte ahí. Mejor: "No lo tengo totalmente presente; lo razonaría así… y verificaría la norma exacta".',
      },
      { anchor: 'ent-s43-inventar', text: 'Inventar artículos, jurisprudencia, cifras o experiencias.' },
    ],
    tags: ['checklist', 'repaso-final'],
  }),
  checklist({
    id: 'CHK-GANAR-TIEMPO',
    title: 'Frases para ganar un segundo',
    topic: 'Método',
    subtopic: 'Preguntas difíciles',
    track: 'cross-track',
    level: 1,
    priority: 'medium',
    objectiveId: 'LO-X-003',
    anchor: 'ent-s45-cierre',
    intro:
      'No hay obligación de contestar en el mismo segundo. Puedes usar cualquiera de estas con naturalidad.',
    items: [
      { anchor: 'ent-s45-frases', text: '"Déjame organizar la idea un segundo."' },
      { anchor: 'ent-s45-frase2', text: '"Creo que ahí separaría dos escenarios."' },
      { anchor: 'ent-s45-frase3', text: '"Lo primero que revisaría sería…"' },
    ],
    tags: ['checklist', 'repaso-final', 'método'],
  }),
  checklist({
    id: 'CHK-REF-ARTICULOS',
    title: 'Artículos ubicados (consulta)',
    topic: 'Referencia',
    subtopic: 'Artículos',
    track: 'penal',
    level: 'reference',
    priority: 'reference',
    objectiveId: 'LO-REF-001',
    anchor: 'pen-s58-aviso',
    intro:
      'No es necesario recitarlos, pero reconocerlos da seguridad. Esta sección es consulta: no entra en el plan ni en los indicadores.',
    items: [
      { anchor: 'pen-s58-penal', text: 'Código Penal, Ley 599 de 2000: artículos 9 a 12, 21-25, 27, 29-32, 63, 64 y 83 y ss.' },
      {
        anchor: 'pen-s58-procedimiento',
        text:
          'Código de Procedimiento Penal, Ley 906 de 2004: artículos 153-154, 286 y ss., 296-302, 308, 313, 336, 337, 339 y ss., 355-356, 371-381 y 459 y ss.',
      },
      { anchor: 'pen-s58-otras', text: 'Ley 1095 de 2006: hábeas corpus. Ley 65 de 1993: Código Penitenciario y Carcelario.' },
    ],
    tags: ['checklist', 'referencia'],
  }),
  checklist({
    id: 'CHK-REF-NORMAS',
    title: 'Estructura del Derecho Penal (consulta)',
    topic: 'Referencia',
    subtopic: 'Normas centrales',
    track: 'penal',
    level: 'reference',
    priority: 'reference',
    objectiveId: 'LO-REF-002',
    anchor: 'pen-s2-sustancial',
    intro: 'Las tres preguntas que ordenan el área y la norma principal de cada una.',
    items: [
      {
        anchor: 'pen-s2-sustancial',
        text:
          'Sustancial: ¿existe una conducta punible y quién puede responder por ella? Ley 599 de 2000 — Código Penal.',
      },
      {
        anchor: 'pen-s2-procesal',
        text:
          'Procesal: ¿cómo investiga, acusa, defiende, prueba y decide el Estado? Ley 906 de 2004 — Código de Procedimiento Penal.',
      },
      {
        anchor: 'pen-s2-penitenciario',
        text:
          'Penitenciario y ejecución: ¿cómo se ejecuta la sentencia y qué decisiones corresponden después de la condena?',
      },
    ],
    tags: ['checklist', 'referencia'],
  }),
];
