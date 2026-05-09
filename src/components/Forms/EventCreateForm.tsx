"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createEvent, deleteEvent, updateEvent } from "@/actions/admin/events";
import AppButton from "@/components/Common/AppButton";
import LabeledField from "@/components/Common/LabeledField";
import LabeledInput from "@/components/Common/LabeledInput";
import LabeledTextarea from "@/components/Common/LabeledTextarea";
import { SportPicker } from "@/components/Forms/SportPicker";
import { format } from "date-fns";
import { useToast } from "@/hooks/useToast";
import { IoClose, IoCalendarOutline, IoTimeOutline } from "react-icons/io5";
import { DatePicker } from "@/components/Overlay/DatePicker";
import { TimePicker } from "@/components/Overlay/TimePicker";
import { LocationPicker } from "@/components/Forms/LocationPicker";

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
    <form onSubmit={handleSubmit} className="relative">
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
          aria-label="Zavřít formulář"
        >
          <IoClose size={20} />
        </button>
      ) : null}

      <div className="flex flex-col max-h-[calc(100vh-10rem)] bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="px-6 py-6 sm:px-8 bg-surface-container-low border-b border-outline-variant/5">
          <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wider text-on-surface">
            {isEditing ? "Upravit akci" : "Nová akce"}
          </h2>
          <p className="text-[11px] font-sans uppercase tracking-widest text-on-surface/30 mt-1">
            {isEditing ? "Plánování události" : "Vytvoření události"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
          <LabeledInput
            label="Název události"
            value={title}
            onChange={setTitle}
            placeholder="Např. Akademické mistrovství v basketbalu"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <LabeledField label="Datum konání">
              <DatePicker
                date={startDate ? new Date(startDate) : undefined}
                onDateChange={(d) => setStartDate(d ? format(d, "yyyy-MM-dd") : "")}
              />
            </LabeledField>

            <LabeledField label="Čas zahájení">
              <TimePicker
                time={startTime}
                onTimeChange={setStartTime}
              />
            </LabeledField>

            <LabeledField label="Sportovní odvětví">
              <SportPicker
                sports={sports}
                selectedId={sportId}
                onSelect={setSportId}
                disabled={sports.length === 0}
              />
            </LabeledField>
          </div>

          <LabeledField label="Místo konání">
            <LocationPicker
              value={location}
              onChange={setLocation}
            />
          </LabeledField>

          <LabeledTextarea
            label="Podrobnosti akce"
            value={description}
            onChange={setDescription}
            placeholder="Popište průběh, požadavky na sportovce nebo doplňující info..."
            rows={8}
          />
        </div>

        <div className="p-6 bg-surface-container-low border-t border-outline-variant/5">
          <div className={`flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${isEditing ? "sm:justify-between" : "sm:justify-end"}`}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {isEditing ? (
                <AppButton
                  type="button"
                  variant="danger"
                  isUppercase
                  onClick={handleDelete}
                  isLoading={loading}
                >
                  Smazat akci
                </AppButton>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <AppButton
                type="button"
                variant="tertiary"
                isUppercase
                onClick={onCancel}
              >
                Zrušit
              </AppButton>
              <AppButton
                type="submit"
                variant="primary"
                isUppercase
                isLoading={loading}
                disabled={!canSubmit}
              >
                {isEditing ? "Uložit změny" : "Vytvořit akci"}
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EventCreateForm;