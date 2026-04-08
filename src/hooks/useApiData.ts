"use client";

import { useCallback, useEffect, useState } from "react";

interface UseApiDataOptions<TResponse, TData> {
  url: string | null;
  errorMessage: string;
  mapData?: (payload: TResponse) => TData;
  requestInit?: RequestInit;
}

interface UseApiDataResult<TData> {
  data: TData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useApiData = <TResponse, TData = TResponse>({
  url,
  errorMessage,
  mapData,
  requestInit,
}: UseApiDataOptions<TResponse, TData>): UseApiDataResult<TData> => {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(url));
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setReloadKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          cache: "no-store",
          ...requestInit,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`${errorMessage} (${response.status})`);
        }

        const payload = (await response.json()) as TResponse;
        const mapped = mapData ? mapData(payload) : (payload as unknown as TData);

        if (active) {
          setData(mapped);
        }
      } catch (e) {
        if (!active || controller.signal.aborted) {
          return;
        }

        setData(null);
        setError(e instanceof Error ? e.message : errorMessage);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [url, errorMessage, mapData, requestInit, reloadKey]);

  return { data, loading, error, refetch };
};
