import { EmptyState } from "@/components/EmptyState";
import { DevelopmentStatusBadge } from "@/components/StatusBadge";
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
import { blobUrl, formatBudget, formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  IndianRupee,
  RefreshCw,
  Sprout,
} from "lucide-react";

const routeApi = getRouteApi("/development/$updateId");

export function DevelopmentDetailPage() {
  const { updateId } = routeApi.useParams();
  const { actor, isReady } = useBackend();

  const id = /^\d+$/.test(updateId) ? BigInt(updateId) : null;

  const updateQuery = useQuery({
    queryKey: ["developmentUpdate", updateId],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getDevelopmentUpdate(id);
    },
    enabled: isReady && id !== null,
  });

  if (updateQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-72 rounded-lg" />
      </div>
    );
  }

  const update = updateQuery.data ?? null;

  if (!update) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          ocid="development_detail.not_found_state"
          icon={Sprout}
          titleHi="विकास कार्य नहीं मिला"
          titleEn="Development update not found"
          description="यह कार्य हटा दिया गया हो सकता है या पता गलत है।"
          action={
            <Button
              asChild
              type="button"
              data-ocid="development_detail.back_button"
            >
              <Link to="/development">{t.actions.back}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const photo = blobUrl(update.photo);

  return (
    <div
      data-ocid="development_detail.page"
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <Button
        asChild
        type="button"
        variant="ghost"
        size="sm"
        data-ocid="development_detail.back_button"
        className="mb-4"
      >
        <Link to="/development">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.actions.back}
        </Link>
      </Button>

      <article className="flex flex-col gap-6">
        <Card className="overflow-hidden rounded-lg border-border shadow-subtle">
          {photo ? (
            <img
              src={photo}
              alt={update.title}
              className="max-h-96 w-full object-cover"
            />
          ) : null}
          <CardHeader className="gap-3">
            <DevelopmentStatusBadge status={update.status} />
            <CardTitle className="font-display text-2xl font-bold leading-snug sm:text-3xl">
              {update.title}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDateTime(update.createdAt)}
              </span>
              {update.updatedAt !== update.createdAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  अद्यतन: {formatDateTime(update.updatedAt)}
                </span>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {update.description}
            </p>

            <Separator />

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t.common.budget} · {t.common.budgetEn}
                </span>
                <span className="inline-flex items-center gap-1.5 font-display text-2xl font-bold text-primary">
                  <IndianRupee className="size-5" aria-hidden="true" />
                  {formatBudget(update.budget).replace("₹", "")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
