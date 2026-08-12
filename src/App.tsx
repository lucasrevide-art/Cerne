import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppShell } from "./app/AppShell";
import { AuthGate } from "./features/auth/AuthGate";
import { ResetPassword } from "./features/auth/ResetPassword";
import { RealtimeSync } from "./features/sync/RealtimeSync";
import { supabase, supabaseConfigured } from "./lib/supabase/client";
import { useTaskStore } from "./store/taskStore";
import { useAreaStore } from "./store/areaStore";
import { useProjectStore } from "./store/projectStore";

function App() {
  // undefined = ainda checando a sessão salva; null = sem sessão (mostra login).
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  // Fica true quando o usuário volta pelo link de "esqueci minha senha" —
  // trava na tela de definir nova senha antes de liberar o app, mesmo já
  // tendo uma sessão válida (o Supabase autentica esse link como sessão normal).
  const [recoveryMode, setRecoveryMode] = useState(false);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadAreas = useAreaStore((s) => s.loadAreas);
  const loadProjects = useProjectStore((s) => s.loadProjects);

  useEffect(() => {
    if (!supabaseConfigured) {
      setSession(null);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null));
    const { data: subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
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
  if (recoveryMode) return <ResetPassword onDone={() => setRecoveryMode(false)} />;
  if (!session) return <AuthGate />;

  return (
    <>
      <RealtimeSync session={session} />
      <AppShell />
    </>
  );
}

export default App;
