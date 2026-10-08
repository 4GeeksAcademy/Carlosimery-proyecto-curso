"use client";

import { useEffect, useState } from "react";
import { candidateLabel, formatDate, type Candidate } from "@/lib/candidates";
import { addCandidateNote, deleteCandidateNote, getCandidateNotes, updateCandidate } from "./actions";

type CandidateNote = NonNullable<Candidate["notes"]>[number];

const statusOptions = ["received", "in_progress", "selected", "discarded"];
const stageOptions = ["pending", "review", "interview", "offer", "hired"];

export default function CandidateInteractions({
  candidateId,
  initialStatus,
  initialStage,
  onFieldUpdated,
  onNotesCountChange,
}: {
  candidateId: string;
  initialStatus: string;
  initialStage: string;
  onFieldUpdated: (field: "status" | "stage", value: string) => void;
  onNotesCountChange: (count: number) => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [stage, setStage] = useState(initialStage);
  const [savingField, setSavingField] = useState<"status" | "stage" | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deletingNote, setDeletingNote] = useState("");

  useEffect(() => {
    let active = true;
    async function loadNotes() {
      try {
        const result = await getCandidateNotes(candidateId);
        if (active) setNotes(result);
      } catch (cause: unknown) {
        if (active) setNotesError(cause instanceof Error ? cause.message : "No se pudieron cargar las notas.");
      } finally {
        if (active) setNotesLoading(false);
      }
    }
    void loadNotes();

    return () => {
      active = false;
    };
  }, [candidateId]);

  async function saveField(field: "status" | "stage", value: string) {
    setSavingField(field);
    setUpdateMessage("");
    try {
      await updateCandidate(candidateId, field === "status" ? { status: value } : { stage: value });
      if (field === "status") setStatus(value);
      else setStage(value);
      onFieldUpdated(field, value);
      setUpdateMessage("Cambios guardados.");
    } catch (cause) {
      setUpdateMessage(cause instanceof Error ? cause.message : "No se pudo actualizar la candidatura.");
    } finally {
      setSavingField(null);
    }
  }

  async function submitNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = noteText.trim();
    if (!content) return;

    setSavingNote(true);
    setNotesError("");
    try {
      const updatedNotes = await addCandidateNote(candidateId, content);
      setNotes(updatedNotes);
      onNotesCountChange(updatedNotes.length);
      setNoteText("");
    } catch (cause) {
      setNotesError(cause instanceof Error ? cause.message : "No se pudo añadir la nota.");
    } finally {
      setSavingNote(false);
    }
  }

  async function removeNote(noteId: string) {
    setDeletingNote(noteId);
    setNotesError("");
    try {
      const updatedNotes = await deleteCandidateNote(candidateId, noteId);
      setNotes(updatedNotes);
      onNotesCountChange(updatedNotes.length);
    } catch (cause) {
      setNotesError(cause instanceof Error ? cause.message : "No se pudo eliminar la nota.");
    } finally {
      setDeletingNote("");
    }
  }

  return (
    <>
      <section className="detail-section" aria-labelledby="update-heading">
        <h2 id="update-heading">Actualizar candidatura</h2>
        <div className="edit-fields">
          <label className="detail-control">
            <span>Estado</span>
            <select
              value={status}
              disabled={savingField !== null}
              onChange={(event) => void saveField("status", event.target.value)}
            >
              {[...new Set([initialStatus, ...statusOptions])].map((option) => (
                <option key={option} value={option}>{candidateLabel(option)}</option>
              ))}
            </select>
          </label>
          <label className="detail-control">
            <span>Etapa</span>
            <select
              value={stage}
              disabled={savingField !== null}
              onChange={(event) => void saveField("stage", event.target.value)}
            >
              {[...new Set([initialStage, ...stageOptions])].map((option) => (
                <option key={option} value={option}>{candidateLabel(option)}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="form-message" role="status" aria-live="polite">
          {savingField ? "Guardando cambios..." : updateMessage}
        </p>
      </section>
      <section className="detail-section" aria-labelledby="notes-heading">
        <h2 id="notes-heading">Notas ({notes.length})</h2>
        <form className="note-form" onSubmit={submitNote}>
          <label className="detail-control" htmlFor="new-note">Nueva nota</label>
          <textarea
            id="new-note"
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            rows={4}
            required
          />
          <button className="retry-button" type="submit" disabled={savingNote || !noteText.trim()}>
            {savingNote ? "Añadiendo..." : "Añadir nota"}
          </button>
        </form>
        {notesError && <p className="error-state" role="alert">{notesError}</p>}
        {notesLoading ? (
          <p className="empty-state" role="status">Cargando notas...</p>
        ) : notes.length === 0 ? (
          <p className="empty-state">Todavía no hay notas.</p>
        ) : (
          <ul className="notes-list">
            {notes.map((note) => (
              <li className="note-item" key={note.id}>
                <div>
                  <time dateTime={note.created_at}>{formatDate(note.created_at, true)}</time>
                  <p>{note.content}</p>
                </div>
                <button
                  className="quiet-button"
                  type="button"
                  disabled={deletingNote !== "" || savingNote}
                  onClick={() => void removeNote(note.id)}
                >
                  {deletingNote === note.id ? "Eliminando..." : "Eliminar"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}