import { AdminGuard } from "@/components/AdminGuard";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDevelopmentUpdates,
  useProblemStats,
  useProblems,
} from "@/hooks/useQueries";
import { formatDateTime, formatNumber, resolutionRate } from "@/lib/format";
import { categoryLabel, t } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  MessageSquareWarning,
  Phone,
  Sprout,
  TrendingUp,
} from "lucide-react";

const QUICK_LINKS = [
  {
    to: "/admin/problems",
    hi: "शिकायत प्रबंधन",
    en: "Manage problems",
    icon: MessageSquareWarning,
  },
  {
    to: "/admin/development",
    hi: "परियोजना प्रबंधन",
    en: "Manage development",
    icon: Sprout,
  },
  {
    to: "/admin/profile",
    hi: "गाँव प्रोफ़ाइल",
    en: "Village profile",
    icon: FolderKanban,
  },
  {
    to: "/admin/settings",
    hi: "संपर्क सेटिंग",
    en: "Contact settings",
    icon: Phone,
  },
] as const;

function AdminDashboard() {
  const statsQuery = useProblemStats();
  const recentQuery = useProblems({});
  const developmentQuery = useDevelopmentUpdates();

  const stats = statsQuery.data;
  const recent = (recentQuery.data ?? []).slice(0, 5);
  const developmentCount = developmentQuery.data?.length ?? 0;

  return (
    <div
      data-ocid="admin.page"
      className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          प्रशासन · Administration
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          पंचायत डैशबोर्ड
        </h1>
        <p className="text-sm text-muted-foreground">
          गाँव की शिकायतों और विकास कार्यों का सारांश · Overview of village
          complaints and development work
        </p>
      </header>

      {statsQuery.isLoading ? (
        <div
          data-ocid="admin.stats.loading_state"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {Array.from({ length: 4 }, (_, i) => `admin-stat-${i}`).map((id) => (
            <Skeleton key={id} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : statsQuery.isError ? (
        <Card
          data-ocid="admin.stats.error_state"
          className="rounded-lg border-destructive/30 shadow-subtle"
        >
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-destructive">
              आँकड़े लोड नहीं हो सके · Could not load statistics
            </p>
            <Button
              type="button"
              variant="secondary"
              data-ocid="admin.stats.retry_button"
              onClick={() => void statsQuery.refetch()}
            >
              {t.actions.retry}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            labelHi="कुल शिकायतें"
            labelEn="Total problems"
            value={formatNumber(stats?.total ?? 0n)}
            icon={MessageSquareWarning}
            tone="primary"
            ocid="admin.stat.total"
          />
          <StatCard
            labelHi="खुली शिकायतें"
            labelEn="Open problems"
            value={formatNumber(stats?.open ?? 0n)}
            icon={TrendingUp}
            tone="accent"
            ocid="admin.stat.open"
          />
          <StatCard
            labelHi="हल हो गईं"
            labelEn="Resolved"
            value={formatNumber(stats?.resolved ?? 0n)}
            icon={CheckCircle2}
            tone="success"
            hint={`${resolutionRate(stats?.resolved ?? 0n, stats?.total ?? 0n)}% हल दर`}
            ocid="admin.stat.resolved"
          />
          <StatCard
            labelHi="विकास कार्य"
            labelEn="Development updates"
            value={formatNumber(developmentCount)}
            icon={Sprout}
            tone="warning"
            ocid="admin.stat.development"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          data-ocid="admin.recent_activity.card"
          className="rounded-lg border-border shadow-subtle lg:col-span-2"
        >
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="font-display text-xl">
                हाल की गतिविधि
              </CardTitle>
              <CardDescription>Recent activity</CardDescription>
            </div>
            <Button asChild type="button" variant="ghost" size="sm">
              <Link to="/admin/problems" data-ocid="admin.recent.view_all_link">
                {t.actions.viewAll}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentQuery.isLoading ? (
              <div
                data-ocid="admin.recent.loading_state"
                className="flex flex-col gap-3"
              >
                {Array.from({ length: 3 }, (_, i) => `recent-${i}`).map(
                  (id) => (
                    <Skeleton key={id} className="h-16 rounded-lg" />
                  ),
                )}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                icon={MessageSquareWarning}
                titleHi="अभी कोई शिकायत नहीं"
                titleEn="No problems reported yet"
                description="जब ग्रामीण समस्या दर्ज करेंगे, वे यहाँ दिखाई देंगी।"
                ocid="admin.recent.empty_state"
              />
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {recent.map((problem, index) => {
                  const category = categoryLabel(problem.category);
                  return (
                    <li key={problem.id.toString()}>
                      <Link
                        to="/problems/$problemId"
                        params={{ problemId: problem.id.toString() }}
                        data-ocid={`admin.recent.item.${index + 1}`}
                        className="flex flex-col gap-2 rounded-md px-2 py-3 transition-smooth hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 flex-col gap-1">
                          <span className="truncate font-medium text-foreground">
                            {problem.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {category.hi} · {formatDateTime(problem.createdAt)}
                          </span>
                        </div>
                        <StatusBadge status={problem.status} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card
          data-ocid="admin.quick_links.card"
          className="rounded-lg border-border shadow-subtle"
        >
          <CardHeader>
            <CardTitle className="font-display text-xl">प्रबंधन</CardTitle>
            <CardDescription>Management</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid={`admin.quick_link.${link.en.toLowerCase().replace(/\s+/g, "_")}`}
                  className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 transition-smooth hover:border-primary/40 hover:shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="text-sm font-medium text-foreground">
                      {link.hi}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {link.en}
                    </span>
                  </span>
                  <ArrowRight
                    className="ml-auto size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
