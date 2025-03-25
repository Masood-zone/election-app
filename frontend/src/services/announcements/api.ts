import { api } from "../api";

export const getAnnouncements = async (): Promise<AnnouncementsResponse> => {
  const response = await api.get("/dashboard/announcements");
  return response.data;
};

export const getAnnouncementsByElection = async (
  electionId: string
): Promise<AnnouncementsResponse> => {
  const response = await api.get(
    `/dashboard/elections/${electionId}/announcements`
  );
  return response.data;
};
