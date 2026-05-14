import React from "react";
import { useFormContext } from "react-hook-form";
import { User as UserIcon } from "lucide-react";
import FormLabeledInput from "@/components/ui/Forms/FormLabeledInput";
import { CollapsibleSection } from "@/components/features/admin/UserForm/CollapsibleSection";

type TrainerFieldsProps = {
    defaultOpen?: boolean;
    disabled?: boolean;
};

export const TrainerFields = ({
    defaultOpen,
    disabled
}: TrainerFieldsProps) => {
    return (
        <CollapsibleSection title="Trenér" icon={UserIcon} defaultOpen={defaultOpen}>
            <FormLabeledInput
                label="Kategorie trenéra"
                name="trainerCategory"
                placeholder="Např. I. třída"
                disabled={disabled}
            />
        </CollapsibleSection>
    );
};

