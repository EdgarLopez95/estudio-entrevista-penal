import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { IconButton } from '@/components/primitives';
import { useProgress, useStore } from '@/state/StoreProvider';
import { interviewPhase, phaseLabel } from '@/domain/time';
import { SearchDialog } from './SearchDialog';

const PRIMARY_NAV = [
  { to: '/', label: 'Inicio' },
  { to: '/ruta', label: 'Ruta de estudio' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/practica', label: 'Práctica' },
  { to: '/casos', label: 'Casos' },
  { to: '/entrevista', label: 'Entrevista' },
  { to: '/simulacro', label: 'Simulacro' },
  { to: '/errores', label: 'Mis errores' },
  { to: '/progreso', label: 'Progreso' },
];

const SECONDARY_NAV = [
  { to: '/referencia', label: 'Referencia' },
  { to: '/preferencias', label: 'Preferencias' },
];

const MOBILE_NAV = [
  { to: '/', label: 'Inicio' },
  { to: '/penal', label: 'Estudiar' },
  { to: '/practica', label: 'Practicar' },
  { to: '/entrevista', label: 'Entrevista' },
  { to: '/mas', label: 'Más' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const progress = useProgress();
  const store = useStore();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const phase = interviewPhase(progress.targetInterview);
  const context = phaseLabel(phase, progress.targetInterview);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  const theme = progress.preferences.theme;

  function cycleTheme() {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    store.setTheme(next);
  }

  const themeLabel =
    theme === 'system' ? 'Tema: del sistema' : theme === 'light' ? 'Tema: claro' : 'Tema: oscuro';

  return (
    <div className="shell">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <nav className="sidebar" aria-label="Navegación principal">
        <div className="sidebar__sticky">
        <div className="sidebar__brand">
          <strong>Estudio</strong>
          <span className="caption">Primera entrevista</span>
        </div>
        <ul className="nav-list">
          {PRIMARY_NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.to === '/'} className="nav-link">
                <span className="nav-link__dot" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="nav-group eyebrow">Secundario</p>
        <ul className="nav-list">
          {SECONDARY_NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className="nav-link">
                <span className="nav-link__dot" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        </div>
      </nav>

      <main className="shell__main" id="contenido">
        <div className="shell__inner">
          <header className="topbar">
            <div className="topbar__context">
              <p className="eyebrow">Modo Primera entrevista · Entrevista 65 / Penal 35</p>
              {phase === 'none' ? (
                <Link to="/preferencias" className="topbar__title">
                  Añadir la fecha de tu entrevista
                </Link>
              ) : (
                <span className="topbar__title">{context}</span>
              )}
            </div>
            <div className="topbar__actions">
              <IconButton label="Buscar (Ctrl+K)" onClick={() => setSearchOpen(true)}>
                <span aria-hidden="true">⌕</span>
              </IconButton>
              <IconButton label={themeLabel} onClick={cycleTheme}>
                <span aria-hidden="true">{theme === 'dark' ? '◑' : theme === 'light' ? '○' : '◐'}</span>
              </IconButton>
            </div>
          </header>
          {children}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Navegación inferior">
        {MOBILE_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="mobile-nav__item">
            <span className="mobile-nav__marker" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {searchOpen ? <SearchDialog onClose={() => setSearchOpen(false)} /> : null}
    </div>
  );
}

/** Shell reducido para sesiones: conserva salir, contexto y progreso (contrato §11). */
export function FocusShell({
  children,
  onExit,
  context,
  progressLabel,
  progressNode,
}: {
  children: ReactNode;
  onExit: () => void;
  context: string;
  progressLabel?: string;
  progressNode?: ReactNode;
}) {
  return (
    <div className="shell">
      <main className="shell__main" id="contenido" style={{ gridColumn: '1 / -1' }}>
        <div className="shell__inner practice">
          <header className="practice__bar">
            <button type="button" className="btn btn--tertiary" onClick={onExit}>
              ← Salir
            </button>
            <span className="practice__context">{context}</span>
            <span className="practice__context">{progressLabel}</span>
          </header>
          {progressNode}
          {children}
        </div>
      </main>
    </div>
  );
}
