"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  const mapDataRef = useRef(mapData);
  const requestInitRef = useRef(requestInit);

  mapDataRef.current = mapData;
  requestInitRef.current = requestInit;

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

        const effectiveRequestInit = requestInitRef.current;

        const response = await fetch(url, {
          ...effectiveRequestInit,
          cache: effectiveRequestInit?.cache ?? "force-cache",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`${errorMessage} (${response.status})`);
        }

        const payload = (await response.json()) as TResponse;
        const mapped = mapDataRef.current
          ? mapDataRef.current(payload)
          : (payload as unknown as TData);

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
  }, [url, errorMessage, reloadKey]);

  return { data, loading, error, refetch };
};
