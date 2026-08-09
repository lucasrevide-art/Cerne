import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import Fuse from "fuse.js";
import { useCommandPaletteStore } from "../../store/commandPaletteStore";
import { useNavigationStore, type FixedView } from "../../store/navigationStore";
import { useTaskStore } from "../../store/taskStore";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { Overlay } from "../../components/Overlay";
import {
  SearchIcon,
  CircleIcon,
  ProjectIcon,
  AreasIcon,
  InboxIcon,
  SunIcon,
  UpcomingIcon,
  AnytimeIcon,
  SomedayIcon,
  LogbookIcon,
} from "../../components/icons";
import { resolveTaskRoute } from "../tasks/taskFilters";
import "./CommandPalette.css";

interface ResultItem {
  id: string;
  type: "task" | "project" | "area" | "command";
  label: string;
  sublabel?: string;
  icon: ReactNode;
  onSelect: () => void;
}

const fixedViewCommands: { view: FixedView; label: string; icon: ReactNode }[] = [
  { view: "inbox", label: "Ir para Inbox", icon: <InboxIcon width={16} height={16} /> },
  { view: "today", label: "Ir para Today", icon: <SunIcon width={16} height={16} /> },
  { view: "upcoming", label: "Ir para Upcoming", icon: <UpcomingIcon width={16} height={16} /> },
  { view: "anytime", label: "Ir para Anytime", icon: <AnytimeIcon width={16} height={16} /> },
  { view: "someday", label: "Ir para Someday", icon: <SomedayIcon width={16} height={16} /> },
  { view: "logbook", label: "Ir para Logbook", icon: <LogbookIcon width={16} height={16} /> },
];

export function CommandPalette() {
  const isOpen = useCommandPaletteStore((s) => s.isOpen);
  const close = useCommandPaletteStore((s) => s.close);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useCommandPaletteStore.getState().toggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;
  return <CommandPaletteContent onClose={close} />;
}

function CommandPaletteContent({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const areas = useAreaStore((s) => s.areas);
  const setFixedView = useNavigationStore((s) => s.setFixedView);
  const setArea = useNavigationStore((s) => s.setArea);
  const setProject = useNavigationStore((s) => s.setProject);
  const highlightTask = useNavigationStore((s) => s.highlightTask);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const areaNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const area of areas) map.set(area.id, area.name);
    return map;
  }, [areas]);

  const viewLabel: Record<FixedView, string> = {
    inbox: "Inbox",
    today: "Today",
    upcoming: "Upcoming",
    anytime: "Anytime",
    someday: "Someday",
    logbook: "Logbook",
  };

  const allItems = useMemo<ResultItem[]>(() => {
    const commandItems: ResultItem[] = fixedViewCommands.map((c) => ({
      id: `command:${c.view}`,
      type: "command",
      label: c.label,
      icon: c.icon,
      onSelect: () => {
        setFixedView(c.view);
        onClose();
      },
    }));

    const areaItems: ResultItem[] = areas.map((area) => ({
      id: `area:${area.id}`,
      type: "area",
      label: area.name,
      sublabel: "Área",
      icon: <AreasIcon width={16} height={16} />,
      onSelect: () => {
        setArea(area.id);
        onClose();
      },
    }));

    const projectItems: ResultItem[] = projects.map((project) => ({
      id: `project:${project.id}`,
      type: "project",
      label: project.name,
      sublabel: project.areaId ? areaNameById.get(project.areaId) : "Sem área",
      icon: <ProjectIcon width={16} height={16} />,
      onSelect: () => {
        setProject(project.id);
        onClose();
      },
    }));

    const taskItems: ResultItem[] = tasks.map((task) => {
      const route = resolveTaskRoute(task);
      const sublabel =
        route.type === "fixed"
          ? viewLabel[route.view]
          : route.type === "project"
            ? projects.find((p) => p.id === route.projectId)?.name
            : areaNameById.get(route.areaId);
      return {
        id: `task:${task.id}`,
        type: "task",
        label: task.title,
        sublabel: task.status === "completed" ? `${sublabel} · Concluída` : sublabel,
        icon: <CircleIcon width={16} height={16} />,
        onSelect: () => {
          if (route.type === "fixed") setFixedView(route.view);
          else if (route.type === "area") setArea(route.areaId);
          else setProject(route.projectId);
          highlightTask(task.id);
          onClose();
        },
      };
    });

    return [...commandItems, ...areaItems, ...projectItems, ...taskItems];
  }, [tasks, projects, areas, areaNameById, setFixedView, setArea, setProject, highlightTask, onClose]);

  const fuse = useMemo(
    () =>
      new Fuse(allItems, {
        keys: ["label", "sublabel"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [allItems],
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      return allItems.filter((item) => item.type === "command");
    }
    return fuse.search(query).slice(0, 30).map((r) => r.item);
  }, [query, fuse, allItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e: ReactKeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[selectedIndex]?.onSelect();
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="cerne-command-palette">
        <div className="cerne-command-palette__search">
          <SearchIcon width={18} height={18} className="cerne-command-palette__search-icon" />
          <input
            ref={inputRef}
            className="cerne-command-palette__input"
            placeholder="Buscar tarefas, projetos, áreas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="cerne-command-palette__hint">esc</kbd>
        </div>

        <div className="cerne-command-palette__results">
          {results.length === 0 ? (
            <p className="cerne-command-palette__empty">
              Nenhum resultado para "{query}".
            </p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`cerne-command-palette__item${
                  index === selectedIndex ? " cerne-command-palette__item--active" : ""
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => item.onSelect()}
              >
                <span className="cerne-command-palette__item-icon">{item.icon}</span>
                <span className="cerne-command-palette__item-label">{item.label}</span>
                {item.sublabel && (
                  <span className="cerne-command-palette__item-sublabel">{item.sublabel}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </Overlay>
  );
}
