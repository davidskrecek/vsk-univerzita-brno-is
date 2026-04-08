interface FieldProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

export const Field = ({ label, className = "", children }: FieldProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface/60">
        {label}
      </div>
      {children}
    </div>
  );
};

export default Field;
