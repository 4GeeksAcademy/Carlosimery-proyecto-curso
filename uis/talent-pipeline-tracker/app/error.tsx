"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="workspace empty-state" role="alert">
      <h1>No se pudieron cargar los datos</h1>
      <p>Comprueba la conexi&oacute;n y vuelve a intentarlo.</p>
      <button className="retry-button" onClick={() => reset()}>Reintentar</button>
    </main>
  );
}