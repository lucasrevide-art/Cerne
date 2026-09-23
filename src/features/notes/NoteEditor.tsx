import { useEffect, useRef, useState } from "react";
import type { Note } from "../../types";
import { useNoteStore } from "../../store/noteStore";
import { Overlay } from "../../components/Overlay";
import { ConfirmButton } from "../../components/ConfirmButton";
import "./NoteEditor.css";

const AUTOSAVE_DEBOUNCE_MS = 600;

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface NoteEditorProps {
  note: Note;
  onClose: () => void;
}

/** Editor de uma nota isolada — cada nota é seu próprio registro, editado sozinho (como no app Notas do macOS). */
export function NoteEditor({ note, onClose }: NoteEditorProps) {
  const updateNote = useNoteStore((s) => s.updateNote);
  const removeNote = useNoteStore((s) => s.removeNote);
  const [body, setBody] = useState(note.body);
  const debounceRef = useRef<number | undefined>(undefined);
  const bodyRef = useRef(body);
  bodyRef.current = body;

  useEffect(() => {
    return () => {
      window.clearTimeout(debounceRef.current);
      if (bodyRef.current !== note.body) void updateNote(note.id, bodyRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  function handleChange(value: string) {
    setBody(value);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void updateNote(note.id, value);
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  function handleDelete() {
    window.clearTimeout(debounceRef.current);
    void removeNote(note.id);
    onClose();
  }

  return (
    <Overlay onClose={onClose} label="Nota">
      <div className="cerne-note-editor">
        <div className="cerne-note-editor__header">
          <span className="cerne-note-editor__date">Editado {formatRelative(note.updatedAt)}</span>
          <ConfirmButton confirmLabel="Confirmar exclusão" onConfirm={handleDelete}>
            Apagar
          </ConfirmButton>
        </div>
        <textarea
          autoFocus
          className="cerne-note-editor__body"
          placeholder="Nova nota…"
          value={body}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
    </Overlay>
  );
}
