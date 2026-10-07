import type { GeoLocation, ProblemCategory } from "@/backend";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBackend } from "@/hooks/use-backend";
import { PROBLEM_CATEGORIES, categoryLabel, t } from "@/lib/i18n";
import { ExternalBlob } from "@caffeineai/object-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  Send,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function ReportProblemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor } = useBackend();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProblemCategory | "">("");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      if (!category) throw new Error("Category is required");

      let blob: ExternalBlob | undefined;
      if (photo) {
        const bytes = new Uint8Array(await photo.arrayBuffer());
        blob = ExternalBlob.fromBytes(
          bytes,
          photo.type,
          photo.name,
        ).withUploadProgress((pct) => setUploadProgress(pct));
      }

      return actor.createProblem({
        title: title.trim(),
        description: description.trim(),
        category,
        reporterName: reporterName.trim() || undefined,
        reporterContact: reporterContact.trim() || undefined,
        photo: blob,
        location: location ?? undefined,
      });
    },
    onSuccess: (problem) => {
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
      void queryClient.invalidateQueries({ queryKey: ["problemStats"] });
      toast.success("शिकायत दर्ज हो गई · Problem reported");
      void navigate({
        to: "/problems/$problemId",
        params: { problemId: problem.id.toString() },
      });
    },
    onError: () => {
      setUploadProgress(0);
      toast.error("शिकायत दर्ज नहीं हो सकी · Could not submit report");
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setPhoto(file);
    setUploadProgress(0);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("इस ब्राउज़र में स्थान सुविधा उपलब्ध नहीं है।");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError("स्थान प्राप्त नहीं हो सका। अनुमति जाँचें।");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length < 4) {
      setFormError("कृपया कम से कम 4 अक्षरों का शीर्षक लिखें।");
      return;
    }
    if (description.trim().length < 10) {
      setFormError("कृपया समस्या का विवरण विस्तार से लिखें।");
      return;
    }
    if (!category) {
      setFormError("कृपया श्रेणी चुनें।");
      return;
    }
    setFormError(null);
    createMutation.mutate();
  };

  const isPending = createMutation.isPending;

  return (
    <div
      data-ocid="report_problem.page"
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold text-foreground">
          {t.actions.reportProblem}
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.actions.reportProblemEn}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          अपनी समस्या विस्तार से बताएँ। नाम और संपर्क देना वैकल्पिक है — गुमनाम शिकायत भी
          स्वीकार है।
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <Card className="rounded-lg border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg">समस्या का विवरण</CardTitle>
            <CardDescription>Problem details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="problem-title">
                शीर्षक · Title <span className="text-accent">*</span>
              </Label>
              <Input
                id="problem-title"
                data-ocid="report_problem.title_input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="जैसे: मुख्य मार्ग पर पानी भरा है"
                maxLength={120}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="problem-description">
                विवरण · Description <span className="text-accent">*</span>
              </Label>
              <Textarea
                id="problem-description"
                data-ocid="report_problem.description_textarea"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="समस्या कहाँ है, कब से है, और किसे प्रभावित कर रही है?"
                rows={5}
                maxLength={2000}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="problem-category">
                श्रेणी · Category <span className="text-accent">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as ProblemCategory)}
              >
                <SelectTrigger
                  id="problem-category"
                  data-ocid="report_problem.category_select"
                >
                  <SelectValue placeholder="श्रेणी चुनें" />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEM_CATEGORIES.map((item) => {
                    const label = categoryLabel(item);
                    return (
                      <SelectItem key={item} value={item}>
                        {label.hi} · {label.en}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="size-5 text-primary" aria-hidden="true" />
              फ़ोटो
            </CardTitle>
            <CardDescription>
              Photo · {t.common.optional} ({t.common.optionalEn})
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {photoPreview ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                <img
                  src={photoPreview}
                  alt="चयनित फ़ोटो का पूर्वावलोकन"
                  className="max-h-72 w-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  data-ocid="report_problem.remove_photo_button"
                  onClick={removePhoto}
                  aria-label="फ़ोटो हटाएँ"
                  className="absolute right-2 top-2"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="problem-photo"
                data-ocid="report_problem.dropzone"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-smooth hover:border-primary/50 hover:bg-muted"
              >
                <ImagePlus
                  className="size-7 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-foreground">
                  फ़ोटो चुनें या खींचकर छोड़ें
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG या WEBP · अधिकतम 10 MB
                </span>
              </label>
            )}
            <input
              ref={fileInputRef}
              id="problem-photo"
              data-ocid="report_problem.photo_input"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
            />
            {photo && isPending ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>अपलोड हो रहा है… · Uploading</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress
                  value={uploadProgress}
                  data-ocid="report_problem.upload_progress"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="size-5 text-accent" aria-hidden="true" />
              स्थान
            </CardTitle>
            <CardDescription>
              Location · {t.common.optional} ({t.common.optionalEn})
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {location ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCircle2
                    className="size-4 text-success"
                    aria-hidden="true"
                  />
                  {location.latitude.toFixed(5)},{" "}
                  {location.longitude.toFixed(5)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid="report_problem.clear_location_button"
                  onClick={() => setLocation(null)}
                >
                  {t.actions.clear}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                data-ocid="report_problem.locate_button"
                onClick={captureLocation}
                disabled={locating}
                className="w-full sm:w-auto"
              >
                {locating ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <MapPin className="size-4" aria-hidden="true" />
                )}
                {locating ? "स्थान खोजा जा रहा है…" : "वर्तमान स्थान जोड़ें"}
              </Button>
            )}
            {locationError ? (
              <p
                data-ocid="report_problem.location_error"
                className="text-xs text-destructive"
              >
                {locationError}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg">शिकायतकर्ता</CardTitle>
            <CardDescription>
              Reporter · {t.common.optional} ({t.common.optionalEn})
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reporter-name">नाम · Name</Label>
              <Input
                id="reporter-name"
                data-ocid="report_problem.reporter_name_input"
                value={reporterName}
                onChange={(event) => setReporterName(event.target.value)}
                placeholder="आपका नाम"
                maxLength={80}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reporter-contact">संपर्क · Contact</Label>
              <Input
                id="reporter-contact"
                data-ocid="report_problem.reporter_contact_input"
                value={reporterContact}
                onChange={(event) => setReporterContact(event.target.value)}
                placeholder="मोबाइल नंबर या ईमेल"
                maxLength={120}
              />
            </div>
          </CardContent>
        </Card>

        {formError ? (
          <p
            data-ocid="report_problem.form_error"
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            data-ocid="report_problem.cancel_button"
            onClick={() => void navigate({ to: "/problems" })}
            disabled={isPending}
          >
            {t.actions.cancel}
          </Button>
          <Button
            type="submit"
            data-ocid="report_problem.submit_button"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            {isPending ? "जमा हो रहा है…" : t.actions.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}
