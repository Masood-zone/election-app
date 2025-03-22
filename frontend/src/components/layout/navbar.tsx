import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import Logo from "../logo";
import { useAuthStore } from "@/store/auth.store";
import UserProfileMenu from "../user-profile-menu";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Candidates", href: "/candidates" },
    { name: "Positions", href: "/positions" },
    { name: "Results", href: "/results" },
  ];

  const authenticatedLinks = isAuthenticated
    ? [...navLinks, { name: "My Votes", href: "/my-votes" }]
    : navLinks;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {authenticatedLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {isAuthenticated ? (
            <UserProfileMenu />
          ) : (
            <Button asChild className="hidden md:inline-flex">
              <Link to="/voter/login">Login</Link>
            </Button>
          )}

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b">
          <div className="container py-4 flex flex-col gap-4">
            {authenticatedLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="border-t pt-4 mt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-medium">
                    {user?.studentName
                      ? `${user.studentName.split(" ")[0][0]}${
                          user.studentName.split(" ")[1]?.[0] || ""
                        }`
                      : user?.fullName?.split(" ")[0][0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {user?.studentName || user?.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Log out
                </Button>
              </div>
            ) : (
              <Button asChild className="w-full">
                <Link
                  to="/voter/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
