import { CONTENT_VERSION } from '@/domain/types';
import { createEmptyProgress, type ProgressState } from '@/domain/progress';
import { migrate } from './migrations';

export const STORAGE_KEY = 'estudio.progreso.v1';
export const BACKUP_PREFIX = 'estudio.progreso.respaldo.';

export interface LoadResult {
  state: ProgressState;
  /** Mensajes para el panel de preferencias (migración, datos corruptos recuperados). */
  notes: string[];
  recoveredFromCorruption: boolean;
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const probe = '__estudio_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

/**
 * Carga el progreso. Datos corruptos no rompen la app: se conserva una copia recuperable
 * y se arranca con estado vacío (contrato §15). Nunca se hace `localStorage.clear()`.
 */
export function loadProgress(now = new Date().toISOString()): LoadResult {
  const store = storage();
  if (!store) {
    return {
      state: createEmptyProgress(now, CONTENT_VERSION),
      notes: ['Este navegador no permite almacenamiento local: el progreso no se guardará.'],
      recoveredFromCorruption: false,
    };
  }

  const raw = store.getItem(STORAGE_KEY);
  if (!raw) {
    return { state: createEmptyProgress(now, CONTENT_VERSION), notes: [], recoveredFromCorruption: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const backupKey = `${BACKUP_PREFIX}${Date.now()}`;
    try {
      store.setItem(backupKey, raw);
    } catch {
      // Si no hay espacio para el respaldo, se continúa sin perder el original.
    }
    return {
      state: createEmptyProgress(now, CONTENT_VERSION),
      notes: [
        'Los datos guardados no se pudieron leer. Se conservó una copia recuperable y se empezó de nuevo.',
      ],
      recoveredFromCorruption: true,
    };
  }

  const result = migrate(parsed, now);
  return { state: result.state, notes: result.notes, recoveredFromCorruption: false };
}

let pending: number | null = null;
let pendingState: ProgressState | null = null;

/** Guardado sin bloquear la UI: se agrupa en un microtask diferido. */
export function saveProgress(state: ProgressState): void {
  pendingState = state;
  const store = storage();
  if (!store) return;
  if (pending !== null) return;
  const flush = () => {
    pending = null;
    const toSave = pendingState;
    pendingState = null;
    if (!toSave) return;
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Cuota agotada o modo privado: la sesión sigue funcionando en memoria.
    }
  };
  pending = (
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(flush)
      : (setTimeout(flush, 0) as unknown as number)
  ) as unknown as number;
}

export function saveProgressNow(state: ProgressState): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silencioso: no se bloquea la UI por un fallo de almacenamiento.
  }
}

/** Reset con confirmación explícita en la UI. Solo borra la clave del progreso. */
export function resetProgress(now = new Date().toISOString()): ProgressState {
  const store = storage();
  const fresh = createEmptyProgress(now, CONTENT_VERSION);
  if (store) {
    try {
      const previous = store.getItem(STORAGE_KEY);
      if (previous) store.setItem(`${BACKUP_PREFIX}${Date.now()}`, previous);
      store.removeItem(STORAGE_KEY);
    } catch {
      // Sin almacenamiento: el reset queda en memoria.
    }
  }
  return fresh;
}

export function listBackups(): string[] {
  const store = storage();
  if (!store) return [];
  const keys: string[] = [];
  for (let i = 0; i < store.length; i += 1) {
    const key = store.key(i);
    if (key && key.startsWith(BACKUP_PREFIX)) keys.push(key);
  }
  return keys.sort().reverse();
}
