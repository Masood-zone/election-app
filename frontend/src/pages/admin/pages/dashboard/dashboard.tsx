import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Vote,
  Award,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useGetDashboardData } from "../../services/dashboard/queries";
import { DashboardSkeleton } from "../../components/dashboard-skeleton";

export default function Dashboard() {
  const { data, isLoading, error } = useGetDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-medium">Error Loading Dashboard</h3>
            <p className="text-sm">
              There was a problem loading the dashboard data. Please try again
              later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { summary, elections, recentVotes, topPositions } = data?.data || {
    summary: {
      totalVoters: 0,
      activeVoters: 0,
      totalCandidates: 0,
      totalPositions: 0,
      totalVotes: 0,
      voterTurnout: 0,
    },
    elections: {
      total: 0,
      active: 0,
      upcoming: 0,
      completed: 0,
    },
    recentVotes: [],
    topPositions: [],
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of election statistics and voting activity
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Voters
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalVoters}</div>
              <p className="text-xs text-muted-foreground">
                {summary?.activeVoters} active voters
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Candidates
              </CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.totalCandidates}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {summary?.totalPositions} positions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Voter Turnout
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.voterTurnout}%</div>
              <p className="text-xs text-muted-foreground">
                {summary?.totalVotes} total votes cast
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Elections</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{elections?.total}</div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                  {elections?.active} active
                </span>
                <span className="flex items-center">
                  <span className="mr-1 h-2 w-2 rounded-full bg-blue-500"></span>
                  {elections?.upcoming} upcoming
                </span>
                <span className="flex items-center">
                  <span className="mr-1 h-2 w-2 rounded-full bg-gray-500"></span>
                  {elections?.completed} completed
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="voters">Voters</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Election Status */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Election Status</CardTitle>
                  <CardDescription>
                    Current and upcoming elections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {elections?.active > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-500/20 p-2 rounded-full">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            Student Council Election 2025
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Active • Ongoing
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-500">
                          {summary?.voterTurnout}% turnout
                        </div>
                      </div>
                    </div>
                  ) : elections?.upcoming > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-500/20 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Upcoming Election</div>
                          <div className="text-sm text-muted-foreground">
                            Scheduled
                          </div>
                        </div>
                        <div className="text-sm font-medium text-blue-500">
                          Upcoming
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No active or upcoming elections
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Recent Voting Activity</CardTitle>
                  <CardDescription>
                    Latest votes cast in active elections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentVotes?.length > 0 ? (
                    <div className="space-y-4">
                      {recentVotes
                        ?.slice(0, 5)
                        .map(
                          (vote: {
                            id: string;
                            voters: { studentName: string };
                            candidates: { candidateName: string };
                            positions: { positionName: string };
                            timestamp: string;
                          }) => (
                            <div
                              key={vote.id}
                              className="flex items-center gap-4"
                            >
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Vote className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">
                                  {vote.voters.studentName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Voted for{" "}
                                  <span className="font-medium">
                                    {vote.candidates.candidateName}
                                  </span>{" "}
                                  as {vote.positions.positionName}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(vote.timestamp), {
                                  addSuffix: true,
                                })}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No recent voting activity
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Positions */}
            <Card>
              <CardHeader>
                <CardTitle>Top Positions by Vote Count</CardTitle>
                <CardDescription>
                  Positions with the highest voter participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topPositions?.length > 0 ? (
                  <div className="space-y-4">
                    {topPositions?.map((position: Position) => (
                      <div
                        key={position.id}
                        className="flex items-center gap-4"
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {position.positionName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {position.voteCount} votes cast
                          </div>
                        </div>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${
                                (position.voteCount / summary?.totalVotes) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-sm font-medium">
                          {(
                            (position.voteCount / summary?.totalVotes) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No position data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Elections Analytics</CardTitle>
                <CardDescription>
                  Detailed statistics for all elections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  Elections analytics will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voter Analytics</CardTitle>
                <CardDescription>
                  Detailed statistics about voter participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  Voter analytics will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Analytics</CardTitle>
                <CardDescription>
                  Performance metrics for all candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  Candidate analytics will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
