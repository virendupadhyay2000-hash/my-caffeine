import type { DevelopmentUpdate } from "@/backend";
import { DevelopmentCard } from "@/components/DevelopmentCard";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/use-backend";
import { formatNumber } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Sprout, TrendingUp } from "lucide-react";

export function DevelopmentPage() {
  const { actor, isReady } = useBackend();

  const developmentQuery = useQuery({
    queryKey: ["developmentUpdates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDevelopmentUpdates();
    },
    enabled: isReady,
  });

  const updates: DevelopmentUpdate[] = developmentQuery.data ?? [];

  const ongoing = updates.filter((item) => item.status === "ongoing").length;
  const completed = updates.filter(
    (item) => item.status === "completed",
  ).length;

  return (
    <div
      data-ocid="development.page"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-foreground">
          <Sprout className="size-7 text-primary" aria-hidden="true" />
          {t.nav.projects}
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.nav.projectsEn}
        </p>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          पंचायत द्वारा प्रकाशित विकास कार्य — नियोजित, चल रहे और पूर्ण।
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          ocid="development.stat.total"
          labelHi="कुल कार्य"
          labelEn="Total works"
          value={formatNumber(updates.length)}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          ocid="development.stat.ongoing"
          labelHi="चल रहे"
          labelEn="Ongoing"
          value={formatNumber(ongoing)}
          icon={Loader2}
          tone="warning"
        />
        <StatCard
          ocid="development.stat.completed"
          labelHi="पूर्ण"
          labelEn="Completed"
          value={formatNumber(completed)}
          icon={CheckCircle2}
          tone="success"
        />
      </section>

      <section data-ocid="development.list" className="mt-8">
        {developmentQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => `dev-page-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-64 rounded-lg" />
              ),
            )}
          </div>
        ) : developmentQuery.isError ? (
          <EmptyState
            ocid="development.error_state"
            icon={Sprout}
            titleHi={t.common.error}
            titleEn={t.common.errorEn}
            description="विकास कार्य लोड नहीं हो सके। कृपया पुनः प्रयास करें।"
            action={
              <Button
                type="button"
                data-ocid="development.retry_button"
                onClick={() => void developmentQuery.refetch()}
              >
                {t.actions.retry}
              </Button>
            }
          />
        ) : updates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {updates.map((update, index) => (
              <DevelopmentCard
                key={update.id.toString()}
                update={update}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            ocid="development.empty_state"
            icon={Sprout}
            titleHi="अभी कोई विकास कार्य दर्ज नहीं है"
            titleEn="No development updates yet"
            description="पंचायत द्वारा प्रकाशित विकास कार्य यहाँ दिखाई देंगे।"
          />
        )}
      </section>
    </div>
  );
}
