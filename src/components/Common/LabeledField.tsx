import React from "react";

interface LabeledFieldProps {
  label: React.ReactNode;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

export const LabeledField = ({
  label,
  className = "",
  labelClassName = "",
  children,
}: LabeledFieldProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`text-[10px] font-display font-bold uppercase tracking-widest text-on-surface/60 ${labelClassName}`}
      >
        {label}
      </div>
      {children}
    </div>
  );
};

export default LabeledField;
