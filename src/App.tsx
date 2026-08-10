import { useEffect, useState } from "react";
import { AppShell } from "./app/AppShell";
import { PasswordGate, isUnlocked } from "./features/auth/PasswordGate";
import { useTaskStore } from "./store/taskStore";
import { useAreaStore } from "./store/areaStore";
import { useProjectStore } from "./store/projectStore";

function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadAreas = useAreaStore((s) => s.loadAreas);
  const loadProjects = useProjectStore((s) => s.loadProjects);

  useEffect(() => {
    if (!unlocked) return;
    loadTasks();
    loadAreas();
    loadProjects();
  }, [unlocked, loadTasks, loadAreas, loadProjects]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  return <AppShell />;
}

export default App;
