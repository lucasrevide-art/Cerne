import { lazy, Suspense, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { PomodoroWidget } from "../features/pomodoro/PomodoroWidget";
import { useNavigationStore } from "../store/navigationStore";
import { useUiStore } from "../store/uiStore";
import { useCommandPaletteStore } from "../store/commandPaletteStore";
import { useShortcutsHelpStore } from "../store/shortcutsHelpStore";
import { useBackupPanelStore } from "../store/backupPanelStore";
import { useChangePasswordPanelStore } from "../store/changePasswordPanelStore";
import "./AppShell.css";

const CommandPalette = lazy(() =>
  import("../features/search/CommandPalette").then((module) => ({ default: module.CommandPalette })),
);
const ShortcutsHelp = lazy(() =>
  import("./ShortcutsHelp").then((module) => ({ default: module.ShortcutsHelp })),
);
const BackupPanel = lazy(() =>
  import("../features/backup/BackupPanel").then((module) => ({ default: module.BackupPanel })),
);
const ChangePasswordPanel = lazy(() =>
  import("../features/auth/ChangePasswordPanel").then((module) => ({
    default: module.ChangePasswordPanel,
  })),
);

function isTypingContext(): boolean {
  const element = document.activeElement as HTMLElement | null;
  return Boolean(
    element &&
      (["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable),
  );
}

export function AppShell() {
  const route = useNavigationStore((s) => s.route);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);
  const commandPaletteOpen = useCommandPaletteStore((s) => s.isOpen);
  const shortcutsHelpOpen = useShortcutsHelpStore((s) => s.isOpen);
  const backupPanelOpen = useBackupPanelStore((s) => s.isOpen);
  const changePasswordPanelOpen = useChangePasswordPanelStore((s) => s.isOpen);

  // Fecha o drawer da sidebar (mobile) sozinho sempre que a rota muda.
  useEffect(() => {
    closeSidebar();
  }, [route, closeSidebar]);

  // Os atalhos ficam no shell para que os painéis pesados possam ser carregados só ao abrir.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        useCommandPaletteStore.getState().toggle();
      } else if (event.key === "?" && !isTypingContext()) {
        event.preventDefault();
        useShortcutsHelpStore.getState().toggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="cerne-shell">
      <Sidebar />
      {sidebarOpen && (
        <button
          type="button"
          className="cerne-shell__backdrop"
          aria-label="Fechar menu de navegação"
          onClick={closeSidebar}
        />
      )}
      <MainContent />
      <PomodoroWidget />
      <Suspense fallback={null}>
        {commandPaletteOpen && <CommandPalette />}
        {shortcutsHelpOpen && <ShortcutsHelp />}
        {backupPanelOpen && <BackupPanel />}
        {changePasswordPanelOpen && <ChangePasswordPanel />}
      </Suspense>
    </div>
  );
}
