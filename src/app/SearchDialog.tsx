import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GROUP_LABEL, GROUP_ORDER, flattenHits, search, totalHits } from '@/domain/search';

const INITIAL_PER_GROUP = 4;

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [perGroup, setPerGroup] = useState(INITIAL_PER_GROUP);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const grouped = useMemo(() => search(query), [query]);
  const visible = useMemo(() => flattenHits(grouped, perGroup), [grouped, perGroup]);
  const total = totalHits(grouped);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function go(index: number) {
    const hit = visible[index];
    if (!hit) return;
    navigate(hit.href);
    onClose();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(visible.length - 1, 0)));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      go(activeIndex);
    }
  }

  let runningIndex = -1;

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en el corpus"
        onKeyDown={onKeyDown}
      >
        <div className="dialog__head">
          <label className="visually-hidden" htmlFor="search-input">
            Buscar temas, preguntas, conceptos o historias
          </label>
          <input
            id="search-input"
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Buscar: habeas, imputación, salario, error…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="dialog__body">
          {query.trim().length < 2 ? (
            <p className="caption">
              Escribe al menos dos letras. Ignora tildes: «habeas» encuentra «hábeas corpus».
            </p>
          ) : total === 0 ? (
            <p className="caption">Sin resultados para «{query}».</p>
          ) : (
            <>
              {GROUP_ORDER.filter((group) => grouped[group].length > 0).map((group) => (
                <div className="search-group" key={group}>
                  <p className="eyebrow">{GROUP_LABEL[group]}</p>
                  <ul>
                    {grouped[group].slice(0, perGroup).map((hit) => {
                      runningIndex += 1;
                      const index = runningIndex;
                      return (
                        <li key={hit.id}>
                          <button
                            type="button"
                            className="search-hit"
                            data-active={index === activeIndex}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => go(index)}
                          >
                            <span className="search-hit__title">{hit.title}</span>
                            <span className="search-hit__meta"> · {hit.subtitle}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {grouped[group].length > perGroup ? (
                    <button
                      type="button"
                      className="btn btn--tertiary"
                      onClick={() => setPerGroup((value) => value + 6)}
                    >
                      Ver más en {GROUP_LABEL[group]}
                    </button>
                  ) : null}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
