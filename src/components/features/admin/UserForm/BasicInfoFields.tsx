import React from "react";
import LabeledInput from "@/components/ui/Forms/LabeledInput";
import LabeledField from "@/components/ui/Forms/LabeledField";
import { SportPicker } from "@/components/ui/Pickers/SportPicker";
import { Sport } from "@/lib/queries/sports";

type BasicInfoFieldsProps = {
    fullName: string;
    setFullName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    sportId: string;
    setSportId: (val: string) => void;
    sports: Sport[];
    disabled?: boolean;
};

export const BasicInfoFields = ({
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    sportId,
    setSportId,
    sports,
    disabled
}: BasicInfoFieldsProps) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LabeledInput
                    label="Celé jméno"
                    value={fullName}
                    onChange={setFullName}
                    placeholder="Jan Novák"
                    disabled={disabled}
                />
                <LabeledField label="Přiřazený sport">
                    <SportPicker
                        sports={sports}
                        selectedId={sportId}
                        onSelect={setSportId}
                        disabled={disabled}
                    />
                </LabeledField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LabeledInput
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="jan.novak@vskub.cz"
                    disabled={disabled}
                />
                <LabeledInput
                    label="Telefon"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+420 123 456 789"
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

