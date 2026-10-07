import type { Problem } from "@/backend";
import type { ProblemStatus } from "@/backend";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddOfficialResponse,
  useUpdateProblemStatus,
} from "@/hooks/useQueries";
import { formatDateTime } from "@/lib/format";
import { PROBLEM_STATUSES, categoryLabel, statusLabel, t } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Loader2, MapPin, MessageSquarePlus } from "lucide-react";
import { useState } from "react";

interface AdminProblemRowProps {
  problem: Problem;
  index: number;
}

/**
 * One problem in the admin management list: inline status control plus an
 * official-response composer. Both writes surface unauthorized (null) results
 * as an inline error instead of silently succeeding.
 */
export function AdminProblemRow({ problem, index }: AdminProblemRowProps) {
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const statusMutation = useUpdateProblemStatus();
  const responseMutation = useAddOfficialResponse();

  const category = categoryLabel(problem.category);

  const handleStatusChange = (value: string) => {
    setFeedback(null);
    statusMutation.mutate(
      { id: problem.id, status: value as ProblemStatus },
      {
        onSuccess: (result) => {
          if (result === null) {
            setFeedback("स्थिति बदलने की अनुमति नहीं है।");
          }
        },
        onError: () => setFeedback("स्थिति बदलने में त्रुटि हुई।"),
      },
    );
  };

  const handleResponseSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = response.trim();
    if (!message) return;
    setFeedback(null);
    setResponse("");
    responseMutation.mutate(
      { id: problem.id, message },
      {
        onSuccess: (result) => {
          if (result === null) {
            setFeedback("आधिकारिक उत्तर जोड़ने की अनुमति नहीं है।");
            setResponse(message);
          }
        },
        onError: () => {
          setFeedback("उत्तर जोड़ने में त्रुटि हुई।");
          setResponse(message);
        },
      },
    );
  };

  return (
    <Card
      data-ocid={`admin.problem.item.${index + 1}`}
      className="rounded-lg border-border shadow-subtle"
    >
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <Link
              to="/problems/$problemId"
              params={{ problemId: problem.id.toString() }}
              data-ocid={`admin.problem.link.${index + 1}`}
              className="font-display text-lg font-bold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {problem.title}
            </Link>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                {category.hi} · {category.en}
              </span>
              <span>{formatDateTime(problem.createdAt)}</span>
              {problem.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden="true" />
                  {problem.location.latitude.toFixed(3)},{" "}
                  {problem.location.longitude.toFixed(3)}
                </span>
              ) : null}
            </div>
          </div>
          <StatusBadge status={problem.status} />
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {problem.description}
        </p>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5 sm:w-56">
            <label
              htmlFor={`status-${problem.id}`}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              स्थिति बदलें · Change status
            </label>
            <Select
              value={problem.status}
              onValueChange={handleStatusChange}
              disabled={statusMutation.isPending}
            >
              <SelectTrigger
                id={`status-${problem.id}`}
                data-ocid={`admin.problem.status_select.${index + 1}`}
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROBLEM_STATUSES.map((status) => {
                  const label = statusLabel(status);
                  return (
                    <SelectItem key={status} value={status}>
                      {label.hi} · {label.en}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <form
            onSubmit={handleResponseSubmit}
            className="flex flex-1 flex-col gap-1.5"
          >
            <label
              htmlFor={`response-${problem.id}`}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              आधिकारिक उत्तर · Official response
            </label>
            <div className="flex items-start gap-2">
              <Textarea
                id={`response-${problem.id}`}
                data-ocid={`admin.problem.response_input.${index + 1}`}
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="नागरिक को पंचायत की ओर से उत्तर लिखें…"
                rows={2}
                className="min-h-[44px] flex-1 resize-y"
              />
              <Button
                type="submit"
                data-ocid={`admin.problem.response_submit_button.${index + 1}`}
                disabled={responseMutation.isPending || response.trim() === ""}
                className="shrink-0"
              >
                {responseMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <MessageSquarePlus className="size-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{t.actions.submit}</span>
              </Button>
            </div>
          </form>
        </div>

        {feedback ? (
          <p
            data-ocid={`admin.problem.error_state.${index + 1}`}
            className="flex items-center gap-1.5 text-sm text-destructive"
          >
            <AlertCircle className="size-4" aria-hidden="true" />
            {feedback}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
