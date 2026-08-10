import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppShell } from "./app/AppShell";
import { AuthGate } from "./features/auth/AuthGate";
import { RealtimeSync } from "./features/sync/RealtimeSync";
import { supabase } from "./lib/supabase/client";
import { useTaskStore } from "./store/taskStore";
import { useAreaStore } from "./store/areaStore";
import { useProjectStore } from "./store/projectStore";

function App() {
  // undefined = ainda checando a sessão salva; null = sem sessão (mostra login).
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadAreas = useAreaStore((s) => s.loadAreas);
  const loadProjects = useProjectStore((s) => s.loadProjects);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    loadTasks();
    loadAreas();
    loadProjects();
  }, [session, loadTasks, loadAreas, loadProjects]);

  if (session === undefined) return <div className="cerne-app-loading" />;
  if (!session) return <AuthGate />;

  return (
    <>
      <RealtimeSync session={session} />
      <AppShell />
    </>
  );
}

export default App;
