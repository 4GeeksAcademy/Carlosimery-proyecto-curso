"use server";

import type { Candidate, CandidateNotesResponse } from "@/types/candidate";

type CandidateNote = NonNullable<Candidate["notes"]>[number];
type CandidateUpdate = { status: string } | { stage: string };

async function request(path: string, init?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("Falta configurar NEXT_PUBLIC_API_URL.");

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    ...init,
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `La solicitud falló (${response.status}).`);
  }
  return response;
}

async function fetchCandidateNotes(id: string): Promise<CandidateNote[]> {
  const response = await request(`/records/${encodeURIComponent(id)}/notes`);
  const payload: CandidateNotesResponse = await response.json();
  if (Array.isArray(payload)) return payload as CandidateNote[];
  if (payload && typeof payload === "object") {
    if ("data" in payload && Array.isArray(payload.data)) return payload.data;
    if ("notes" in payload && Array.isArray(payload.notes)) return payload.notes;
  }
  throw new Error("La respuesta de notas tiene un formato no válido.");
}

export async function updateCandidate(id: string, update: CandidateUpdate) {
  await request(`/records/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
}

export async function getCandidateNotes(id: string) {
  return fetchCandidateNotes(id);
}

export async function addCandidateNote(id: string, content: string) {
  await request(`/records/${encodeURIComponent(id)}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return fetchCandidateNotes(id);
}

export async function deleteCandidateNote(id: string, noteId: string) {
  await request(`/records/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`, {
    method: "DELETE",
  });
  return fetchCandidateNotes(id);
}