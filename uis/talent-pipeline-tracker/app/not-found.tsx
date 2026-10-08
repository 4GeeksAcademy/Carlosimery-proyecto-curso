import Link from "next/link";

export default function NotFound() {
  return (
    <main className="workspace empty-state">
      <h1>Candidatura no encontrada</h1>
      <p>Esta candidatura no existe o ya no est&aacute; disponible.</p>
      <Link className="back-link" href="/">Volver a candidaturas</Link>
    </main>
  );
}