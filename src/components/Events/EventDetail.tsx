"use client"

import { useEffect } from 'react';
import { IoClose, IoLocationOutline } from 'react-icons/io5';
import dynamic from 'next/dynamic';
import CalendarExport from '../Common/CalendarExport';

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
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Format date to: 14. Prosince 2024
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = [
      'Ledna', 'Února', 'Března', 'Dubna', 'Května', 'Června',
      'Července', 'Srpna', 'Září', 'Října', 'Listopadu', 'Prosince'
    ];
    return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* MODAL CONTENT */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10 flex flex-col animate-in zoom-in-95 duration-300"
      >
        {/* MAP / IMAGE HEADER */}
        <div className="relative h-64 bg-surface-container-high overflow-hidden flex-shrink-0">
          {/* Leaflet Map Component */}
          {location ? (
            <div className="absolute inset-0 bg-[#1a1a1a]">
              <LeafletMap location={location} />
              {/* Overlay for aesthetic and interaction control */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent z-10"></div>
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

          {/* Close Button - Moved above map z-index */}
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

          {/* Open Map Label - Moved above map z-index */}
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
        <div className="p-10 flex flex-col items-center text-center space-y-8">
          {/* Category Badge */}
          <div className="px-4 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-display font-bold text-primary uppercase tracking-widest">
            {sport}
          </div>

          {/* Title */}
          <h2 className="text-4xl font-display font-bold text-on-surface tracking-display leading-tight uppercase">
            {title}
          </h2>

          {/* Meta Info */}
          <div className="flex flex-col space-y-2 text-on-surface/60 font-sans">
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <span>{formatDate(date)}</span>
              {time && (
                <>
                  <span className="opacity-40">—</span>
                  <span>{time} CET</span>
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
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;