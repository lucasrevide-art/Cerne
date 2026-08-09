import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { CommandPalette } from "../features/search/CommandPalette";
import "./AppShell.css";

export function AppShell() {
  return (
    <div className="cerne-shell">
      <Sidebar />
      <MainContent />
      <CommandPalette />
    </div>
  );
}
