import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppData } from "@/lib/app-data";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site-config";

const NAV = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { to: "/clients", labelKey: "nav.clients", icon: Users },
  { to: "/proposals", labelKey: "nav.proposals", icon: FileText },
  { to: "/interviews", labelKey: "nav.interviews", icon: MessagesSquare },
  { to: "/invoices", labelKey: "nav.invoices", icon: Receipt },
];

const SECONDARY = [
  { to: "/about", labelKey: "nav.about", icon: Info },
  { to: "/privacy", labelKey: "nav.privacy", icon: Shield },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
];

const EXTERNAL = [
  { url: "https://www.junian.dev/", labelKey: "nav.developer", icon: Globe },
  { url: "https://www.junian.dev/coffee/", labelKey: "nav.buyMeCoffee", icon: Coffee },
];

const COLLAPSE_KEY = "fcrm.sidebarCollapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { ready } = useAppData();
  const { t } = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    try {
      const v = localStorage.getItem(COLLAPSE_KEY);
      if (v === "1") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b bg-white dark:bg-slate-900 px-4 h-14">
          <button
            onClick={() => setOpen(true)}
            aria-label={t("nav.openNav")}
            className="p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold">{SITE.name}</span>
          <QuickAdd />
        </header>

        <div className="md:flex">
          {/* Desktop sidebar */}
          <aside
            className={cn(
              "hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 border-r bg-white dark:bg-slate-900 transition-[width] duration-200",
              collapsed ? "md:w-16" : "md:w-64",
            )}
          >
            <SidebarContent
              onNavigate={() => {}}
              isActive={isActive}
              collapsed={collapsed}
              onToggleCollapsed={toggleCollapsed}
            />
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
                    aria-label={t("nav.closeNav")}
                    className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <SidebarContent
                  onNavigate={() => setOpen(false)}
                  isActive={isActive}
                  collapsed={false}
                />
              </aside>
            </div>
          )}

          <main className="flex-1 min-w-0">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
              {!ready ? (
                <div className="flex items-center justify-center py-24 text-sm text-slate-500">
                  {t("common.loading")}
                </div>
              ) : (
                children
              )}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

function SidebarContent({
  onNavigate,
  isActive,
  collapsed,
  onToggleCollapsed,
}: {
  onNavigate: () => void;
  isActive: (to: string, exact?: boolean) => boolean;
  collapsed: boolean;
  onToggleCollapsed?: () => void;
}) {
  const { t } = useT();
  return (
    <>
      <div
        className={cn(
          "hidden md:flex items-center h-16 border-b",
          collapsed ? "justify-center px-2" : "justify-between px-5",
        )}
      >
        {!collapsed && (
          <Link to="/" className="font-semibold text-lg tracking-tight" onClick={onNavigate}>
            {SITE.name}
          </Link>
        )}
        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      <nav className={cn("flex-1 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
        <div className={cn("hidden mb-3", collapsed ? "md:flex md:justify-center" : "md:block")}>
          <QuickAdd full={!collapsed} iconOnly={collapsed} />
        </div>
        <ul className="space-y-1">
          {NAV.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={t(item.labelKey)}
              collapsed={collapsed}
              active={isActive(item.to, item.exact)}
              onClick={onNavigate}
            />
          ))}
        </ul>
        {!collapsed && (
          <div className="mt-6 mb-2 px-3 text-[11px] uppercase tracking-wider text-slate-500">
            {t("nav.general")}
          </div>
        )}
        {collapsed && <div className="my-3 mx-2 border-t" />}
        <ul className="space-y-1">
          {SECONDARY.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={t(item.labelKey)}
              collapsed={collapsed}
              active={isActive(item.to)}
              onClick={onNavigate}
            />
          ))}
        </ul>
        {!collapsed && (
          <div className="mt-6 mb-2 px-3 text-[11px] uppercase tracking-wider text-slate-500">
            {t("nav.links")}
          </div>
        )}
        {collapsed && <div className="my-3 mx-2 border-t" />}
        <ul className="space-y-1">
          {EXTERNAL.map((item) => (
            <ExternalItem
              key={item.url}
              url={item.url}
              icon={item.icon}
              label={t(item.labelKey)}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>
      <div className={cn("border-t", collapsed ? "p-2" : "p-3")}>
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-slate-500",
            collapsed ? "justify-center" : "px-2",
          )}
        >
          <WifiOff className="w-3.5 h-3.5" />
          {!collapsed && <span>{t("nav.storedLocally")}</span>}
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
  collapsed,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}) {
  const link = (
    <Link
      to={to}
      onClick={onClick}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors",
        collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
        active
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
      )}
    >
      <Icon className="w-4 h-4" />
      {!collapsed && label}
    </Link>
  );
  return (
    <li>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  );
}

function ExternalItem({
  url,
  label,
  icon: Icon,
  collapsed,
}: {
  url: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed?: boolean;
}) {
  const link = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={collapsed ? label : undefined}
      className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors",
        collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
        "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
      )}
    >
      <Icon className="w-4 h-4" />
      {!collapsed && label}
    </a>
  );
  return (
    <li>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  );
}

function QuickAdd({ full, iconOnly }: { full?: boolean; iconOnly?: boolean }) {
  const { t } = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <Button size="icon" aria-label={t("nav.quickAdd")}>
            <Plus className="w-4 h-4" />
          </Button>
        ) : (
          <Button size={full ? "default" : "sm"} className={cn("gap-2", full && "w-full")}>
            <Plus className="w-4 h-4" />
            {t("nav.quickAdd")}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/clients" hash="new">{t("nav.newClient")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/proposals" hash="new">{t("nav.newProposal")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/invoices/new">{t("nav.newInvoice")}</Link>
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
