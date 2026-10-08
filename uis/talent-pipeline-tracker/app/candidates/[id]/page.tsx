import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCandidate } from "@/lib/candidates";
import type { Candidate } from "@/types/candidate";
import CandidateDetailView from "@/components/candidate-detail";

async function CandidateDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let candidate: Candidate | null;
  try {
    candidate = await getCandidate(id);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "No se pudo cargar la candidatura.";
    return <p className="error-state" role="alert">Error al cargar la candidatura: {message}</p>;
  }
  if (!candidate) notFound();

  return <CandidateDetailView initialCandidate={candidate} />;
}

export default function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="workspace detail-workspace">
      <Link className="back-link" href="/">Volver a candidaturas</Link>
      <Suspense fallback={<p className="empty-state" role="status">Cargando candidatura...</p>}>
        <CandidateDetail params={params} />
      </Suspense>
    </main>
  );
}