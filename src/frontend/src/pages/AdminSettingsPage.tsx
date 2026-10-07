import { AdminGuard } from "@/components/AdminGuard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useContactSettings,
  useUpdateContactSettings,
} from "@/hooks/useQueries";
import { t } from "@/lib/i18n";
import { CheckCircle2, Loader2, Mail, Phone, Save } from "lucide-react";
import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d][\d\s-]{6,}$/;

interface FieldErrors {
  email?: string;
  phone?: string;
}

function AdminSettings() {
  const settingsQuery = useContactSettings();
  const saveMutation = useUpdateContactSettings();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // One-time initialization of the draft from the loaded settings. The draft is
  // never overwritten afterwards, so a refetch cannot clobber in-progress edits.
  if (!initialized && settingsQuery.data) {
    setEmail(settingsQuery.data.email);
    setPhone(settingsQuery.data.phone);
    setInitialized(true);
  }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedEmail) {
      next.email = t.contact.emailRequired;
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = t.contact.emailInvalid;
    }
    if (!trimmedPhone) {
      next.phone = t.contact.phoneRequired;
    } else if (!PHONE_PATTERN.test(trimmedPhone)) {
      next.phone = t.contact.phoneInvalid;
    }
    return next;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    setSaveError(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.phone) return;

    const payload = { email: email.trim(), phone: phone.trim() };
    saveMutation.mutate(payload, {
      onSuccess: () => setSaved(true),
      onError: () => setSaveError(t.contact.saveError),
    });
  };

  return (
    <div
      data-ocid="admin.settings.page"
      className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          प्रशासन · Administration
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t.contact.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.contact.subtitle}</p>
      </header>

      {settingsQuery.isLoading ? (
        <div
          data-ocid="admin.settings.loading_state"
          className="flex flex-col gap-4"
        >
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : settingsQuery.isError ? (
        <Card
          data-ocid="admin.settings.error_state"
          className="rounded-lg border-destructive/30 shadow-subtle"
        >
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-destructive">{t.contact.loadError}</p>
            <Button
              type="button"
              variant="secondary"
              data-ocid="admin.settings.retry_button"
              onClick={() => void settingsQuery.refetch()}
            >
              {t.actions.retry}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-lg border-border shadow-subtle lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Phone className="size-5 text-primary" aria-hidden="true" />
                {t.contact.title}
              </CardTitle>
              <CardDescription>{t.contact.titleEn}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                data-ocid="admin.settings.form"
                className="flex flex-col gap-5"
                noValidate
              >
                {saved ? (
                  <p
                    data-ocid="admin.settings.success_state"
                    className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
                  >
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    {t.contact.saved}
                  </p>
                ) : null}

                {saveError ? (
                  <p
                    data-ocid="admin.settings.save_error_state"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {saveError}
                  </p>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact-email">
                    {t.contact.emailLabel}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    data-ocid="admin.settings.email_input"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSaved(false);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder={t.contact.emailPlaceholder}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={
                      errors.email ? "contact-email-error" : undefined
                    }
                  />
                  {errors.email ? (
                    <p
                      id="contact-email-error"
                      data-ocid="admin.settings.email_error"
                      className="text-sm text-destructive"
                    >
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact-phone">
                    {t.contact.phoneLabel}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    data-ocid="admin.settings.phone_input"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setSaved(false);
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    placeholder={t.contact.phonePlaceholder}
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={
                      errors.phone ? "contact-phone-error" : undefined
                    }
                  />
                  {errors.phone ? (
                    <p
                      id="contact-phone-error"
                      data-ocid="admin.settings.phone_error"
                      className="text-sm text-destructive"
                    >
                      {errors.phone}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Button
                    type="submit"
                    data-ocid="admin.settings.save_button"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Save className="size-4" aria-hidden="true" />
                    )}
                    {t.actions.save}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-border shadow-subtle">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                {t.contact.preview}
              </CardTitle>
              <CardDescription>{t.contact.previewHint}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="min-w-0 break-all text-foreground">
                  {phone.trim() || t.contact.phonePlaceholder}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="min-w-0 break-all text-foreground">
                  {email.trim() || t.contact.emailPlaceholder}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <AdminSettings />
    </AdminGuard>
  );
}
