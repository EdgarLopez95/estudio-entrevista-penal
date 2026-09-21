import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { IconButton } from '@/components/primitives';
import { useProgress, useStore } from '@/state/StoreProvider';
import { interviewPhase, phaseLabel } from '@/domain/time';
import { LogoMark } from '@/components/Logo';
import {
  IconHome,
  IconBook,
  IconBolt,
  IconChart,
  IconBriefcase,
  IconClock,
  IconAlert,
  IconSettings,
} from '@/components/icons';
import { SearchDialog } from './SearchDialog';

const PRIMARY_NAV = [
  { to: '/', label: 'Inicio', icon: IconHome },
  { to: '/estudiar', label: 'Estudiar', icon: IconBook },
  { to: '/practicar', label: 'Practicar', icon: IconBolt },
  { to: '/progreso', label: 'Progreso', icon: IconChart },
];

const SECONDARY_NAV = [
  { to: '/repaso-final', label: 'Repaso antes de salir', icon: IconClock },
  { to: '/simulacro', label: 'Simulacro', icon: IconBriefcase },
  { to: '/errores', label: 'Mis errores', icon: IconAlert },
  { to: '/preferencias', label: 'Preferencias', icon: IconSettings },
];

const MOBILE_NAV = [
  { to: '/', label: 'Inicio', icon: IconHome },
  { to: '/estudiar', label: 'Estudiar', icon: IconBook },
  { to: '/practicar', label: 'Practicar', icon: IconBolt },
  { to: '/progreso', label: 'Progreso', icon: IconChart },
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
        <div className="sidebar__brand" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <LogoMark size={32} />
          <div>
            <strong style={{ display: 'block' }}>Estudio</strong>
            <span className="caption">Primera entrevista</span>
          </div>
        </div>
        <ul className="nav-list">
          {PRIMARY_NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.to === '/'} className="nav-link">
                <item.icon size={18} className="nav-link__icon" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="nav-group eyebrow">Secundario</p>
        <ul className="nav-list">
          {SECONDARY_NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className="nav-link">
                <item.icon size={18} className="nav-link__icon" />
                <span>{item.label}</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <IconClock size={16} color="var(--primary)" className="topbar__clock-icon" />
                <span className="topbar__title">{context}</span>
              </div>
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
          {progress.activeSession &&
          progress.activeSession.status === 'active' &&
          location.pathname !== '/' &&
          !location.pathname.startsWith('/entrevista/star/') &&
          !location.pathname.startsWith('/entrevista/prompt/') &&
          !location.pathname.startsWith('/penal/leccion/') &&
          !location.pathname.startsWith('/casos/') &&
          !location.pathname.startsWith('/ruta/') ? (
            <div className="active-session-banner" role="status">
              <div className="active-session-banner__text">
                <IconBolt size={18} color="var(--primary)" />
                <span>
                  Sesión en curso: <strong>{progress.activeSession.label}</strong> (ítem{' '}
                  {progress.activeSession.currentIndex + 1} de {progress.activeSession.items.length})
                </span>
              </div>
              <NavLink to="/sesion" className="btn btn--primary active-session-banner__btn">
                Reanudar sesión →
              </NavLink>
            </div>
          ) : null}
          {children}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Navegación inferior">
        {MOBILE_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="mobile-nav__item">
            <item.icon size={20} className="mobile-nav__icon" />
            <span>{item.label}</span>
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
        <div className="shell__inner practice" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <header
            className="practice__bar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
              gap: 'var(--space-2)',
            }}
          >
            <button
              type="button"
              className="btn btn--tertiary"
              onClick={onExit}
              style={{ paddingLeft: 0 }}
            >
              ← Salir del bloque
            </button>
            <div style={{ textAlign: 'right' }}>
              <span
                className="caption"
                style={{
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text-secondary)',
                  display: 'block',
                }}
              >
                {context}
              </span>
              {progressLabel ? (
                <span className="caption" style={{ color: 'var(--text-muted)' }}>
                  {progressLabel}
                </span>
              ) : null}
            </div>
          </header>
          {progressNode}
          {children}
        </div>
      </main>
    </div>
  );
}
