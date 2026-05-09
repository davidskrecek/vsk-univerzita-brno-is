"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import ViewToggle from "@/components/Common/ViewToggle";

interface EventsFilterProps {
  availableSports: string[];
}

export default function EventsFilter({ availableSports }: EventsFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedSport = searchParams.get("sport");
  const viewMode = searchParams.get("view") === "list" ? "list" : "calendar";

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

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      <SportFilter
        sports={availableSports}
        selectedSport={selectedSport}
        onSportChange={updateSportFilter}
      />
      <ViewToggle
        options={[
          { id: "calendar", label: "Kalendář" },
          { id: "list", label: "Seznam" },
        ]}
        activeId={viewMode}
        onChange={updateViewMode}
      />
    </div>
  );
}
