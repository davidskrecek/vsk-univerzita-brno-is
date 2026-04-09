"use client"

import React from 'react';
import { FaGoogle, FaApple, FaMicrosoft, FaCalendarPlus } from 'react-icons/fa6';
import ActionDropdown from '@/components/Overlay/ActionDropdown';

interface CalendarExportProps {
  title: string;
  location: string;
  description?: string;
  date?: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  className?: string;
}

const toGoogleDateTime = (value: Date) => {
  // Google expects UTC timestamp in YYYYMMDDTHHmmssZ format.
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
};

const buildDateRange = ({
  date,
  time,
  endDate,
  endTime,
}: Pick<CalendarExportProps, "date" | "time" | "endDate" | "endTime">) => {
  if (!date) return undefined;

  if (!time) {
    // All-day event format for Google Calendar.
    const start = date.replaceAll("-", "");
    const startDate = new Date(`${date}T00:00:00`);
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const end = nextDay.toISOString().slice(0, 10).replaceAll("-", "");
    return `${start}/${end}`;
  }

  const start = new Date(`${date}T${time}:00`);

  let end: Date;
  if (endDate && endTime) {
    end = new Date(`${endDate}T${endTime}:00`);
  } else if (endTime) {
    end = new Date(`${date}T${endTime}:00`);
  } else {
    // Fallback to one-hour event when end is not provided.
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  return `${toGoogleDateTime(start)}/${toGoogleDateTime(end)}`;
};

const escapeIcsText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const toIcsUtc = (value: Date) => toGoogleDateTime(value);

const buildIcsPayload = ({
  title,
  location,
  description,
  date,
  time,
  endDate,
  endTime,
}: Pick<CalendarExportProps, "title" | "location" | "description" | "date" | "time" | "endDate" | "endTime">) => {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@vskuniverzitabrno`;
  const stamp = toIcsUtc(new Date());

  if (date && !time) {
    const startDate = date.replaceAll("-", "");
    const nextDayDate = new Date(`${date}T00:00:00`);
    nextDayDate.setDate(nextDayDate.getDate() + 1);
    const endDateValue = nextDayDate.toISOString().slice(0, 10).replaceAll("-", "");

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VSK Univerzita Brno//Calendar Export//CS",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDateValue}`,
      `SUMMARY:${escapeIcsText(title)}`,
      `LOCATION:${escapeIcsText(location)}`,
      `DESCRIPTION:${escapeIcsText(description || "")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  }

  const start = date && time ? new Date(`${date}T${time}:00`) : new Date();
  let end: Date;
  if (date && endTime) {
    end = new Date(`${endDate || date}T${endTime}:00`);
  } else {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VSK Univerzita Brno//Calendar Export//CS",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description || "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

export const CalendarExport = ({
  title,
  location,
  description,
  date,
  time,
  endDate,
  endTime,
  className = "",
}: CalendarExportProps) => {
  const dateRange = buildDateRange({ date, time, endDate, endTime });
  const handleAppleExport = () => {
    const ics = buildIcsPayload({ title, location, description, date, time, endDate, endTime });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "udalost.ics";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const googleParams = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    location,
    details: description || "",
  });

  if (dateRange) {
    googleParams.set("dates", dateRange);
  }

  const calendarLinks = {
    google: `https://www.google.com/calendar/render?${googleParams.toString()}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}&body=${encodeURIComponent(description || '')}`,
    apple: `#`, // Placeholder for .ics
  };

  const items = [
    {
      key: "google",
      label: "Google Kalendář",
      icon: (
        <span className="inline-flex h-4 w-5 shrink-0 items-center justify-center">
          <FaGoogle size={12} className="text-primary/60" />
        </span>
      ),
      href: calendarLinks.google,
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      key: "apple",
      label: "Apple Kalendář",
      icon: (
        <span className="inline-flex h-4 w-5 shrink-0 items-center justify-center">
          <FaApple size={12} className="text-primary/60" />
        </span>
      ),
      onSelect: handleAppleExport,
    },
    {
      key: "outlook",
      label: "Outlook / Office 365",
      icon: (
        <span className="inline-flex h-4 w-5 shrink-0 items-center justify-center">
          <FaMicrosoft size={12} className="text-primary/60" />
        </span>
      ),
      href: calendarLinks.outlook,
      target: "_blank",
      rel: "noopener noreferrer",
    },
  ];

  return (
    <ActionDropdown
      align="center"
      items={items}
      trigger={
        <button
          type="button"
          className={`btn-secondary text-[0.625rem] py-2 px-4 uppercase tracking-wider flex items-center gap-2 group/btn ${className}`}
        >
          <FaCalendarPlus className="text-primary transition-transform group-hover/btn:scale-110" />
          Do kalendáře
        </button>
      }
    />
  );
};

export default CalendarExport;
