"use client";

import {useActionState, useEffect, useState} from "react";
import {createUser} from "@/actions/admin/users";
import LabeledInput from "@/components/Common/LabeledInput";
import AppButton from "@/components/Common/AppButton";
import LabeledSelect from "@/components/Common/LabeledSelect";


const initialState = {
    error: null,
    fieldErrors: {},
    success: false,
};

export default function CreateUserForm({ onSuccess, roles }) {
    const [state, action, pending] = useActionState(createUser, initialState);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const roleOptions = roles.map((role) => ({ label: role.name, value: role.id.toString() }));

    useEffect(() => {
        if (state?.success) {
            onSuccess?.();
        }
    }, [state?.success]);

    return (
        <div className="w-full">
            <h1 className="mb-6 text-2xl font-display font-bold text-on-surface">Vytvořit uživatele</h1>
            <form action={action} className="space-y-4">
                <LabeledInput value={firstName} name="firstName" label="Jméno" onChange={setFirstName} required/>
                <LabeledInput value={lastName} name="lastName" label="Příjmení" onChange={setLastName} required/>
                <LabeledInput value={email} name="email" type="email" label="Email" onChange={setEmail} required/>

                <LabeledSelect label="Role" name="editorRoleId" value={role} onChange={setRole} options={roleOptions} required/>

                {state?.error && (
                    <div className="text-red-500">
                        {state.error}
                    </div>
                )}

                <AppButton type="submit" disabled={pending}>
                    {pending ? "Vytvářím..." : "Vytvořit"}
                </AppButton>
            </form>
        </div>
    );
}
