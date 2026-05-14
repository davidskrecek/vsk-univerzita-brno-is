"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import { createPostAction } from "@/actions/admin/posts/create-post";
import { updatePostAction } from "@/actions/admin/posts/update-post";
import { deletePostAction } from "@/actions/admin/posts/delete-post";
import AppButton from "@/components/ui/Actions/AppButton";
import CloseButton from "@/components/ui/Actions/CloseButton";
import LabeledField from "@/components/ui/Forms/LabeledField";
import FormLabeledInput from "@/components/ui/Forms/FormLabeledInput";
import FormLabeledTextarea from "@/components/ui/Forms/FormLabeledTextarea";
import { LinksSection, type LinkDraft } from "@/components/ui/Forms/LinksSection";
import { SportPicker } from "@/components/ui/Pickers/SportPicker";
import { DatePicker } from "@/components/ui/Pickers/DatePicker";
import Modal from "@/components/ui/Overlay/Modal";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { postFormSchema, type PostFormData } from "@/schemas/posts/postFormSchema";

interface SportOption {
  id: number;
  name: string;
}

interface PostFormInitialValues {
  id?: number;
  sportId: number;
  title: string;
  excerpt?: string | null;
  content: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  links?: Array<{ url: string; alias: string | null }>;
}

interface PostCreateFormProps {
  sports: SportOption[];
  mode?: "create" | "edit";
  initialValues?: PostFormInitialValues;
  onSuccess?: () => void;
  onCancel?: () => void;
  onDeleted?: () => void;
  canDelete?: boolean;
}

const DEFAULT_ERROR = "Příspěvek se nepodařilo uložit.";

const toDateInputValue = (dateValue?: string | null) => {
  if (!dateValue) return new Date().toISOString().slice(0, 10);
  return dateValue.slice(0, 10);
};

