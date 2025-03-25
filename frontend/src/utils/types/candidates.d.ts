// Type representing a Candidate
interface Candidate {
  id: string;
  candidateName: string; // Name of the candidate
  telephone: string; // Candidate's phone number as a string
  profile: string; // URL to the candidate's profile image
  positionId: string; // Foreign key linking to a position
  del_flag: boolean; // Indicates if the candidate is flagged as deleted
  createdAt: string; // ISO timestamp string for creation
  updatedAt: string; // ISO timestamp string for last update
  positions: Position; // Nested object representing the position details
}

// Main response type encapsulating all candidates
interface CandidatesResponse {
  success: boolean;
  candidates: Candidate[];
  positions: Position[];
  groupedByPosition: {
    position: Position;
    candidates: Candidate[];
  }[];
  totalCandidates: number;
}

interface CandidateDetailsResponse {
  success: boolean;
  candidate: Candidate;
  otherCandidates: Candidate[];
}
