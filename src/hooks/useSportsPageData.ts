"use client";

import { useMemo } from "react";
import { splitSportsByType, type SportApiItem } from "@/components/Sports/sportUtils";
import { useApiData } from "@/hooks/useApiData";

interface UseSportsPageDataResult {
  loading: boolean;
  error: string | null;
  sports: SportApiItem[];
  competitiveSports: string[];
  recreationalSports: string[];
}

export const useSportsPageData = (): UseSportsPageDataResult => {
  const { data, loading, error } = useApiData<SportApiItem[]>({
    url: "/api/sports",
    errorMessage: "Nepodařilo se načíst sporty",
  });

  const sports = useMemo(() => data ?? [], [data]);
  const { competitiveSports, recreationalSports } = useMemo(() => splitSportsByType(sports), [sports]);

  return {
    loading,
    error,
    sports,
    competitiveSports,
    recreationalSports,
  };
};
