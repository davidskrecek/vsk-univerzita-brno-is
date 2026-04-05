"use client"

interface SportFilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const SportFilterButton = ({ label, isActive, onClick }: SportFilterButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 text-[10px] font-display font-bold uppercase tracking-widest rounded-md transition-all duration-300 cursor-pointer
        ${isActive
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container-low text-on-surface/40 hover:bg-surface-container hover:text-on-surface'
        }`}
    >
      {label}
    </button>
  );
};

export default SportFilterButton;
