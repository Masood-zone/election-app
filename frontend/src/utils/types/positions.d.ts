interface Position {
  id: string;
  positionName: string;
  description: string;
  voteCount: number;
  del_flg: boolean; // Indicates if the position is flagged as deleted
  createdAt: string; // ISO timestamp string for creation
  updatedAt: string; // ISO timestamp string for last update
}
