import type { VillageProfile } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";

interface VillageProfileFormProps {
  initial?: VillageProfile | null;
  onSubmit: (input: VillageProfile) => void;
  isPending: boolean;
  errorMessage?: string | null;
}

/**
 * Editor for the village facts and figures. Facilities are entered as one
 * comma-separated line and normalised into a string array on submit.
 */
export function VillageProfileForm({
  initial,
  onSubmit,
  isPending,
  errorMessage,
}: VillageProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [population, setPopulation] = useState(
    initial ? initial.population.toString() : "",
  );
  const [households, setHouseholds] = useState(
    initial ? initial.households.toString() : "",
  );
  const [areaSqKm, setAreaSqKm] = useState(
    initial ? String(initial.areaSqKm) : "",
  );
  const [facilities, setFacilities] = useState(
    initial ? initial.facilities.join(", ") : "",
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const parsedPopulation = Number.parseInt(population, 10);
    const parsedHouseholds = Number.parseInt(households, 10);
    const parsedArea = Number.parseFloat(areaSqKm);
    onSubmit({
      name: trimmedName,
      population: BigInt(Number.isNaN(parsedPopulation) ? 0 : parsedPopulation),
      households: BigInt(Number.isNaN(parsedHouseholds) ? 0 : parsedHouseholds),
      areaSqKm: Number.isNaN(parsedArea) ? 0 : parsedArea,
      facilities: facilities
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
      updatedAt: initial?.updatedAt ?? 0n,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="village_profile.form"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="village-name">
          गाँव का नाम · Village name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="village-name"
          data-ocid="village_profile.name_input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="जैसे: रामपुर"
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="village-population">जनसंख्या · Population</Label>
          <Input
            id="village-population"
            data-ocid="village_profile.population_input"
            type="number"
            min={0}
            inputMode="numeric"
            value={population}
            onChange={(event) => setPopulation(event.target.value)}
            placeholder="जैसे: 4200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="village-households">परिवार · Households</Label>
          <Input
            id="village-households"
            data-ocid="village_profile.households_input"
            type="number"
            min={0}
            inputMode="numeric"
            value={households}
            onChange={(event) => setHouseholds(event.target.value)}
            placeholder="जैसे: 780"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="village-area">क्षेत्र (वर्ग किमी) · Area (sq km)</Label>
          <Input
            id="village-area"
            data-ocid="village_profile.area_input"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={areaSqKm}
            onChange={(event) => setAreaSqKm(event.target.value)}
            placeholder="जैसे: 12.5"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="village-facilities">
          सुविधाएँ · Facilities (कॉमा से अलग करें)
        </Label>
        <Textarea
          id="village-facilities"
          data-ocid="village_profile.facilities_input"
          value={facilities}
          onChange={(event) => setFacilities(event.target.value)}
          placeholder="प्राथमिक विद्यालय, स्वास्थ्य केंद्र, पंचायत भवन"
          rows={3}
        />
      </div>

      {errorMessage ? (
        <p
          data-ocid="village_profile.form.error_state"
          className="text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <div>
        <Button
          type="submit"
          data-ocid="village_profile.save_button"
          disabled={isPending || name.trim() === ""}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {t.actions.save}
        </Button>
      </div>
    </form>
  );
}
