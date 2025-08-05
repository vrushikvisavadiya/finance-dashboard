import {
  HomeIcon,
  ListIcon,
  PieChartIcon,
  FolderIcon,
  LogOutIcon,
  XIcon,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: <HomeIcon className="h-4 w-4" />, label: "Overview" },
  {
    to: "/transactions",
    icon: <ListIcon className="h-4 w-4" />,
    label: "Transactions",
  },
  {
    to: "/categories",
    icon: <FolderIcon className="h-4 w-4" />,
    label: "Categories",
  },
  {
    to: "/analytics",
    icon: <PieChartIcon className="h-4 w-4" />,
    label: "Analytics",
  },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden border-r bg-background/95 md:flex md:w-56 lg:w-64 lg:flex-col">
        <NavItems logout={logout} />
      </aside>

      {/* Mobile slide-in sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-background shadow-lg transition-transform md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-lg font-semibold">Menu</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
        <NavItems logout={logout} onClickLink={onClose} />
      </aside>
    </>
  );
}

function NavItems({ logout, onClickLink }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onClickLink}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
              isActive && "bg-muted text-primary"
            )
          }
        >
          {link.icon}
          {link.label}
        </NavLink>
      ))}

      <Button
        variant="ghost"
        className="mt-2 flex w-full items-center gap-3 justify-start"
        onClick={logout}
        aria-label="Logout"
      >
        <LogOutIcon className="h-4 w-4" />
        Logout
      </Button>
    </nav>
  );
}
