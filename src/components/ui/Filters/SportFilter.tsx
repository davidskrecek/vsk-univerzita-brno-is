"use client";

import React from "react";
import { IoChevronDown } from "react-icons/io5";
import { ActionDropdown } from "@/components/ui/Actions/ActionDropdown";
import {
  Circle,
  Trophy,
} from "lucide-react";
import { sportIcons } from "@/components/features/sports/sportIcons";

interface SportFilterProps {
  sports: Array<{ name: string; isCompetitive?: boolean }>;
  selectedSport: string | null;
  onSportChange: (sport: string | null) => void;
}

export const SportFilter = ({ sports, selectedSport, onSportChange }: SportFilterProps) => {
  const competitive = sports.filter(s => s.isCompetitive !== false);
  const nonCompetitive = sports.filter(s => s.isCompetitive === false);

  const items = [
    {
      key: "all",
      label: "Všechny sporty",
      onSelect: () => {
        if (selectedSport === null) return;
        onSportChange(null)
      },
      icon: <Trophy size={14} className="text-on-surface/30" />
    },
    ...competitive.map(s => ({
      key: s.name,
      label: s.name,
      onSelect: () => {
        if (selectedSport === s.name) return;
        onSportChange(s.name)
      },
      icon: <div className="text-primary">{sportIcons[s.name] || <Circle size={10} />}</div>
    })),
    ...nonCompetitive.map(s => ({
      key: s.name,
      label: s.name,
      onSelect: () => {
        if (selectedSport === s.name) return;
        onSportChange(s.name)
      },
      icon: <div className="text-on-surface/40">{sportIcons[s.name] || <Circle size={10} />}</div>
    }))
  ];

  const currentIcon = selectedSport ? sportIcons[selectedSport] : <Trophy size={14} />;

  return (
    <div className="flex items-center gap-3">
      <ActionDropdown
        align="start"
        trigger={
          <button type="button" className="group flex items-center gap-3 bg-surface-container-low border border-outline-variant/10 px-4 py-2.5 rounded-md hover:bg-surface-container transition-all active:scale-[0.98]">
            <div className="flex items-center gap-2.5">
              <div className="text-primary transition-transform group-hover:scale-110">
                {currentIcon}
              </div>
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface/80 leading-none">
                {selectedSport || "Všechny sporty"}
              </span>
            </div>
            <IoChevronDown size={14} className="text-on-surface/40 group-hover:text-primary transition-colors" />
          </button>
        }
        items={items}
        contentClassName="max-h-[400px] overflow-y-auto custom-scrollbar w-[260px]"
      />
    </div>
  );
};

export default SportFilter;

