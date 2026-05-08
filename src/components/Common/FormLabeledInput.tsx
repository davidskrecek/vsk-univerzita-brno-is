"use client";

import React from "react";
import {useFormContext, useFormState} from "react-hook-form";

import LabeledField from "@/components/Common/LabeledField";


interface FormLabeledInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: React.ReactNode;
    name: string;
    inputClassName?: string;
}

export const FormLabeledInput = ({label, name, type = "text", className = "", inputClassName = "", ...props}: FormLabeledInputProps) => {
    const {register, control} = useFormContext();
    const {errors} = useFormState({control, name})

    const error = errors?.[name]?.message as string | undefined;

    const baseInputClassName =
        "w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors";

    return (
        <LabeledField label={label} className={className}>
            <input
                id={name}
                type={type}
                className={`${baseInputClassName} ${inputClassName} ${
                    error ? "border-red-500" : ""
                }`}
                {...props}
                {...register(name)}
            />

            {error && (
                <span className="mt-1 text-sm text-red-600">
                    {error}
                </span>
            )}
        </LabeledField>
    );
};

export default FormLabeledInput;
