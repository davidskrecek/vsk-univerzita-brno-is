"use client";

import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import ActionDropdown from "@/components/Overlay/ActionDropdown";
import AppButton from "@/components/Common/AppButton";
import LabeledField from "@/components/Common/LabeledField";
import LabeledInput from "@/components/Common/LabeledInput";
import LabeledTextarea from "@/components/Common/LabeledTextarea";

interface PartnerOrderFormProps {
  partners: Array<{ id: string; name: string }>;
  isSubmitting?: boolean;
  initialValues?: {
    partnerId?: string | null;
    fullName?: string;
    phone?: string;
    email?: string;
    details?: string;
  };
  onPartnerChange?: (partnerId: string | null) => void;
  onSubmit?: (draft: { partnerId: string; fullName: string; phone: string; email: string; details: string }) => void | Promise<void>;
}

const getPartnerInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const PartnerOrderForm = ({
  partners,
  isSubmitting = false,
  initialValues,
  onPartnerChange,
  onSubmit,
}: PartnerOrderFormProps) => {
  const [partnerId, setPartnerId] = useState<string | null>(initialValues?.partnerId ?? null);
  const [fullName, setFullName] = useState(initialValues?.fullName ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [details, setDetails] = useState(initialValues?.details ?? "");

  const handlePartnerChange = (value: string) => {
    const next = value || null;
    setPartnerId(next);
    onPartnerChange?.(next);
  };

  const submitDisabled = isSubmitting || !partnerId || !fullName || !phone || !email || !details;
  const partnerLabel = partnerId ? partners.find((p) => p.id === partnerId)?.name ?? null : null;

  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-6 sm:p-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <LabeledField label="Partner / Brand">
          <ActionDropdown
            align="start"
            contentClassName="min-w-[14rem] max-w-[calc(100vw-2rem)]"
            items={partners.map((p) => ({
              key: p.id,
              label: p.name,
              icon: (
                <span className="inline-flex h-5 w-8 shrink-0 items-center justify-center rounded-sm bg-surface-bright/90 px-1 text-[0.5rem] font-display font-bold uppercase text-on-surface/75">
                  {getPartnerInitials(p.name)}
                </span>
              ),
              onSelect: () => handlePartnerChange(p.id),
            }))}
            trigger={
              <button
                type="button"
                className="btn-secondary w-full py-3 px-4 text-sm font-sans outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors flex items-center justify-between gap-3"
              >
                <span className={partnerLabel ? "text-on-surface/70" : "text-on-surface/40"}>
                  {partnerLabel ?? "Vyberte partnera"}
                </span>
                <IoChevronDown className="text-on-surface/40" size={16} />
              </button>
            }
          />
        </LabeledField>

        <LabeledInput
          label="E-mail"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="jmeno@priklad.cz"
        />

        <LabeledInput
          label="Jméno"
          name="fullName"
          value={fullName}
          onChange={setFullName}
          placeholder="Jméno a příjmení"
        />

        <LabeledInput
          label="Telefon"
          name="phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+420 777 123 456"
        />
      </div>
      <LabeledTextarea
        label="Detaily objednávky"
        name="details"
        value={details}
        onChange={setDetails}
        placeholder="Např.: 2x Nutrend Protein tyčinka (Vanilka), 1x Top4Running Tričko vel. L (kód: 12345)..."
        rows={5}
      />

      <AppButton
        variant="primary"
        type="button"
        disabled={submitDisabled}
        className="w-full font-display uppercase tracking-widest text-[11px] py-4"
        onClick={() => {
          if (!partnerId || !fullName || !phone || !email || !details) return;
          onSubmit?.({ partnerId, fullName, phone, email, details });
        }}
      >
        {isSubmitting ? "Odesílání..." : "Odeslat objednávku"}
      </AppButton>
    </div>
  );
};

export default PartnerOrderForm;
