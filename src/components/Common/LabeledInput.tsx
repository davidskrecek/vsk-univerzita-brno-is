"use client";

import React from "react";
import LabeledField from "@/components/Common/LabeledField";

interface LabeledInputProps {
  label: React.ReactNode;
  name?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export const LabeledInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  inputClassName = "",
  required,
  disabled,
  autoComplete,
}: LabeledInputProps) => {
  const baseInputClassName =
    "w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors";

  return (
    <LabeledField label={label} className={className}>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`${baseInputClassName} ${inputClassName}`}
      />
    </LabeledField>
  );
};

export default LabeledInput;
