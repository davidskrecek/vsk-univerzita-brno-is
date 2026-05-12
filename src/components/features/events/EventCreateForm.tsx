"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/actions/admin/events/create-event";
import { updateEventAction } from "@/actions/admin/events/update-event";
import { deleteEventAction } from "@/actions/admin/events/delete-event";
import AppButton from "@/components/ui/Actions/AppButton";
import LabeledField from "@/components/ui/Forms/LabeledField";
import LabeledInput from "@/components/ui/Forms/LabeledInput";
import LabeledTextarea from "@/components/ui/Forms/LabeledTextarea";
import { SportPicker } from "@/components/ui/Pickers/SportPicker";
import { format } from "date-fns";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { IoClose } from "react-icons/io5";
import { DatePicker } from "@/components/ui/Pickers/DatePicker";
import { TimePicker } from "@/components/ui/Pickers/TimePicker";
import { LocationPicker } from "@/components/ui/Pickers/LocationPicker";
import { LinksSection, LinkDraft } from "@/components/ui/Forms/LinksSection";
import Modal from "@/components/ui/Overlay/Modal";

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
  links?: Array<{ url: string; alias: string | null }>;
}

interface EventCreateFormProps {
  sports: SportOption[];
  mode?: "create" | "edit";
  initialValues?: EventFormInitialValues;
  onSuccess?: () => void;
  onCancel?: () => void;
  onDeleted?: () => void;
  canDelete?: boolean;
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
  canDelete = false,
}: EventCreateFormProps) => {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const isEditing = mode === "edit" && typeof initialValues?.id === "number";

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [sportId, setSportId] = useState(initialValues?.sportId ? String(initialValues.sportId) : "");
  const [startDate, setStartDate] = useState(() => toDateInputValue(initialValues?.startTime));
  const [startTime, setStartTime] = useState(() => toTimeInputValue(initialValues?.startTime));
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [links, setLinks] = useState<LinkDraft[]>(
    initialValues?.links?.map((link) => ({ url: link.url, alias: link.alias ?? "" })) ?? []
  );
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

    const confirmed = await confirm({
      title: "Smazat akci",
      message: "Opravdu chcete tuto akci smazat? Tato operace je nevratná.",
      confirmLabel: "Smazat",
      cancelLabel: "Zrušit",
      type: "danger"
    });
    if (!confirmed) return;

    setLoading(true);

    try {
      const result = await deleteEventAction(initialValues.id);

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

    if (isEditing) {
      const isConfirmed = await confirm({
        title: "Uložit změny",
        message: "Opravdu chcete uložit provedené změny v akci?",
        confirmLabel: "Uložit",
        type: "primary"
      });
      if (!isConfirmed) return;
    }

    const formData = new FormData();
    const cleanedLinks = links
      .map((link) => ({
        url: link.url.trim(),
        alias: link.alias.trim(),
      }))
      .filter((link) => link.url.length > 0)
      .map((link) => ({
        url: link.url,
        ...(link.alias ? { alias: link.alias } : {}),
      }));

    formData.set("links", JSON.stringify(cleanedLinks));

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
      const result = isEditing ? await updateEventAction({}, formData) : await createEventAction({}, formData);

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
    <Modal onClose={onCancel} contentClassName="max-w-4xl w-full">
      <form onSubmit={handleSubmit} className="relative w-full h-full">
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

          <div
            className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar"
            style={{ scrollbarGutter: 'stable both-edges' }}
          >
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
                  disabled={sports.length <= 1}
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

            <LinksSection links={links} onChange={setLinks} />
          </div>

          <div className="p-4 sm:p-6 bg-surface-container-low border-t border-outline-variant/5">
            <div className={`flex flex-row items-center gap-2 ${isEditing && canDelete ? "justify-between" : "justify-end"}`}>
              {isEditing && canDelete && (
                <AppButton
                  type="button"
                  variant="danger"
                  isUppercase
                  onClick={handleDelete}
                  isLoading={loading}
                  className="px-3 sm:px-6"
                >
                  Smazat<span className="hidden sm:inline">&nbsp;akci</span>
                </AppButton>
              )}

              <div className="flex flex-row gap-2">
                <AppButton
                  type="button"
                  variant="tertiary"
                  isUppercase
                  onClick={onCancel}
                  className="px-3 sm:px-6"
                >
                  Zrušit
                </AppButton>
                <AppButton
                  type="submit"
                  variant="primary"
                  isUppercase
                  isLoading={loading}
                  disabled={!canSubmit}
                  className="px-3 sm:px-6"
                >
                  {isEditing ? (
                    <>Uložit<span className="hidden sm:inline">&nbsp;změny</span></>
                  ) : (
                    <>Vytvořit<span className="hidden sm:inline">&nbsp;akci</span></>
                  )}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EventCreateForm;

