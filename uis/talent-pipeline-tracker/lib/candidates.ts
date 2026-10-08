import type { Candidate, CandidateRecordResponse, CandidateWriteInput, RecordsPage } from "@/types/candidate";

export type { Candidate } from "@/types/candidate";

async function request(path: string, init?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("Falta configurar NEXT_PUBLIC_API_URL.");
  return await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    ...init,
  });
}

async function getPage(page: number): Promise<RecordsPage> {
  const response = await request(`/records?page=${page}`);
  if (!response.ok) throw new Error("No se pudo obtener el listado.");
  return await response.json() as RecordsPage;
}

export async function getCandidates(): Promise<Candidate[]> {
  const first = await getPage(1);
  const pageCount = Math.ceil(first.total / first.limit);
  const remaining = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => getPage(index + 2)),
  );
  return [first, ...remaining].flatMap((page) => page.data);
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  const response = await request(`/records/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo obtener la candidatura.");
  const payload: CandidateRecordResponse = await response.json();
  return "data" in payload ? payload.data : payload;
}

export async function createCandidate(input: CandidateWriteInput): Promise<Candidate> {
  const response = await request("/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "No se pudo registrar la candidatura.");
  }
  const payload: CandidateRecordResponse = await response.json();
  return "data" in payload ? payload.data : payload;
}

export async function replaceCandidate(id: string, input: CandidateWriteInput): Promise<void> {
  const response = await request(`/records/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "No se pudo guardar la candidatura.");
  }
}

const labels: Record<string, string> = {
  received: "Recibida",
  in_progress: "En proceso",
  selected: "Seleccionada",
  discarded: "Descartada",
  pending: "Pendiente",
  review: "En revisi\u00f3n",
  interview: "Entrevista",
  offer: "Oferta",
  hired: "Contratada",
};

export function candidateLabel(value: string) {
  return labels[value] ?? value;
}

export function formatDate(value: string, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "long" as const } : {}),
    timeZone: "UTC",
  }).format(date);
}