import type { ProblemFilter } from "@/backend";
import type { ProblemStatus } from "@/backend";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminProblemRow } from "@/components/AdminProblemRow";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProblems } from "@/hooks/useQueries";
import { PROBLEM_STATUSES, statusLabel, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MessageSquareWarning, Search } from "lucide-react";
import { useMemo, useState } from "react";

type StatusFilter = ProblemStatus | "all";

function AdminProblems() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const filter = useMemo<ProblemFilter>(() => {
    const next: ProblemFilter = {};
    if (statusFilter !== "all") next.status = statusFilter;
    const trimmed = search.trim();
    if (trimmed) next.search = trimmed;
    return next;
  }, [statusFilter, search]);

  const problemsQuery = useProblems(filter);
  const problems = problemsQuery.data ?? [];

  return (
    <div
      data-ocid="admin.problems.page"
      className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          प्रशासन · Administration
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          शिकायत प्रबंधन
        </h1>
        <p className="text-sm text-muted-foreground">
          स्थिति बदलें और आधिकारिक उत्तर दें · Change status and post official
          responses
        </p>
      </header>

      <Card className="rounded-lg border-border shadow-subtle">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              data-ocid="admin.problems.search_input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="शिकायत खोजें… · Search problems"
              aria-label="शिकायत खोजें"
              className="pl-9"
            />
          </div>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">स्थिति छाँटें</legend>
            <button
              type="button"
              aria-pressed={statusFilter === "all"}
              data-ocid="admin.problems.filter.all_tab"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                statusFilter === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40",
              )}
            >
              सभी · All
            </button>
            {PROBLEM_STATUSES.map((status) => {
              const label = statusLabel(status);
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={statusFilter === status}
                  data-ocid={`admin.problems.filter.${status}_tab`}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    statusFilter === status
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {label.hi} · {label.en}
                </button>
              );
            })}
          </fieldset>
        </CardContent>
      </Card>

      {problemsQuery.isLoading ? (
        <div
          data-ocid="admin.problems.loading_state"
          className="flex flex-col gap-4"
        >
          {Array.from({ length: 3 }, (_, i) => `problem-${i}`).map((id) => (
            <Skeleton key={id} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : problemsQuery.isError ? (
        <Card
          data-ocid="admin.problems.error_state"
          className="rounded-lg border-destructive/30 shadow-subtle"
        >
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-destructive">
              शिकायतें लोड नहीं हो सकीं · Could not load problems
            </p>
            <Button
              type="button"
              variant="secondary"
              data-ocid="admin.problems.retry_button"
              onClick={() => void problemsQuery.refetch()}
            >
              {t.actions.retry}
            </Button>
          </CardContent>
        </Card>
      ) : problems.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          titleHi="कोई शिकायत नहीं मिली"
          titleEn="No problems found"
          description="चुने गए फ़िल्टर से मेल खाती कोई शिकायत नहीं है।"
          ocid="admin.problems.empty_state"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {problems.map((problem, index) => (
            <AdminProblemRow
              key={problem.id.toString()}
              problem={problem}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminProblemsPage() {
  return (
    <AdminGuard>
      <AdminProblems />
    </AdminGuard>
  );
}
