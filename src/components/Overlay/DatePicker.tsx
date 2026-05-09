"use client";

import * as React from "react";
import { format, addMonths, startOfMonth } from "date-fns";
import { cs } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";
import { IoCalendarOutline, IoChevronBack, IoChevronForward, IoChevronDown } from "react-icons/io5";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DatePicker = ({
  date,
  onDateChange,
  placeholder = "Vyberte datum",
  disabled = false,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date>(date ? startOfMonth(date) : startOfMonth(new Date()));

  const handlePrevious = () => setMonth(addMonths(month, -1));
  const handleNext = () => setMonth(addMonths(month, 1));

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    if (selectedDate) setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-md border border-outline-variant/10 bg-surface-container-high px-4 py-3 text-left font-sans text-sm text-on-surface/70 transition-all hover:bg-surface-container-high focus:border-primary/40 focus:outline-none group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <IoCalendarOutline className="text-on-surface/40 group-hover:text-primary transition-colors" size={18} />
            <span className={!date ? "text-on-surface/40" : ""}>
              {date ? format(date, "PPP", { locale: cs }) : placeholder}
            </span>
          </div>
          <IoChevronDown size={16} className="text-on-surface/40" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="glass-overlay z-[3000] overflow-hidden rounded-xl border border-outline-variant/10 shadow-ambient animate-in fade-in zoom-in-95 duration-200"
          align="start"
          sideOffset={8}
        >
          {/* Custom Header */}
          <div className="flex justify-between items-center p-4">
            <span className="text-sm font-display font-bold uppercase tracking-wider text-on-surface">
              {format(month, "LLLL y", { locale: cs })}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevious}
                className="h-8 w-8 flex items-center justify-center text-on-surface/40 hover:text-primary hover:bg-primary/10 rounded-md transition-all"
              >
                <IoChevronBack size={18} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="h-8 w-8 flex items-center justify-center text-on-surface/40 hover:text-primary hover:bg-primary/10 rounded-md transition-all"
              >
                <IoChevronForward size={18} />
              </button>
            </div>
          </div>

          <DayPicker
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={date}
            onSelect={handleSelect}
            locale={cs}
            className="font-sans m-0 p-3"
            hideNavigation
            classNames={{
              months: "flex flex-col",
              month: "w-full border-collapse",
              month_caption: "hidden",
              weeks: "w-full",
              weekdays: "",
              weekday: "text-on-surface/30 w-10 h-10 font-display font-bold text-[10px] uppercase text-center vertical-middle",
              week: "",
              day: "p-0 text-center",
              day_button: "h-10 w-10 p-0 font-sans font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-all inline-flex items-center justify-center cursor-pointer relative",
              selected: "bg-primary text-on-primary hover:bg-primary hover:text-on-primary focus:bg-primary focus:text-on-primary rounded-md",
              today: "text-primary font-bold bg-primary/5 rounded-md",
              outside: "text-on-surface/5 opacity-30",
              disabled: "text-on-surface/5 opacity-30",
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
