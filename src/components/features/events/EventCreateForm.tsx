"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";

import { createEventAction } from "@/actions/admin/events/create-event";
import { updateEventAction } from "@/actions/admin/events/update-event";
import { deleteEventAction } from "@/actions/admin/events/delete-event";
import AppButton from "@/components/ui/Actions/AppButton";
import CloseButton from "@/components/ui/Actions/CloseButton";
import LabeledField from "@/components/ui/Forms/LabeledField";
import FormLabeledInput from "@/components/ui/Forms/FormLabeledInput";
import FormLabeledTextarea from "@/components/ui/Forms/FormLabeledTextarea";
import { SportPicker } from "@/components/ui/Pickers/SportPicker";
import { DatePicker } from "@/components/ui/Pickers/DatePicker";
import { TimePicker } from "@/components/ui/Pickers/TimePicker";
import { LocationPicker } from "@/components/ui/Pickers/LocationPicker";
import { LinksSection, type LinkDraft } from "@/components/ui/Forms/LinksSection";
import Modal from "@/components/ui/Overlay/Modal";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { eventFormSchema, type EventFormData } from "@/schemas/events/eventFormSchema";

type EventFormInput = z.input<typeof eventFormSchema>;
type EventFormOutput = z.output<typeof eventFormSchema>;

interface SportOption {
  id: number;
  name: string;
}

interface EventCreateFormProps {
  sports: SportOption[];
  mode?: "create" | "edit";
  initialValues?: EventFormData & { links?: Array<{ url: string; alias: string | null }> };
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
  const [isDeleting, setIsDeleting] = useState(false);

  const defaultValues: EventFormInput = {
    id: initialValues?.id,
    sportId: initialValues?.sportId || (sports.length > 0 ? sports[0].id : 0),
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    startDate: initialValues ? toDateInputValue(initialValues.startTime) : new Date().toISOString().slice(0, 10),
    startTime: initialValues ? toTimeInputValue(initialValues.startTime) : "",
    location: initialValues?.location || "",
    links: initialValues?.links?.map((link) => ({ url: link.url, alias: link.alias ?? "" })) || [],
  };

  const form = useForm<EventFormInput, undefined, EventFormOutput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    formState: { isSubmitting, isValid, errors },
  } = form;

  const handleDelete = async () => {
    if (!isEditing || !initialValues?.id) return;

    const confirmed = await confirm({
      title: "Smazat akci",
      message: "Opravdu chcete tuto akci smazat? Tato operace je nevratná.",
      confirmLabel: "Smazat",
      cancelLabel: "Zrušit",
      type: "danger",
    });
    if (!confirmed) return;

    setIsDeleting(true);

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
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (data: EventFormData) => {
    if (isEditing) {
      const isConfirmed = await confirm({
        title: "Uložit změny",
        message: "Opravdu chcete uložit provedené změny v akci?",
        confirmLabel: "Uložit",
        type: "primary",
      });
      if (!isConfirmed) return;
    }

    const formData = new FormData();
    const cleanedLinks = (data.links || [])
      .map((link) => ({
        url: link.url.trim(),
        alias: (link.alias || "").trim(),
      }))
      .filter((link) => link.url.length > 0)
      .map((link) => ({
        url: link.url,
        ...(link.alias ? { alias: link.alias } : {}),
      }));

    formData.set("links", JSON.stringify(cleanedLinks));

    if (isEditing && data.id) {
      formData.set("id", String(data.id));
    }

    formData.set("sportId", String(data.sportId));
    formData.set("title", data.title);
    formData.set("startTime", buildDateTimeIso(data.startDate, data.startTime));
    formData.set("description", data.description);

    if (data.location?.trim()) {
      formData.set("location", data.location.trim());
    }

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
    }
  };

  return (
    <Modal onClose={onCancel} contentClassName="max-w-4xl w-full">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="relative w-full h-full">
          {onCancel ? <CloseButton onClick={onCancel} ariaLabel="Zavřít formulář" /> : null}

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
              style={{ scrollbarGutter: "stable both-edges" }}
            >
              <FormLabeledInput
                label="Název události"
                name="title"
                placeholder="Např. Akademické mistrovství v basketbalu"
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Controller
                  name="startDate"
                  control={form.control}
                  render={({ field }) => (
                    <LabeledField label="Datum konání">
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onDateChange={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
                      />
                      {errors.startDate && <p className="text-xs text-error mt-1">{errors.startDate.message}</p>}
                    </LabeledField>
                  )}
                />

                <Controller
                  name="startTime"
                  control={form.control}
                  render={({ field }) => (
                    <LabeledField label="Čas zahájení">
                      <TimePicker time={field.value} onTimeChange={field.onChange} />
                      {errors.startTime && <p className="text-xs text-error mt-1">{errors.startTime.message}</p>}
                    </LabeledField>
                  )}
                />

                <Controller
                  name="sportId"
                  control={form.control}
                  render={({ field }) => (
                    <LabeledField label="Sportovní odvětví">
                      <SportPicker
                        sports={sports}
                        selectedId={String(field.value)}
                        onSelect={(id) => field.onChange(Number(id))}
                        disabled={sports.length <= 1}
                      />
                      {errors.sportId && <p className="text-xs text-error mt-1">{errors.sportId.message}</p>}
                    </LabeledField>
                  )}
                />
              </div>

              <Controller
                name="location"
                control={form.control}
                render={({ field }) => (
                  <LabeledField label="Místo konání">
                    <LocationPicker value={field.value || ""} onChange={field.onChange} />
                  </LabeledField>
                )}
              />

              <FormLabeledTextarea
                label="Podrobnosti akce"
                name="description"
                placeholder="Popište průběh, požadavky na sportovce nebo doplňující info..."
                rows={8}
              />

              <Controller
                name="links"
                control={form.control}
                render={({ field }) => (
                  <LinksSection
                    links={(field.value || []).map((link): LinkDraft => ({ url: link.url, alias: link.alias || "" }))}
                    onChange={(newLinks: LinkDraft[]) => field.onChange(newLinks)}
                  />
                )}
              />
            </div>

            <div className="p-4 sm:p-6 bg-surface-container-low border-t border-outline-variant/5">
              <div className={`flex flex-row items-center gap-2 ${isEditing && canDelete ? "justify-between" : "justify-end"}`}>
                {isEditing && canDelete && (
                  <AppButton
                    type="button"
                    variant="danger"
                    isUppercase
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    className="px-3 sm:px-6"
                  >
                    Smazat<span className="hidden sm:inline">&nbsp;akci</span>
                  </AppButton>
                )}

                <div className="flex flex-row gap-2">
                  <AppButton type="button" variant="tertiary" isUppercase onClick={onCancel} className="px-3 sm:px-6">
                    Zrušit
                  </AppButton>
                  <AppButton
                    type="submit"
                    variant="primary"
                    isUppercase
                    isLoading={isSubmitting}
                    disabled={isSubmitting || !isValid}
                    className="px-3 sm:px-6"
                  >
                    {isEditing ? (
                      <>
                        Uložit<span className="hidden sm:inline">&nbsp;změny</span>
                      </>
                    ) : (
                      <>
                        Vytvořit<span className="hidden sm:inline">&nbsp;akci</span>
                      </>
                    )}
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EventCreateForm;
