import { beforeEach, describe, expect, it } from 'vitest';
import { CONTENT_VERSION } from '@/domain/types';
import { SCHEMA_VERSION, createEmptyProgress } from '@/domain/progress';
import { migrate } from './migrations';
import {
  BACKUP_PREFIX,
  STORAGE_KEY,
  listBackups,
  loadProgress,
  resetProgress,
  saveProgressNow,
} from './repository';

const NOW = '2026-09-20T09:00:00.000Z';

describe('migraciones (contrato §15)', () => {
  it('sin datos previos devuelve un estado vacío coherente', () => {
    const result = migrate(null, NOW);
    expect(result.state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.state.contentVersion).toBe(CONTENT_VERSION);
    expect(result.migratedFrom).toBeNull();
  });

  it('migra v1 a v2 conservando el progreso con IDs compatibles', () => {
    const v1 = {
      schemaVersion: 1,
      contentVersion: '0.0.9',
      createdAt: '2026-09-01T00:00:00.000Z',
      preferences: { theme: 'dark' },
      objectives: { 'LO-INT-001': { lessonStudiedAt: 'x', recalls: [], quizScores: [] } },
      questions: { 'Q-PEN-010-1': [{ at: 'a', chosenOptionId: 'c', correct: true, sessionId: 's1' }] },
      prompts: {
        'P-INT-001': [
          { at: 'a', selfRating: 'good', coveredKeyPointIds: ['kp1'], sessionId: 's1', usedModelAnswer: false },
        ],
      },
      errors: [],
    };

    const result = migrate(v1, NOW);
    expect(result.migratedFrom).toBe(1);
    expect(result.state.schemaVersion).toBe(SCHEMA_VERSION);
    // El progreso se conserva y el banco de entrevista cambia de nombre sin perderse.
    expect(result.state.interview['P-INT-001']).toHaveLength(1);
    expect(result.state.objectives['LO-INT-001'].lessonStudiedAt).toBe('x');
    expect(result.state.questions['Q-PEN-010-1']).toHaveLength(1);
    // Las preferencias previas sobreviven y se completan las nuevas.
    expect(result.state.preferences.theme).toBe('dark');
    expect(result.state.preferences.includeLevel2).toBe(false);
    // Cambió contentVersion: se anota, no se borra nada.
    expect(result.state.contentVersion).toBe(CONTENT_VERSION);
    expect(result.notes.join(' ')).toContain('contenido cambió');
  });

  it('completa campos ausentes sin destruir lo existente', () => {
    const partial = { schemaVersion: SCHEMA_VERSION, errors: [{ id: 'x' }] };
    const result = migrate(partial, NOW);
    expect(result.state.errors).toHaveLength(1);
    expect(result.state.targetInterview.enabled).toBe(true);
    expect(result.state.targetInterview.date).toBe('2026-09-21');
  });

  it('datos de una versión más nueva no rompen la aplicación', () => {
    const future = { schemaVersion: SCHEMA_VERSION + 5, objectives: {} };
    const result = migrate(future, NOW);
    expect(result.state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.notes.join(' ')).toContain('más nueva');
  });
});

describe('repositorio local (contrato §6, §15)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda y recupera el progreso', () => {
    const state = createEmptyProgress(NOW, CONTENT_VERSION);
    state.objectives['LO-INT-001'] = { lessonStudiedAt: NOW, recalls: [], quizScores: [] };
    saveProgressNow(state);
    const loaded = loadProgress();
    expect(loaded.state.objectives['LO-INT-001'].lessonStudiedAt).toBe(NOW);
  });

  it('datos corruptos no rompen la app y conservan copia recuperable', () => {
    localStorage.setItem(STORAGE_KEY, '{esto no es json');
    const loaded = loadProgress();
    expect(loaded.recoveredFromCorruption).toBe(true);
    expect(loaded.state.objectives).toEqual({});
    expect(listBackups().length).toBeGreaterThan(0);
  });

  it('el reset conserva un respaldo y no usa localStorage.clear', () => {
    const state = createEmptyProgress(NOW, CONTENT_VERSION);
    saveProgressNow(state);
    localStorage.setItem('otra.clave', 'valor de otra app');
    resetProgress();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem('otra.clave')).toBe('valor de otra app');
    expect(listBackups().some((key) => key.startsWith(BACKUP_PREFIX))).toBe(true);
  });
});
