"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { candidateLabel, formatDate, type Candidate } from "@/lib/candidates";

type CandidateListProps = {
  candidates?: Candidate[];
  error?: string;
};

export default function CandidateList({ candidates = [], error }: CandidateListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const statusFilter = searchParams.get("status") ?? "";
  const stageFilter = searchParams.get("stage") ?? "";

  function updateFilter(name: "status" | "stage", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleCandidates = candidates.filter((candidate) => {
    const matchesStatus = !statusFilter || candidate.status === statusFilter;
    const matchesStage = !stageFilter || candidate.stage === stageFilter;
    const matchesSearch = !normalizedSearch
      || candidate.full_name.toLocaleLowerCase().includes(normalizedSearch)
      || candidate.email.toLocaleLowerCase().includes(normalizedSearch);
    return matchesStatus && matchesStage && matchesSearch;
  });
  const statuses = [...new Set(candidates.map((candidate) => candidate.status))]
    .sort((first, second) => candidateLabel(first).localeCompare(candidateLabel(second), "es"));
  const stages = [...new Set(candidates.map((candidate) => candidate.stage))]
    .sort((first, second) => candidateLabel(first).localeCompare(candidateLabel(second), "es"));

  return (
    <>
      <div className="section-heading">
        <h1>Candidaturas</h1>
        <div className="list-heading-meta">
          <span className="count">{error ? "" : `${visibleCandidates.length} candidaturas`}</span>
          <Link className="retry-button new-candidate-link" href="/candidates/new">Nueva candidatura</Link>
        </div>
      </div>
      <div className="candidate-filters">
        <label className="filter-control">
          <span>Buscar</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre o email"
          />
        </label>
        <label className="filter-control">
          <span>Estado</span>
          <select value={statusFilter} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="">Todos</option>
            {statuses.map((status) => <option key={status} value={status}>{candidateLabel(status)}</option>)}
          </select>
        </label>
        <label className="filter-control">
          <span>Etapa</span>
          <select value={stageFilter} onChange={(event) => updateFilter("stage", event.target.value)}>
            <option value="">Todas</option>
            {stages.map((stage) => <option key={stage} value={stage}>{candidateLabel(stage)}</option>)}
          </select>
        </label>
      </div>
      {error ? (
        <p className="error-state" role="alert">Error al cargar las candidaturas: {error}</p>
      ) : candidates.length === 0 ? (
        <p className="empty-state">No hay candidaturas disponibles.</p>
      ) : visibleCandidates.length === 0 ? (
        <p className="empty-state" role="status">No hay candidaturas que coincidan con la búsqueda y los filtros.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <caption className="sr-only">Listado de todas las candidaturas</caption>
            <thead><tr>
              <th scope="col">Candidato</th><th scope="col">Puesto</th>
              <th scope="col">Estado</th><th scope="col">Etapa</th>
              <th scope="col">Experiencia</th><th scope="col">Fecha de candidatura</th>
            </tr></thead>
            <tbody>
              {visibleCandidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <Link className="candidate-link" href={`/candidates/${encodeURIComponent(candidate.id)}`} prefetch={false}>
                      {candidate.full_name}
                    </Link>
                    <span className="secondary">{candidate.email}</span>
                  </td>
                  <td>{candidate.position}</td>
                  <td><span className="status" data-status={candidate.status}>{candidateLabel(candidate.status)}</span></td>
                  <td>{candidateLabel(candidate.stage)}</td>
                  <td>{candidate.experience_years == null ? "No disponible" : `${candidate.experience_years} a\u00f1os`}</td>
                  <td className="date-cell">{formatDate(candidate.applied_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}