"use client"

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  sport: string;
}

interface CalendarProps {
  events: CalendarEvent[];
}

const MONTHS = [
  'Leden', 'Únor', 'Března', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
];

const DAYS = ['PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO', 'NE'];

export const Calendar = ({ events }: CalendarProps) => {
  const searchParams = useSearchParams();
  // Use Nov 2024 as starting point to match the image
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper for month navigation
  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  // Get days in month and starting day
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon-Sun (0-6)

  // Calendar grid construction
  const totalCells = Math.ceil((daysInMonth + startingDay) / 7) * 7;
  const calendarDays = Array.from({ length: totalCells }).map((_, i) => {
    const day = i - startingDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-6 md:p-10 space-y-10 shadow-lg border border-outline-variant/5">
      {/* HEADER: Month + Nav */}
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-display font-bold text-on-surface tracking-display">
          {MONTHS[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-3 bg-surface-container-high hover:bg-surface-container rounded-lg transition-all cursor-pointer text-on-surface/60 hover:text-on-surface"
          >
            <IoChevronBack size={20} />
          </button>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-3 bg-surface-container-high hover:bg-surface-container rounded-lg transition-all cursor-pointer text-on-surface/60 hover:text-on-surface"
          >
            <IoChevronForward size={20} />
          </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 border-t border-l border-outline-variant/10 rounded-sm overflow-hidden">
        {/* Day headers */}
        {DAYS.map(day => (
          <div key={day} className="py-6 text-center text-[11px] font-display font-bold text-on-surface/40 tracking-widest border-r border-b border-outline-variant/10 bg-surface-container-low/30 uppercase">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, idx) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const isWeekend = idx % 7 >= 5;

          return (
            <div 
              key={idx} 
              className={`min-h-[140px] p-4 border-r border-b border-outline-variant/10 transition-colors
                ${!day ? 'bg-surface-container-low/20' : isWeekend ? 'bg-surface-container-low/40' : 'bg-transparent'}
              `}
            >
              {day && (
                <div className="flex flex-col h-full space-y-3">
                  <span className={`text-lg font-display font-bold ${dayEvents.length > 0 ? 'text-on-surface' : 'text-on-surface/30'}`}>
                    {day}
                  </span>

                  <div className="flex-1 space-y-1.5">
                    {dayEvents.map(event => (
                      <Link 
                        key={event.id}
                        href={`/events/${event.id}?${searchParams.toString()}`}
                        scroll={false}
                        className="block px-2 py-1.5 rounded-md text-[9px] font-display font-bold uppercase tracking-wide border bg-surface-container-high text-on-surface/80 border-outline-variant/10 hover:bg-surface-container transition-all cursor-pointer"
                      >
                        <div className="text-[7px] text-primary/60 mb-0.5">{event.sport}</div>
                        <div className="line-clamp-1">{event.title}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
