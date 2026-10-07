import type { VillageProfile } from "@/backend";
import { AdminGuard } from "@/components/AdminGuard";
import { VillageProfileForm } from "@/components/VillageProfileForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSetVillageProfile, useVillageProfile } from "@/hooks/useQueries";
import { formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n";
import { CheckCircle2, MapPinned } from "lucide-react";
import { useState } from "react";

function AdminProfile() {
  const profileQuery = useVillageProfile();
  const saveMutation = useSetVillageProfile();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<bigint | null>(null);

  const handleSubmit = (input: VillageProfile) => {
    setErrorMessage(null);
    saveMutation.mutate(input, {
      onSuccess: (result) => {
        setSavedAt(result.updatedAt);
      },
      onError: () => setErrorMessage("सहेजने में त्रुटि हुई। पुनः प्रयास करें।"),
    });
  };

  return (
    <div
      data-ocid="admin.profile.page"
      className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          प्रशासन · Administration
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          गाँव प्रोफ़ाइल
        </h1>
        <p className="text-sm text-muted-foreground">
          गाँव के तथ्य और आँकड़े संपादित करें · Edit village facts and figures
        </p>
      </header>

      {profileQuery.isLoading ? (
        <div
          data-ocid="admin.profile.loading_state"
          className="flex flex-col gap-4"
        >
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      ) : profileQuery.isError ? (
        <Card
          data-ocid="admin.profile.error_state"
          className="rounded-lg border-destructive/30 shadow-subtle"
        >
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-destructive">
              प्रोफ़ाइल लोड नहीं हो सकी · Could not load profile
            </p>
            <Button
              type="button"
              variant="secondary"
              data-ocid="admin.profile.retry_button"
              onClick={() => void profileQuery.refetch()}
            >
              {t.actions.retry}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-lg border-border shadow-subtle">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <MapPinned className="size-5 text-primary" aria-hidden="true" />
                गाँव की जानकारी
              </CardTitle>
              <CardDescription>Village information</CardDescription>
            </div>
            {profileQuery.data ? (
              <span className="text-xs text-muted-foreground">
                अंतिम अद्यतन: {formatDateTime(profileQuery.data.updatedAt)}
              </span>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {savedAt !== null ? (
              <p
                data-ocid="admin.profile.success_state"
                className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                प्रोफ़ाइल सहेजी गई · Profile saved
              </p>
            ) : null}
            <VillageProfileForm
              initial={profileQuery.data}
              onSubmit={handleSubmit}
              isPending={saveMutation.isPending}
              errorMessage={errorMessage}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <AdminGuard>
      <AdminProfile />
    </AdminGuard>
  );
}
