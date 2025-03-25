interface Announcement {
  id: string;
  electionId: string;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  election?: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    isActive: boolean;
  };
}

interface AnnouncementsResponse {
  status: string;
  data: Announcement[];
}
