import { useEffect } from "react";
import { AppShell } from "./app/AppShell";
import { useTaskStore } from "./store/taskStore";
import { useAreaStore } from "./store/areaStore";
import { useProjectStore } from "./store/projectStore";

function App() {
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadAreas = useAreaStore((s) => s.loadAreas);
  const loadProjects = useProjectStore((s) => s.loadProjects);

  useEffect(() => {
    loadTasks();
    loadAreas();
    loadProjects();
  }, [loadTasks, loadAreas, loadProjects]);

  return <AppShell />;
}

export default App;
