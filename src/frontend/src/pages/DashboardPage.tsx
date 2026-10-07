import type { Problem, ProblemCategory } from "@/backend";
import { DevelopmentCard } from "@/components/DevelopmentCard";
import { EmptyState } from "@/components/EmptyState";
import { ProblemCard } from "@/components/ProblemCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/use-backend";
import { formatNumber, resolutionRate } from "@/lib/format";
import { PROBLEM_CATEGORIES, categoryLabel, t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Droplets,
  Home,
  Landmark,
  MapPinned,
  MessageSquareWarning,
  Ruler,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "oklch(0.42 0.11 155)",
  "oklch(0.58 0.13 40)",
  "oklch(0.72 0.14 78)",
  "oklch(0.55 0.09 200)",
  "oklch(0.66 0.1 130)",
  "oklch(0.5 0.09 240)",
  "oklch(0.6 0.05 60)",
];

function useDashboardData() {
  const { actor, isReady } = useBackend();

  const profileQuery = useQuery({
    queryKey: ["villageProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVillageProfile();
    },
    enabled: isReady,
  });

  const statsQuery = useQuery({
    queryKey: ["problemStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProblemStats();
    },
    enabled: isReady,
  });

  const problemsQuery = useQuery({
    queryKey: ["problems", "recent"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProblems({});
    },
    enabled: isReady,
  });

  const developmentQuery = useQuery({
    queryKey: ["developmentUpdates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDevelopmentUpdates();
    },
    enabled: isReady,
  });

  return { profileQuery, statsQuery, problemsQuery, developmentQuery };
}

