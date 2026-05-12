"use client";

import React, { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { IoLocationOutline } from "react-icons/io5";

interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    postcode?: string;
    amenity?: string;
    leisure?: string;
    building?: string;
    sport?: string;
  };
  name?: string;
}

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const LocationPicker = ({
  value,
  onChange,
  placeholder = "Adresa nebo název haly",
}: LocationPickerProps) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!query || query.length < 3 || query === value) {
      setResults([]);
      setOpen(false);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=5&countrycodes=cz`
        );
        const data = await response.json();
        setResults(data);
        if (data.length > 0) setOpen(true);
      } catch (error) {
        console.error("Location search error:", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query, value]);

  const getCleanName = (item: LocationResult) => {
    const name = item.name || item.address?.amenity || item.address?.leisure || item.address?.building || item.address?.sport;
    const { road, house_number, city, town, village, suburb } = item.address;
    const place = city || town || village || suburb || "";

    if (name && road) {
      return `${name}, ${road} ${house_number || ""}, ${place}`.replace(/ ,/g, ",").replace(/,,/g, ",").trim();
    }

    const street = [road, house_number].filter(Boolean).join(" ");
    return name || [street, place].filter(Boolean).join(", ");
  };

  const handleSelect = (item: LocationResult) => {
    const cleanName = getCleanName(item);
    onChange(cleanName);
    setQuery(cleanName);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className="relative group">
          <IoLocationOutline
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-primary transition-colors pointer-events-none"
            size={18}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-surface-container-high pl-12 pr-4 py-3 rounded-md border border-outline-variant/10 focus:border-primary/40 outline-none transition-all font-sans text-sm text-on-surface/70"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            </div>
          )}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className="glass-overlay z-[3000] w-[var(--radix-popover-anchor-width)] overflow-hidden rounded-xl border border-outline-variant/10 shadow-ambient animate-in fade-in zoom-in-95 duration-200 p-1"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-on-surface/30 px-3 py-2">Navrhované adresy</span>
            {results.map((item) => {
              const cleanName = getCleanName(item);
              return (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="flex w-full flex-col items-start px-3 py-2.5 text-left rounded-md hover:bg-primary/10 transition-colors group"
                >
                  <span className="text-sm font-sans text-on-surface/80 group-hover:text-primary transition-colors line-clamp-1 text-left">
                    {cleanName}
                  </span>
                  <span className="text-[10px] text-on-surface/30 uppercase tracking-tighter text-left">
                    {[item.address.suburb, item.address.city || item.address.town].filter(Boolean).join(", ")}
                  </span>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

