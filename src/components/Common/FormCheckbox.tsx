"use client";

import { useFormContext, Controller } from "react-hook-form";

type FormCheckboxProps = {
    name: string;
    label: string;
    disabled?: boolean;
    className?: string;
};

export default function FormCheckbox({name, label, disabled, className}: FormCheckboxProps) {
    const {control, formState: { errors }} = useFormContext();
    const error = errors[name];

    return (
        <div className={className}>
            <Controller name={name} control={control} render={({ field }) => (
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={disabled}
                            className="h-4 w-4 rounded border border-outline"
                        />

                        <span className="text-sm text-on-surface">
                            {label}
                        </span>
                    </label>
                )}
            />

            {error && (
                <p className="mt-1 text-sm text-error">
                    {String(error.message)}
                </p>
            )}
        </div>
    );
}
