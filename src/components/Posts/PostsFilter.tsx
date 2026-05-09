"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SportFilter from "@/components/Common/SportFilter/SportFilter";

interface PostsFilterProps {
  availableSports: string[];
}

export default function PostsFilter({ availableSports }: PostsFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectedSport = searchParams.get("sport");

  const updateSportFilter = useCallback((sportName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sportName) {
      params.set("sport", sportName);
    } else {
      params.delete("sport");
    }
    params.delete("postId"); 
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [router, searchParams]);

  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      <SportFilter
        sports={availableSports}
        selectedSport={selectedSport}
        onSportChange={updateSportFilter}
      />
    </div>
  );
}
