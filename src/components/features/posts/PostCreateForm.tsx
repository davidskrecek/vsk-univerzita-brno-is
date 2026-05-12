"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPostAction } from "@/actions/admin/posts/create-post";
import { updatePostAction } from "@/actions/admin/posts/update-post";
import { deletePostAction } from "@/actions/admin/posts/delete-post";
import AppButton from "@/components/ui/Actions/AppButton";
import LabeledField from "@/components/ui/Forms/LabeledField";
import LabeledInput from "@/components/ui/Forms/LabeledInput";
import LabeledTextarea from "@/components/ui/Forms/LabeledTextarea";
import { LinksSection, LinkDraft } from "@/components/ui/Forms/LinksSection";
import { SportPicker } from "@/components/ui/Pickers/SportPicker";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { IoClose } from "react-icons/io5";
import { DatePicker } from "@/components/ui/Pickers/DatePicker";
import { format } from "date-fns";
import Modal from "@/components/ui/Overlay/Modal";

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
}

interface PostLinkDraft {
  url: string;
  alias: string;
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
}: PostCreateFormProps) => {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const isEditing = mode === "edit" && typeof initialValues?.id === "number";

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [sportId, setSportId] = useState(initialValues?.sportId ? String(initialValues.sportId) : "");
  const [publishedAt, setPublishedAt] = useState(() => toDateInputValue(initialValues?.publishedAt));
  const [excerpt] = useState(initialValues?.excerpt ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>(initialValues?.imageUrl ? "Aktuální obrázek" : "");
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(initialValues?.imageUrl ?? null);
  const [links, setLinks] = useState<LinkDraft[]>(
    initialValues?.links?.map((link) => ({ url: link.url, alias: link.alias ?? "" })) ?? []
  );
  const [loading, setLoading] = useState(false);

  const availableSports = useMemo(() => sports, [sports]);

  useEffect(() => {
    if (availableSports.length === 0) {
      setSportId("");
      return;
    }

    if (!sportId || !availableSports.some((sport) => String(sport.id) === sportId)) {
      setSportId(String(availableSports[0].id));
    }
  }, [availableSports, sportId]);

  useEffect(() => {
    if (selectedImage) {
      const previewUrl = URL.createObjectURL(selectedImage);
      setSelectedImagePreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    }

    setSelectedImagePreview(initialValues?.imageUrl ?? null);
  }, [initialValues?.imageUrl, selectedImage]);

  const canSubmit = Boolean(sportId && title.trim() && content.trim()) && !loading;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);
    setSelectedImageName(file?.name ?? "");
  };

  const updateLinks = (updatedLinks: PostLinkDraft[]) => {
    setLinks(updatedLinks);
  };


  const handleDelete = async () => {
    if (!isEditing || !initialValues?.id) return;

    const confirmed = await confirm({
      title: "Smazat příspěvek",
      message: "Opravdu chcete tento příspěvek smazat? Tato akce je nevratná.",
      confirmLabel: "Smazat",
      cancelLabel: "Zrušit",
      type: "danger"
    });
    if (!confirmed) return;

    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.warning("Vyplňte prosím sport, nadpis a obsah příspěvku.");
      return;
    }

    if (isEditing) {
      const isConfirmed = await confirm({
        title: "Uložit změny",
        message: "Opravdu chcete uložit provedené změny v příspěvku?",
        confirmLabel: "Uložit",
        type: "primary"
      });
      if (!isConfirmed) return;
    }

    const formData = new FormData();
    if (isEditing && initialValues?.id) {
      formData.set("id", String(initialValues.id));
    }
    formData.set("sportId", sportId);
    formData.set("title", title);
    if (excerpt.trim()) {
      formData.set("excerpt", excerpt);
    }
    formData.set("content", content);

    if (publishedAt.trim()) {
      const [year, month, day] = publishedAt.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);
      formData.set("publishedAt", localDate.toISOString());
    }

    // Image is not stored anywhere as per requirements

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

    setLoading(true);

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
              {isEditing ? "Upravit příspěvek" : "Nový příspěvek"}
            </h2>
            <p className="text-[11px] font-sans uppercase tracking-widest text-on-surface/30 mt-1">
              {isEditing ? "Administrace obsahu" : "Vytvoření obsahu"}
            </p>
          </div>

          <div
            className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar"
            style={{ scrollbarGutter: 'stable both-edges' }}
          >
            <LabeledInput
              label="Titulek příspěvku"
              value={title}
              onChange={setTitle}
              placeholder="Zadejte poutavý nadpis..."
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <LabeledField label="Sportovní kategorie">
                <SportPicker
                  sports={availableSports}
                  selectedId={sportId}
                  onSelect={setSportId}
                  disabled={availableSports.length <= 1}
                />
              </LabeledField>
              <LabeledField label="Datum publikace">
                <DatePicker
                  date={publishedAt ? new Date(publishedAt) : undefined}
                  onDateChange={(d) => setPublishedAt(d ? format(d, "yyyy-MM-dd") : "")}
                  disabled={true}
                />
              </LabeledField>
            </div>

            <LabeledField label="Náhledový obrázek (pouze náhled)">
              <div className="space-y-3">
                <label className="flex min-h-13 cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-outline-variant/20 bg-surface-container-high px-4 py-3 text-sm font-sans text-on-surface/60 transition-colors hover:border-primary/40 hover:text-on-surface/80">
                  <span className="truncate">
                    {selectedImageName || "Vyberte soubor z počítače"}
                  </span>
                  <span className="shrink-0 text-xs uppercase tracking-widest text-on-surface/40">
                    Procházet
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
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

            <LabeledTextarea
              label="Obsah příspěvku"
              value={content}
              onChange={setContent}
              placeholder="Začněte psát o novinkách z vašeho týmu..."
              rows={10}
            />

            <LinksSection links={links} onChange={setLinks} />
          </div>

          <div className="p-4 sm:p-6 bg-surface-container-low border-t border-outline-variant/5">
            <div className={`flex flex-row items-center gap-2 ${isEditing ? "justify-between" : "justify-end"}`}>
              {isEditing && (
                <AppButton
                  type="button"
                  variant="danger"
                  isUppercase
                  onClick={handleDelete}
                  isLoading={loading}
                  className="px-3 sm:px-6"
                >
                  Smazat<span className="hidden sm:inline">&nbsp;příspěvek</span>
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
                    <>Publikovat<span className="hidden sm:inline">&nbsp;příspěvek</span></>
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

export default PostCreateForm;

