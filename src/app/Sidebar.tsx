import type { ReactElement } from "react";
import { useNavigationStore, type FixedView } from "../store/navigationStore";
import { useCommandPaletteStore } from "../store/commandPaletteStore";
import { useUiStore } from "../store/uiStore";
import { useBackupPanelStore } from "../store/backupPanelStore";
import { useChangePasswordPanelStore } from "../store/changePasswordPanelStore";
import { AreaNavList } from "../features/areas/AreaNavList";
import { supabase } from "../lib/supabase/client";
import {
  InboxIcon,
  StarIcon,
  UpcomingIcon,
  LogbookIcon,
  SearchIcon,
  BackupIcon,
  KeyIcon,
  LogoutIcon,
} from "../components/icons";
import "./Sidebar.css";

interface NavEntry {
  id: FixedView;
  label: string;
  icon: (props: { width?: number; height?: number }) => ReactElement;
}

const topEntries: NavEntry[] = [
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "focus", label: "A Única Coisa", icon: StarIcon },
  { id: "upcoming", label: "Upcoming", icon: UpcomingIcon },
];

export function Sidebar() {
  const route = useNavigationStore((s) => s.route);
  const setFixedView = useNavigationStore((s) => s.setFixedView);
  const openCommandPalette = useCommandPaletteStore((s) => s.open);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const openBackupPanel = useBackupPanelStore((s) => s.open);
  const openChangePasswordPanel = useChangePasswordPanelStore((s) => s.open);

  return (
    <nav
      className={`cerne-sidebar${sidebarOpen ? " cerne-sidebar--open" : ""}`}
      aria-label="Navegação principal"
    >
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
        <li>
          <button type="button" className="cerne-sidebar__item" onClick={openBackupPanel}>
            <BackupIcon width={18} height={18} />
            <span>Backup</span>
          </button>
        </li>
        <li>
          <button type="button" className="cerne-sidebar__item" onClick={openChangePasswordPanel}>
            <KeyIcon width={18} height={18} />
            <span>Trocar senha</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="cerne-sidebar__item"
            onClick={() => void supabase.auth.signOut()}
          >
            <LogoutIcon width={18} height={18} />
            <span>Sair</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
