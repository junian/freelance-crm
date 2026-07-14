import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessagesSquare,
  Receipt,
  Settings,
  Info,
  Shield,
  Menu,
  X,
  Plus,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppData } from "@/lib/app-data";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site-config";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/proposals", label: "Proposals", icon: FileText },
  { to: "/interviews", label: "Interviews", icon: MessagesSquare },
  { to: "/invoices", label: "Invoices", icon: Receipt },
];

const SECONDARY = [
  { to: "/about", label: "About", icon: Info },
  { to: "/privacy", label: "Privacy", icon: Shield },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { ready } = useAppData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b bg-white dark:bg-slate-900 px-4 h-14">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold">{SITE.name}</span>
        <QuickAdd />
      </header>

      <div className="md:flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:sticky md:top-0 border-r bg-white dark:bg-slate-900">
          <SidebarContent onNavigate={() => {}} isActive={isActive} />
        </aside>

        {/* Mobile slide-out */}
        {open && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <aside className="relative w-72 max-w-[80%] h-full bg-white dark:bg-slate-900 flex flex-col shadow-xl">
              <div className="flex items-center justify-between px-4 h-14 border-b">
                <span className="font-semibold">{SITE.name}</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent onNavigate={() => setOpen(false)} isActive={isActive} />
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            {!ready ? (
              <div className="flex items-center justify-center py-24 text-sm text-slate-500">
                Loading local data…
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  onNavigate,
  isActive,
}: {
  onNavigate: () => void;
  isActive: (to: string, exact?: boolean) => boolean;
}) {
  return (
    <>
      <div className="hidden md:flex items-center justify-between px-5 h-16 border-b">
        <Link to="/" className="font-semibold text-lg tracking-tight" onClick={onNavigate}>
          {SITE.name}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="hidden md:block mb-3">
          <QuickAdd full />
        </div>
        <ul className="space-y-1">
          {NAV.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              active={isActive(item.to, item.exact)}
              onClick={onNavigate}
            />
          ))}
        </ul>
        <div className="mt-6 mb-2 px-3 text-[11px] uppercase tracking-wider text-slate-500">
          General
        </div>
        <ul className="space-y-1">
          {SECONDARY.map((item) => (
            <NavItem key={item.to} {...item} active={isActive(item.to)} onClick={onNavigate} />
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t">
        <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Stored in this browser</span>
        </div>
      </div>
    </>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
        )}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Link>
    </li>
  );
}

function QuickAdd({ full }: { full?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={full ? "default" : "sm"} className={cn("gap-2", full && "w-full")}>
          <Plus className="w-4 h-4" />
          Quick add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/clients" hash="new">New client</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/proposals" hash="new">New proposal</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/invoices/new">New invoice</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <div className="text-sm text-slate-500 mt-1">{description}</div>
        )}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-10 text-center">
      <div className="text-lg font-semibold">{title}</div>
      {description && <p className="text-sm text-slate-500 mt-2">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </Card>
  );
}
