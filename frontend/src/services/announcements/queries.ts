import { useQuery } from "@tanstack/react-query";
import { getAnnouncements, getAnnouncementsByElection } from "./api";

export const useGetAnnouncements = () => {
  return useQuery({
    queryKey: ["all-announcements"],
    queryFn: getAnnouncements,
  });
};

export const useGetAnnouncementsByElection = (electionId: string) => {
  return useQuery({
    queryKey: ["announcements", electionId],
    queryFn: () => getAnnouncementsByElection(electionId),
    enabled: !!electionId,
  });
};
