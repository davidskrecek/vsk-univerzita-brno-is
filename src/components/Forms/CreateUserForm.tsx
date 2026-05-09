"use client";

import AppButton from "@/components/Common/AppButton";
import {FormLabeledSelect} from "@/components/Common/FormLabeledSelect";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {createUserFormSchema, CreateUserFormSchema} from "@/schemas/user/createUserFormSchema";
import FormLabeledInput from "@/components/Common/FormLabeledInput";
import {createUser, updateUser} from "@/actions/admin/users";
import {Role} from "@/lib/queries/roles";
import {User} from "@/lib/queries/users";

type CreateUserFormProps = {
    onSuccess: () => void;
    onError: (message: string) => void;
    roles: Role[],
    user?: User
}

export default function CreateUserForm({ onSuccess, onError, roles, user }: CreateUserFormProps) {
    const form = useForm<CreateUserFormSchema>({
        resolver: zodResolver(createUserFormSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",
            editorRoleId: user?.editorRoleId ? user.editorRoleId : undefined,
            isActive: user?.isActive ?? true
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
            onError(result.error);
        }
    }

    const roleOptions = roles.map((role) => ({ label: role.name, value: role.id.toString() }));
    const isActiveOptions = [
        {label: "Aktivní", value: "true"},
        {label: "Neaktivní", value: "false"}];

    return (
        <FormProvider {...form}>
            <div className="w-full">
                <h1 className="mb-6 text-2xl font-display font-bold text-on-surface">{user ? 'Editovat uživatele' : 'Vytvořit uživatele'}</h1>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex gap-4">
                        <FormLabeledInput name="firstName" label="Jméno" placeholder="Jméno" className="w-full"/>
                        <FormLabeledInput name="lastName" label="Příjmení" placeholder="Příjmení" className="w-full"/>
                    </div>

                    <div className="flex gap-4">
                        <FormLabeledInput name="email" type="email" label="Email" placeholder="Zadejte email" className="w-full"/>
                        <FormLabeledInput name="phone" type="phone" label="Telefon" placeholder="Telefon" className="w-full"/>
                    </div>

                    <FormLabeledSelect label="Role" name="editorRoleId" options={roleOptions}/>
                    <FormLabeledSelect label="Stav" name="isActive" options={isActiveOptions}/>

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
