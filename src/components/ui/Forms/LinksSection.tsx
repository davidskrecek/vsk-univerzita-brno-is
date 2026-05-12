"use client";

import LabeledInput from "@/components/ui/Forms/LabeledInput";
import { IoAdd, IoTrashOutline } from "react-icons/io5";

export interface LinkDraft {
  url: string;
  alias: string;
}

interface LinksSectionProps {
  links: LinkDraft[];
  onChange: (links: LinkDraft[]) => void;
}

export const LinksSection = ({ links, onChange }: LinksSectionProps) => {
  const updateLink = (index: number, field: keyof LinkDraft, value: string) => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-on-surface/20">
          Odkazy
        </h3>
        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <IoAdd size={14} />
          <span className="text-[10px] font-display font-bold uppercase tracking-wider">Přidat</span>
        </button>
      </div>

      {links.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-outline-variant/10 bg-surface-container-low/50 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-sans text-on-surface/30 italic">Zatím nebyly přidány žádné odkazy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {links.map((link, index) => (
            <div
              key={index}
              className="relative group flex flex-col gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-high/30 p-4 transition-all hover:border-outline-variant/30 hover:scale-[1.02] animate-in fade-in zoom-in-95 duration-300"
            >
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-outline-variant/10 bg-surface-container-high text-on-surface/40 opacity-100 transition-all hover:text-red-500 hover:scale-[1.1] shadow-lg z-10"
                title="Odstranit odkaz"
              >
                <IoTrashOutline size={14} />
              </button>

              <LabeledInput
                label="URL (např. https://...)"
                value={link.url}
                onChange={(value) => updateLink(index, "url", value)}
                placeholder="https://vsk-univerzita.cz/galerie"
                className="bg-transparent text-xs"
              />
              <LabeledInput
                label="Zobrazený text"
                value={link.alias}
                onChange={(value) => updateLink(index, "alias", value)}
                placeholder="Např. Fotogalerie"
                className="bg-transparent text-xs"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

