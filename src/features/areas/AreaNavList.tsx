import { useState, type FormEvent } from "react";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { useNavigationStore, type Route } from "../../store/navigationStore";
import { ChevronRightIcon } from "../../components/icons";
import "./AreaNavList.css";

function isAreaActive(route: Route, areaId: string): boolean {
  return route.type === "area" && route.areaId === areaId;
}

function isProjectActive(route: Route, projectId: string): boolean {
  return route.type === "project" && route.projectId === projectId;
}

export function AreaNavList() {
  const areas = useAreaStore((s) => s.areas);
  const addArea = useAreaStore((s) => s.addArea);
  const projects = useProjectStore((s) => s.projects);
  const addProject = useProjectStore((s) => s.addProject);
  const route = useNavigationStore((s) => s.route);
  const setArea = useNavigationStore((s) => s.setArea);
  const setProject = useNavigationStore((s) => s.setProject);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingArea, setAddingArea] = useState(false);
  const [areaDraft, setAreaDraft] = useState("");
  const [addingProjectFor, setAddingProjectFor] = useState<string | null>(null);
  const [projectDraft, setProjectDraft] = useState("");

  function toggleExpanded(areaId: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  }

  async function handleAddArea(e: FormEvent) {
    e.preventDefault();
    const name = areaDraft.trim();
    if (!name) return;
    const area = await addArea(name);
    setAreaDraft("");
    setAddingArea(false);
    setExpanded((current) => new Set(current).add(area.id));
    setArea(area.id);
  }

  async function handleAddProject(e: FormEvent, areaId: string) {
    e.preventDefault();
    const name = projectDraft.trim();
    if (!name) return;
    const project = await addProject(name, areaId);
    setProjectDraft("");
    setAddingProjectFor(null);
    setProject(project.id);
  }

  return (
    <div className="cerne-area-nav">
      <div className="cerne-area-nav__header">
        <span className="text-caption">Areas</span>
        <button
          type="button"
          className="cerne-area-nav__add"
          aria-label="Nova área"
          onClick={() => setAddingArea((v) => !v)}
        >
          +
        </button>
      </div>

      {addingArea && (
        <form className="cerne-area-nav__inline-form" onSubmit={handleAddArea}>
          <input
            autoFocus
            className="cerne-area-nav__inline-input"
            placeholder="Nome da área…"
            value={areaDraft}
            onChange={(e) => setAreaDraft(e.target.value)}
            onBlur={() => !areaDraft && setAddingArea(false)}
          />
        </form>
      )}

      {areas.length === 0 && !addingArea && (
        <p className="cerne-area-nav__empty">Nenhuma área ainda.</p>
      )}

      <ul className="cerne-sidebar__list">
        {areas.map((area) => {
          const areaProjects = projects.filter((p) => p.areaId === area.id);
          const isExpanded = expanded.has(area.id);
          return (
            <li key={area.id}>
              <div
                className={`cerne-sidebar__item cerne-area-nav__row${
                  isAreaActive(route, area.id) ? " cerne-sidebar__item--active" : ""
                }`}
              >
                <button
                  type="button"
                  className="cerne-area-nav__chevron-btn"
                  aria-label={isExpanded ? "Recolher área" : "Expandir área"}
                  onClick={() => toggleExpanded(area.id)}
                >
                  <ChevronRightIcon
                    width={12}
                    height={12}
                    className={`cerne-sidebar__chevron${
                      isExpanded ? " cerne-sidebar__chevron--expanded" : ""
                    }`}
                  />
                </button>
                <button
                  type="button"
                  className="cerne-area-nav__label"
                  onClick={() => setArea(area.id)}
                >
                  {area.name}
                </button>
                <button
                  type="button"
                  className="cerne-area-nav__add cerne-area-nav__add--project"
                  aria-label="Novo projeto"
                  onClick={() => {
                    setExpanded((current) => new Set(current).add(area.id));
                    setAddingProjectFor(area.id);
                  }}
                >
                  +
                </button>
              </div>

              {isExpanded && (
                <ul className="cerne-area-nav__projects">
                  {areaProjects.map((project) => (
                    <li key={project.id}>
                      <button
                        type="button"
                        className={`cerne-sidebar__item cerne-area-nav__project${
                          isProjectActive(route, project.id)
                            ? " cerne-sidebar__item--active"
                            : ""
                        }`}
                        onClick={() => setProject(project.id)}
                      >
                        {project.name}
                      </button>
                    </li>
                  ))}
                  {addingProjectFor === area.id && (
                    <li>
                      <form
                        className="cerne-area-nav__inline-form cerne-area-nav__inline-form--project"
                        onSubmit={(e) => handleAddProject(e, area.id)}
                      >
                        <input
                          autoFocus
                          className="cerne-area-nav__inline-input"
                          placeholder="Nome do projeto…"
                          value={projectDraft}
                          onChange={(e) => setProjectDraft(e.target.value)}
                          onBlur={() => !projectDraft && setAddingProjectFor(null)}
                        />
                      </form>
                    </li>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
