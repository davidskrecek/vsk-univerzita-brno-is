"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import DetailLayout, { type DetailLink } from "@/components/layout/DetailLayout";

export type PostDetailLink = DetailLink;

interface PostDetailProps {
  title: string;
  category: string;
  date: string;
  content: string;
  imageUrl?: string | null;
  links?: PostDetailLink[];
  actions?: ReactNode;
  onClose?: () => void;
}

export const PostDetail = ({
  title,
  category,
  date,
  content,
  imageUrl,
  links = [],
  actions,
  onClose,
}: PostDetailProps) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = [
      "Ledna", "Února", "Března", "Dubna", "Května", "Června",
      "Července", "Srpna", "Září", "Října", "Listopadu", "Prosince",
    ];
    return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const paragraphs = content
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <DetailLayout
      title={title}
      category={category}
      onClose={onClose}
      actions={actions}
      links={links}
      headerContent={
        imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 42rem"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="text-4xl font-display font-bold uppercase tracking-widest text-on-surface/5 italic">{category}</div>
          </div>
        )
      }
      metaContent={<div className="text-sm font-medium">{formatDate(date)}</div>}
    >
      <div className="max-w-md mx-auto text-sm text-on-surface/50 font-sans leading-relaxed space-y-4">
        {paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    </DetailLayout>
  );
};

export default PostDetail;

