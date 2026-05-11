import React from "react";

interface LabeledFieldProps {
  label: React.ReactNode;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
  error?: string;
}

export const LabeledField = ({
  label,
  className = "",
  labelClassName = "",
  children,
  error,
}: LabeledFieldProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`text-[10px] font-display font-bold uppercase tracking-widest text-on-surface/60 ${labelClassName}`}
      >
        {label}
      </div>
      {children}
      {error && (
        <p className="text-[10px] font-medium text-red-500 mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default LabeledField;

