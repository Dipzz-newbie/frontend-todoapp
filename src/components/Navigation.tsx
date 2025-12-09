import React, { useEffect, useState } from "react";
import { Home, BarChart3, Settings, CheckCircle2 } from "lucide-react";
import { Link } from "./Link";

export const Navigation: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(
    window.location.hash.slice(1) || "/"
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || "/");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.addEventListener("hashchange", handleHashChange);
  }, []);

  // Sembunyikan navbar di halaman login dan register
  const hideNavbarPath = ["/login", "/register"];
  const shouldHideNavbar = hideNavbarPath.includes(currentPath);

  // Jangan render navbar jika berada di halaman login atau pun register
  if (shouldHideNavbar) {
    return null;
  }

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/stats", icon: BarChart3, label: "Stats" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3 px-4 z-50">
      <div className="flex items-center justify-between px-4">
        {/* Nav Items - Left */}
        <div className="flex gap-6 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 no-underline transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logo and Text - Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl shadow-md">
            <CheckCircle2 size={20} className="text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-foreground leading-tight">Task Manager</h1>
            <p className="text-xs text-muted-foreground">Stay organized and productive</p>
          </div>
        </div>
      </div>
    </nav>
  );
};
