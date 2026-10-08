"use server";

import { createCandidate, replaceCandidate } from "@/lib/candidates";
import type { Candidate, CandidateWriteInput } from "@/types/candidate";

export async function createCandidateAction(input: CandidateWriteInput): Promise<Candidate> {
  return await createCandidate(input);
}

export async function replaceCandidateAction(id: string, input: CandidateWriteInput): Promise<void> {
  await replaceCandidate(id, input);
}