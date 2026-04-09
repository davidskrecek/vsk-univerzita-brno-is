"use client";

import React from "react";
import LabeledField from "@/components/Common/LabeledField";

interface LabeledTextareaProps {
  label: React.ReactNode;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  textareaClassName?: string;
  required?: boolean;
  disabled?: boolean;
}

export const LabeledTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 5,
  className = "",
  textareaClassName = "",
  required,
  disabled,
}: LabeledTextareaProps) => {
  const baseTextareaClassName =
    "w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors resize-none";

  return (
    <LabeledField label={label} className={className}>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`${baseTextareaClassName} ${textareaClassName}`}
      />
    </LabeledField>
  );
};

export default LabeledTextarea;
