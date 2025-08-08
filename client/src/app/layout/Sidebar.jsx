import {
  HomeIcon,
  ListIcon,
  PieChartIcon,
  FolderIcon,
  LogOutIcon,
  XIcon,
  WalletIcon,
  TargetIcon,
  ArrowRightLeftIcon,
  GridIcon,
  LayoutDashboard,
  UserIcon,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// const links = [
//   { to: "/", icon: <HomeIcon className="h-4 w-4" />, label: "Overview" },
//   {
//     to: "/transactions",
//     icon: <ListIcon className="h-4 w-4" />,
//     label: "Transactions",
//   },
//   {
//     to: "/budgets",
//     icon: <TargetIcon className="h-4 w-4" />,
//     label: "Bugets",
//   },
//   {
//     to: "/categories",
//     icon: <FolderIcon className="h-4 w-4" />,
//     label: "Categories",
//   },
// ];

const links = [
  { to: "/", icon: <LayoutDashboard className="h-4 w-4" />, label: "Overview" },
  {
    to: "/transactions",
    icon: <ArrowRightLeftIcon className="h-4 w-4" />,
    label: "Transactions",
  },
  {
    to: "/budgets",
    icon: <PieChartIcon className="h-4 w-4" />,
    label: "Budgets",
  },
  {
    to: "/categories",
    icon: <GridIcon className="h-4 w-4" />,
    label: "Categories",
  },
  {
    to: "/profile",
    icon: <UserIcon className="h-4 w-4" />,
    label: "Profile",
  },
];

export default function Sidebar({ open, collapsed = false, onClose }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex md:flex-col h-full">
        <SidebarHeader collapsed={collapsed} />
        <NavItems logout={logout} collapsed={collapsed} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile slide-in sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-background shadow-lg transition-transform md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarHeader mobile onClose={onClose} />
        <NavItems logout={logout} onClickLink={onClose} />
      </aside>
    </>
  );
}

function SidebarHeader({ collapsed = false, mobile = false, onClose }) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3 min-h-[3.5rem]">
      {/* Logo and Brand */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
            collapsed ? "w-8 h-8" : "w-8 h-8"
          )}
        >
          <WalletIcon
            className={cn("transition-all", collapsed ? "h-4 w-4" : "h-4 w-4")}
          />
        </div>

        {(!collapsed || mobile) && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              FinanceApp
            </span>
            <span className="text-xs text-muted-foreground">
              Personal Finance
            </span>
          </div>
        )}
      </div>

      {/* Close button for mobile */}
      {mobile && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Close sidebar"
          className="hover:bg-muted"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function NavItems({ logout, collapsed = false, onClickLink }) {
  return (
    <div className="flex flex-col flex-1">
      {/* Navigation Links */}
      <nav className="flex flex-col gap-1 p-4 flex-1">
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClickLink}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted group",
                  isActive &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                  collapsed && "justify-center px-2"
                )
              }
              title={collapsed ? link.label : undefined}
            >
              <span className="flex-shrink-0">{link.icon}</span>
              {(!collapsed || onClickLink) && (
                <span className="truncate">{link.label}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "flex w-full items-center gap-3 justify-start hover:bg-muted text-muted-foreground hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
            onClick={logout}
            aria-label="Logout"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOutIcon className="h-4 w-4 flex-shrink-0" />
            {(!collapsed || onClickLink) && <span>Logout</span>}
          </Button>
        </div>
      </nav>
    </div>
  );
}
