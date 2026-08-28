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
import { useTagStore } from "./store/tagStore";
import "./App.css";

type DataStatus = "idle" | "loading" | "ready" | "error";

function StartupState({
  status,
  onRetry,
}: {
  status: "loading" | "error";
  onRetry?: () => void;
}) {
  return (
    <main className="cerne-startup" aria-live="polite">
      <div className="cerne-startup__card" role={status === "error" ? "alert" : "status"}>
        {status === "loading" ? (
          <>
            <span className="cerne-startup__spinner" aria-hidden="true" />
            <h1 className="text-h2">Preparando seus dados</h1>
            <p className="text-body-small">Sincronizando tarefas, áreas e projetos…</p>
          </>
        ) : (
          <>
            <h1 className="text-h2">Não foi possível carregar seus dados</h1>
            <p className="text-body-small">
              Verifique sua conexão. Seus dados continuam seguros e você pode tentar novamente.
            </p>
            <button type="button" className="cerne-startup__retry" onClick={onRetry}>
              Tentar novamente
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function App() {
  // undefined = ainda checando a sessão salva; null = sem sessão (mostra login).
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  // Fica true quando o usuário volta pelo link de "esqueci minha senha" —
  // trava na tela de definir nova senha antes de liberar o app, mesmo já
  // tendo uma sessão válida (o Supabase autentica esse link como sessão normal).
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [dataStatus, setDataStatus] = useState<DataStatus>("idle");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadAreas = useAreaStore((s) => s.loadAreas);
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const loadTags = useTagStore((s) => s.loadTags);

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

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId || recoveryMode) {
      setDataStatus("idle");
      return;
    }

    let active = true;
    setDataStatus("loading");
    Promise.all([loadTasks(), loadAreas(), loadProjects(), loadTags()])
      .then(() => {
        if (active) setDataStatus("ready");
      })
      .catch(() => {
        if (active) setDataStatus("error");
      });
    return () => {
      active = false;
    };
  }, [userId, recoveryMode, retryAttempt, loadTasks, loadAreas, loadProjects, loadTags]);

  if (session === undefined) return <StartupState status="loading" />;
  if (recoveryMode) return <ResetPassword onDone={() => setRecoveryMode(false)} />;
  if (!session) return <AuthGate />;
  if (dataStatus === "error") {
    return <StartupState status="error" onRetry={() => setRetryAttempt((value) => value + 1)} />;
  }
  if (dataStatus !== "ready") return <StartupState status="loading" />;

  return (
    <>
      <RealtimeSync session={session} />
      <AppShell />
    </>
  );
}

export default App;
