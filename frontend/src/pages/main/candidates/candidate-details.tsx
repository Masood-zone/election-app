import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetCandidateById } from "@/services/candidates/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Phone, Award, User, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

export default function CandidateDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, error } = useGetCandidateById(id || "");
  //   const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  if (error) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Error Loading Candidate
        </h1>
        <p className="text-muted-foreground mb-6">
          We encountered an error while loading the candidate details. Please
          try again later.
        </p>
        <Button asChild>
          <Link to="/candidates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Link>
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading candidate details...</p>
      </div>
    );
  }

  if (!data?.candidate) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Candidate Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The candidate you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/candidates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Link>
        </Button>
      </div>
    );
  }

  const { candidate, otherCandidates } = data;

  return (
    <div className="container py-8 md:py-12">
      {/* Back button */}
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link to="/candidates" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Image */}
        <div className="lg:col-span-1">
          <div className="relative rounded-lg overflow-hidden border bg-background shadow-md aspect-[3/4]">
            {/* {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )} */}
            <img
              src={candidate.profile || "/placeholder.svg"}
              alt={candidate.candidateName}
              className="h-full w-full object-cover transition-opacity duration-300"
              //   className={`h-full w-full object-cover transition-opacity duration-300 ${
              //     imageLoaded ? "opacity-100" : "opacity-0"
              //   }`}
              //   onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>

        {/* Right column - Details */}
        <div className="lg:col-span-2">
          <div className="mb-2">
            <Badge className="bg-primary/80 hover:bg-primary">
              {candidate.positions.positionName}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {candidate.candidateName}
          </h1>

          <div className="flex items-center text-muted-foreground mb-6">
            <Phone className="mr-2 h-4 w-4" />
            <span>{candidate.telephone}</span>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center mb-3">
                <Award className="mr-2 h-5 w-5 text-primary" />
                Position Details
              </h2>
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">
                  {candidate.positions.positionName}
                </h3>
                <p className="text-muted-foreground">
                  {candidate.positions.description ||
                    "No description available."}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold flex items-center mb-3">
                <User className="mr-2 h-5 w-5 text-primary" />
                Candidate Profile
              </h2>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-muted-foreground">
                  {candidate.profile
                    ? "This candidate has provided a detailed profile picture."
                    : "This candidate has not provided a detailed profile yet."}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button size="lg" className="w-full md:w-auto">
                Vote for this Candidate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Other candidates for this position */}
      {otherCandidates && otherCandidates.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold flex items-center mb-6">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Other Candidates for {candidate.positions.positionName}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherCandidates.map((otherCandidate) => (
              <motion.div
                key={otherCandidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md"
              >
                <Link to={`/candidates/${otherCandidate.id}`}>
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={
                        otherCandidate.profile ||
                        "/placeholder.svg?height=300&width=300"
                      }
                      alt={otherCandidate.candidateName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold">
                      {otherCandidate.candidateName}
                    </h3>

                    <div className="mt-2 flex items-center text-sm opacity-90">
                      <Phone className="mr-1 h-3 w-3" />
                      <span>{otherCandidate.telephone}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
