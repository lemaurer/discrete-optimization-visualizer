"use client";

import { useEffect, useMemo, useState } from "react";
import { VisualizationPlayer } from "@/components/VisualizationPlayer";
import { visualizationRegistry } from "@/visualizations/registry";

export default function Home() {
  const chapterNames = useMemo(
    () => [...new Set(visualizationRegistry.map((visualization) => visualization.chapter))],
    [],
  );
  const [activeId, setActiveId] = useState(visualizationRegistry[0]?.id ?? "");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(
    () => new Set(chapterNames.slice(1)),
  );

  const activeVisualization = useMemo(
    () =>
      visualizationRegistry.find((visualization) => visualization.id === activeId) ??
      visualizationRegistry[0],
    [activeId],
  );

  const availableByChapter = useMemo(
    () =>
      Object.groupBy(
        visualizationRegistry,
        (visualization) => visualization.chapter,
      ),
    [],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const activeChapter = activeVisualization?.chapter;
    if (!activeChapter) return;

    setCollapsedChapters((current) => {
      if (!current.has(activeChapter)) return current;
      const next = new Set(current);
      next.delete(activeChapter);
      return next;
    });
  }, [activeVisualization?.chapter]);

  if (!activeVisualization) {
    return <main className="empty-state">No visualization modules found.</main>;
  }

  const toggleChapter = (chapter: string) => {
    setCollapsedChapters((current) => {
      const next = new Set(current);
      if (next.has(chapter)) next.delete(chapter);
      else next.add(chapter);
      return next;
    });
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar--open" : ""}`}>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>OR / VIS</strong>
            <small>Discrete optimization</small>
          </div>
        </div>

        <nav className="chapter-nav" aria-label="Visualization chapters">
          <div className="chapter-nav-header">
            <p className="eyebrow">Visual textbook</p>
            <div className="chapter-nav-actions">
              <button
                onClick={() => setCollapsedChapters(new Set())}
                type="button"
              >
                Open all
              </button>
              <button
                onClick={() => setCollapsedChapters(new Set(chapterNames))}
                type="button"
              >
                Close all
              </button>
            </div>
          </div>

          {Object.entries(availableByChapter).map(
            ([chapter, visualizations], chapterIndex) => {
              const collapsed = collapsedChapters.has(chapter);
              const itemsId = `chapter-items-${chapterIndex}`;

              return (
                <section
                  className={`chapter-group ${collapsed ? "chapter-group--collapsed" : ""}`}
                  key={chapter}
                >
                  <button
                    aria-controls={itemsId}
                    aria-expanded={!collapsed}
                    className="chapter-heading"
                    onClick={() => toggleChapter(chapter)}
                    type="button"
                  >
                    <span>{String(chapterIndex + 1).padStart(2, "0")}</span>
                    <h2>{chapter}</h2>
                    <em>{visualizations?.length ?? 0}</em>
                    <i aria-hidden="true">⌄</i>
                  </button>

                  {!collapsed && (
                    <div className="chapter-items" id={itemsId}>
                      {visualizations?.map((visualization) => (
                        <button
                          className={
                            visualization.id === activeId
                              ? "nav-item nav-item--active"
                              : "nav-item"
                          }
                          key={visualization.id}
                          onClick={() => {
                            setActiveId(visualization.id);
                            setMobileNavOpen(false);
                          }}
                          type="button"
                        >
                          <span className="nav-item-index">
                            {String(visualization.order).padStart(2, "0")}
                          </span>
                          <span>
                            {visualization.shortTitle ?? visualization.title}
                          </span>
                          <i aria-hidden="true">→</i>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              );
            },
          )}
        </nav>

        <div className="sidebar-footer">
          <span>Open learning project</span>
          <div className="status-dot">Engine online</div>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close chapter navigation"
          onClick={() => setMobileNavOpen(false)}
          type="button"
        />
      )}

      <section className="main-stage">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-expanded={mobileNavOpen}
            aria-label="Open chapter navigation"
            onClick={() => setMobileNavOpen((value) => !value)}
            type="button"
          >
            <span />
            <span />
          </button>
          <div className="breadcrumb">
            <span>{activeVisualization.chapter}</span>
            <i>/</i>
            <strong>
              {activeVisualization.shortTitle ?? activeVisualization.title}
            </strong>
          </div>
          <div className="topbar-meta">
            <span className="topbar-pill">{activeVisualization.difficulty}</span>
            <span>{activeVisualization.duration} min lesson</span>
          </div>
        </header>

        <VisualizationPlayer
          key={activeVisualization.id}
          definition={activeVisualization}
        />
      </section>
    </main>
  );
}
