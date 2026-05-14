"use client";

import React from "react";
import { useFormContext, useFormState } from "react-hook-form";
import LabeledField from "@/components/ui/Forms/LabeledField";

interface FormLabeledTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: React.ReactNode;
  name: string;
  textareaClassName?: string;
}

export const FormLabeledTextarea = ({
  label,
  name,
  rows = 5,
  className = "",
  textareaClassName = "",
  ...props
}: FormLabeledTextareaProps) => {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control, name });

  const error = errors?.[name]?.message as string | undefined;

  const baseTextareaClassName =
    "w-full bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors resize-none";

  return (
    <LabeledField label={label} className={className}>
      <textarea
        id={name}
        rows={rows}
        className={`${baseTextareaClassName} ${textareaClassName} ${
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

export default FormLabeledTextarea;
