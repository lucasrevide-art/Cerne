import { useState } from "react";
import { useNoteStore } from "../../store/noteStore";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../components/icons";
import { NoteEditor } from "./NoteEditor";
import "./NotesSection.css";

function noteTitle(body: string): string {
  const firstLine = body.split("\n").find((line) => line.trim() !== "");
  return firstLine?.trim() || "Nota sem título";
}

function notePreview(body: string): string {
  const lines = body.split("\n").filter((line) => line.trim() !== "");
  return lines.slice(1).join(" ").trim();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface NotesSectionProps {
  areaId: string;
}

/** Lista de notas independentes de uma área — cada card abre sua própria nota, como no app Notas do macOS. */
export function NotesSection({ areaId }: NotesSectionProps) {
  const allNotes = useNoteStore((s) => s.notes);
  const addNote = useNoteStore((s) => s.addNote);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const notes = allNotes.filter((n) => n.areaId === areaId);
  const openNote = openNoteId ? notes.find((n) => n.id === openNoteId) : undefined;

  async function handleCreate() {
    const note = await addNote(areaId);
    setOpenNoteId(note.id);
  }

  return (
    <section className="cerne-notes-section" aria-label="Notas da área">
      <div className="cerne-notes-section__header">
        <h2 className="text-h2">Notas</h2>
        <Button variant="secondary" icon={<PlusIcon width={14} height={14} />} onClick={() => void handleCreate()}>
          Nova nota
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="cerne-notes-section__empty">Nenhuma nota nesta área.</p>
      ) : (
        <div className="cerne-notes-section__list">
          {notes.map((note) => (
            <button
              key={note.id}
              type="button"
              className="cerne-notes-section__card"
              onClick={() => setOpenNoteId(note.id)}
            >
              <span className="cerne-notes-section__card-title">{noteTitle(note.body)}</span>
              {notePreview(note.body) && (
                <span className="cerne-notes-section__card-preview">{notePreview(note.body)}</span>
              )}
              <span className="cerne-notes-section__card-date">{formatDate(note.updatedAt)}</span>
            </button>
          ))}
        </div>
      )}

      {openNote && <NoteEditor note={openNote} onClose={() => setOpenNoteId(null)} />}
    </section>
  );
}
