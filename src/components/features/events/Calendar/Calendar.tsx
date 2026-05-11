"use client"

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { parseDateKey } from '@/components/features/events/eventUtils';
import { CalendarEvent } from '@/types/events';

interface CalendarProps {
  events: CalendarEvent[];
  year: number;
  month: number;
}

const DAYS = ['PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO', 'NE'];

export const Calendar = ({ events, year, month: monthOneBased }: CalendarProps) => {
  const searchParams = useSearchParams();
  const month = monthOneBased - 1; // 0-based

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
    <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 md:p-10 space-y-6 sm:space-y-10 shadow-lg border border-outline-variant/5">
      <div className="grid grid-cols-7 min-w-[900px]">
        {/* Day headers */}
        {DAYS.map(day => (
          <div key={day} className="py-4 sm:py-6 text-center text-[11px] font-display font-bold text-on-surface/40 tracking-widest border-r border-b border-outline-variant/10 bg-surface-container-low/30 uppercase">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, idx) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const isWeekend = idx % 7 >= 5;

          const today = new Date();
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <div
              key={idx}
              className={`min-h-[110px] sm:min-h-[140px] p-3 sm:p-4 border-r border-b border-outline-variant/10 transition-colors
                ${!day ? "bg-surface-container-low/20" : isWeekend ? "bg-surface-container-low/40" : "bg-transparent"}
              `}
            >
              {day && (
                <div className="flex flex-col h-full space-y-3">
                  <div className="flex items-center">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-lg font-display font-bold transition-all ${
                        isToday
                          ? "bg-primary text-on-primary shadow-sm"
                          : dayEvents.length > 0
                          ? "text-on-surface"
                          : "text-on-surface/30"
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {dayEvents.map(event => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (!params.get('view')) params.set('view', 'calendar');
                      params.set('eventId', event.id);
                      const href = `/events?${params.toString()}`;

                      return (
                        <Link
                          key={event.id}
                          href={href}
                          scroll={false}
                          className="block px-2 py-1.5 rounded-md text-[9px] font-display font-bold uppercase tracking-wide border bg-surface-container-high text-on-surface/80 border-outline-variant/10 hover:bg-surface-container transition-all cursor-pointer"
                        >
                          <div className="text-[7px] text-primary/60 mb-0.5">{event.sport}</div>
                          <div className="line-clamp-1">{event.title}</div>
                        </Link>
                      );
                    })}
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

