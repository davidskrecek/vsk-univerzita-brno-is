"use client";

import AppButton from "@/components/Common/AppButton";
import {FormLabeledSelect} from "@/components/Common/FormLabeledSelect";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {createUserFormSchema, CreateUserFormSchema} from "@/schemas/user/createUserFormSchema";
import FormLabeledInput from "@/components/Common/FormLabeledInput";
import {createUser} from "@/actions/admin/users";
import {useToast} from "@/hooks/useToast";


export default function CreateUserForm({ onSuccess, roles }) {
    const toast = useToast();
    const form = useForm<CreateUserFormSchema>({
        resolver: zodResolver(createUserFormSchema),
    });

    const onSubmit = async (data: CreateUserFormSchema)=> {
        const result = await createUser({}, makeFormData(data));

        if(!result.error) {
            onSuccess();
        } else {
            toast.error("Nepodařilo se vytvořit uživatele");
        }
    }

    const roleOptions = roles.map((role) => ({ label: role.name, value: role.id.toString() }));

    return (
        <FormProvider {...form}>
            <div className="w-full">
                <h1 className="mb-6 text-2xl font-display font-bold text-on-surface">Vytvořit uživatele</h1>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormLabeledInput name="firstName" label="Jméno" />
                    <FormLabeledInput name="lastName" label="Příjmení" />
                    <FormLabeledInput name="email" type="email" label="Email"/>

                    <FormLabeledSelect label="Role" name="editorRoleId" options={roleOptions}/>

                    <AppButton type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Vytvářím..." : "Vytvořit"}
                    </AppButton>
                </form>
            </div>
        </FormProvider>
    );
}

function makeFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
            if (typeof value === "object" && !Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        }
    }
    return formData;
}
