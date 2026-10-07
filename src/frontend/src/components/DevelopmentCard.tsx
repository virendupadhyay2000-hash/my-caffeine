import type { DevelopmentUpdate } from "@/backend";
import { DevelopmentStatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { blobUrl, formatBudget, formatDate, truncate } from "@/lib/format";
import { t } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { CalendarDays, IndianRupee } from "lucide-react";

interface DevelopmentCardProps {
  update: DevelopmentUpdate;
  index: number;
}

/** Feed card for a single development update. */
export function DevelopmentCard({ update, index }: DevelopmentCardProps) {
  const photo = blobUrl(update.photo);
  const position = index + 1;

  return (
    <Card
      data-ocid={`development.item.${position}`}
      className="group overflow-hidden rounded-lg border-border shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-md"
    >
      {photo ? (
        <Link
          to="/development/$updateId"
          params={{ updateId: update.id.toString() }}
          className="block"
          aria-label={update.title}
        >
          <img
            src={photo}
            alt={update.title}
            loading="lazy"
            className="h-44 w-full object-cover"
          />
        </Link>
      ) : null}

      <CardContent className="flex flex-col gap-3 p-5">
        <DevelopmentStatusBadge status={update.status} />

        <div className="flex min-w-0 flex-col gap-1">
          <Link
            to="/development/$updateId"
            params={{ updateId: update.id.toString() }}
            data-ocid={`development.link.${position}`}
            className="rounded-sm font-display text-lg font-bold leading-snug text-foreground transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {update.title}
          </Link>
          <p className="text-sm text-muted-foreground">
            {truncate(update.description, 150)}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <IndianRupee className="size-3.5 text-primary" aria-hidden="true" />
            {formatBudget(update.budget)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {formatDate(update.createdAt)}
          </span>
          <span className="sr-only">{t.common.budgetEn}</span>
        </div>
      </CardContent>
    </Card>
  );
}
