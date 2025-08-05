import {
  MenuIcon,
  MoonIcon,
  SunIcon,
  LogOutIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ProfileModal from "@/components/Modal/ProfileModal";
// import ProfileModal from "./ProfileModal";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Light/Dark toggle
  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    //  (optional) persist user choice
    localStorage.setItem(
      "theme",
      root.classList.contains("dark") ? "dark" : "light"
    );
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // Open sidebar on mobile
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar keeps its own colors */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex flex-col flex-1">
        {/* ----  Mobile Header  ---- */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:hidden">
          {/* icons use text-foreground so they flip automatically */}
          <Button size="icon" variant="ghost" onClick={openSidebar}>
            <MenuIcon className="h-4 w-4 text-foreground" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Finance Dashboard
          </h1>

          <div className="ml-auto flex items-center gap-2">
            {/* theme toggle button keeps same structure */}
            <Button size="icon" variant="ghost" onClick={toggleTheme}>
              <SunIcon className="h-4 w-4 text-foreground rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition" />
              <MoonIcon className="absolute h-4 w-4 text-foreground rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setProfileOpen(true)}
            >
              <UserIcon className="h-4 w-4 text-foreground" />
            </Button>

            <Button size="icon" variant="ghost" onClick={logout}>
              <LogOutIcon className="h-4 w-4 text-foreground" />
            </Button>
          </div>
        </header>

        {/* ----  Desktop Header  ---- */}
        <header className="hidden sticky top-0 z-30 h-14 items-center gap-4 border-b border-border bg-background px-8 md:flex">
          <h1 className="text-lg font-semibold text-foreground">
            Finance Dashboard
          </h1>

          <div className="ml-auto flex items-center gap-4">
            <Button size="icon" variant="ghost" onClick={toggleTheme}>
              <SunIcon className="h-5 w-5 text-foreground rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition" />
              <MoonIcon className="absolute h-5 w-5 text-foreground rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setProfileOpen(true)}
            >
              <UserIcon className="h-5 w-5 text-foreground" />
            </Button>

            <Button size="icon" variant="ghost" onClick={logout}>
              <LogOutIcon className="h-5 w-5 text-foreground" />
            </Button>
          </div>
        </header>

        {/* content */}
        <main className="flex-1 p-6 bg-background text-foreground">
          <Outlet />
        </main>
      </div>

      {/* Profile modal */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
