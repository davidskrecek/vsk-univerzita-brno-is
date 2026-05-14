import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import FormLabeledInput from "@/components/ui/Forms/FormLabeledInput";
import LabeledField from "@/components/ui/Forms/LabeledField";
import { SportPicker } from "@/components/ui/Pickers/SportPicker";
import { Sport } from "@/lib/queries/sports";

type BasicInfoFieldsProps = {
  sports: Sport[];
  disabled?: boolean;
};

export const BasicInfoFields = ({ sports, disabled }: BasicInfoFieldsProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormLabeledInput label="Celé jméno" name="fullName" placeholder="Jan Novák" disabled={disabled} />

        <Controller
          name="sportId"
          control={control}
          render={({ field }) => (
            <LabeledField label="Přiřazený sport" className={errors.sportId ? "border-red-500" : ""}>
              <SportPicker
                sports={sports}
                selectedId={String(field.value || "")}
                onSelect={(id) => field.onChange(id)}
                disabled={disabled || sports.length === 1}
              />
              {errors.sportId && <p className="text-xs text-error mt-1">{errors.sportId.message as string}</p>}
            </LabeledField>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormLabeledInput
          label="E-mail"
          type="email"
          name="email"
          placeholder="jan.novak@vskub.cz"
          disabled={disabled}
        />
        <FormLabeledInput
          label="Telefon"
          type="tel"
          name="phone"
          placeholder="+420 123 456 789"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
