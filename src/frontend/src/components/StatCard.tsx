import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  labelHi: string;
  labelEn: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "primary" | "accent" | "warning" | "success";
  ocid?: string;
}

const TONE_CLASSES: Record<
  NonNullable<StatCardProps["tone"]>,
  { icon: string; value: string }
> = {
  primary: { icon: "bg-primary/12 text-primary", value: "text-primary" },
  accent: { icon: "bg-accent/12 text-accent", value: "text-accent" },
  warning: {
    icon: "bg-warning/20 text-warning-foreground",
    value: "text-foreground",
  },
  success: { icon: "bg-success/12 text-success", value: "text-success" },
};

/** Compact KPI tile used across the dashboard and stats sections. */
export function StatCard({
  labelHi,
  labelEn,
  value,
  icon: Icon,
  hint,
  tone = "primary",
  ocid,
}: StatCardProps) {
  const toneClasses = TONE_CLASSES[tone];
  return (
    <Card
      data-ocid={ocid}
      className="rounded-lg border-border shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-md"
    >
      <CardContent className="flex items-start gap-4 p-5">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg",
            toneClasses.icon,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {labelHi}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
            {labelEn}
          </span>
          <span
            className={cn(
              "mt-1 font-display text-2xl font-bold leading-none",
              toneClasses.value,
            )}
          >
            {value}
          </span>
          {hint ? (
            <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