export const PostCreateForm = ({
  sports,
  mode = "create",
  initialValues,
  onSuccess,
  onCancel,
  onDeleted,
  canDelete = false,
}: PostCreateFormProps) => {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const isEditing = mode === "edit" && typeof initialValues?.id === "number";

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>(initialValues?.imageUrl ? "Aktuální obrázek" : "");
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(initialValues?.imageUrl ?? null);

  const availableSports = useMemo(() => sports, [sports]);

  const defaultValues: PostFormData = {
    id: initialValues?.id,
    sportId: initialValues?.sportId || (sports.length > 0 ? sports[0].id : 0),
    title: initialValues?.title || "",
    content: initialValues?.content || "",
    publishedAt: initialValues?.publishedAt ? toDateInputValue(initialValues.publishedAt) : "",
    links: initialValues?.links?.map((link) => ({ url: link.url, alias: link.alias ?? "" })) || [],
  };

  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema) as any,
    defaultValues,
    mode: "onChange",
  });

  const {
    formState: { isSubmitting, isValid, errors },
  } = form;

  useEffect(() => {
    if (selectedImage) {
      const previewUrl = URL.createObjectURL(selectedImage);
      setSelectedImagePreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    }

    setSelectedImagePreview(initialValues?.imageUrl ?? null);
  }, [initialValues?.imageUrl, selectedImage]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);
    setSelectedImageName(file?.name ?? "");
  };

  const handleDelete = async () => {
    if (!isEditing || !initialValues?.id) return;

    const confirmed = await confirm({
      title: "Smazat příspěvek",
      message: "Opravdu chcete tento příspěvek smazat? Tato akce je nevratná.",
      confirmLabel: "Smazat",
      cancelLabel: "Zrušit",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      const result = await deletePostAction(initialValues.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Příspěvek byl smazán.");
      onDeleted?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : DEFAULT_ERROR);
    }
  };

  const handleSubmit = async (data: PostFormData) => {
    if (isEditing) {
      const isConfirmed = await confirm({
        title: "Uložit změny",
        message: "Opravdu chcete uložit provedené změny v příspěvku?",
        confirmLabel: "Uložit",
        type: "primary",
      });
      if (!isConfirmed) return;
    }

    const formData = new FormData();

    if (isEditing && data.id) {
      formData.set("id", String(data.id));
    }

    formData.set("sportId", String(data.sportId));
    formData.set("title", data.title);
    formData.set("content", data.content);

    if (data.publishedAt?.trim()) {
      const [year, month, day] = data.publishedAt.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);
      formData.set("publishedAt", localDate.toISOString());
    }

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

    try {
      const result = isEditing ? await updatePostAction({}, formData) : await createPostAction({}, formData);

      if (result.error) {
        toast.error(result.error ?? DEFAULT_ERROR);
        return;
      }

      toast.success(isEditing ? "Příspěvek byl upraven." : "Příspěvek byl vytvořen.");
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : DEFAULT_ERROR);
    }
  };

  return (
    <Modal onClose={onCancel} contentClassName="max-w-4xl w-full">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="relative w-full h-full">
          {onCancel ? <CloseButton onClick={onCancel} ariaLabel="Zavřít formulář" /> : null}

          <div className="flex flex-col max-h-[calc(100vh-10rem)] bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="px-6 py-6 sm:px-8 bg-surface-container-low border-b border-outline-variant/5">
              <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wider text-on-surface">
                {isEditing ? "Upravit příspěvek" : "Nový příspěvek"}
              </h2>
              <p className="text-[11px] font-sans uppercase tracking-widest text-on-surface/30 mt-1">
                {isEditing ? "Administrace obsahu" : "Vytvoření obsahu"}
              </p>
            </div>

            <div
              className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar"
              style={{ scrollbarGutter: "stable both-edges" }}
            >
              <FormLabeledInput
                label="Titulek příspěvku"
                name="title"
                placeholder="Zadejte poutavý nadpis..."
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Controller
                  name="sportId"
                  control={form.control}
                  render={({ field }) => (
                    <LabeledField label="Sportovní kategorie">
                      <SportPicker
                        sports={availableSports}
                        selectedId={String(field.value)}
                        onSelect={(id) => field.onChange(Number(id))}
                        disabled={availableSports.length <= 1}
                      />
                      {errors.sportId && <p className="text-xs text-error mt-1">{errors.sportId.message}</p>}
                    </LabeledField>
                  )}
                />

                <Controller
                  name="publishedAt"
                  control={form.control}
                  render={({ field }) => (
                    <LabeledField label="Datum publikace">
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onDateChange={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
                        disabled={true}
                      />
                    </LabeledField>
                  )}
                />
              </div>

              <LabeledField label="Náhledový obrázek (pouze náhled)">
                <div className="space-y-3">
                  <label className="flex min-h-13 cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-outline-variant/20 bg-surface-container-high px-4 py-3 text-sm font-sans text-on-surface/60 transition-colors hover:border-primary/40 hover:text-on-surface/80">
                    <span className="truncate">{selectedImageName || "Vyberte soubor z počítače"}</span>
                    <span className="shrink-0 text-xs uppercase tracking-widest text-on-surface/40">Procházet</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                  </label>

                  {selectedImagePreview ? (
                    <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-low">
                      <Image
                        src={selectedImagePreview}
                        alt={selectedImageName || "Náhled obrázku"}
                        width={960}
                        height={384}
                        unoptimized
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </LabeledField>

              <FormLabeledTextarea
                label="Obsah příspěvku"
                name="content"
                placeholder="Začněte psát o novinkách z vašeho týmu..."
                rows={10}
              />

              <Controller
                name="links"
                control={form.control}
                render={({ field }) => (
                  <LinksSection
                    links={(field.value || []).map((link): LinkDraft => ({ url: link.url, alias: link.alias || "" }))}
                    onChange={(updatedLinks: LinkDraft[]) => field.onChange(updatedLinks)}
                  />
                )}
              />
            </div>

            <div className="p-4 sm:p-6 bg-surface-container-low border-t border-outline-variant/5">
              <div className={`flex flex-row items-center gap-2 ${isEditing && canDelete ? "justify-between" : "justify-end"}`}>
                {isEditing && canDelete && (
                  <AppButton type="button" variant="danger" onClick={handleDelete} isUppercase className="px-6">
                    Smazat příspěvek
                  </AppButton>
                )}
                <div className="flex gap-3">
                  <AppButton type="button" variant="tertiary" onClick={onCancel} isUppercase className="px-6">
                    Zrušit
                  </AppButton>
                  <AppButton type="submit" variant="primary" isUppercase className="px-6" disabled={isSubmitting || !isValid}>
                    {isSubmitting ? "Ukládám..." : isEditing ? "Uložit změny" : "Vytvořit příspěvek"}
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

export default PostCreateForm;