function DashboardSkeleton() {
  const ids = Array.from({ length: 4 }, (_, i) => `dash-skeleton-${i}`);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ids.map((id) => (
        <Skeleton key={id} className="h-28 rounded-lg" />
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { profileQuery, statsQuery, problemsQuery, developmentQuery } =
    useDashboardData();

  const profile = profileQuery.data ?? null;
  const stats = statsQuery.data ?? null;
  const problems: Problem[] = problemsQuery.data ?? [];
  const development = developmentQuery.data ?? [];

  const recentProblems = problems.slice(0, 4);
  const recentDevelopment = development.slice(0, 3);

  const categoryData = (stats?.byCategory ?? []).map(
    ([category, count]: [ProblemCategory, bigint]) => {
      const label = categoryLabel(category);
      return { name: label.hi, nameEn: label.en, value: Number(count) };
    },
  );

  const populationData = profile
    ? [
        {
          name: "जनसंख्या",
          nameEn: "Population",
          value: Number(profile.population),
        },
        {
          name: "परिवार",
          nameEn: "Households",
          value: Number(profile.households),
        },
      ]
    : [];

  const resolved = stats?.resolved ?? 0n;
  const total = stats?.total ?? 0n;
  const open = stats?.open ?? 0n;
  const rate = resolutionRate(resolved, total);

  const isLoading =
    profileQuery.isLoading || statsQuery.isLoading || problemsQuery.isLoading;

  return (
    <div
      data-ocid="dashboard.page"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Hero / village identity */}
      <section
        data-ocid="dashboard.hero_section"
        className="overflow-hidden rounded-lg border border-border bg-gradient-primary text-primary-foreground shadow-subtle"
      >
        <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
              <Landmark className="size-3.5" aria-hidden="true" />
              {t.appNameEn}
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              {profile?.name ?? t.appName}
            </h1>
            <p className="max-w-xl text-sm text-primary-foreground/85">
              {t.tagline}
              <span className="mt-1 block text-xs uppercase tracking-wider opacity-80">
                {t.taglineEn}
              </span>
            </p>
          </div>
          <Button
            asChild
            type="button"
            variant="secondary"
            size="lg"
            data-ocid="dashboard.report_problem_button"
            className="w-full shrink-0 sm:w-auto"
          >
            <Link to="/problems/new">
              <MessageSquareWarning className="size-4" aria-hidden="true" />
              {t.actions.reportProblem}
            </Link>
          </Button>
        </div>
      </section>

      {/* KPI grid */}
      <section data-ocid="dashboard.kpi_section" className="mt-8">
        <h2 className="sr-only">मुख्य आँकड़े</h2>
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              ocid="dashboard.stat.population"
              labelHi="कुल जनसंख्या"
              labelEn="Total population"
              value={profile ? formatNumber(profile.population) : "—"}
              icon={Users}
              tone="primary"
            />
            <StatCard
              ocid="dashboard.stat.households"
              labelHi="परिवार"
              labelEn="Households"
              value={profile ? formatNumber(profile.households) : "—"}
              icon={Home}
              tone="accent"
            />
            <StatCard
              ocid="dashboard.stat.problems"
              labelHi="कुल शिकायतें"
              labelEn="Total problems"
              value={formatNumber(total)}
              icon={MessageSquareWarning}
              hint={`${formatNumber(open)} ${t.status.inProgressEn}`}
              tone="warning"
            />
            <StatCard
              ocid="dashboard.stat.resolution"
              labelHi="समाधान दर"
              labelEn="Resolution rate"
              value={`${rate}%`}
              icon={CheckCircle2}
              hint={`${formatNumber(resolved)} ${t.status.resolvedEn}`}
              tone="success"
            />
          </div>
        )}
      </section>

      {/* Village profile + charts */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card
          data-ocid="dashboard.profile_card"
          className="rounded-lg border-border shadow-subtle lg:col-span-1"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="size-5 text-primary" aria-hidden="true" />
              गाँव प्रोफ़ाइल
            </CardTitle>
            <CardDescription>Village profile</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {profile ? (
              <>
                <dl className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      क्षेत्रफल
                    </dt>
                    <dd className="flex items-center gap-1.5 font-display text-lg font-bold text-foreground">
                      <Ruler
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      {profile.areaSqKm} km²
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      परिवार
                    </dt>
                    <dd className="flex items-center gap-1.5 font-display text-lg font-bold text-foreground">
                      <Home
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      {formatNumber(profile.households)}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    मुख्य सुविधाएँ · Key facilities
                  </span>
                  <ul className="flex flex-wrap gap-2">
                    {profile.facilities.map((facility) => (
                      <li
                        key={facility}
                        className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {facility}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                गाँव की जानकारी अभी उपलब्ध नहीं है।
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          data-ocid="dashboard.category_chart_card"
          className="rounded-lg border-border shadow-subtle lg:col-span-2"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="size-5 text-accent" aria-hidden="true" />
              श्रेणी-वार शिकायतें
            </CardTitle>
            <CardDescription>Problems by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div
                data-ocid="dashboard.category_chart"
                className="h-64 w-full"
                role="img"
                aria-label="श्रेणी-वार शिकायतों का स्तंभ चार्ट"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={56}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [value, "शिकायतें"]}
                      labelFormatter={(label: string) => label}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={entry.nameEn}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                अभी कोई शिकायत दर्ज नहीं है।
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card
          data-ocid="dashboard.population_chart_card"
          className="rounded-lg border-border shadow-subtle"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-primary" aria-hidden="true" />
              जनसंख्या विवरण
            </CardTitle>
            <CardDescription>Population breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {populationData.length > 0 ? (
              <div
                data-ocid="dashboard.population_chart"
                className="h-56 w-full"
                role="img"
                aria-label="जनसंख्या और परिवारों का वृत्त चार्ट"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={populationData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {populationData.map((entry, index) => (
                        <Cell
                          key={entry.nameEn}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatNumber(value)}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                जनसंख्या डेटा उपलब्ध नहीं है।
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          data-ocid="dashboard.resolution_card"
          className="rounded-lg border-border shadow-subtle lg:col-span-2"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="size-5 text-success" aria-hidden="true" />
              समाधान की स्थिति
            </CardTitle>
            <CardDescription>Resolution overview</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-end gap-3">
              <span className="font-display text-5xl font-bold text-success">
                {rate}%
              </span>
              <span className="pb-2 text-sm text-muted-foreground">
                शिकायतें हल हुईं · problems resolved
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-smooth"
                style={{ width: `${rate}%` }}
              />
            </div>
            <dl className="grid grid-cols-3 gap-4 border-t border-border pt-4">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  कुल
                </dt>
                <dd className="font-display text-xl font-bold text-foreground">
                  {formatNumber(total)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  लंबित
                </dt>
                <dd className="font-display text-xl font-bold text-accent">
                  {formatNumber(open)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  हल
                </dt>
                <dd className="font-display text-xl font-bold text-success">
                  {formatNumber(resolved)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      {/* Recent problems */}
      <section data-ocid="dashboard.recent_problems_section" className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h2 className="font-display text-2xl font-bold text-foreground">
              हाल की शिकायतें
            </h2>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Recent problems
            </span>
          </div>
          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            data-ocid="dashboard.view_all_problems_button"
          >
            <Link to="/problems">{t.actions.viewAll}</Link>
          </Button>
        </div>

        {problemsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => `prob-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-40 rounded-lg" />
              ),
            )}
          </div>
        ) : recentProblems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentProblems.map((problem, index) => (
              <ProblemCard
                key={problem.id.toString()}
                problem={problem}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            ocid="dashboard.problems_empty_state"
            icon={MessageSquareWarning}
            titleHi="अभी कोई शिकायत दर्ज नहीं है"
            titleEn="No problems reported yet"
            description="गाँव की पहली समस्या दर्ज करके पंचायत तक पहुँचाएँ।"
            action={
              <Button
                asChild
                type="button"
                data-ocid="dashboard.empty_report_button"
              >
                <Link to="/problems/new">{t.actions.reportProblem}</Link>
              </Button>
            }
          />
        )}
      </section>

      {/* Development highlights */}
      <section data-ocid="dashboard.development_section" className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
              <Sprout className="size-6 text-primary" aria-hidden="true" />
              विकास कार्य
            </h2>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Development highlights
            </span>
          </div>
          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            data-ocid="dashboard.view_all_development_button"
          >
            <Link to="/development">{t.actions.viewAll}</Link>
          </Button>
        </div>

        {developmentQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => `dev-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-56 rounded-lg" />
              ),
            )}
          </div>
        ) : recentDevelopment.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recentDevelopment.map((update, index) => (
              <DevelopmentCard
                key={update.id.toString()}
                update={update}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            ocid="dashboard.development_empty_state"
            icon={MapPinned}
            titleHi="अभी कोई विकास कार्य दर्ज नहीं है"
            titleEn="No development updates yet"
            description="पंचायत द्वारा प्रकाशित विकास कार्य यहाँ दिखाई देंगे।"
          />
        )}
      </section>
    </div>
  );
}
