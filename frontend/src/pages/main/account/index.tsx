import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User, Vote, SettingsIcon, Menu, ChevronLeft, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      title: "Settings",
      href: "/voter",
      icon: <Cog className="mr-2 h-4 w-4" />,
    },
    {
      title: "Profile",
      href: "/voter/profile",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      title: "My Votes",
      href: "/voter/my-votes",
      icon: <Vote className="mr-2 h-4 w-4" />,
    },
    {
      title: "Preferences",
      href: "/voter/preferences",
      icon: <SettingsIcon className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col container">
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
        {/* Mobile sidebar trigger */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b bg-background px-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <NavLink
                to="/"
                className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </NavLink>
              <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col gap-2">
                  {navItems.map((item, index) => (
                    <NavLink
                      key={index}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                          isActive
                            ? "bg-muted font-medium text-primary"
                            : "text-muted-foreground"
                        )
                      }
                    >
                      {item.icon}
                      {item.title}
                    </NavLink>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex-1 text-center md:hidden">
            <h1 className="text-lg font-semibold">Account Settings</h1>
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-x-2 border-t-2 rounded-tl-lg rounded-tr-lg">
          <ScrollArea className="h-full py-4 px-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Account Settings</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                      isActive
                        ? "bg-muted font-medium text-primary"
                        : "text-muted-foreground"
                    )
                  }
                >
                  {item.icon}
                  {item.title}
                </NavLink>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <NavLink
                to="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </NavLink>
            </div>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
