"use client";

import type { ReactNode } from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import dynamic from 'next/dynamic';
import CalendarExport from './CalendarExport';
import DetailLayout from '@/components/layout/DetailLayout';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-container-high animate-pulse" />
});

interface EventDetailProps {
  id: string;
  title: string;
  sport: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  links?: Array<{ url: string; alias: string | null }>;
  actions?: ReactNode;
  onClose?: () => void;
}

export const EventDetail = ({
  title,
  sport,
  date,
  time,
  location,
  description,
  links = [],
  actions,
  onClose
}: EventDetailProps) => {
  const formatDate = (dateStr: string) => {
    const [yearRaw, monthRaw, dayRaw] = dateStr.split('-');
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return dateStr;
    }

    const months = [
      'Ledna', 'Února', 'Března', 'Dubna', 'Května', 'Června',
      'Července', 'Srpna', 'Září', 'Října', 'Listopadu', 'Prosince'
    ];

    if (month < 1 || month > 12) {
      return dateStr;
    }

    return `${day}. ${months[month - 1]} ${year}`;
  };

  return (
    <DetailLayout
      title={title}
      category={sport}
      onClose={onClose}
      actions={actions}
      links={links.map(l => ({ url: l.url, label: l.alias || l.url }))}
      headerContent={
        location ? (
          <div className="absolute inset-0 bg-[#1a1a1a]">
            <LeafletMap location={location} />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 to-transparent z-10"></div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-[10px] font-display font-bold text-white uppercase tracking-widest rounded transition-colors hover:bg-black/80 cursor-pointer z-[2000]"
            >
              Otevřít mapu
            </a>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping"></div>
              <div className="relative bg-primary p-3 rounded-full shadow-lg">
                <IoLocationOutline size={24} className="text-on-primary" />
              </div>
            </div>
          </div>
        )
      }
      metaContent={
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <span>{formatDate(date)}</span>
            {time && (
              <>
                <span className="opacity-40">—</span>
                <span>{time}</span>
              </>
            )}
          </div>
          {location && (
            <div className="text-xs opacity-60">
              {location}
            </div>
          )}
        </div>
      }
    >
      <div className="max-w-md mx-auto flex flex-col space-y-8">
        <div className="text-sm text-on-surface/50 font-sans leading-relaxed">
          {description ? (
            <p>{description}</p>
          ) : (
            <p className="italic">Pro tuto akci není k dispozici podrobný popis.</p>
          )}
        </div>

        <CalendarExport
          title={title}
          location={location || ''}
          description={description}
          date={date}
          time={time}
          className="mx-auto"
        />
      </div>
    </DetailLayout>
  );
};

export default EventDetail;

