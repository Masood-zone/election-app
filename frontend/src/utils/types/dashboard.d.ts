interface DashboardDataResponse {
  summary: {
    totalVoters: number;
    activeVoters: number;
    totalCandidates: number;
    totalPositions: number;
    totalVotes: number;
    voterTurnout: number;
  };
  elections: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
  recentVotes: {
    id: string;
    positionId: string;
    candidateId: string;
    voterId: string;
    electionId: string | null;
    timestamp: string;
    voters: {
      studentId: string;
      studentName: string;
    };
    positions: {
      positionName: string;
    };
    candidates: {
      candidateName: string;
    };
    election: {
      title: string;
    } | null;
  }[];
  topPositions: {
    id: string;
    positionName: string;
    voteCount: number;
  }[];
}
