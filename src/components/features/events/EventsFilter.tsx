"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SportFilter from "@/components/ui/Filters/SportFilter";
import ViewToggle from "@/components/ui/Actions/ViewToggle";

import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface EventsFilterProps {
  availableSports: Array<{ name: string; isCompetitive?: boolean }>;
}

export default function EventsFilter({ availableSports }: EventsFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedSport = searchParams.get("sport");
  const viewMode = searchParams.get("view") === "list" ? "list" : "calendar";

  const now = new Date();
  const currentMonth = Number(searchParams.get("month")) || now.getMonth() + 1;
  const currentYear = Number(searchParams.get("year")) || now.getFullYear();

  const updateSportFilter = useCallback((sportName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sportName) {
      params.set("sport", sportName);
    } else {
      params.delete("sport");
    }
    params.delete("eventId");
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [router, searchParams]);

  const updateViewMode = useCallback((newMode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newMode);
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [router, searchParams]);

  const updateMonth = useCallback((delta: number) => {
    const params = new URLSearchParams(searchParams.toString());
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    params.set("month", String(newMonth));
    params.set("year", String(newYear));

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [router, searchParams, currentMonth, currentYear]);

  const monthName = new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric" }).format(new Date(currentYear, currentMonth - 1));

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 items-center gap-6 transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      <div className="flex justify-start">
        <SportFilter
          sports={availableSports}
          selectedSport={selectedSport}
          onSportChange={updateSportFilter}
        />
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateMonth(-1)}
            className="p-2 hover:bg-primary/10 text-on-surface/40 hover:text-primary rounded-full transition-all"
            title="Předchozí měsíc"
          >
            <IoChevronBack size={18} />
          </button>
          <span className="text-[11px] font-display font-bold uppercase tracking-[0.2em] px-4 min-w-[150px] text-center text-on-surface/70">
            {monthName}
          </span>
          <button
            onClick={() => updateMonth(1)}
            className="p-2 hover:bg-primary/10 text-on-surface/40 hover:text-primary rounded-full transition-all"
            title="Následující měsíc"
          >
            <IoChevronForward size={18} />
          </button>
        </div>
      </div>

      <div className="hidden md:flex justify-end">
        <ViewToggle
          options={[
            { id: "calendar", label: "Kalendář" },
            { id: "list", label: "Seznam" },
          ]}
          activeId={viewMode}
          onChange={updateViewMode}
        />
      </div>
    </div>
  );
}

