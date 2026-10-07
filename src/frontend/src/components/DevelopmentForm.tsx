import type { DevelopmentInput, DevelopmentUpdate } from "@/backend";
import { DevelopmentStatus } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DEVELOPMENT_STATUSES, developmentStatusLabel, t } from "@/lib/i18n";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";

interface DevelopmentFormProps {
  /** Existing update when editing; omitted when creating. */
  initial?: DevelopmentUpdate;
  onSubmit: (input: DevelopmentInput) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage?: string | null;
}

/**
 * Create/edit form for a development update. Owns its own draft state so a
 * background refetch never overwrites what the admin is typing.
 */
export function DevelopmentForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: DevelopmentFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<DevelopmentStatus>(
    initial?.status ?? DevelopmentStatus.planned,
  );
  const [budget, setBudget] = useState(
    initial ? initial.budget.toString() : "",
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle || !trimmedDescription) return;
    const parsedBudget = Number.parseInt(budget, 10);
    onSubmit({
      title: trimmedTitle,
      description: trimmedDescription,
      status,
      budget: BigInt(Number.isNaN(parsedBudget) ? 0 : parsedBudget),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="development.form"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dev-title">
          शीर्षक · Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="dev-title"
          data-ocid="development.title_input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="जैसे: मुख्य सड़क का निर्माण"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dev-description">
          विवरण · Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="dev-description"
          data-ocid="development.description_input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="परियोजना का विवरण, लाभ और वर्तमान स्थिति लिखें…"
          rows={5}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dev-status">स्थिति · Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as DevelopmentStatus)}
          >
            <SelectTrigger
              id="dev-status"
              data-ocid="development.status_select"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEVELOPMENT_STATUSES.map((option) => {
                const label = developmentStatusLabel(option);
                return (
                  <SelectItem key={option} value={option}>
                    {label.hi} · {label.en}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dev-budget">बजट (₹) · Budget</Label>
          <Input
            id="dev-budget"
            data-ocid="development.budget_input"
            type="number"
            min={0}
            inputMode="numeric"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="जैसे: 500000"
          />
        </div>
      </div>

      {errorMessage ? (
        <p
          data-ocid="development.form.error_state"
          className="text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          data-ocid="development.submit_button"
          disabled={
            isPending || title.trim() === "" || description.trim() === ""
          }
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {initial ? t.actions.save : t.actions.submit}
        </Button>
        <Button
          type="button"
          variant="secondary"
          data-ocid="development.cancel_button"
          onClick={onCancel}
          disabled={isPending}
        >
          {t.actions.cancel}
        </Button>
      </div>
    </form>
  );
}
