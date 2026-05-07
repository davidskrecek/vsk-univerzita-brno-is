"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createEvent, deleteEvent, updateEvent } from "@/actions/admin/events";
import AppButton from "@/components/Common/AppButton";
import LabeledField from "@/components/Common/LabeledField";
import LabeledInput from "@/components/Common/LabeledInput";
import LabeledTextarea from "@/components/Common/LabeledTextarea";
import { useToast } from "@/hooks/useToast";
import { IoClose } from "react-icons/io5";

interface SportOption {
  id: number;
  name: string;
}

interface EventFormInitialValues {
  id?: number;
  sportId: number;
  title: string;
  description?: string | null;
  location?: string | null;
  startTime?: string | null;
}

interface EventCreateFormProps {
  sports: SportOption[];
  mode?: "create" | "edit";
  initialValues?: EventFormInitialValues;
  onSuccess?: () => void;
  onCancel?: () => void;
  onDeleted?: () => void;
}

const DEFAULT_ERROR = "Akci se nepodařilo uložit.";

const toDateInputValue = (dateValue?: string | null) => {
  if (!dateValue) return new Date().toISOString().slice(0, 10);
  return dateValue.slice(0, 10);
};

const toTimeInputValue = (dateValue?: string | null) => {
  if (!dateValue) return "";
  return dateValue.slice(11, 16);
};

const buildDateTimeIso = (dateValue: string, timeValue: string) => {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
};

export const EventCreateForm = ({
  sports,
  mode = "create",
  initialValues,
  onSuccess,
  onCancel,
  onDeleted,
}: EventCreateFormProps) => {
  const router = useRouter();
  const toast = useToast();
  const isEditing = mode === "edit" && typeof initialValues?.id === "number";

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [sportId, setSportId] = useState(initialValues?.sportId ? String(initialValues.sportId) : "");
  const [startDate, setStartDate] = useState(() => toDateInputValue(initialValues?.startTime));
  const [startTime, setStartTime] = useState(() => toTimeInputValue(initialValues?.startTime));
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sports.length === 0) {
      setSportId("");
      return;
    }

    if (!sportId || !sports.some((sport) => String(sport.id) === sportId)) {
      setSportId(String(sports[0].id));
    }
  }, [sports, sportId]);

  const canSubmit = Boolean(sportId && title.trim() && startDate && startTime && description.trim()) && !loading;

  const handleSportChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSportId(event.target.value);
  };

  const handleDelete = async () => {
    if (!isEditing || !initialValues?.id) return;

    const confirmed = window.confirm("Opravdu chcete tuto akci smazat?");
    if (!confirmed) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("id", String(initialValues.id));

      const result = await deleteEvent({}, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Akce byla smazána.");
      onDeleted?.();
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : DEFAULT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.warning("Vyplňte prosím sport, název, datum, čas, místo a popis akce.");
      return;
    }

    const formData = new FormData();

    if (isEditing && initialValues?.id) {
      formData.set("id", String(initialValues.id));
    }

    formData.set("sportId", sportId);
    formData.set("title", title);
    formData.set("startTime", buildDateTimeIso(startDate, startTime));
    formData.set("description", description);

    if (location.trim()) {
      formData.set("location", location.trim());
    }

    setLoading(true);

    try {
      const result = isEditing ? await updateEvent({}, formData) : await createEvent({}, formData);

      if (result.error) {
        toast.error(result.error ?? DEFAULT_ERROR);
        return;
      }

      toast.success(isEditing ? "Akce byla upravena." : "Akce byla vytvořena.");
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : DEFAULT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6">
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-0 top-0 z-10 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
          aria-label="Zavřít formulář"
        >
          <IoClose size={20} />
        </button>
      ) : null}

      <div className="border-l-4 border-primary pl-6 pr-12 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-display text-on-surface leading-none">
          {isEditing ? "Upravit akci" : "Nová akce"}
        </h2>
        <p className="text-sm font-sans text-on-surface/40 leading-relaxed max-w-2xl">
          {isEditing
            ? "Upravte akci v rámci sportu, který spravujete."
            : "Vytvořte novou akci pro sekci, kterou spravujete."}
        </p>
      </div>

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-6 sm:p-8 space-y-6">
        <LabeledInput
          label="Název události"
          value={title}
          onChange={setTitle}
          placeholder="Např. Akademické mistrovství v basketbalu"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <LabeledInput
            label="Datum"
            type="date"
            value={startDate}
            onChange={setStartDate}
            inputClassName="[color-scheme:dark]"
          />

          <LabeledInput
            label="Čas zahájení"
            type="time"
            value={startTime}
            onChange={setStartTime}
            inputClassName="[color-scheme:dark]"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <LabeledInput
            label="Místo konání"
            value={location}
            onChange={setLocation}
            placeholder="Adresa nebo název haly"
            className="sm:col-span-2"
          />
        </div>

        <LabeledField label="Sportovní odvětví">
          <select
            value={sportId}
            onChange={handleSportChange}
            className="w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors"
            disabled={sports.length === 0}
          >
            {sports.length === 0 ? (
              <option value="">Žádné dostupné sekce</option>
            ) : (
              sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))
            )}
          </select>
        </LabeledField>

        <LabeledTextarea
          label="Podrobnosti akce"
          value={description}
          onChange={setDescription}
          placeholder="Popište průběh, požadavky na sportovce nebo doplňující info..."
          rows={8}
        />

        <div className={`flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${isEditing ? "sm:justify-between" : "sm:justify-center"}`}>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {isEditing ? (
              <AppButton
                type="button"
                variant="tertiary"
                className="w-full sm:w-auto font-display uppercase tracking-widest text-[11px] py-4 px-8 text-red-500 hover:bg-red-500/10"
                onClick={handleDelete}
                disabled={loading}
              >
                Smazat akci
              </AppButton>
            ) : null}
          </div>

          <AppButton
            type="button"
            variant="tertiary"
            className="w-full sm:w-auto font-display uppercase tracking-widest text-[11px] py-4 px-8"
            onClick={onCancel}
          >
            Zrušit
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            className="w-full sm:w-auto font-display uppercase tracking-widest text-[11px] py-4 px-8"
            disabled={!canSubmit}
          >
            {loading ? (isEditing ? "Ukládám..." : "Vytvářím...") : isEditing ? "Uložit změny" : "Vytvořit akci"}
          </AppButton>
        </div>
      </div>
    </form>
  );
};

export default EventCreateForm;