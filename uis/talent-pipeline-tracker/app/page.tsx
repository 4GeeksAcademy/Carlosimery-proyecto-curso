import { Suspense } from "react";
import CandidateList from "./candidate-list";
import { getCandidates, type Candidate } from "@/lib/candidates";

async function CandidateListLoader() {
  let candidates: Candidate[] = [];
  let error = "";

  try {
    candidates = await getCandidates();
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "No se pudieron obtener las candidaturas.";
  }

  return error ? <CandidateList error={error} /> : <CandidateList candidates={candidates} />;
}

export default function Home() {
  return (
    <main className="workspace">
      <Suspense fallback={<p className="empty-state" role="status">Cargando candidaturas...</p>}>
        <CandidateListLoader />
      </Suspense>
    </main>
  );
}
