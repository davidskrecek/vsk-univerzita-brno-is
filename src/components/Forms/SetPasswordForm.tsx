"use client";

import AppButton from "@/components/Common/AppButton";
import {
    ResetPasswordFormSchema,
    resetPasswordFormSchema,
} from "@/schemas/auth/resetPasswordSchema";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FormLabeledInput from "@/components/Common/FormLabeledInput";
import {setPassword} from "@/actions/admin/setPassword";
import {useRouter} from "next/navigation";
import {useToast} from "@/hooks/useToast";

type SetPasswordProps = {
    token: string;
}

export default function SetPasswordForm({ token }: SetPasswordProps) {
    const router = useRouter();
    const toast = useToast();

    const form = useForm<ResetPasswordFormSchema>({
        resolver: zodResolver(resetPasswordFormSchema),
    });

    const onSubmit = async (data: ResetPasswordFormSchema) => {
        const result = await setPassword({...data, token: token});

        console.log("ON SUBMIT RESULT " + JSON.stringify(result));

        if(result.success === true) {
            router.push("/");
        } else {
            toast.error("Nastavení hesla se nezdařilo. Odkaz pro nastavení hesla je neplatný a nebo vypršela jeho platnost.");
        }
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormLabeledInput label="Nové heslo" name="password" type="password"/>
                <FormLabeledInput label="Potvrzení hesla" name="confirmPassword" type="password"/>

                <AppButton type="submit" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? "Nastavuji heslo..." : "Nastavit heslo"}
                </AppButton>
            </form>
        </FormProvider>
    )
}
