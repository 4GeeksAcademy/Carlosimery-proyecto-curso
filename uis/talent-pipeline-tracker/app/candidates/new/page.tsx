import Link from "next/link";
import CandidateForm from "@/components/candidate-form";

export default function NewCandidatePage() {
  return (
    <main className="workspace detail-workspace">
      <Link className="back-link" href="/">Volver a candidaturas</Link>
      <div className="detail-heading">
        <div>
          <h1>Nueva candidatura</h1>
          <p className="position">Registrar una persona candidata en TrackFlow</p>
        </div>
      </div>
      <section className="detail-section" aria-labelledby="new-candidate-heading">
        <h2 id="new-candidate-heading">Datos de la candidatura</h2>
        <CandidateForm mode="create" />
      </section>
    </main>
  );
}