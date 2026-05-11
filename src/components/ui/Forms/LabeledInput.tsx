"use client";

import React from "react";
import LabeledField from "@/components/ui/Forms/LabeledField";

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
  rightElement?: React.ReactNode;
  error?: string;
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
  rightElement,
  error,
}: LabeledInputProps) => {
  const baseInputClassName =
    "w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border transition-colors";

  const stateClassName = error
    ? "border-red-500/50 focus:border-red-500"
    : "border-outline-variant/10 focus:border-primary/40";

  return (
    <LabeledField label={label} className={className} error={error}>
      <div className="relative w-full">
        <input
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`${baseInputClassName} ${stateClassName} ${rightElement ? "pr-12" : ""} ${inputClassName}`}
        />
        {rightElement && (
          <div className="absolute right-0 top-0 bottom-0 pr-3 flex items-center justify-center z-20">
            {rightElement}
          </div>
        )}
      </div>
    </LabeledField>
  );
};

export default LabeledInput;

