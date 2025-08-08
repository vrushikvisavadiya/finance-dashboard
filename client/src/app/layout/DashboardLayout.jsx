import {
  MenuIcon,
  MoonIcon,
  SunIcon,
  LogOutIcon,
  UserIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
// import ProfileModal from "@/components/Modal/ProfileModal";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Light/Dark toggle
  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      root.classList.contains("dark") ? "dark" : "light"
    );
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // Sidebar handlers
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    localStorage.setItem("sidebarCollapsed", (!sidebarCollapsed).toString());
  };

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    }

    // Sidebar collapse state
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Sticky */}
      <div
        className={`hidden md:block sticky top-0 h-screen transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <Sidebar open={true} collapsed={sidebarCollapsed} onClose={() => {}} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeSidebar}
          />
          <div className="relative w-64 h-full">
            <Sidebar open={sidebarOpen} onClose={closeSidebar} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 md:hidden">
          <Button size="icon" variant="ghost" onClick={openSidebar}>
            <MenuIcon className="h-4 w-4 text-foreground" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground truncate">
            Finance Dashboard
          </h1>

          <div className="ml-auto flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={toggleTheme}>
              <SunIcon className="h-4 w-4 text-foreground rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
              <MoonIcon className="absolute h-4 w-4 text-foreground rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              // onClick={() => setProfileOpen(true)}
              onClick={() => navigate("/profile")}
            >
              <UserIcon className="h-4 w-4 text-foreground" />
            </Button>

            <Button size="icon" variant="ghost" onClick={logout}>
              <LogOutIcon className="h-4 w-4 text-foreground" />
            </Button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden sticky top-0 z-40 h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-6 md:flex">
          {/* Sidebar Toggle Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleSidebarCollapse}
            className="hover:bg-muted"
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="h-4 w-4 text-foreground" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4 text-foreground" />
            )}
          </Button>

          <h1 className="text-lg font-semibold text-foreground">
            Finance Dashboard
          </h1>

          <div className="ml-auto flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={toggleTheme}>
              <SunIcon className="h-4 w-4 text-foreground rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
              <MoonIcon className="absolute h-4 w-4 text-foreground rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/profile")}
            >
              <UserIcon className="h-4 w-4 text-foreground" />
            </Button>

            <Button size="icon" variant="ghost" onClick={logout}>
              <LogOutIcon className="h-4 w-4 text-foreground" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-background text-foreground overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
