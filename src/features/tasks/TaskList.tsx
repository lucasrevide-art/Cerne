import { useEffect, useState, type FormEvent } from "react";
import { useTaskStore } from "../../store/taskStore";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { InboxIcon } from "../../components/icons";
import { TaskListItem } from "./TaskListItem";
import "./TaskList.css";

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const loaded = useTaskStore((s) => s.loaded);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const addTask = useTaskStore((s) => s.addTask);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!loaded) loadTasks();
  }, [loaded, loadTasks]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    addTask(title);
    setDraft("");
  }

  return (
    <div className="cerne-task-list">
      <form className="cerne-task-list__quick-add" onSubmit={handleSubmit}>
        <Input
          placeholder="Adicionar tarefa…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" variant="primary">
          Adicionar
        </Button>
      </form>

      {loaded && tasks.length === 0 ? (
        <EmptyState
          icon={<InboxIcon width={28} height={28} />}
          title="Está tudo em dia por aqui."
          description="Capture qualquer coisa acima — classificar é opcional."
        />
      ) : (
        <div className="cerne-task-list__rows">
          {tasks.map((task) => (
            <TaskListItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
