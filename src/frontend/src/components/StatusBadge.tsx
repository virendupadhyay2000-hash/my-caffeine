import { DevelopmentStatus, ProblemStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { developmentStatusLabel, statusLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "new"
  | "progress"
  | "resolved"
  | "planned"
  | "ongoing"
  | "completed";

const TONE_CLASSES: Record<BadgeTone, string> = {
  new: "border-accent/30 bg-accent/12 text-accent",
  progress: "border-warning/40 bg-warning/15 text-warning-foreground",
  resolved: "border-success/35 bg-success/12 text-success",
  planned: "border-info/30 bg-info/12 text-info",
  ongoing: "border-warning/40 bg-warning/15 text-warning-foreground",
  completed: "border-success/35 bg-success/12 text-success",
};

function toneForProblem(status: ProblemStatus): BadgeTone {
  switch (status) {
    case ProblemStatus.inProgress:
      return "progress";
    case ProblemStatus.resolved:
      return "resolved";
    default:
      return "new";
  }
}

function toneForDevelopment(status: DevelopmentStatus): BadgeTone {
  switch (status) {
    case DevelopmentStatus.ongoing:
      return "ongoing";
    case DevelopmentStatus.completed:
      return "completed";
    default:
      return "planned";
  }
}

interface StatusBadgeProps {
  status: ProblemStatus;
  className?: string;
}

/** Bilingual status pill for a problem report. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = statusLabel(status);
  return (
    <Badge
      variant="outline"
      data-ocid={`status.${status}`}
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        TONE_CLASSES[toneForProblem(status)],
        className,
      )}
    >
      <span>{label.hi}</span>
      <span className="font-medium normal-case opacity-70">{label.en}</span>
    </Badge>
  );
}

interface DevelopmentStatusBadgeProps {
  status: DevelopmentStatus;
  className?: string;
}

/** Bilingual status pill for a development update. */
export function DevelopmentStatusBadge({
  status,
  className,
}: DevelopmentStatusBadgeProps) {
  const label = developmentStatusLabel(status);
  return (
    <Badge
      variant="outline"
      data-ocid={`development_status.${status}`}
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        TONE_CLASSES[toneForDevelopment(status)],
        className,
      )}
    >
      <span>{label.hi}</span>
      <span className="font-medium normal-case opacity-70">{label.en}</span>
    </Badge>
  );
}
