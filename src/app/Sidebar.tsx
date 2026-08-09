import { useState, type ReactElement } from "react";
import { useNavigationStore, type FixedView } from "../store/navigationStore";
import {
  InboxIcon,
  SunIcon,
  UpcomingIcon,
  AnytimeIcon,
  SomedayIcon,
  LogbookIcon,
  AreasIcon,
  ChevronRightIcon,
} from "../components/icons";
import "./Sidebar.css";

interface NavEntry {
  id: FixedView;
  label: string;
  icon: (props: { width?: number; height?: number }) => ReactElement;
}

const topEntries: NavEntry[] = [
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "today", label: "Today", icon: SunIcon },
  { id: "upcoming", label: "Upcoming", icon: UpcomingIcon },
  { id: "anytime", label: "Anytime", icon: AnytimeIcon },
  { id: "someday", label: "Someday", icon: SomedayIcon },
];

export function Sidebar() {
  const activeView = useNavigationStore((s) => s.activeView);
  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const [areasExpanded, setAreasExpanded] = useState(true);

  return (
    <nav className="cerne-sidebar" aria-label="Navegação principal">
      <div className="cerne-sidebar__brand">
        <span className="text-h2">Cerne</span>
      </div>

      <ul className="cerne-sidebar__list">
        {topEntries.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              type="button"
              className={`cerne-sidebar__item${
                activeView === id ? " cerne-sidebar__item--active" : ""
              }`}
              onClick={() => setActiveView(id)}
            >
              <Icon width={18} height={18} />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="cerne-sidebar__divider" />

      <div className="cerne-sidebar__section">
        <button
          type="button"
          className="cerne-sidebar__section-header"
          onClick={() => setAreasExpanded((v) => !v)}
          aria-expanded={areasExpanded}
        >
          <ChevronRightIcon
            width={12}
            height={12}
            className={`cerne-sidebar__chevron${
              areasExpanded ? " cerne-sidebar__chevron--expanded" : ""
            }`}
          />
          <AreasIcon width={16} height={16} />
          <span>Areas</span>
        </button>
        {areasExpanded && (
          <p className="cerne-sidebar__section-empty">
            Nenhuma área ainda — chega na Fase 3.
          </p>
        )}
      </div>

      <div className="cerne-sidebar__divider" />

      <ul className="cerne-sidebar__list">
        <li>
          <button
            type="button"
            className={`cerne-sidebar__item${
              activeView === "logbook" ? " cerne-sidebar__item--active" : ""
            }`}
            onClick={() => setActiveView("logbook")}
          >
            <LogbookIcon width={18} height={18} />
            <span>Logbook</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
