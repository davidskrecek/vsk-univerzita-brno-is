"use client";

import { useFormContext } from "react-hook-form";
import React from "react";
import LabeledField from "@/components/ui/Forms/LabeledField";

interface SelectOption {
    label: string;
    value: string | number;
}

interface FormLabeledSelectProps {
    label: React.ReactNode;
    name: string;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    selectClassName?: string;
    disabled?: boolean;
    multiple?: boolean;
}

export const FormLabeledSelect = ({ label, name, options, placeholder = "Vyberte možnost", className = "", selectClassName = "", disabled, multiple = false, }: FormLabeledSelectProps) => {
    const { register, formState: { errors } } = useFormContext();

    const baseSelectClassName =
        "w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors appearance-none cursor-pointer";

    const error = errors[name]?.message?.toString();

    return (
        <LabeledField label={label} className={className}>
            <select
                {...register(name)}
                disabled={disabled}
                multiple={multiple}
                className={`${baseSelectClassName} ${selectClassName}`}
            >
                {!multiple && placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}

                {options.map((opt) => (
                    <option key={opt.value} value={String(opt.value)}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {error && (
                <span className="mt-1 text-sm text-red-600">
                    {error}
                </span>
            )}
        </LabeledField>
    );
};

export default FormLabeledSelect;

