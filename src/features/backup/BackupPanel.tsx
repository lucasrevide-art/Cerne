import { useRef, useState } from "react";
import { useBackupPanelStore } from "../../store/backupPanelStore";
import { useTaskStore } from "../../store/taskStore";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { Overlay } from "../../components/Overlay";
import { Button } from "../../components/Button";
import { exportBackup, importBackup } from "../../lib/backup/exportImport";
import "./BackupPanel.css";

export function BackupPanel() {
  const isOpen = useBackupPanelStore((s) => s.isOpen);
  const close = useBackupPanelStore((s) => s.close);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadAreas = useAreaStore((s) => s.loadAreas);
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setStatus(null);
    try {
      await importBackup(file);
      await Promise.all([loadTasks(), loadAreas(), loadProjects()]);
      setStatus("Backup importado com sucesso.");
    } catch {
      setStatus("Não foi possível importar esse arquivo — confira se é um backup do Cerne.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Overlay onClose={close} label="Backup dos dados">
      <div className="cerne-backup-panel">
        <h2 className="text-h2">Backup dos dados</h2>
        <p className="text-body-small">
          O Cerne guarda tudo no navegador. Use isto para levar suas tarefas para outro
          navegador, computador ou para o site publicado.
        </p>

        <div className="cerne-backup-panel__actions">
          <Button variant="secondary" onClick={() => void exportBackup()}>
            Exportar backup (.json)
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            Importar backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={handleImportFile}
          />
        </div>

        {status && <p className="cerne-backup-panel__status">{status}</p>}
      </div>
    </Overlay>
  );
}
