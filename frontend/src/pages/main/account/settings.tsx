import { Link } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Vote, SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const settingsOptions = [
    {
      title: "Profile",
      description: "Manage your personal information and account settings",
      icon: <User className="h-6 w-6" />,
      link: "/voter/profile",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "My Votes",
      description:
        "View your voting history and current election participation",
      icon: <Vote className="h-6 w-6" />,
      link: "/voter/my-votes",
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Preferences",
      description: "Customize your voting experience and notification settings",
      icon: <SettingsIcon className="h-6 w-6" />,
      link: "/voter/preferences",
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <div className="container py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {settingsOptions.map((option, index) => (
          <motion.div key={index} variants={item}>
            <Link to={option.link} className="block h-full">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center mb-2`}
                  >
                    {option.icon}
                  </div>
                  <CardTitle>{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-start">
                    Manage {option.title.toLowerCase()}
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
