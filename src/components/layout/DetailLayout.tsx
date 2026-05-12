"use client";

import { ReactNode } from "react";
import { IoClose, IoLinkOutline } from "react-icons/io5";

export interface DetailLink {
  url: string;
  label: string;
}

interface DetailLayoutProps {
  title: string;
  category: string;
  headerContent?: ReactNode;
  metaContent?: ReactNode;
  links?: DetailLink[];
  actions?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  contentClassName?: string;
}

export const DetailLayout = ({
  title,
  category,
  headerContent,
  metaContent,
  links = [],
  actions,
  onClose,
  children,
  contentClassName = "max-w-2xl",
}: DetailLayoutProps) => {
  return (
    <div className={`${contentClassName} bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10 flex flex-col w-full`}>
      {/* HEADER SECTION (Image or Map) */}
      <div className="relative h-48 sm:h-56 md:h-64 bg-surface-container-high overflow-hidden flex-shrink-0">
        {headerContent}

        {onClose && (
          <div className="absolute top-4 right-4 z-[2000] flex items-center gap-2">
            {actions && <div className="flex-shrink-0">{actions}</div>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full p-2 text-white bg-black/30 hover:bg-black/50 transition-colors cursor-pointer"
              type="button"
            >
              <IoClose size={20} />
            </button>
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center text-center space-y-6 sm:space-y-8">
        <div className="meta-badge uppercase">
          {category}
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-on-surface tracking-display leading-tight uppercase">
          {title}
        </h2>

        {metaContent && (
          <div className="text-on-surface/60 font-sans">
            {metaContent}
          </div>
        )}

        <div className="w-full text-left sm:text-center">
          {children}
        </div>

        {/* LINKS SECTION */}
        <div className="pt-4 w-full border-t border-outline-variant/5">
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-on-surface/20">
              Odkazy
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {links.length > 0 ? (
                links.map((l, i) => (
                  <a
                    key={`${l.url}-${i}`}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-surface-container-high/50 hover:bg-primary/10 border border-outline-variant/5 rounded-full transition-all group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <IoLinkOutline className="text-primary/60 group-hover:text-primary" />
                    <span className="text-[11px] font-display font-bold uppercase tracking-wider text-on-surface/70 group-hover:text-primary">
                      {l.label}
                    </span>
                  </a>
                ))
              ) : (
                <div className="text-xs font-sans text-on-surface/30 italic">Bez doplňujících odkazů</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailLayout;

