import { useEffect, useState } from "react";
import { useGetMyVotes } from "@/services/voting/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, CheckCircle2, Vote } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";

export default function MyVotes() {
  const { data, isLoading, error } = useGetMyVotes();
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    // Set the first election as active tab if available
    if (data?.elections && data.elections.length > 0) {
      setActiveTab(data.elections[0].election.id);
    }
  }, [data]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item: { hidden: { opacity: 0; y: 20 }; show: { opacity: 1; y: 0 } } = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your voting history. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data?.elections || data.elections.length === 0) {
    return (
      <div className="p-6 md:p-10">
        <div className="mb-6">
          <h3 className="text-2xl font-bold tracking-tight">My Votes</h3>
          <p className="text-muted-foreground">
            View your voting history and current election participation
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Votes Found</CardTitle>
            <CardDescription>
              You haven't participated in any elections yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Vote className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No voting history</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                When you participate in elections, your voting history will
                appear here. Check the active elections to cast your vote.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">My Votes</h3>
        <p className="text-muted-foreground">
          View your voting history and current election participation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-auto flex flex-nowrap overflow-x-auto pb-1 justify-start">
          <TabsTrigger value="all" className="flex-shrink-0">
            All Votes ({data.totalVotes})
          </TabsTrigger>
          {data.elections.map(
            (election: {
              election: { id: string; title: string };
              votes: {
                id: string;
                candidate: { name: string; profile?: string };
                position: { name: string; description?: string };
                votedAt: string;
              }[];
            }) => (
              <TabsTrigger
                key={election.election.id}
                value={election.election.id}
                className="flex-shrink-0"
              >
                {election.election.title} ({election.votes.length})
              </TabsTrigger>
            )
          )}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <motion.div
            className="grid gap-6 md:grid-cols-2"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {data.elections.flatMap(
              (election: {
                election: { id: string; title: string };
                votes: {
                  id: string;
                  candidate: { name: string; profile?: string };
                  position: { name: string; description?: string };
                  votedAt: string;
                }[];
              }) =>
                election.votes.map((vote) => (
                  <VoteCard
                    key={vote.id}
                    vote={vote}
                    electionTitle={election.election.title}
                    item={item}
                  />
                ))
            )}
          </motion.div>
        </TabsContent>

        {data.elections.map(
          (election: {
            election: { id: string; title: string };
            votes: {
              id: string;
              candidate: { name: string; profile?: string };
              position: { name: string; description?: string };
              votedAt: string;
            }[];
          }) => (
            <TabsContent
              key={election.election.id}
              value={election.election.id}
              className="mt-6"
            >
              <motion.div
                className="grid gap-6 md:grid-cols-2"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {election.votes.map((vote) => (
                  <VoteCard
                    key={vote.id}
                    vote={vote}
                    electionTitle={election.election.title}
                    item={item}
                  />
                ))}
              </motion.div>
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}

function VoteCard({
  vote,
  electionTitle,
  item,
}: {
  vote: {
    id: string;
    candidate: { name: string; profile?: string };
    position: { name: string; description?: string };
    votedAt: string;
  };
  electionTitle: string;
  item: {
    hidden: { opacity: 0; y: 20 };
    show: { opacity: 1; y: 0 };
  };
}) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        formatted: format(date, "PPP 'at' p"),
        relative: formatDistanceToNow(date, { addSuffix: true }),
      };
    } catch (e) {
      console.log(e);

      return {
        formatted: "Unknown date",
        relative: "",
      };
    }
  };

  const dateInfo = formatDate(vote.votedAt);

  return (
    <motion.div variants={item}>
      <Card className="h-full overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {vote.position?.name || "Unknown Position"}
              </CardTitle>
              <CardDescription>{electionTitle}</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-500 border-green-500/20"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" /> Voted
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {vote.candidate?.profile ? (
                <img
                  src={vote.candidate.profile || "/placeholder.svg"}
                  alt={vote.candidate?.name || "Candidate"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10">
                  <span className="text-xl font-bold text-primary">
                    {vote.candidate?.name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-medium">
                {vote.candidate?.name || "Unknown Candidate"}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {vote.position?.description || "No description available"}
              </p>
              <div className="flex items-center text-xs text-muted-foreground mt-3">
                <Calendar className="mr-1 h-3 w-3" />
                <span title={dateInfo.formatted}>{dateInfo.relative}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
