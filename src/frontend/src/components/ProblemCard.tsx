import type { Problem } from "@/backend";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { blobUrl, formatDate, truncate } from "@/lib/format";
import { categoryLabel, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowBigUp, MapPin, MessageSquare } from "lucide-react";

interface ProblemCardProps {
  problem: Problem;
  index: number;
  onUpvote?: (id: bigint) => void;
  upvotePending?: boolean;
}

/** Feed card for a single reported problem. */
export function ProblemCard({
  problem,
  index,
  onUpvote,
  upvotePending,
}: ProblemCardProps) {
  const category = categoryLabel(problem.category);
  const photo = blobUrl(problem.photo);
  const position = index + 1;

  return (
    <Card
      data-ocid={`problem.item.${position}`}
      className="group overflow-hidden rounded-lg border-border shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row">
        {photo ? (
          <Link
            to="/problems/$problemId"
            params={{ problemId: problem.id.toString() }}
            className="block shrink-0 sm:w-44"
            aria-label={problem.title}
          >
            <img
              src={photo}
              alt={problem.title}
              loading="lazy"
              className="h-40 w-full object-cover sm:h-full"
            />
          </Link>
        ) : null}

        <CardContent className="flex min-w-0 flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={problem.status} />
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {category.hi}
              <span className="ml-1 font-medium normal-case opacity-70">
                {category.en}
              </span>
            </span>
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <Link
              to="/problems/$problemId"
              params={{ problemId: problem.id.toString() }}
              data-ocid={`problem.link.${position}`}
              className="rounded-sm font-display text-lg font-bold leading-snug text-foreground transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {problem.title}
            </Link>
            <p className="text-sm text-muted-foreground">
              {truncate(problem.description, 160)}
            </p>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="size-3.5" aria-hidden="true" />
                {formatDate(problem.createdAt)}
              </span>
              {problem.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {problem.location.latitude.toFixed(3)},{" "}
                  {problem.location.longitude.toFixed(3)}
                </span>
              ) : null}
              <span className="truncate">
                {problem.reporterName
                  ? problem.reporterName
                  : t.common.anonymous}
              </span>
            </div>

            <button
              type="button"
              data-ocid={`problem.upvote_button.${position}`}
              onClick={() => onUpvote?.(problem.id)}
              disabled={!onUpvote || upvotePending}
              aria-label={`${t.actions.upvote} — ${problem.title}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-smooth hover:border-accent/50 hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <ArrowBigUp className="size-4" aria-hidden="true" />
              <span>{Number(problem.upvotes)}</span>
              <span className="sr-only">{t.actions.upvoteEn}</span>
            </button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
