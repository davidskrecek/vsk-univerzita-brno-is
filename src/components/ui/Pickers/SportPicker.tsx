"use client";

import { ActionDropdown, type ActionDropdownItem } from "@/components/ui/Actions/ActionDropdown";
import { IoChevronDown } from "react-icons/io5";

interface SportOption {
  id: number;
  name: string;
}

interface SportPickerProps {
  sports: SportOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export const SportPicker = ({ sports, selectedId, onSelect, disabled }: SportPickerProps) => {
  const selectedSport = sports.find((s) => String(s.id) === selectedId);

  const items: ActionDropdownItem[] = sports.map((sport) => ({
    key: String(sport.id),
    label: sport.name,
    onSelect: () => onSelect(String(sport.id)),
  }));

  return (
    <ActionDropdown
      disabled={disabled}
      trigger={
        <button
          type="button"
          disabled={disabled}
          className="flex w-full items-center justify-between bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors disabled:opacity-50"
        >
          <span>{selectedSport?.name ?? "Vyberte sport"}</span>
          <IoChevronDown size={16} className="text-on-surface/40" />
        </button>
      }
      items={items}
      align="start"
      contentClassName="w-[--radix-dropdown-menu-trigger-width]"
    />
  );
};

