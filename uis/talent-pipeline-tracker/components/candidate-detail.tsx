"use client";

import { useState } from "react";
import { candidateLabel, formatDate } from "@/lib/candidates";
import type { Candidate, CandidateWriteInput } from "@/types/candidate";
import CandidateForm from "./candidate-form";
import CandidateInteractions from "@/app/candidates/[id]/candidate-interactions";

export default function CandidateDetailView({ initialCandidate }: { initialCandidate: Candidate }) {
  const [candidate, setCandidate] = useState(initialCandidate);
  const [editing, setEditing] = useState(false);

  function applyEdit(input: CandidateWriteInput) {
    setCandidate((current) => ({ ...current, ...input, updated_at: new Date().toISOString() }));
    setEditing(false);
  }

  function updateCandidateField(field: "status" | "stage", value: string) {
    setCandidate((current) => ({ ...current, [field]: value, updated_at: new Date().toISOString() }));
  }

  function updateNotesCount(notes_count: number) {
    setCandidate((current) => ({ ...current, notes_count }));
  }

  return (
    <>
      <div className="detail-heading">
        <div><h1>{candidate.full_name}</h1><p className="position">{candidate.position}</p></div>
        <div className="detail-heading-actions">
          <span className="status" data-status={candidate.status}>{candidateLabel(candidate.status)}</span>
          {!editing && <button className="secondary-button" type="button" onClick={() => setEditing(true)}>Editar candidatura</button>}
        </div>
      </div>
      {editing ? (
        <section className="detail-section" aria-labelledby="edit-candidate-heading">
          <h2 id="edit-candidate-heading">Editar datos de la candidatura</h2>
          <CandidateForm mode="edit" candidate={candidate} onCancel={() => setEditing(false)} onSaved={applyEdit} />
        </section>
      ) : (
        <>
          <section className="detail-section" aria-labelledby="contact-heading">
            <h2 id="contact-heading">Contacto y documentos</h2>
            <dl className="detail-grid">
              <div><dt>Nombre completo</dt><dd>{candidate.full_name}</dd></div>
              <div><dt>Correo electr&oacute;nico</dt><dd><a href={`mailto:${candidate.email}`}>{candidate.email}</a></dd></div>
              <div><dt>Tel&eacute;fono</dt><dd>{candidate.phone ? <a href={`tel:${candidate.phone}`}>{candidate.phone}</a> : "No disponible"}</dd></div>
              <div><dt>LinkedIn</dt><dd>{candidate.linkedin_url ? <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">{candidate.linkedin_url}</a> : "No disponible"}</dd></div>
              <div><dt>Curr&iacute;culum</dt><dd>{candidate.cv_url ? <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">Ver curr&iacute;culum</a> : "No disponible"}</dd></div>
            </dl>
          </section>
          <section className="detail-section" aria-labelledby="application-heading">
            <h2 id="application-heading">Datos de la candidatura</h2>
            <dl className="detail-grid">
              <div><dt>Puesto</dt><dd>{candidate.position}</dd></div>
              <div><dt>Estado</dt><dd>{candidateLabel(candidate.status)}</dd></div>
              <div><dt>Etapa</dt><dd>{candidateLabel(candidate.stage)}</dd></div>
              <div><dt>Experiencia</dt><dd>{candidate.experience_years == null ? "No disponible" : `${candidate.experience_years} a\u00f1os`}</dd></div>
              <div><dt>Fecha de candidatura</dt><dd><time dateTime={candidate.applied_at}>{formatDate(candidate.applied_at, true)}</time></dd></div>
              <div><dt>&Uacute;ltima actualizaci&oacute;n</dt><dd><time dateTime={candidate.updated_at}>{formatDate(candidate.updated_at, true)}</time></dd></div>
              <div><dt>N&uacute;mero de notas</dt><dd>{candidate.notes_count}</dd></div>
              <div><dt>ID de candidatura</dt><dd className="record-id">{candidate.id}</dd></div>
            </dl>
          </section>
          <CandidateInteractions
            candidateId={candidate.id}
            initialStatus={candidate.status}
            initialStage={candidate.stage}
            onFieldUpdated={updateCandidateField}
            onNotesCountChange={updateNotesCount}
          />
        </>
      )}
    </>
  );
}