"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createPost, uploadPostImage } from "@/actions/admin/posts";
import AppButton from "@/components/Common/AppButton";
import LabeledField from "@/components/Common/LabeledField";
import LabeledInput from "@/components/Common/LabeledInput";
import LabeledTextarea from "@/components/Common/LabeledTextarea";
import { useToast } from "@/hooks/useToast";

interface SportOption {
  id: number;
  name: string;
}

interface PostCreateFormProps {
  sports: SportOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PostLinkDraft {
  url: string;
  alias: string;
}

const DEFAULT_ERROR = "Příspěvek se nepodařilo vytvořit.";

export const PostCreateForm = ({ sports, onSuccess, onCancel }: PostCreateFormProps) => {
  const router = useRouter();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [sportId, setSportId] = useState("");
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [links, setLinks] = useState<PostLinkDraft[]>([]);
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

  const canSubmit = Boolean(sportId && title.trim() && content.trim()) && !loading;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);
    setSelectedImageName(file?.name ?? "");
  };

  useEffect(() => {
    if (!selectedImage) {
      setSelectedImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setSelectedImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  const updateLink = (index: number, field: keyof PostLinkDraft, value: string) => {
    setLinks((currentLinks) =>
      currentLinks.map((link, linkIndex) => (linkIndex === index ? { ...link, [field]: value } : link))
    );
  };

  const addLink = () => {
    setLinks((currentLinks) => [...currentLinks, { url: "", alias: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks((currentLinks) => currentLinks.filter((_, linkIndex) => linkIndex !== index));
  };

  const uploadImage = async () => {
    if (!selectedImage || loading) return null;

    const uploadFormData = new FormData();
    uploadFormData.set("image", selectedImage);

    const result = await uploadPostImage(uploadFormData);

    if (result.error) {
      throw new Error(result.error);
    }

    return result.url ?? null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.warning("Vyplňte prosím sport, nadpis a obsah příspěvku.");
      return;
    }

    const formData = new FormData();
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

    if (selectedImage) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        formData.set("imageUrl", uploadedUrl);
      }
    }

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

    if (cleanedLinks.length > 0) {
      formData.set("links", JSON.stringify(cleanedLinks));
    }

    setLoading(true);

    try {
      const result = await createPost({}, formData);

      if (result.error) {
        toast.error(result.error ?? DEFAULT_ERROR);
        return;
      }

      toast.success("Příspěvek byl vytvořen.");
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : DEFAULT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-l-4 border-primary pl-6 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-display text-on-surface leading-none">
          Nový příspěvek
        </h2>
        <p className="text-sm font-sans text-on-surface/40 leading-relaxed max-w-2xl">
          Vytvořte nový příspěvek pro sekci, kterou spravujete. 
        </p>
      </div>

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-6 sm:p-8 space-y-6">
        <LabeledInput
          label="Titulek příspěvku"
          value={title}
          onChange={setTitle}
          placeholder="Zadejte poutavý nadpis..."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <LabeledField label="Sportovní kategorie">
            <select
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
              className="w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors"
              disabled={availableSports.length === 0}
            >
              {availableSports.length === 0 ? (
                <option value="">Žádné dostupné sekce</option>
              ) : (
                availableSports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))
              )}
            </select>
          </LabeledField>

          <LabeledInput
            label="Datum publikace"
            type="date"
            value={publishedAt}
            onChange={setPublishedAt}
            inputClassName="[color-scheme:dark]"
          />

        </div>

        <LabeledField label="Náhledový obrázek">
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
                <img
                  src={selectedImagePreview}
                  alt={selectedImageName || "Náhled obrázku"}
                  className="h-48 w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        </LabeledField>

        <LabeledTextarea
          label="Krátký popis"
          value={excerpt}
          onChange={setExcerpt}
          placeholder="Volitelný stručný popis příspěvku..."
          rows={3}
        />

        <LabeledTextarea
          label="Obsah příspěvku"
          value={content}
          onChange={setContent}
          placeholder="Začněte psát o novinkách z vašeho týmu..."
          rows={10}
        />

        <div className="space-y-5 rounded-xl border border-outline-variant/10 bg-surface-container-low px-4 py-5 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="text-caption font-display font-bold uppercase tracking-widest text-on-surface/60">
                Odkazy
              </div>
              <p className="text-xs font-sans text-on-surface/40">
                Volitelně přidejte odkazy, které se zobrazí u detailu příspěvku.
              </p>
            </div>
            <button
              type="button"
              onClick={addLink}
              className="w-full sm:w-auto rounded-md border border-outline-variant/10 bg-surface-container-high px-4 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-on-surface/60 transition-colors hover:border-primary/40 hover:text-primary"
            >
              Přidat odkaz
            </button>
          </div>

          {links.length > 0 ? (
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)_auto] md:items-end">
                  <LabeledInput
                    label={`URL odkazu ${index + 1}`}
                    value={link.url}
                    onChange={(value) => updateLink(index, "url", value)}
                    placeholder="https://..."
                    autoComplete="off"
                  />
                  <LabeledInput
                    label="Text odkazu"
                    value={link.alias}
                    onChange={(value) => updateLink(index, "alias", value)}
                    placeholder="Např. Fotky"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="h-13 rounded-md border border-outline-variant/10 px-4 text-xs font-display font-bold uppercase tracking-widest text-on-surface/40 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Odebrat
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
            {loading ? "Publikuji..." : "Publikovat příspěvek"}
          </AppButton>
        </div>
      </div>
    </form>
  );
};

export default PostCreateForm;