export type CandidateNote = {
  id: string;
  content: string;
  created_at: string;
};

export type Candidate = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: string;
  stage: string;
  experience_years: number | null;
  notes_count: number;
  applied_at: string;
  updated_at: string;
  notes?: CandidateNote[];
};

export type CandidateWriteInput = Pick<
  Candidate,
  | "full_name"
  | "email"
  | "phone"
  | "position"
  | "linkedin_url"
  | "cv_url"
  | "status"
  | "stage"
  | "experience_years"
  | "applied_at"
>;

export type RecordsPage = {
  total: number;
  page: number;
  limit: number;
  data: Candidate[];
};

export type CandidateRecordResponse = Candidate | { data: Candidate };
export type CandidateNotesResponse = CandidateNote[] | { data: CandidateNote[] } | { notes: CandidateNote[] };