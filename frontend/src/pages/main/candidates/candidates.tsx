import { useState } from "react";
import { useGetAllCandidates } from "@/services/candidates/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { CandidateCard } from "./candidate-card";

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Debounce search term to avoid too many API calls
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Only pass positionId if not "all"
  const positionId = activeTab !== "all" ? activeTab : undefined;

  // Use the updated query with search and position filtering
  const { data, isPending, error } = useGetAllCandidates(
    debouncedSearch,
    positionId
  );

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (error) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Error Loading Candidates
        </h1>
        <p className="text-muted-foreground">
          We encountered an error while loading the candidates. Please try again
          later.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground mt-1">
            Meet the candidates running for various positions in the upcoming
            election.
          </p>
        </div>

        <div className="w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-10 w-full md:w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isPending ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading candidates...</span>
        </div>
      ) : (
        <>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="border-b mb-6">
              <TabsList className="bg-transparent h-auto p-0 mb-[-1px]">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 data-[state=active]:shadow-none"
                >
                  All Positions
                </TabsTrigger>

                {data?.positions?.map((position) => (
                  <TabsTrigger
                    key={position.id}
                    value={position.id}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 data-[state=active]:shadow-none"
                  >
                    {position.positionName}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {data?.groupedByPosition?.map((group) => (
                <div key={group.position.id} className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-2xl font-semibold">
                      {group.position.positionName}
                    </h2>
                    <Badge variant="outline" className="text-xs">
                      {group.candidates.length} candidates
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {group.position.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.candidates.map((candidate) => (
                      <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                  </div>
                </div>
              ))}

              {data?.groupedByPosition?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No candidates found matching your search criteria.
                  </p>
                </div>
              )}
            </TabsContent>

            {data?.positions?.map((position) => (
              <TabsContent
                key={position.id}
                value={position.id}
                className="mt-0"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">
                    {position.positionName}
                  </h2>
                  <p className="text-muted-foreground">
                    {position.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.candidates?.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>

                {data?.candidates?.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No candidates found for this position matching your search
                      criteria.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}
