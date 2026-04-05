"use client"

import SportFilterButton from "./SportFilterButton";

interface SportFilterProps {
  sports: string[];
  selectedSport: string | null;
  onSportChange: (sport: string | null) => void;
}

export const SportFilter = ({ sports, selectedSport, onSportChange }: SportFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <SportFilterButton
        label="Vše"
        isActive={selectedSport === null}
        onClick={() => onSportChange(null)}
      />
      
      {sports.map((sport) => (
        <SportFilterButton
          key={sport}
          label={sport}
          isActive={selectedSport === sport}
          onClick={() => onSportChange(sport)}
        />
      ))}
    </div>
  );
};

export default SportFilter;
