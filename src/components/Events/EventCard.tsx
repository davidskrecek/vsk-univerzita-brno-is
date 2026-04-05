'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CalendarExport from '../Common/CalendarExport';

interface EventCardProps {
  id: string;
  day: string;
  month: string;
  category: string;
  title: string;
  location: string;
  href?: string;
}

export const EventCard = ({ id, day, month, category, title, location, href }: EventCardProps) => {
  const searchParams = useSearchParams();
  const currentParams = searchParams.toString();
  const baseHref = href ?? `/events/${id}`;
  const detailHref = `${baseHref}${currentParams ? `?${currentParams}` : ''}`;

  return (
    <Link 
      href={detailHref}
      scroll={false}
      className="card-surface flex items-center justify-between gap-8"
    >
      {/* Date */}
      <div className="flex flex-col items-center justify-center min-w-[3.75rem] text-center">
        <span className="text-3xl font-display font-bold text-secondary leading-none">
          {day}
        </span>
        <span className="text-[0.625rem] font-display font-bold text-on-surface-variant uppercase tracking-widest mt-1">
          {month}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-grow min-w-0">
        <span className="text-[9px] font-display font-bold text-primary/60 uppercase tracking-[0.2em] mb-1">
          {category}
        </span>
        <h3 className="text-lg font-display font-bold text-on-surface mb-1 truncate group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-on-surface/40 font-sans">
          <svg className="w-3 h-3 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>
      </div>

      {/* Action: Refactored Calendar Dropdown */}
      <div
        className="flex-shrink-0"
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <CalendarExport 
          title={title}
          location={location}
        />
      </div>
    </Link>
  );
};
