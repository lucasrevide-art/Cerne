import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import "./AppShell.css";

export function AppShell() {
  return (
    <div className="cerne-shell">
      <Sidebar />
      <MainContent />
    </div>
  );
}
