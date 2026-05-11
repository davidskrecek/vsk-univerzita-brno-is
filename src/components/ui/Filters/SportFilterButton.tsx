"use client"

interface SportFilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCompetitive?: boolean;
}

export const SportFilterButton = ({ label, isActive, onClick, isCompetitive = true }: SportFilterButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 text-[10px] font-display font-bold uppercase tracking-widest rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2
        ${isActive
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container-low text-on-surface/40 hover:bg-surface-container hover:text-on-surface'
        }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full transition-colors ${isActive ? 'bg-on-primary' : isCompetitive ? 'bg-primary' : 'bg-on-surface/20'}`} />
      {label}
    </button>
  );
};

export default SportFilterButton;

