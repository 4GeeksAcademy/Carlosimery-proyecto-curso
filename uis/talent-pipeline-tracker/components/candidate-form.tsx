"use client";

import { useState } from "react";
import Link from "next/link";
import { candidateLabel } from "@/lib/candidates";
import type { Candidate, CandidateWriteInput } from "@/types/candidate";
import { createCandidateAction, replaceCandidateAction } from "@/app/candidates/actions";

type CandidateFormValues = {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string;
  cv_url: string;
  status: string;
  stage: string;
  experience_years: string;
  applied_at: string;
};

type CandidateFormProps =
  | { mode: "create" }
  | { mode: "edit"; candidate: Candidate; onCancel: () => void; onSaved: (input: CandidateWriteInput) => void };

const statusOptions = ["received", "in_progress", "selected", "discarded"];
const stageOptions = ["pending", "review", "interview", "offer", "hired"];

function formValues(candidate?: Candidate): CandidateFormValues {
  return {
    full_name: candidate?.full_name ?? "",
    email: candidate?.email ?? "",
    phone: candidate?.phone ?? "",
    position: candidate?.position ?? "",
    linkedin_url: candidate?.linkedin_url ?? "",
    cv_url: candidate?.cv_url ?? "",
    status: candidate?.status ?? "received",
    stage: candidate?.stage ?? "pending",
    experience_years: candidate?.experience_years == null ? "" : String(candidate.experience_years),
    applied_at: candidate?.applied_at.slice(0, 10) ?? "",
  };
}

function toCandidateInput(values: CandidateFormValues): CandidateWriteInput {
  return {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    position: values.position.trim(),
    linkedin_url: values.linkedin_url.trim() || null,
    cv_url: values.cv_url.trim() || null,
    status: values.status,
    stage: values.stage,
    experience_years: values.experience_years === "" ? null : Number(values.experience_years),
    applied_at: new Date(`${values.applied_at}T00:00:00.000Z`).toISOString(),
  };
}

export default function CandidateForm(props: CandidateFormProps) {
  const [values, setValues] = useState(() => formValues(props.mode === "edit" ? props.candidate : undefined));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [createdCandidate, setCreatedCandidate] = useState<Candidate | null>(null);
  const currentStatus = props.mode === "edit" ? props.candidate.status : "received";
  const currentStage = props.mode === "edit" ? props.candidate.stage : "pending";

  function updateValue(field: keyof CandidateFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const input = toCandidateInput(values);
      if (props.mode === "create") {
        const created = await createCandidateAction(input);
        setCreatedCandidate(created);
        setFeedback({ kind: "success", message: "Candidatura registrada correctamente." });
      } else {
        await replaceCandidateAction(props.candidate.id, input);
        props.onSaved(input);
        setFeedback({ kind: "success", message: "Candidatura actualizada correctamente." });
      }
    } catch (cause) {
      setFeedback({
        kind: "error",
        message: cause instanceof Error ? cause.message : "No se pudo guardar la candidatura.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="candidate-form" onSubmit={submitForm}>
      <div className="candidate-form-grid">
        <label className="detail-control">
          <span>Nombre completo *</span>
          <input autoComplete="name" maxLength={160} required value={values.full_name} onChange={(event) => updateValue("full_name", event.target.value)} />
        </label>
        <label className="detail-control">
          <span>Correo electr&oacute;nico *</span>
          <input autoComplete="email" type="email" maxLength={254} required value={values.email} onChange={(event) => updateValue("email", event.target.value)} />
        </label>
        <label className="detail-control">
          <span>Puesto *</span>
          <input maxLength={160} required value={values.position} onChange={(event) => updateValue("position", event.target.value)} />
        </label>
        <label className="detail-control">
          <span>Tel&eacute;fono</span>
          <input autoComplete="tel" type="tel" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} />
        </label>
        <label className="detail-control">
          <span>LinkedIn</span>
          <input type="url" placeholder="https://www.linkedin.com/in/..." value={values.linkedin_url} onChange={(event) => updateValue("linkedin_url", event.target.value)} />
        </label>
        <label className="detail-control">
          <span>Enlace al CV</span>
          <input type="url" placeholder="https://..." value={values.cv_url} onChange={(event) => updateValue("cv_url", event.target.value)} />
        </label>
        <label className="detail-control">
          <span>A&ntilde;os de experiencia</span>
          <input type="number" min="0" max="80" step="1" value={values.experience_years} onChange={(event) => updateValue("experience_years", event.target.value)} />
        </label>
        <label className="detail-control">
          <span>Fecha de candidatura *</span>
          <input type="date" required value={values.applied_at} onChange={(event) => updateValue("applied_at", event.target.value)} />
        </label>
        <label className="detail-control">
          <span>Estado *</span>
          <select required value={values.status} onChange={(event) => updateValue("status", event.target.value)}>
            {[...new Set([currentStatus, ...statusOptions])].map((status) => <option key={status} value={status}>{candidateLabel(status)}</option>)}
          </select>
        </label>
        <label className="detail-control">
          <span>Etapa *</span>
          <select required value={values.stage} onChange={(event) => updateValue("stage", event.target.value)}>
            {[...new Set([currentStage, ...stageOptions])].map((stage) => <option key={stage} value={stage}>{candidateLabel(stage)}</option>)}
          </select>
        </label>
      </div>
      {feedback && (
        <p className="form-feedback" data-kind={feedback.kind} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.message}
          {createdCandidate && feedback.kind === "success" && (
            <> {createdCandidate.full_name} · {createdCandidate.position}. <Link href={`/candidates/${encodeURIComponent(createdCandidate.id)}`}>Abrir ficha</Link></>
          )}
        </p>
      )}
      <div className="form-actions">
        {props.mode === "edit" && <button className="secondary-button" type="button" disabled={saving} onClick={props.onCancel}>Cancelar</button>}
        <button className="retry-button" type="submit" disabled={saving || (props.mode === "create" && createdCandidate !== null)}>
          {saving ? "Guardando..." : props.mode === "create" ? "Registrar candidatura" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}