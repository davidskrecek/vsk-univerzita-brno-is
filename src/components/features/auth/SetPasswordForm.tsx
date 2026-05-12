"use client";

import AppButton from "@/components/ui/Actions/AppButton";
import LabeledInput from "@/components/ui/Forms/LabeledInput";
import {
    ResetPasswordFormSchema,
    resetPasswordFormSchema,
} from "@/schemas/auth/resetPasswordSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setPassword } from "@/actions/admin/setPassword";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

type SetPasswordProps = {
    token: string;
    onSuccess?: () => void;
    showOldPassword?: boolean;
}

export default function SetPasswordForm({ token, onSuccess, showOldPassword }: SetPasswordProps) {
    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue
    } = useForm<ResetPasswordFormSchema>({
        resolver: zodResolver(resetPasswordFormSchema),
        defaultValues: {
            oldPassword: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (data: ResetPasswordFormSchema) => {
        const result = await setPassword({ ...data, token: token });

        if (result.success === true) {
            toast.success("Heslo bylo úspěšně nastaveno.");
            onSuccess?.();
        } else {
            toast.error(result.error || "Nastavení hesla se nezdařilo.");
        }
    }

    const password = watch("password");
    const confirmPassword = watch("confirmPassword");
    const oldPassword = watch("oldPassword");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {showOldPassword && (
                <LabeledInput
                    label="Původní heslo"
                    type="password"
                    value={oldPassword || ""}
                    onChange={(val) => setValue("oldPassword", val)}
                    error={errors.oldPassword?.message}
                />
            )}

            <LabeledInput
                label="Nové heslo"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(val) => setValue("password", val)}
                error={errors.password?.message}
                rightElement={
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#121212] hover:text-primary transition-colors focus:outline-none p-1"
                    >
                        {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                }
            />

            <LabeledInput
                label="Potvrzení hesla"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(val) => setValue("confirmPassword", val)}
                error={errors.confirmPassword?.message}
            />

            <AppButton
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Ukládám..." : "Uložit heslo"}
            </AppButton>
        </form>
    )
}

