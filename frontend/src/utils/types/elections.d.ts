interface Election {
  id: string;
  title: string;
  description: string;
  status: "ONGOING" | "UPCOMING" | "COMPLETED";
  isActive: boolean;
  startDate: string;
  endDate: string;
}
