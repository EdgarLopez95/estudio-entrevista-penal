import type { StudyResource } from './types';
import { RESOURCES, STARS } from '@/content';
import { LEARNING_OBJECTIVES } from '@/content/objectives';

/**
 * Normalización de búsqueda (contrato §21): ignora mayúsculas y tildes cuando conviene,
 * de modo que "habeas" encuentra "hábeas corpus".
 */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type SearchGroup = 'objetivos' | 'entrevista' | 'penal' | 'flashcards' | 'casos' | 'star' | 'referencia';

export interface SearchHit {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  /** Ruta de la aplicación a la que navega el resultado. */
  href: string;
  level: StudyResource['level'];
  score: number;
}

interface IndexEntry extends Omit<SearchHit, 'score'> {
  haystack: string;
}

function groupFor(resource: StudyResource): SearchGroup {
  if (resource.level === 'reference') return 'referencia';
  switch (resource.type) {
    case 'interview-prompt':
      return 'entrevista';
    case 'star-story':
      return 'star';
    case 'flashcard':
      return 'flashcards';
    case 'case':
      return 'casos';
    case 'checklist':
      return 'referencia';
    default:
      return 'penal';
  }
}

function hrefFor(resource: StudyResource): string {
  switch (resource.type) {
    case 'interview-prompt':
      return `/entrevista/prompt/${resource.id}`;
    case 'star-story':
      return `/entrevista/star/${resource.id}`;
    case 'lesson':
      return `/penal/leccion/${resource.id}`;
    case 'question':
      return `/practica/pregunta/${resource.id}`;
    case 'flashcard':
      return `/flashcards?card=${resource.id}`;
    case 'case':
      return `/casos/${resource.id}`;
    case 'checklist':
      return `/referencia?item=${resource.id}`;
    default:
      return '/';
  }
}

function textOf(resource: StudyResource): string {
  const parts: string[] = [resource.title, resource.topic, resource.subtopic, ...resource.tags];
  switch (resource.type) {
    case 'interview-prompt':
      parts.push(
        resource.prompt,
        resource.ideaThatMustLand,
        ...resource.keyPoints.map((k) => k.text),
        ...resource.followUps.map((f) => f.prompt),
      );
      break;
    case 'lesson':
      parts.push(resource.essentialIdea, ...resource.whatToRemember, ...resource.explanation);
      break;
    case 'question':
      parts.push(resource.question, ...resource.options.map((o) => o.text), resource.explanation);
      break;
    case 'flashcard':
      parts.push(resource.front, resource.back);
      break;
    case 'case':
      parts.push(resource.facts, resource.legalProblem, ...resource.steps.map((s) => s.prompt));
      break;
    case 'star-story':
      parts.push(resource.situation, resource.action, resource.result, ...resource.usefulFor);
      break;
    case 'checklist':
      parts.push(resource.intro, ...resource.items.map((i) => i.text));
      break;
  }
  return normalize(parts.join(' '));
}

const INDEX: IndexEntry[] = [
  ...LEARNING_OBJECTIVES.map((objective) => ({
    id: objective.id,
    group: 'objetivos' as SearchGroup,
    title: objective.title,
    subtitle: `${objective.track === 'penal' ? 'Penal' : objective.track === 'interview' ? 'Entrevista' : 'Cross-track'} · ${
      objective.level === 'reference' ? 'Referencia' : `Nivel ${objective.level}`
    }`,
    href: `/ruta/${objective.id}`,
    level: objective.level,
    haystack: normalize(
      [objective.id, objective.title, objective.sourceSummary, objective.practiceMode].join(' '),
    ),
  })),
  ...RESOURCES.map((resource) => ({
    id: resource.id,
    group: groupFor(resource),
    title: resource.type === 'interview-prompt' ? resource.prompt : resource.title,
    subtitle: `${resource.topic} · ${resource.subtopic}`,
    href: hrefFor(resource),
    level: resource.level,
    haystack: textOf(resource),
  })),
  ...STARS.map((star) => ({
    id: `${star.id}-usos`,
    group: 'star' as SearchGroup,
    title: star.title,
    subtitle: `Sirve para: ${star.competencies.join(', ')}`,
    href: `/entrevista/star/${star.id}`,
    level: star.level,
    haystack: normalize([star.title, ...star.competencies, ...star.usefulFor].join(' ')),
  })),
];

export const GROUP_LABEL: Record<SearchGroup, string> = {
  objetivos: 'Objetivos',
  entrevista: 'Entrevista',
  penal: 'Penal',
  flashcards: 'Flashcards',
  casos: 'Casos',
  star: 'Historias STAR',
  referencia: 'Referencia',
};

export const GROUP_ORDER: SearchGroup[] = [
  'objetivos',
  'entrevista',
  'penal',
  'flashcards',
  'casos',
  'star',
  'referencia',
];

export interface SearchOptions {
  /** Máximo inicial por grupo; el resto queda tras "Ver más". */
  perGroup?: number;
  includeReference?: boolean;
}

export function search(query: string, options: SearchOptions = {}): Record<SearchGroup, SearchHit[]> {
  const perGroup = options.perGroup ?? 4;
  const normalized = normalize(query);
  const result = Object.fromEntries(GROUP_ORDER.map((g) => [g, [] as SearchHit[]])) as Record<
    SearchGroup,
    SearchHit[]
  >;
  if (normalized.length < 2) return result;

  const terms = normalized.split(' ').filter(Boolean);
  const hits: SearchHit[] = [];
  for (const entry of INDEX) {
    if (!options.includeReference && entry.group === 'referencia' && entry.level === 'reference') {
      // La referencia sigue disponible, pero no compite en los primeros resultados.
    }
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      const index = entry.haystack.indexOf(term);
      if (index === -1) {
        matchedAll = false;
        break;
      }
      score += index === 0 ? 3 : 1;
      if (normalize(entry.title).includes(term)) score += 4;
    }
    if (!matchedAll) continue;
    if (entry.level === 1) score += 2;
    if (entry.level === 'reference') score -= 1;
    hits.push({
      id: entry.id,
      group: entry.group,
      title: entry.title,
      subtitle: entry.subtitle,
      href: entry.href,
      level: entry.level,
      score,
    });
  }

  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  const seen = new Set<string>();
  for (const hit of hits) {
    const key = `${hit.group}:${hit.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result[hit.group].push(hit);
  }
  for (const group of GROUP_ORDER) {
    result[group] = result[group].slice(0, perGroup * 4);
  }
  return result;
}

export function flattenHits(
  grouped: Record<SearchGroup, SearchHit[]>,
  perGroup: number,
): SearchHit[] {
  const flat: SearchHit[] = [];
  for (const group of GROUP_ORDER) {
    flat.push(...grouped[group].slice(0, perGroup));
  }
  return flat;
}

export function totalHits(grouped: Record<SearchGroup, SearchHit[]>): number {
  return GROUP_ORDER.reduce((total, group) => total + grouped[group].length, 0);
}
