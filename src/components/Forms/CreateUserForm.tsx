"use client";

import AppButton from "@/components/Common/AppButton";
import {FormLabeledSelect} from "@/components/Common/FormLabeledSelect";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {createUserFormSchema, CreateUserFormSchema} from "@/schemas/user/createUserFormSchema";
import FormLabeledInput from "@/components/Common/FormLabeledInput";
import {createUser, updateUser} from "@/actions/admin/users";
import {useToast} from "@/hooks/useToast";

export default function CreateUserForm({ onSuccess, roles, user }) {
    const toast = useToast();
    const form = useForm<CreateUserFormSchema>({
        resolver: zodResolver(createUserFormSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",
            editorRoleId: user?.editorRoleId ? user.editorRoleId : undefined,
        }
    });

    const onSubmit = async (data: CreateUserFormSchema)=> {
        let result;

        if(user) {
            result = await updateUser({}, makeFormData({...data, personnelId: user.id}));
        } else {
            result = await createUser({}, makeFormData(data));
        }

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
                <h1 className="mb-6 text-2xl font-display font-bold text-on-surface">{user ? 'Editovat uživatele' : 'Vytvořit uživatele'}</h1>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormLabeledInput name="firstName" label="Jméno" />
                    <FormLabeledInput name="lastName" label="Příjmení" />
                    <FormLabeledInput name="email" type="email" label="Email"/>
                    <FormLabeledInput name="phone" type="phone" label="Telefon"/>

                    <FormLabeledSelect label="Role" name="editorRoleId" options={roleOptions}/>

                    <AppButton type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Vytvářím..." : user ? 'Editovat' : 'Vytvořit'}
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
