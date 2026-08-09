import type { ReactElement } from "react";
import { useNavigationStore, type FixedView } from "../store/navigationStore";
import { useCommandPaletteStore } from "../store/commandPaletteStore";
import { AreaNavList } from "../features/areas/AreaNavList";
import {
  InboxIcon,
  SunIcon,
  UpcomingIcon,
  AnytimeIcon,
  SomedayIcon,
  LogbookIcon,
  SearchIcon,
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
  const route = useNavigationStore((s) => s.route);
  const setFixedView = useNavigationStore((s) => s.setFixedView);
  const openCommandPalette = useCommandPaletteStore((s) => s.open);

  return (
    <nav className="cerne-sidebar" aria-label="Navegação principal">
      <div className="cerne-sidebar__brand">
        <span className="text-h2">Cerne</span>
      </div>

      <button
        type="button"
        className="cerne-sidebar__search-trigger"
        onClick={openCommandPalette}
      >
        <SearchIcon width={16} height={16} />
        <span>Buscar</span>
        <kbd className="cerne-sidebar__search-hint">⌘K</kbd>
      </button>

      <ul className="cerne-sidebar__list">
        {topEntries.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              type="button"
              className={`cerne-sidebar__item${
                route.type === "fixed" && route.view === id
                  ? " cerne-sidebar__item--active"
                  : ""
              }`}
              onClick={() => setFixedView(id)}
            >
              <Icon width={18} height={18} />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="cerne-sidebar__divider" />

      <AreaNavList />

      <div className="cerne-sidebar__divider" />

      <ul className="cerne-sidebar__list">
        <li>
          <button
            type="button"
            className={`cerne-sidebar__item${
              route.type === "fixed" && route.view === "logbook"
                ? " cerne-sidebar__item--active"
                : ""
            }`}
            onClick={() => setFixedView("logbook")}
          >
            <LogbookIcon width={18} height={18} />
            <span>Logbook</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
