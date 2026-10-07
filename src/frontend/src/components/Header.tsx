import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquareWarning,
  ShieldCheck,
  Sprout,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  to: string;
  hi: string;
  en: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    hi: t.nav.dashboard,
    en: t.nav.dashboardEn,
    icon: LayoutDashboard,
  },
  {
    to: "/problems",
    hi: t.nav.complaints,
    en: t.nav.complaintsEn,
    icon: MessageSquareWarning,
  },
  {
    to: "/development",
    hi: t.nav.projects,
    en: t.nav.projectsEn,
    icon: Sprout,
  },
  {
    to: "/admin",
    hi: t.nav.admin,
    en: t.nav.adminEn,
    icon: ShieldCheck,
    adminOnly: true,
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    isAuthenticated,
    isAdmin,
    isInitializing,
    isLoggingIn,
    login,
    logout,
  } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/20 bg-primary text-primary-foreground shadow-subtle">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          data-ocid="nav.home_link"
          className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Sprout className="size-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-lg font-bold tracking-tight">
              {t.appName}
            </span>
            <span className="truncate text-[11px] font-medium uppercase tracking-widest text-primary-foreground/70">
              {t.appNameEn}
            </span>
          </span>
        </Link>

        <nav
          aria-label="मुख्य नेविगेशन"
          className="hidden items-center gap-1 lg:flex"
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={`nav.${item.en.toLowerCase()}_link`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60",
                  isActive(item.to)
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="flex flex-col leading-none">
                  <span>{item.hi}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-70">
                    {item.en}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              data-ocid="nav.logout_button"
              onClick={logout}
              className="hidden sm:inline-flex"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t.actions.logout}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              data-ocid="nav.login_button"
              onClick={login}
              disabled={isInitializing || isLoggingIn}
              className="hidden sm:inline-flex"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {isLoggingIn ? t.common.loading : t.actions.login}
            </Button>
          )}

          <button
            type="button"
            data-ocid="nav.mobile_menu_button"
            aria-label={mobileOpen ? "मेन्यू बंद करें" : "मेन्यू खोलें"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-md text-primary-foreground transition-smooth hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 lg:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="मोबाइल नेविगेशन"
          className="border-t border-primary-foreground/15 bg-primary px-4 pb-4 pt-2 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    data-ocid={`nav.mobile.${item.en.toLowerCase()}_link`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-smooth",
                      isActive(item.to)
                        ? "bg-primary-foreground/15 text-primary-foreground"
                        : "text-primary-foreground/80 hover:bg-primary-foreground/10",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="flex flex-col leading-tight">
                      <span>{item.hi}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-70">
                        {item.en}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              {isAuthenticated ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  data-ocid="nav.mobile.logout_button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {t.actions.logout}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  data-ocid="nav.mobile.login_button"
                  onClick={() => {
                    login();
                    setMobileOpen(false);
                  }}
                  disabled={isInitializing || isLoggingIn}
                >
                  <LogIn className="size-4" aria-hidden="true" />
                  {t.actions.login}
                </Button>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
