import React from "react";
import { User as UserIcon } from "lucide-react";
import LabeledInput from "@/components/ui/Forms/LabeledInput";
import { CollapsibleSection } from "@/components/features/admin/UserForm/CollapsibleSection";

type TrainerFieldsProps = {
    category: string;
    setCategory: (val: string) => void;
    defaultOpen?: boolean;
    disabled?: boolean;
};

export const TrainerFields = ({
    category,
    setCategory,
    defaultOpen,
    disabled
}: TrainerFieldsProps) => {
    return (
        <CollapsibleSection title="Trenér" icon={UserIcon} defaultOpen={defaultOpen}>
            <LabeledInput
                label="Kategorie trenéra"
                value={category}
                onChange={setCategory}
                placeholder="Např. I. třída"
                disabled={disabled}
            />
        </CollapsibleSection>
    );
};

