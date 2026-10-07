import type { DevelopmentInput, DevelopmentUpdate } from "@/backend";
import { AdminGuard } from "@/components/AdminGuard";
import { DevelopmentForm } from "@/components/DevelopmentForm";
import { EmptyState } from "@/components/EmptyState";
import { DevelopmentStatusBadge } from "@/components/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateDevelopmentUpdate,
  useDeleteDevelopmentUpdate,
  useDevelopmentUpdates,
  useUpdateDevelopmentUpdate,
} from "@/hooks/useQueries";
import { formatBudget, formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n";
import { Pencil, Plus, Sprout, Trash2 } from "lucide-react";
import { useState } from "react";

function AdminDevelopment() {
  const updatesQuery = useDevelopmentUpdates();
  const createMutation = useCreateDevelopmentUpdate();
  const updateMutation = useUpdateDevelopmentUpdate();
  const deleteMutation = useDeleteDevelopmentUpdate();

  const [editing, setEditing] = useState<DevelopmentUpdate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DevelopmentUpdate | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updates = updatesQuery.data ?? [];
  const formOpen = isCreating || editing !== null;

  const closeForm = () => {
    setIsCreating(false);
    setEditing(null);
    setErrorMessage(null);
  };

  const handleCreate = (input: DevelopmentInput) => {
    setErrorMessage(null);
    createMutation.mutate(input, {
      onSuccess: () => closeForm(),
      onError: () => setErrorMessage("सहेजने में त्रुटि हुई। पुनः प्रयास करें।"),
    });
  };

  const handleUpdate = (input: DevelopmentInput) => {
    if (!editing) return;
    setErrorMessage(null);
    updateMutation.mutate(
      { id: editing.id, input },
      {
        onSuccess: (result) => {
          if (result === null) {
            setErrorMessage("अद्यतन करने की अनुमति नहीं है।");
            return;
          }
          closeForm();
        },
        onError: () => setErrorMessage("सहेजने में त्रुटि हुई। पुनः प्रयास करें।"),
      },
    );
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  return (
    <div
      data-ocid="admin.development.page"
      className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            प्रशासन · Administration
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            परियोजना प्रबंधन
          </h1>
          <p className="text-sm text-muted-foreground">
            विकास कार्य बनाएँ, संपादित करें और हटाएँ · Create, edit and delete
            development updates
          </p>
        </div>
        {!formOpen ? (
          <Button
            type="button"
            data-ocid="admin.development.create_button"
            onClick={() => {
              setIsCreating(true);
              setErrorMessage(null);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            नया कार्य · New update
          </Button>
        ) : null}
      </header>

      {formOpen ? (
        <Card
          data-ocid="admin.development.form_card"
          className="rounded-lg border-border shadow-subtle"
        >
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {editing ? "कार्य संपादित करें" : "नया विकास कार्य"}
            </CardTitle>
            <CardDescription>
              {editing
                ? "Edit development update"
                : "Create development update"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DevelopmentForm
              key={editing ? editing.id.toString() : "new"}
              initial={editing ?? undefined}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={closeForm}
              isPending={createMutation.isPending || updateMutation.isPending}
              errorMessage={errorMessage}
            />
          </CardContent>
        </Card>
      ) : null}

      {updatesQuery.isLoading ? (
        <div
          data-ocid="admin.development.loading_state"
          className="flex flex-col gap-4"
        >
          {Array.from({ length: 3 }, (_, i) => `dev-${i}`).map((id) => (
            <Skeleton key={id} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : updatesQuery.isError ? (
        <Card
          data-ocid="admin.development.error_state"
          className="rounded-lg border-destructive/30 shadow-subtle"
        >
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-destructive">
              परियोजनाएँ लोड नहीं हो सकीं · Could not load updates
            </p>
            <Button
              type="button"
              variant="secondary"
              data-ocid="admin.development.retry_button"
              onClick={() => void updatesQuery.refetch()}
            >
              {t.actions.retry}
            </Button>
          </CardContent>
        </Card>
      ) : updates.length === 0 ? (
        <EmptyState
          icon={Sprout}
          titleHi="अभी कोई विकास कार्य नहीं"
          titleEn="No development updates yet"
          description="पहला विकास कार्य जोड़कर गाँव की प्रगति दर्ज करें।"
          action={
            <Button
              type="button"
              data-ocid="admin.development.empty_create_button"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              नया कार्य जोड़ें
            </Button>
          }
          ocid="admin.development.empty_state"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {updates.map((update, index) => (
            <Card
              key={update.id.toString()}
              data-ocid={`admin.development.item.${index + 1}`}
              className="rounded-lg border-border shadow-subtle"
            >
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="font-display text-lg font-bold text-foreground">
                      {update.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {formatBudget(update.budget)}
                      </span>
                      <span>अद्यतन: {formatDateTime(update.updatedAt)}</span>
                    </div>
                  </div>
                  <DevelopmentStatusBadge status={update.status} />
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {update.description}
                </p>
                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    data-ocid={`admin.development.edit_button.${index + 1}`}
                    onClick={() => {
                      setEditing(update);
                      setIsCreating(false);
                      setErrorMessage(null);
                    }}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    {t.actions.edit}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-ocid={`admin.development.delete_button.${index + 1}`}
                    onClick={() => setPendingDelete(update)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    {t.actions.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent data-ocid="admin.development.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>कार्य हटाएँ?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” को स्थायी रूप से हटाया जाएगा। यह क्रिया पूर्ववत
              नहीं की जा सकती।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              type="button"
              data-ocid="admin.development.delete_cancel_button"
            >
              {t.actions.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              data-ocid="admin.development.delete_confirm_button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminDevelopmentPage() {
  return (
    <AdminGuard>
      <AdminDevelopment />
    </AdminGuard>
  );
}
