"use client";

import React from "react";
import LabeledField from "@/components/ui/Forms/LabeledField";

interface SelectOption {
    label: string;
    value: string;
}

interface LabeledSelectProps {
    label: React.ReactNode;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    selectClassName?: string;
    required?: boolean;
    disabled?: boolean;
}

export const LabeledSelect = ({ label, name, value, onChange, options, placeholder = "Vyberte možnost", className = "", selectClassName = "", required, disabled, }: LabeledSelectProps) => {
    const baseSelectClassName =
        "w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors appearance-none cursor-pointer";

    return (
        <LabeledField label={label} className={className}>
            <select
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                disabled={disabled}
                className={`${baseSelectClassName} ${selectClassName}`}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}

                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </LabeledField>
    );
};

export default LabeledSelect;

