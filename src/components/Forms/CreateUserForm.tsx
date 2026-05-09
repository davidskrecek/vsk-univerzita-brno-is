"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {createUser, updateUser} from "@/actions/admin/users";
import FormLabeledInput from "@/components/Common/FormLabeledInput";
import FormLabeledSelect from "@/components/Common/FormLabeledSelect";
import AppButton from "@/components/Common/AppButton";
import React from "react";
import FormCheckbox from "@/components/Common/FormCheckbox";
import {User} from "@/lib/queries/users";
import {CreateUserFormSchema, createUserFormSchema} from "@/schemas/user/createUserFormSchema";
import {Role} from "@/lib/queries/roles";
import {Sport} from "@/lib/queries/sports";


type CreateUserFormProps = {
    onResult: (error?: string) => void;
    roles: Role[];
    sports: Sport[];
    user?: User;
};

export default function CreateUserForm({onResult, roles, sports, user}: CreateUserFormProps) {
    const form = useForm<CreateUserFormSchema>({
        resolver: zodResolver(createUserFormSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",

            sportId: user?.sportId,

            editorRoleId: user?.editorRoleId
                ? user.editorRoleId.toString()
                : undefined,

            isActive: user?.isActive ?? true,

            isTrainer: user?.isTrainer ?? false,
            trainerCategory: user?.trainerCategory || "",

            isOfficial: user?.isOfficial ?? false,
            officialPosition: user?.officialPosition || "",

            managedSportIds:
                user?.managedSportIds?.map(String) || [],
        },
    });

    const isTrainer = form.watch("isTrainer");
    const isOfficial = form.watch("isOfficial");
    const isEditor = form.watch("isEditor");

    const onSubmit = async (data: CreateUserFormSchema) => {
        let result;

        if (user) {
            result = await updateUser({}, makeFormData({...data, personnelId: user.id}));
        } else {
            result = await createUser({}, makeFormData(data));
        }

        if (!result.error) {
            onResult();
        } else {
            onResult(result.error);
        }
    };

    const roleOptions = roles.map((role) => ({
        label: role.name,
        value: role.id.toString(),
    }));

    const sportOptions = sports.map((sport) => ({
        label: sport.name,
        value: sport.id,
    }));

    const isActiveOptions = [
        { label: "Aktivní", value: "true" },
        { label: "Neaktivní", value: "false" },
    ];

    return (
        <FormProvider {...form}>
            <div className="w-full">
                <h1 className="mb-6 text-2xl font-display font-bold text-on-surface">
                    {user ? "Editovat uživatele" : "Vytvořit uživatele"}
                </h1>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex gap-4">
                        <FormLabeledInput name="firstName" label="Jméno" placeholder="Jméno" className="w-full"/>
                        <FormLabeledInput name="lastName" label="Příjmení" placeholder="Příjmení" className="w-full"/>
                    </div>

                    <div className="flex gap-4">
                        <FormLabeledInput name="email" type="email" label="Email" placeholder="Zadejte email" className="w-full"/>
                        <FormLabeledInput name="phone" type="tel" label="Telefon" placeholder="Telefon" className="w-full"/>
                    </div>

                    <div className="flex gap-4">
                        <FormLabeledSelect label="Sport" name="sportId" options={sportOptions} className="w-full"/>
                        <FormLabeledSelect label="Role editora" name="editorRoleId" options={roleOptions} className="w-full"/>
                        <FormLabeledSelect label="Stav" name="isActive" options={isActiveOptions} className="w-full"/>
                    </div>

                    <div className="flex gap-6">
                        <FormCheckbox name="isTrainer" label="Trenér"/>
                        <FormCheckbox name="isOfficial" label="Rozhodčí"/>
                        <FormCheckbox name="isEditor" label="Editor"/>
                    </div>

                    {isTrainer && (
                        <FormLabeledInput name="trainerCategory" label="Kategorie trenéra" placeholder="Kategorie trenéra"/>
                    )}

                    {isOfficial && (
                        <FormLabeledInput name="officialPosition" label="Pozice rozhodčího" placeholder="Pozice rozhodčího"/>
                    )}

                    {isEditor && (
                        <>
                            <FormLabeledSelect label="Role editora" name="editorRoleId" options={roleOptions}/>
                            <FormLabeledSelect label="Spravované sporty" name="managedSportIds" options={sportOptions} multiple={true}/>
                        </>
                    )}

                    <AppButton type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Ukládám..." : user ? "Editovat" : "Vytvořit"}
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
            if (
                typeof value === "object" ||
                Array.isArray(value)
            ) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        }
    }

    return formData;
}
