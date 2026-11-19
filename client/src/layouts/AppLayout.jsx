import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileBarChart,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Ticket,
  Users,
  Workflow
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { connectSocket } from "../services/socket";
import { resources } from "../services/api";
import { api } from "../services/api";
import toast from "react-hot-toast";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/users", label: "Users", icon: Users },
  { to: "/app/customers", label: "Customers", icon: Users },
  { to: "/app/emails", label: "Emails", icon: Inbox },
  { to: "/app/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/app/invoices", label: "Invoices", icon: CreditCard },
  { to: "/app/tickets", label: "Tickets", icon: Ticket },
  { to: "/app/reports", label: "Reports", icon: FileBarChart },
  { to: "/app/crm", label: "CRM", icon: Activity },
  { to: "/app/workflows", label: "Workflows", icon: Workflow },
  { to: "/app/ai-control", label: "AI Control", icon: Bot },
  { to: "/app/settings", label: "Settings", icon: Settings }
];

export function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { darkMode, sidebarOpen, toggleDarkMode, toggleSidebar } = useUiStore();
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: resources.notifications });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.classList.toggle("light", !darkMode);
  }, [darkMode]);

  useEffect(() => {
    const socket = connectSocket(queryClient);
    return () => socket?.disconnect();
  }, [queryClient]);

  const handleLogout = () => {
    api.post("/auth/logout").catch(() => {}).finally(() => { logout(); navigate("/login"); });
  };

  return (
    <div className="min-h-screen lg:grid" style={{ gridTemplateColumns: sidebarOpen ? "280px 1fr" : "84px 1fr" }}>
      <aside className={`${mobileNavOpen ? "block" : "hidden"} fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-muted p-3 shadow-soft lg:sticky lg:top-0 lg:z-auto lg:block lg:h-screen lg:w-auto lg:shadow-none`}>
        <div className="mb-5 flex h-12 items-center justify-between px-2">
          <div className="min-w-0">
            <div className="text-sm font-bold text-primary">{sidebarOpen ? "Elvora" : "EL"}</div>
            {sidebarOpen && <div className="text-xs text-muted-foreground">Autonomous operations</div>}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex h-10 items-center gap-3 rounded-md px-3 text-sm transition ${isActive ? "bg-primary/15 text-primary [&>svg]:text-primary" : "text-muted-foreground hover:bg-elevated hover:text-foreground"}`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      {mobileNavOpen && <button className="fixed inset-0 z-30 bg-black/55 lg:hidden" aria-label="Close navigation menu" onClick={() => setMobileNavOpen(false)} />}
      <main className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Toggle navigation"><Menu className="h-4 w-4" /></Button>
            <div>
            <div className="text-sm font-semibold">{user?.name ?? "Ops team"}</div>
            <div className="text-xs text-muted-foreground">{user?.role ?? "Viewer"} workspace</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right text-xs text-muted-foreground sm:block">
              {notifications.data?.filter((item) => !item.read).length ?? 0} unread alerts
            </div>
            <Button variant="outline" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
