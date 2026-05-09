"use client";

import LabeledInput from "@/components/Common/LabeledInput";

interface PostLinkDraft {
  url: string;
  alias: string;
}

interface PostLinksSectionProps {
  links: PostLinkDraft[];
  onChange: (links: PostLinkDraft[]) => void;
}

export const PostLinksSection = ({ links, onChange }: PostLinksSectionProps) => {
  const updateLink = (index: number, field: keyof PostLinkDraft, value: string) => {
    const updated = links.map((link, i) => (i === index ? { ...link, [field]: value } : link));
    onChange(updated);
  };

  const addLink = () => {
    onChange([...links, { url: "", alias: "" }]);
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
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
  );
};
