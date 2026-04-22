"use client"

import { IoClose, IoLocationOutline } from 'react-icons/io5';
import dynamic from 'next/dynamic';
import CalendarExport from '../Common/CalendarExport';
import Modal from '@/components/Overlay/Modal';

// Import LeafletMap dynamically to avoid SSR issues
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
  onClose?: () => void;
}

export const EventDetail = ({
  title,
  sport,
  date,
  time,
  location,
  description,
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
    <Modal
      onClose={onClose}
      contentClassName="max-w-2xl bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10 flex flex-col animate-in zoom-in-95 duration-300"
    >
      {/* MAP / IMAGE HEADER */}
      <div className="relative h-48 sm:h-56 md:h-64 bg-surface-container-high overflow-hidden flex-shrink-0">
        {/* Leaflet Map Component */}
        {location ? (
          <div className="absolute inset-0 bg-[#1a1a1a]">
            <LeafletMap location={location} />
            {/* Overlay for aesthetic and interaction control */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 to-transparent z-10"></div>
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
        )}

        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-[2000] cursor-pointer"
          >
            <IoClose size={20} />
          </button>
        )}

        {location && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-[10px] font-display font-bold text-white uppercase tracking-widest rounded transition-colors hover:bg-black/80 cursor-pointer z-[2000]"
          >
            Otevřít mapu
          </a>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center text-center space-y-6 sm:space-y-8">
        {/* Category Badge */}
        <div className="meta-badge">
          {sport}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-on-surface tracking-display leading-tight uppercase">
          {title}
        </h2>

        {/* Meta Info */}
        <div className="flex flex-col space-y-2 text-on-surface/60 font-sans">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <span>{formatDate(date)}</span>
            {time && (
              <>
                <span className="opacity-40">—</span>
                <span>{time} (Europe/Prague)</span>
              </>
            )}
          </div>
          {location && (
            <div className="text-xs opacity-60">
              {location}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="max-w-md text-sm text-on-surface/50 font-sans leading-relaxed space-y-4">
          {description ? (
            <p>{description}</p>
          ) : (
            <p className="italic">Pro tuto akci není k dispozici podrobný popis.</p>
          )}
        </div>

        {/* Action: Add to Calendar */}
        <div className="pt-4 w-full border-t border-outline-variant/5">
          <CalendarExport
            title={title}
            location={location || ''}
            description={description}
            date={date}
            time={time}
            className="mx-auto"
          />
        </div>
      </div>
    </Modal>
  );
};

export default EventDetail;
