"use client"

interface ViewToggleOption<T extends string> {
  id: T;
  label: string;
}

interface ViewToggleProps<T extends string> {
  options: ViewToggleOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}

export const ViewToggle = <T extends string>({ 
  options, 
  activeId, 
  onChange,
  className = ""
}: ViewToggleProps<T>) => {
  return (
    <div className={`flex bg-surface-container-low rounded-md w-fit ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`px-6 py-2 text-[10px] font-display font-bold uppercase tracking-widest rounded-md transition-all duration-300 cursor-pointer
            ${activeId === option.id
              ? 'bg-surface-container-high text-on-surface shadow-sm'
              : 'text-on-surface/40 hover:text-on-surface'
            }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;
