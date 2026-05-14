"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

import AppButton from "@/components/ui/Actions/AppButton";
import FormLabeledInput from "@/components/ui/Forms/FormLabeledInput";
import { setPassword } from "@/actions/admin/setPassword";
import { useToast } from "@/hooks/useToast";
import { ResetPasswordFormSchema, resetPasswordFormSchema } from "@/schemas/auth/resetPasswordSchema";

type SetPasswordProps = {
  token: string;
  onSuccess?: () => void;
  showOldPassword?: boolean;
};

export default function SetPasswordForm({ token, onSuccess, showOldPassword }: SetPasswordProps) {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ResetPasswordFormSchema>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: ResetPasswordFormSchema) => {
    const result = await setPassword({ ...data, token });

    if (result.success === true) {
      toast.success("Heslo bylo úspěšně nastaveno.");
      onSuccess?.();
    } else {
      toast.error(result.error || "Nastavení hesla se nezdařilo.");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {showOldPassword && <FormLabeledInput label="Původní heslo" type="password" name="oldPassword" />}

        <div className="relative">
          <FormLabeledInput label="Nové heslo" type={showPassword ? "text" : "password"} name="password" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-10 text-[#121212] hover:text-primary transition-colors focus:outline-none p-1"
          >
            {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
          </button>
        </div>

        <FormLabeledInput label="Potvrzení hesla" type={showPassword ? "text" : "password"} name="confirmPassword" />

        <AppButton type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Ukládám..." : "Uložit heslo"}
        </AppButton>
      </form>
    </FormProvider>
  );
}
