import type { Problem, ProblemCategory, ProblemStatus } from "@/backend";
import { EmptyState } from "@/components/EmptyState";
import { ProblemCard } from "@/components/ProblemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/use-backend";
import {
  PROBLEM_CATEGORIES,
  PROBLEM_STATUSES,
  categoryLabel,
  statusLabel,
  t,
} from "@/lib/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";
import {
  MessageSquareWarning,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const routeApi = getRouteApi("/problems");

const ALL = "all";

export function ProblemsPage() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const queryClient = useQueryClient();
  const { actor, isReady } = useBackend();

  const [searchInput, setSearchInput] = useState(search.q ?? "");

  // Keep the text field in sync when the URL changes (back/forward, clear).
  useEffect(() => {
    setSearchInput(search.q ?? "");
  }, [search.q]);

  const category = search.category ?? undefined;
  const status = search.status ?? undefined;
  const keyword = search.q ?? undefined;

  const problemsQuery = useQuery({
    queryKey: ["problems", category ?? ALL, status ?? ALL, keyword ?? ""],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProblems({
        category,
        status,
        search: keyword,
      });
    },
    enabled: isReady,
  });

  const upvoteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.upvoteProblem(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
      void queryClient.invalidateQueries({ queryKey: ["problemStats"] });
    },
    onError: () => {
      toast.error("समर्थन दर्ज नहीं हो सका · Could not record upvote");
    },
  });

  const problems: Problem[] = problemsQuery.data ?? [];
  const hasFilters = Boolean(category || status || keyword);

  const updateSearch = (patch: {
    category?: ProblemCategory | undefined;
    status?: ProblemStatus | undefined;
    q?: string | undefined;
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
      replace: true,
    });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    updateSearch({ q: trimmed === "" ? undefined : trimmed });
  };

  const clearFilters = () => {
    setSearchInput("");
    void navigate({ search: {}, replace: true });
  };

  return (
    <div
      data-ocid="problems.page"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold text-foreground">
            {t.nav.complaints}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t.nav.complaintsEn}
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            गाँव की सभी दर्ज समस्याएँ, नई सबसे पहले। श्रेणी और स्थिति से छाँटें।
          </p>
        </div>
        <Button
          asChild
          type="button"
          data-ocid="problems.report_problem_button"
          className="w-full sm:w-auto"
        >
          <Link to="/problems/new">
            <MessageSquareWarning className="size-4" aria-hidden="true" />
            {t.actions.reportProblem}
          </Link>
        </Button>
      </header>

      {/* Filters */}
      <Card
        data-ocid="problems.filter_panel"
        className="mt-6 rounded-lg border-border shadow-subtle"
      >
        <CardContent className="flex flex-col gap-4 p-5">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="problem-search">
                {t.actions.search} · {t.actions.searchEn}
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="problem-search"
                  data-ocid="problems.search_input"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="शीर्षक या विवरण खोजें…"
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="secondary"
              data-ocid="problems.search_button"
              className="sm:w-auto"
            >
              <Search className="size-4" aria-hidden="true" />
              {t.actions.search}
            </Button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="problem-category-filter">श्रेणी · Category</Label>
              <Select
                value={category ?? ALL}
                onValueChange={(value) =>
                  updateSearch({
                    category:
                      value === ALL ? undefined : (value as ProblemCategory),
                  })
                }
              >
                <SelectTrigger
                  id="problem-category-filter"
                  data-ocid="problems.category_select"
                >
                  <SelectValue placeholder="सभी श्रेणियाँ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>
                    सभी श्रेणियाँ · All categories
                  </SelectItem>
                  {PROBLEM_CATEGORIES.map((item) => {
                    const label = categoryLabel(item);
                    return (
                      <SelectItem key={item} value={item}>
                        {label.hi} · {label.en}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="problem-status-filter">स्थिति · Status</Label>
              <Select
                value={status ?? ALL}
                onValueChange={(value) =>
                  updateSearch({
                    status:
                      value === ALL ? undefined : (value as ProblemStatus),
                  })
                }
              >
                <SelectTrigger
                  id="problem-status-filter"
                  data-ocid="problems.status_select"
                >
                  <SelectValue placeholder="सभी स्थितियाँ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>
                    सभी स्थितियाँ · All statuses
                  </SelectItem>
                  {PROBLEM_STATUSES.map((item) => {
                    const label = statusLabel(item);
                    return (
                      <SelectItem key={item} value={item}>
                        {label.hi} · {label.en}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="size-3.5" aria-hidden="true" />
              {problems.length} परिणाम · results
            </span>
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-ocid="problems.clear_filters_button"
                onClick={clearFilters}
              >
                <X className="size-4" aria-hidden="true" />
                {t.actions.clear}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <section data-ocid="problems.list" className="mt-6 flex flex-col gap-4">
        {problemsQuery.isLoading ? (
          Array.from({ length: 3 }, (_, i) => `problems-skeleton-${i}`).map(
            (id) => <Skeleton key={id} className="h-40 rounded-lg" />,
          )
        ) : problemsQuery.isError ? (
          <EmptyState
            ocid="problems.error_state"
            icon={MessageSquareWarning}
            titleHi={t.common.error}
            titleEn={t.common.errorEn}
            description="शिकायतें लोड नहीं हो सकीं। कृपया पुनः प्रयास करें।"
            action={
              <Button
                type="button"
                data-ocid="problems.retry_button"
                onClick={() => void problemsQuery.refetch()}
              >
                {t.actions.retry}
              </Button>
            }
          />
        ) : problems.length > 0 ? (
          problems.map((problem, index) => (
            <ProblemCard
              key={problem.id.toString()}
              problem={problem}
              index={index}
              onUpvote={(id) => upvoteMutation.mutate(id)}
              upvotePending={upvoteMutation.isPending}
            />
          ))
        ) : (
          <EmptyState
            ocid="problems.empty_state"
            icon={MessageSquareWarning}
            titleHi={
              hasFilters
                ? "कोई मेल खाती शिकायत नहीं मिली"
                : "अभी कोई शिकायत नहीं है"
            }
            titleEn={hasFilters ? "No matching problems" : "No problems yet"}
            description={
              hasFilters
                ? "फ़िल्टर बदलें या साफ़ करके सभी शिकायतें देखें।"
                : "गाँव की पहली समस्या दर्ज करें और पंचायत तक पहुँचाएँ।"
            }
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="problems.empty_clear_button"
                  onClick={clearFilters}
                >
                  {t.actions.clear}
                </Button>
              ) : (
                <Button
                  asChild
                  type="button"
                  data-ocid="problems.empty_report_button"
                >
                  <Link to="/problems/new">{t.actions.reportProblem}</Link>
                </Button>
              )
            }
          />
        )}
      </section>
    </div>
  );
}
