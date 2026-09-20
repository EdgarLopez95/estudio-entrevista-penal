import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { ALL_RESOURCES_INCLUDING_UNVERIFIED, QUESTIONS, RESOURCES } from './index';
import { LEARNING_OBJECTIVES, LEVEL_1_OBJECTIVES, DEFAULT_LEVEL_1_SEQUENCE } from './objectives';
import { buildCoverageMatrix, validateCoverage } from './coverage';
import { SOURCE_MANIFEST, allAnchors, trace } from './sources/traceability';
import { HARD_PROMPT_IDS, PENAL_ESSENTIAL_OBJECTIVE_IDS, TOP_10_PROMPT_IDS } from './collections';

/** Misma regla de normalización que `scripts/verify-excerpts.mjs`, documentada en ese archivo. */
function canonicalize(text: string): string {
  return text
    .normalize('NFC')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s{0,3}(?:>\s?)+/, '')
        .replace(/^\s{0,3}#{1,6}\s+/, '')
        .replace(/^\s{0,3}[-*+]\s+/, '')
        .replace(/^\s{0,3}\d+\.\s+/, ''),
    )
    .join('\n')
    .replace(/\*\*|__/g, '')
    .replace(/[*_`]/g, '')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

describe('manifiesto de fuentes', () => {
  it('conserva el SHA-256 declarado en el contrato §2 para las cuatro fuentes', () => {
    for (const entry of Object.values(SOURCE_MANIFEST)) {
      const buffer = readFileSync(entry.relativePath);
      const hash = createHash('sha256').update(buffer).digest('hex').toUpperCase();
      expect(hash, `${entry.id} cambió respecto del manifiesto`).toBe(entry.sha256);
    }
  });
});

describe('trazabilidad de fragmentos', () => {
  const sources = {
    PENAL_MD: canonicalize(readFileSync(SOURCE_MANIFEST.PENAL_MD.relativePath, 'utf8')),
    ENTREVISTA_MD: canonicalize(readFileSync(SOURCE_MANIFEST.ENTREVISTA_MD.relativePath, 'utf8')),
  } as Record<string, string>;

  it('cada fragmento existe literalmente en su fuente y su hash coincide', () => {
    const anchors = allAnchors();
    expect(anchors.length).toBeGreaterThan(200);
    for (const anchor of anchors) {
      const ref = trace(anchor);
      const canonical = canonicalize(ref.sourceExcerpt);
      expect(sources[ref.sourceId], `fuente desconocida en ${anchor}`).toBeDefined();
      expect(sources[ref.sourceId].includes(canonical), `${anchor} no aparece en la fuente`).toBe(
        true,
      );
      const hash = createHash('sha256').update(canonical, 'utf8').digest('hex');
      expect(ref.sourceExcerptHash, `hash incorrecto en ${anchor}`).toBe(hash);
    }
  });

  it('todo recurso publicado es verified y trazable', () => {
    expect(RESOURCES.length).toBeGreaterThan(80);
    for (const resource of RESOURCES) {
      expect(resource.reviewStatus).toBe('verified');
      expect(resource.sourceExcerptHash).toHaveLength(64);
      expect(resource.sourceSection.length).toBeGreaterThan(3);
      expect(resource.contentVersion).toBeTruthy();
    }
  });

  it('no publica recursos con reviewStatus distinto de verified', () => {
    const blocked = ALL_RESOURCES_INCLUDING_UNVERIFIED.filter((r) => r.reviewStatus !== 'verified');
    for (const resource of blocked) {
      expect(RESOURCES.find((r) => r.id === resource.id)).toBeUndefined();
    }
  });
});

describe('LearningObjectives y Apéndice A', () => {
  it('reproduce exactamente los 32 objetivos Nivel 1 del Apéndice A', () => {
    const interview = LEVEL_1_OBJECTIVES.filter((o) => o.track === 'interview');
    const penal = LEVEL_1_OBJECTIVES.filter((o) => o.track === 'penal');
    const cross = LEVEL_1_OBJECTIVES.filter((o) => o.track === 'cross-track');
    expect(interview).toHaveLength(12);
    expect(penal).toHaveLength(17);
    expect(cross).toHaveLength(3);
    expect(interview.map((o) => o.id)).toEqual([
      'LO-INT-001',
      'LO-INT-002',
      'LO-INT-003',
      'LO-INT-004',
      'LO-INT-005',
      'LO-INT-006',
      'LO-INT-007',
      'LO-INT-008',
      'LO-INT-009',
      'LO-INT-010',
      'LO-INT-011',
      'LO-INT-012',
    ]);
    expect(penal[0].id).toBe('LO-PEN-001');
    expect(penal.at(-1)?.id).toBe('LO-PEN-017');
    expect(cross.map((o) => o.id)).toEqual(['LO-X-001', 'LO-X-002', 'LO-X-003']);
  });

  it('usa ids únicos y todos los objetivos declaran nivel y fuente', () => {
    const ids = LEARNING_OBJECTIVES.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const objective of LEARNING_OBJECTIVES) {
      expect(objective.level).toBeDefined();
      expect(objective.source.sourceExcerptHash).toHaveLength(64);
      expect(objective.sourceSummary).toBeTruthy();
    }
  });

  it('la secuencia por defecto empieza por entrevista y experiencia real, no por teoría penal', () => {
    expect(DEFAULT_LEVEL_1_SEQUENCE[0]).toBe('LO-INT-001');
    expect(DEFAULT_LEVEL_1_SEQUENCE[1]).toBe('LO-INT-002');
    expect(DEFAULT_LEVEL_1_SEQUENCE[2]).toBe('LO-INT-003');
    expect(DEFAULT_LEVEL_1_SEQUENCE[3]).toBe('LO-X-001');
    const firstPenalIndex = DEFAULT_LEVEL_1_SEQUENCE.findIndex((id) => id.startsWith('LO-PEN-'));
    expect(firstPenalIndex).toBeGreaterThan(3);
    // Todos los objetivos Nivel 1 aparecen exactamente una vez.
    expect(new Set(DEFAULT_LEVEL_1_SEQUENCE).size).toBe(DEFAULT_LEVEL_1_SEQUENCE.length);
    expect(DEFAULT_LEVEL_1_SEQUENCE).toHaveLength(LEVEL_1_OBJECTIVES.length);
  });
});

describe('Coverage Matrix', () => {
  it('no tiene hallazgos críticos ni importantes', () => {
    const issues = validateCoverage();
    const blocking = issues.filter((i) => i.severity !== 'mejora');
    expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0);
  });

  it('todo objetivo crítico tiene contenido y práctica', () => {
    for (const row of buildCoverageMatrix()) {
      if (row.objective.priority !== 'critical') continue;
      expect(row.hasContent, `${row.objective.id} sin contenido`).toBe(true);
      expect(row.hasPractice, `${row.objective.id} sin práctica`).toBe(true);
    }
  });

  it('cada objetivo Penal Nivel 1 tiene entre 2 y 4 preguntas útiles, u oral', () => {
    for (const row of buildCoverageMatrix()) {
      const { objective } = row;
      if (objective.level !== 1 || objective.track !== 'penal') continue;
      if (row.questions.length === 0) {
        expect(row.prompts.length, `${objective.id} sin preguntas ni prompt`).toBeGreaterThan(0);
        continue;
      }
      expect(row.questions.length, `${objective.id}`).toBeGreaterThanOrEqual(2);
      expect(row.questions.length, `${objective.id}`).toBeLessThanOrEqual(4);
    }
  });
});

describe('calidad de las preguntas (contrato §12.3)', () => {
  it('una sola mejor respuesta, opciones únicas y explicación presente', () => {
    for (const question of QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      const ids = question.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(question.correctOptionId);
      expect(question.explanation.trim().length).toBeGreaterThan(10);
    }
  });

  it('no usa "todas las anteriores" ni dobles negaciones evidentes', () => {
    for (const question of QUESTIONS) {
      for (const option of question.options) {
        expect(option.text.toLowerCase()).not.toContain('todas las anteriores');
        expect(option.text.toLowerCase()).not.toContain('ninguna de las anteriores');
      }
    }
  });

  it('la respuesta correcta no se puede deducir por ser la más larga', () => {
    // Pista fuerte: la correcta es estrictamente la más larga y supera a la segunda en +20%.
    let strongCue = 0;
    const offenders: string[] = [];
    for (const question of QUESTIONS) {
      const lengths = question.options.map((o) => o.text.length).sort((a, b) => b - a);
      const correct = question.options.find((o) => o.id === question.correctOptionId);
      if (!correct) continue;
      const second = lengths[1] ?? 0;
      if (correct.text.length === lengths[0] && correct.text.length > second * 1.2) {
        strongCue += 1;
        offenders.push(question.id);
      }
    }
    expect(offenders, 'la longitud delata la respuesta correcta').toEqual([]);
    expect(strongCue).toBe(0);
  });

  it('la respuesta correcta no está siempre en la misma posición', () => {
    const positions = new Map<string, number>();
    for (const question of QUESTIONS) {
      positions.set(
        question.correctOptionId,
        (positions.get(question.correctOptionId) ?? 0) + 1,
      );
    }
    const max = Math.max(...positions.values());
    expect(max / QUESTIONS.length).toBeLessThan(0.55);
  });

  it('el questionScope de cada pregunta coincide con su objetivo y nivel', () => {
    for (const question of QUESTIONS) {
      expect(question.questionScope.objectiveId).toBe(question.learningObjectiveId);
      expect(question.questionScope.level).toBe(question.level);
      expect(question.questionScope.track).toBe(question.track);
    }
  });
});

describe('colecciones derivadas', () => {
  it('Top 10 son los diez prompts del mini simulacro fuente y todos existen', () => {
    expect(TOP_10_PROMPT_IDS).toHaveLength(10);
    for (const id of TOP_10_PROMPT_IDS) {
      const prompt = RESOURCES.find((r) => r.id === id);
      expect(prompt, `${id} no existe`).toBeDefined();
      expect(prompt?.level).toBe(1);
      expect(prompt?.type).toBe('interview-prompt');
    }
  });

  it('Preguntas difíciles son personales, de Nivel 1 y respaldadas por ENTREVISTA_MD o cross-track', () => {
    for (const id of HARD_PROMPT_IDS) {
      const prompt = RESOURCES.find((r) => r.id === id);
      expect(prompt, `${id} no existe`).toBeDefined();
      expect(prompt?.level).toBe(1);
      expect(['interview', 'cross-track']).toContain(prompt?.track);
    }
  });

  it('Penal esencial tiene entre 12 y 18 objetivos Nivel 1', () => {
    expect(PENAL_ESSENTIAL_OBJECTIVE_IDS.length).toBeGreaterThanOrEqual(12);
    expect(PENAL_ESSENTIAL_OBJECTIVE_IDS.length).toBeLessThanOrEqual(18);
  });
});
