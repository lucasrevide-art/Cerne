import { useShortcutsHelpStore } from "../store/shortcutsHelpStore";
import { Overlay } from "../components/Overlay";
import "./ShortcutsHelp.css";

const shortcuts: { combo: string; description: string }[] = [
  { combo: "⌘K", description: "Buscar, navegar ou criar uma tarefa" },
  { combo: "Espaço", description: "Concluir a tarefa focada" },
  { combo: "Enter", description: "Abrir ou fechar a tarefa focada" },
  { combo: "Esc", description: "Fechar o que estiver aberto" },
  { combo: "?", description: "Esta ajuda" },
];

export function ShortcutsHelp() {
  const isOpen = useShortcutsHelpStore((s) => s.isOpen);
  const close = useShortcutsHelpStore((s) => s.close);

  if (!isOpen) return null;

  return (
    <Overlay onClose={close} label="Atalhos de teclado">
      <div className="cerne-shortcuts-help">
        <h2 className="text-h2">Atalhos de teclado</h2>
        <div className="cerne-shortcuts-help__list">
          {shortcuts.map((s) => (
            <div key={s.combo} className="cerne-shortcuts-help__row">
              <kbd className="cerne-shortcuts-help__combo">{s.combo}</kbd>
              <span>{s.description}</span>
            </div>
          ))}
        </div>
      </div>
    </Overlay>
  );
}
