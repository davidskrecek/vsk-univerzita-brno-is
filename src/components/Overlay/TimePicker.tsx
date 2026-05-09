"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { IoTimeOutline, IoChevronDown } from "react-icons/io5";

interface TimePickerProps {
  time: string; // "HH:mm"
  onTimeChange: (time: string) => void;
}

const TIME_SLOTS = Array.from({ length: 48 }).map((_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

export const TimePicker = ({ time, onTimeChange }: TimePickerProps) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (slot: string) => {
    onTimeChange(slot);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md border border-outline-variant/10 bg-surface-container-high px-4 py-3 text-left font-sans text-sm text-on-surface/70 transition-all hover:bg-surface-container-high focus:border-primary/40 focus:outline-none group"
        >
          <div className="flex items-center gap-3">
            <IoTimeOutline className="text-on-surface/40 group-hover:text-primary transition-colors" size={18} />
            <span>{time || "08:00"}</span>
          </div>
          <IoChevronDown size={16} className="text-on-surface/40" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="glass-overlay z-[3000] w-48 rounded-xl border border-outline-variant/10 shadow-ambient animate-in fade-in zoom-in-95 duration-200 p-2"
          align="start"
          sideOffset={8}
        >
          <div className="flex flex-col gap-1 overflow-y-auto max-h-64 custom-scrollbar pr-1">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => handleSelect(slot)}
                className={`flex items-center px-3 py-2 text-sm font-sans rounded transition-all ${time === slot ? "bg-primary text-on-primary font-bold" : "hover:bg-primary/10 text-on-surface/60"
                  }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
