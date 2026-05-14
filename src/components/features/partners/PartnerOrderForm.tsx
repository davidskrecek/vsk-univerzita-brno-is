"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoChevronDown } from "react-icons/io5";
import ActionDropdown from "@/components/ui/Actions/ActionDropdown";
import AppButton from "@/components/ui/Actions/AppButton";
import LabeledField from "@/components/ui/Forms/LabeledField";
import FormLabeledInput from "@/components/ui/Forms/FormLabeledInput";
import FormLabeledTextarea from "@/components/ui/Forms/FormLabeledTextarea";
import { partnerOrderFormSchema, type PartnerOrderFormData } from "@/schemas/partners/partnerOrderFormSchema";

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
  onSubmit?: (draft: PartnerOrderFormData) => void | Promise<void>;
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
  const defaultValues: PartnerOrderFormData = {
    partnerId: initialValues?.partnerId ?? "",
    fullName: initialValues?.fullName ?? "",
    phone: initialValues?.phone ?? "",
    email: initialValues?.email ?? "",
    details: initialValues?.details ?? "",
  };

  const form = useForm<PartnerOrderFormData>({
    resolver: zodResolver(partnerOrderFormSchema) as any,
    defaultValues,
    mode: "onChange",
  });

  const { formState: { isSubmitting: isFormSubmitting, errors } } = form;
  const partnerId = form.watch("partnerId");
  
  const partnerLabel = partnerId ? partners.find((p) => p.id === partnerId)?.name ?? null : null;

  const handlePartnerChange = (value: string) => {
    form.setValue("partnerId", value);
    onPartnerChange?.(value || null);
  };

  const handleFormSubmit = async (data: PartnerOrderFormData) => {
    await onSubmit?.(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <LabeledField label="Partner / Brand" className={errors.partnerId ? "border-red-500" : ""}>
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
                  className={`btn-secondary w-full py-3 px-4 text-sm font-sans outline-none border transition-colors flex items-center justify-between gap-3 ${
                    errors.partnerId
                      ? "border-red-500"
                      : "border-outline-variant/10 focus:border-primary/40"
                  }`}
                >
                  <span className={partnerLabel ? "text-on-surface/70" : "text-on-surface/40"}>
                    {partnerLabel ?? "Vyberte partnera"}
                  </span>
                  <IoChevronDown className="text-on-surface/40" size={16} />
                </button>
              }
            />
            {errors.partnerId && (
              <p className="text-xs text-error mt-1">{errors.partnerId.message}</p>
            )}
          </LabeledField>

          <FormLabeledInput
            label="E-mail"
            type="email"
            name="email"
            placeholder="jmeno@priklad.cz"
          />

          <FormLabeledInput
            label="Jméno"
            name="fullName"
            placeholder="Jméno a příjmení"
          />

          <FormLabeledInput
            label="Telefon"
            type="tel"
            name="phone"
            placeholder="+420 777 123 456"
          />
        </div>

        <FormLabeledTextarea
          label="Detaily objednávky"
          name="details"
          placeholder="Např.: 2x Nutrend Protein tyčinka (Vanilka), 1x Top4Running Tričko vel. L (kód: 12345)..."
          rows={5}
        />

        <AppButton
          variant="primary"
          type="submit"
          disabled={isFormSubmitting || isSubmitting}
          className="w-full font-display uppercase tracking-widest text-[11px] py-4"
        >
          {isFormSubmitting || isSubmitting ? "Odesílání..." : "Odeslat objednávku"}
        </AppButton>
      </form>
    </FormProvider>
  );
};

export default PartnerOrderForm;

