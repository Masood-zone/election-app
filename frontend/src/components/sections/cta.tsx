import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarClock, AlertCircle, Megaphone } from "lucide-react";
import FlipCountdown from "../flip-countdown";
import { useGetAnnouncements } from "@/services/announcements/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow, isPast, parseISO } from "date-fns";

export default function CallToAction() {
  const { data, isLoading, error } = useGetAnnouncements();
  const controls = useAnimation();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [latestAnnouncement, setLatestAnnouncement] =
    useState<Announcement | null>(null);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  useEffect(() => {
    if (data?.data) {
      // Find active elections from announcements
      const elections = data.data
        .filter((announcement) => announcement.election)
        .map((announcement) => announcement.election);

      // Remove duplicates by ID
      const uniqueElections = Array.from(
        new Map(elections.map((election) => [election?.id, election])).values()
      );

      // Find the active election (ongoing and active)
      const active = uniqueElections.find(
        (election) => election?.status === "ONGOING" && election?.isActive
      );

      // If no active election, find the next upcoming one
      const upcoming = uniqueElections
        .filter((election) => election?.status === "UPCOMING")
        .filter((election) => election?.startDate) // Filter out undefined startDate
        .sort(
          (a, b) =>
            new Date(a?.startDate ?? 0).getTime() -
            new Date(b?.startDate ?? 0).getTime()
        )[0];

      setActiveElection(active || upcoming || null);

      // Find the latest announcement
      if (data.data.length > 0) {
        setLatestAnnouncement(data.data[0]);
      }
    }
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // const listVariants = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: {
  //       staggerChildren: 0.1,
  //     },
  //   },
  // };

  // const listItemVariants = {
  //   hidden: { x: -10, opacity: 0 },
  //   visible: {
  //     x: 0,
  //     opacity: 1,
  //     transition: {
  //       duration: 0.4,
  //     },
  //   },
  // };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.log(error);
      return dateString;
    }
  };

  // Check if the date is in the past
  const isDatePast = (dateString: string) => {
    try {
      return isPast(parseISO(dateString));
    } catch (error) {
      console.log(error);

      return false;
    }
  };

  // Get time remaining text
  const getTimeRemaining = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isPast(date)) {
        return "Event has started";
      }
      return `Starts ${formatDistanceToNow(date, { addSuffix: true })}`;
    } catch (error) {
      console.log(error);

      return "";
    }
  };

  return (
    <motion.section
      ref={ref}
      className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground"
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 md:gap-16 lg:grid-cols-2">
          <motion.div className="space-y-4" variants={containerVariants}>
            <motion.h2
              className="text-3xl font-bold tracking-tighter md:text-4xl/tight"
              variants={itemVariants}
            >
              Ready to make your voice heard?
            </motion.h2>
            <motion.p
              className="max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed"
              variants={itemVariants}
            >
              Join thousands of Epicurious Institute students who are shaping
              the future of our campus through democratic participation.
            </motion.p>

            {latestAnnouncement && (
              <motion.div variants={itemVariants} className="mt-6">
                <Alert className="bg-primary-foreground/10 border-primary-foreground/20">
                  <Megaphone className="h-4 w-4 text-primary-foreground" />
                  <AlertTitle className="text-primary-foreground">
                    {latestAnnouncement.title}
                  </AlertTitle>
                  <AlertDescription className="text-primary-foreground/80">
                    {latestAnnouncement.content.length > 150
                      ? `${latestAnnouncement.content.substring(0, 150)}...`
                      : latestAnnouncement.content}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div
              className="flex flex-col gap-2 min-[400px]:flex-row mt-6"
              variants={itemVariants}
            >
              <Button asChild size="lg" variant="secondary">
                <Link to="/register">Register Now</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/candidates">View Candidates</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Election Information Section */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 bg-primary-foreground/20" />
                <Skeleton className="h-32 w-full bg-primary-foreground/20" />
                <Skeleton className="h-10 w-1/2 bg-primary-foreground/20" />
              </div>
            ) : error ? (
              <Alert
                variant="destructive"
                className="bg-destructive/20 border-destructive/30"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Unable to load election information. Please try again later.
                </AlertDescription>
              </Alert>
            ) : activeElection ? (
              <div className="rounded-xl bg-primary-foreground/5 p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4">
                  {activeElection.title}
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  {activeElection.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary-foreground/10 rounded-lg p-3">
                    <p className="text-xs text-primary-foreground/70">
                      Start Date
                    </p>
                    <p className="font-medium">
                      {formatDate(activeElection.startDate)}
                    </p>
                  </div>
                  <div className="bg-primary-foreground/10 rounded-lg p-3">
                    <p className="text-xs text-primary-foreground/70">
                      End Date
                    </p>
                    <p className="font-medium">
                      {formatDate(activeElection.endDate)}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-primary-foreground/90 mb-2">
                    Status:{" "}
                    <span className="font-bold">{activeElection.status}</span>
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    {getTimeRemaining(activeElection.startDate)}
                  </p>
                </div>

                {!isDatePast(activeElection.startDate) && (
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <CalendarClock className="h-5 w-5 text-primary-foreground/90" />
                      <h3 className="text-lg font-semibold text-primary-foreground/90">
                        Countdown to Election
                      </h3>
                    </div>
                    <FlipCountdown
                      targetDate={new Date(activeElection.startDate)}
                      className="mb-2"
                    />
                  </div>
                )}

                {activeElection.status === "ONGOING" &&
                  activeElection.isActive && (
                    <Button asChild size="lg" className="w-full mt-6">
                      <Link to="/voting">Vote Now</Link>
                    </Button>
                  )}
              </div>
            ) : (
              <div className="rounded-xl bg-primary-foreground/5 p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4">No Active Elections</h3>
                <p className="text-primary-foreground/80 mb-6">
                  There are currently no active elections. Please check back
                  later for upcoming voting opportunities.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link to="/candidates">Browse Candidates</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
