import React from 'react';
import AppLink from '../Common/AppLink';

interface PostCardProps {
  category: string;
  title: string;
  description: string;
  href: string;
}

export const PostCard = ({ category, title, description, href }: PostCardProps) => {
  return (
    <div className="card-surface flex items-center gap-6">
      {/* Small Placeholder Image */}
      <div className="w-20 aspect-square bg-surface-container-high rounded-md flex-shrink-0 relative overflow-hidden transition-colors group-hover:bg-surface-bright">
        <div className="absolute inset-0 flex items-center justify-center text-on-surface/5 opacity-10 font-display font-bold text-xl">
          VSK
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col justify-center flex-grow min-w-0">
        <span className="text-[9px] font-display font-bold text-primary/60 uppercase tracking-[0.2em] mb-1">
          {category}
        </span>
        <AppLink href={href} className="no-underline">
          <h3 className="text-lg font-display font-bold text-on-surface group-hover:text-primary transition-colors leading-tight mb-1 truncate">
            {title}
          </h3>
        </AppLink>
        <p className="text-xs text-on-surface/40 font-sans line-clamp-1 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Optional: Add a subtle arrow or indicator to match EventCard's action space if needed, 
          but keeping it clean for now to match the "editorial" feel */}
    </div>
  );
};
