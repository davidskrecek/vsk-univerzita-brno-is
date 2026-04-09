"use client";

import Image from "next/image";
import Modal from "@/components/Overlay/Modal";
import { IoClose } from "react-icons/io5";

export type PostDetailLink = {
  label: string;
  href: string;
};

interface PostDetailProps {
  title: string;
  category: string;
  date: string;
  content: string;
  imageUrl?: string | null;
  links?: PostDetailLink[];
  onClose?: () => void;
}

export const PostDetail = ({ title, category, date, content, imageUrl, links = [], onClose }: PostDetailProps) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = [
      "Ledna",
      "Února",
      "Března",
      "Dubna",
      "Května",
      "Června",
      "Července",
      "Srpna",
      "Září",
      "Října",
      "Listopadu",
      "Prosince",
    ];
    return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const paragraphs = content
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Modal
      onClose={onClose}
      contentClassName="max-w-2xl bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10 flex flex-col animate-in zoom-in-95 duration-300"
    >
      {imageUrl ? (
        <div className="relative h-48 flex-shrink-0 overflow-hidden bg-surface-container-high sm:h-56 md:h-64">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 42rem"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 z-[2000] cursor-pointer rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
              type="button"
            >
              <IoClose size={20} />
            </button>
          )}
        </div>
      ) : null}

      <div className="relative p-6 sm:p-8 md:p-10 flex flex-col items-center text-center space-y-6 sm:space-y-8">
        {!imageUrl && onClose ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-[2000] cursor-pointer rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
            type="button"
          >
            <IoClose size={20} />
          </button>
        ) : null}

        <div className="meta-badge">
          {category}
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-on-surface tracking-display leading-tight uppercase">
          {title}
        </h2>

        <div className="text-on-surface/60 font-sans">
          <div className="text-sm font-medium">{formatDate(date)}</div>
        </div>

        <div className="max-w-md text-sm text-on-surface/50 font-sans leading-relaxed space-y-4 text-left sm:text-center">
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        <div className="pt-4 w-full border-t border-outline-variant/5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {links.length > 0 ? (
              links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface/60 hover:text-primary transition-colors no-underline px-4 py-2 rounded-md hover:bg-primary/10"
                >
                  {l.label}
                </a>
              ))
            ) : (
              <div className="text-xs font-sans text-on-surface/40 italic">Pro tento příspěvek nejsou k dispozici žádné odkazy.</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetail;

