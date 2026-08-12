import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";
import { useTaskStore } from "../../store/taskStore";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { useTagStore } from "../../store/tagStore";

interface RealtimeSyncProps {
  session: Session;
}

const REFETCH_DEBOUNCE_MS = 400;

/**
 * Mantém os dados em dia entre abas/dispositivos: qualquer INSERT/UPDATE/
 * DELETE nas tabelas do usuário (a própria mudança local ou uma vinda de
 * outro navegador) reagenda um refetch completo daquela tabela. Não tenta
 * aplicar o evento em cima do estado local — mais simples e sem risco de
 * o Zustand ficar dessincronizado do banco por causa de eventos fora de ordem.
 */
export function RealtimeSync({ session }: RealtimeSyncProps) {
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadAreas = useAreaStore((s) => s.loadAreas);
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const loadTags = useTagStore((s) => s.loadTags);

  useEffect(() => {
    let taskTimer: number | undefined;
    let areaTimer: number | undefined;
    let projectTimer: number | undefined;
    let tagTimer: number | undefined;

    function scheduleTasks() {
      window.clearTimeout(taskTimer);
      taskTimer = window.setTimeout(() => void loadTasks(), REFETCH_DEBOUNCE_MS);
    }
    function scheduleAreas() {
      window.clearTimeout(areaTimer);
      areaTimer = window.setTimeout(() => void loadAreas(), REFETCH_DEBOUNCE_MS);
    }
    function scheduleProjects() {
      window.clearTimeout(projectTimer);
      projectTimer = window.setTimeout(() => void loadProjects(), REFETCH_DEBOUNCE_MS);
    }
    function scheduleTags() {
      window.clearTimeout(tagTimer);
      tagTimer = window.setTimeout(() => void loadTags(), REFETCH_DEBOUNCE_MS);
    }

    const channel = supabase
      .channel(`cerne-sync-${session.user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, scheduleTasks)
      .on("postgres_changes", { event: "*", schema: "public", table: "subtasks" }, scheduleTasks)
      .on("postgres_changes", { event: "*", schema: "public", table: "recurrences" }, scheduleTasks)
      .on("postgres_changes", { event: "*", schema: "public", table: "areas" }, scheduleAreas)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, scheduleProjects)
      .on("postgres_changes", { event: "*", schema: "public", table: "tags" }, scheduleTags)
      .subscribe();

    return () => {
      window.clearTimeout(taskTimer);
      window.clearTimeout(areaTimer);
      window.clearTimeout(projectTimer);
      window.clearTimeout(tagTimer);
      void supabase.removeChannel(channel);
    };
  }, [session.user.id, loadTasks, loadAreas, loadProjects, loadTags]);

  return null;
}
