import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { CommandPalette } from "../features/search/CommandPalette";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { useNavigationStore } from "../store/navigationStore";
import { useUiStore } from "../store/uiStore";
import "./AppShell.css";

export function AppShell() {
  const route = useNavigationStore((s) => s.route);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);

  // Fecha o drawer da sidebar (mobile) sozinho sempre que a rota muda.
  useEffect(() => {
    closeSidebar();
  }, [route, closeSidebar]);

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
      <CommandPalette />
      <ShortcutsHelp />
    </div>
  );
}
