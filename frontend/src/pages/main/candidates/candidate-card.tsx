import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const navigate = useNavigate();
  const handleViewProfile = (id: string) => {
    navigate(`/candidates/${id}`);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md"
    >
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img
          src={candidate.profile || "/placeholder.svg"}
          alt={candidate.candidateName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="mb-1">
          <Badge className="bg-primary/80 hover:bg-primary">
            {candidate.positions.positionName}
          </Badge>
        </div>
        <h3 className="text-xl font-bold">{candidate.candidateName}</h3>

        <div className="mt-2 flex items-center text-sm opacity-90">
          <Phone className="mr-1 h-3 w-3" />
          <span>{candidate.telephone}</span>
        </div>

        <div className="mt-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            onClick={() => {
              handleViewProfile(candidate.id);
            }}
            size="sm"
            className="w-full"
          >
            View Profile
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
