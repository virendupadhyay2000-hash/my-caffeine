import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  titleHi: string;
  titleEn: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  ocid?: string;
}

/** Shared empty-state block: icon, bilingual headline, guidance, next step. */
export function EmptyState({
  icon: Icon,
  titleHi,
  titleEn,
  description,
  action,
  className,
  ocid = "empty_state",
}: EmptyStateProps) {
  return (
    <div
      data-ocid={ocid}
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/60 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="font-display text-xl font-bold text-foreground">
        {titleHi}
      </h3>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {titleEn}
      </p>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Convenience action button for empty states that link elsewhere. */
export function EmptyStateAction({
  children,
  onClick,
  ocid,
}: {
  children: ReactNode;
  onClick: () => void;
  ocid?: string;
}) {
  return (
    <Button type="button" data-ocid={ocid} onClick={onClick}>
      {children}
    </Button>
  );
}
