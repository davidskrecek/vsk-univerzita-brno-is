"use client";

import React from "react";
import { useFormContext, useFormState } from "react-hook-form";
import LabeledField from "@/components/ui/Forms/LabeledField";

interface FormLabeledInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  name: string;
  inputClassName?: string;
}

export const FormLabeledInput = ({
  label,
  name,
  className = "",
  inputClassName = "",
  ...props
}: FormLabeledInputProps) => {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control, name });

  const error = errors?.[name]?.message as string | undefined;

  const baseInputClassName =
    "w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border transition-colors";

  const stateClassName = error
    ? "border-red-500/50 focus:border-red-500"
    : "border-outline-variant/10 focus:border-primary/40";

  return (
    <LabeledField label={label} className={className} error={error}>
      <input
        id={name}
        className={`${baseInputClassName} ${stateClassName} ${inputClassName}`}
        {...props}
        {...register(name)}
      />
    </LabeledField>
  );
};

export default FormLabeledInput;
