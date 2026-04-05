"use client"

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FaGoogle, FaApple, FaMicrosoft, FaCalendarPlus } from 'react-icons/fa6';

interface CalendarExportProps {
  title: string;
  location: string;
  description?: string;
  className?: string;
}

export const CalendarExport = ({ title, location, description, className = '' }: CalendarExportProps) => {
  // Helper to generate calendar links
  const calendarLinks = {
    google: `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(description || '')}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}&body=${encodeURIComponent(description || '')}`,
    apple: `#`, // Placeholder for .ics
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <button className={`btn-secondary text-[0.625rem] py-2 px-4 uppercase tracking-wider flex items-center gap-2 group/btn ${className}`}>
          <FaCalendarPlus className="text-primary transition-transform group-hover/btn:scale-110" />
          Do kalendáře
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="glass-overlay z-[2100] min-w-[10rem] rounded-md p-1 shadow-ambient border border-outline-variant/10 animate-in fade-in zoom-in-95 duration-200"
          sideOffset={8}
          align="center"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenu.Item asChild onClick={(e) => e.stopPropagation()}>
            <a 
              href={calendarLinks.google}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-on-surface/80 hover:text-primary hover:bg-primary/10 rounded-sm outline-none transition-colors cursor-pointer"
            >
              <FaGoogle className="text-primary/60" />
              Google Kalendář
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild onClick={(e) => e.stopPropagation()}>
            <a 
              href={calendarLinks.apple}
              className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-on-surface/80 hover:text-primary hover:bg-primary/10 rounded-sm outline-none transition-colors cursor-pointer"
            >
              <FaApple className="text-primary/60" />
              Apple Kalendář (.ics)
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild onClick={(e) => e.stopPropagation()}>
            <a 
              href={calendarLinks.outlook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-on-surface/80 hover:text-primary hover:bg-primary/10 rounded-sm outline-none transition-colors cursor-pointer"
            >
              <FaMicrosoft className="text-primary/60" />
              Outlook / Office 365
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default CalendarExport;
