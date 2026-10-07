import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/use-backend";
import { blobUrl, formatDateTime } from "@/lib/format";
import { categoryLabel, statusLabel, t } from "@/lib/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";
import {
  ArrowBigUp,
  ArrowLeft,
  CalendarDays,
  MapPin,
  MessageSquareWarning,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

const routeApi = getRouteApi("/problems/$problemId");

export function ProblemDetailPage() {
  const { problemId } = routeApi.useParams();
  const queryClient = useQueryClient();
  const { actor, isReady } = useBackend();

  const id = /^\d+$/.test(problemId) ? BigInt(problemId) : null;

  const detailQuery = useQuery({
    queryKey: ["problemDetail", problemId],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProblemDetail(id);
    },
    enabled: isReady && id !== null,
  });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      if (!actor || id === null) throw new Error("Backend is not ready");
      return actor.upvoteProblem(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["problemDetail", problemId],
      });
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
      void queryClient.invalidateQueries({ queryKey: ["problemStats"] });
    },
    onError: () => {
      toast.error("समर्थन दर्ज नहीं हो सका · Could not record upvote");
    },
  });

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-64 rounded-lg" />
        <Skeleton className="mt-4 h-40 rounded-lg" />
      </div>
    );
  }

  const detail = detailQuery.data ?? null;

  if (!detail) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          ocid="problem_detail.not_found_state"
          icon={MessageSquareWarning}
          titleHi="शिकायत नहीं मिली"
          titleEn="Problem not found"
          description="यह शिकायत हटा दी गई हो सकती है या पता गलत है।"
          action={
            <Button
              asChild
              type="button"
              data-ocid="problem_detail.back_button"
            >
              <Link to="/problems">{t.actions.back}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { problem, statusHistory, responses } = detail;
  const category = categoryLabel(problem.category);
  const photo = blobUrl(problem.photo);

  return (
    <div
      data-ocid="problem_detail.page"
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <Button
        asChild
        type="button"
        variant="ghost"
        size="sm"
        data-ocid="problem_detail.back_button"
        className="mb-4"
      >
        <Link to="/problems">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.actions.back}
        </Link>
      </Button>

      <article className="flex flex-col gap-6">
        <Card className="overflow-hidden rounded-lg border-border shadow-subtle">
          {photo ? (
            <img
              src={photo}
              alt={problem.title}
              className="max-h-96 w-full object-cover"
            />
          ) : null}
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={problem.status} />
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {category.hi}
                <span className="ml-1 font-medium normal-case opacity-70">
                  {category.en}
                </span>
              </span>
            </div>
            <CardTitle className="font-display text-2xl font-bold leading-snug sm:text-3xl">
              {problem.title}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDateTime(problem.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5" aria-hidden="true" />
                {problem.reporterName ?? t.common.anonymous}
              </span>
              {problem.reporterContact ? (
                <span className="inline-flex items-center gap-1.5">
                  {problem.reporterContact}
                </span>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {problem.description}
            </p>

            {problem.location ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPin className="size-4 text-accent" aria-hidden="true" />
                  {t.common.location} · {t.common.locationEn}
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${problem.location.latitude}&mlon=${problem.location.longitude}#map=16/${problem.location.latitude}/${problem.location.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  data-ocid="problem_detail.location_link"
                  className="rounded-sm text-sm font-semibold text-primary underline-offset-4 transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {problem.location.latitude.toFixed(5)},{" "}
                  {problem.location.longitude.toFixed(5)}
                </a>
              </div>
            ) : null}

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-foreground">
                  {Number(problem.upvotes)}
                </span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t.common.upvotes} · {t.common.upvotesEn}
                </span>
              </div>
              <Button
                type="button"
                data-ocid="problem_detail.upvote_button"
                onClick={() => upvoteMutation.mutate()}
                disabled={upvoteMutation.isPending}
              >
                <ArrowBigUp className="size-4" aria-hidden="true" />
                {t.actions.upvote}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status history */}
        <Card className="rounded-lg border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg">स्थिति इतिहास</CardTitle>
            <CardDescription>Status history</CardDescription>
          </CardHeader>
          <CardContent>
            {statusHistory.length > 0 ? (
              <ol
                data-ocid="problem_detail.status_history_list"
                className="relative flex flex-col gap-5 border-l border-border pl-6"
              >
                {statusHistory.map((change, index) => {
                  const to = statusLabel(change.toStatus);
                  const from = statusLabel(change.fromStatus);
                  return (
                    <li
                      key={`${change.changedAt.toString()}-${index}`}
                      data-ocid={`problem_detail.status_history_item.${index + 1}`}
                      className="relative flex flex-col gap-1"
                    >
                      <span className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-card bg-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        {from.hi} → {to.hi}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(change.changedAt)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                अभी कोई स्थिति परिवर्तन दर्ज नहीं है।
              </p>
            )}
          </CardContent>
        </Card>

        {/* Official responses */}
        <Card className="rounded-lg border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              पंचायत की प्रतिक्रियाएँ
            </CardTitle>
            <CardDescription>Official responses</CardDescription>
          </CardHeader>
          <CardContent>
            {responses.length > 0 ? (
              <ul
                data-ocid="problem_detail.responses_list"
                className="flex flex-col gap-4"
              >
                {responses.map((response, index) => (
                  <li
                    key={response.id.toString()}
                    data-ocid={`problem_detail.response_item.${index + 1}`}
                    className="rounded-lg border border-border bg-muted/40 p-4"
                  >
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {response.message}
                    </p>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {formatDateTime(response.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                पंचायत ने अभी कोई प्रतिक्रिया नहीं दी है।
              </p>
            )}
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
