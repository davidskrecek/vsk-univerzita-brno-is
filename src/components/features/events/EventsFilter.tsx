"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SportFilter from "@/components/ui/Filters/SportFilter";
import { useSports } from "@/components/features/sports/SportsProvider";
import ViewToggle from "@/components/ui/Actions/ViewToggle";

import MonthNavigator from "@/components/ui/Filters/MonthNavigator";

export default function EventsFilter() {
  const { sports: availableSports } = useSports();
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

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 items-center gap-6 transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      <div className="flex justify-start">
        <SportFilter
          sports={availableSports}
          selectedSport={selectedSport}
          onSportChange={updateSportFilter}
        />
      </div>

      <div className="flex justify-center">
        <MonthNavigator
          month={currentMonth}
          year={currentYear}
          onMonthChange={updateMonth}
        />
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

