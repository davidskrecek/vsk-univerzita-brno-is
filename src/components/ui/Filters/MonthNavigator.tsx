"use client";

import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface MonthNavigatorProps {
  month: number;
  year: number;
  onMonthChange: (delta: number) => void;
}

export const MonthNavigator = ({ month, year, onMonthChange }: MonthNavigatorProps) => {
  const monthName = new Intl.DateTimeFormat("cs-CZ", {
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1));

  return (
    <div className="flex items-center gap-0.5 md:gap-2">
      <button
        type="button"
        onClick={() => onMonthChange(-1)}
        className="p-2 hover:bg-primary/10 text-on-surface/40 hover:text-primary rounded-full transition-all active:scale-[0.92]"
        title="Předchozí měsíc"
      >
        <IoChevronBack size={18} />
      </button>
      <span className="text-[11px] font-display font-bold uppercase tracking-[0.2em] px-4 min-w-[140px] text-center text-on-surface/70 select-none">
        {monthName}
      </span>
      <button
        type="button"
        onClick={() => onMonthChange(1)}
        className="p-2 hover:bg-primary/10 text-on-surface/40 hover:text-primary rounded-full transition-all active:scale-[0.92]"
        title="Následující měsíc"
      >
        <IoChevronForward size={18} />
      </button>
    </div>
  );
};

export default MonthNavigator;
