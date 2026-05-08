"use client";

import { useState } from "react";
import AppButton from "@/components/Common/AppButton";
import Modal from "@/components/Overlay/Modal";
import UsersTable from "@/components/Admin/UserTable";
import CreateUserForm from "@/components/Forms/CreateUserForm";
import {sendPasswordEmail} from "@/actions/admin/users";
import {useToast} from "@/hooks/useToast";

export default function UserManagementClient({ users, roles }) {
    const toast = useToast();

    const [open, setOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const onEdit = (user) => {
        setEditingUser(user);
        setOpen(true);
    }

    const onCreate = () => {
        setEditingUser(null);
        setOpen(true);
    };

    const onPasswordRestart = async (user) => {
        const res = await sendPasswordEmail(user);
        if(res.success) {
            toast.success("Email pro restart hesla byl odeslán");
        } else {
            toast.error("Nepodařilo se odeslat email pro restart hesla");
        }
    }

    return (<>
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">
                    Správa uživatelů
                </h1>

                <AppButton onClick={onCreate}>
                    Vytvořit uživatele
                </AppButton>
            </div>

            <UsersTable users={users} onEdit={(user) => onEdit(user)} onPasswordRestart={(user) => onPasswordRestart(user)}/>

            {open && (
                <Modal onClose={() => setOpen(false)}  contentClassName="max-w-lg w-full">
                    <div className="rounded-md border border-outline-variant bg-surface-container-low p-6 shadow-ambient">
                        <CreateUserForm onSuccess={() => setOpen(false)} roles={roles} user={editingUser}/>
                    </div>
                </Modal>
            )}
        </>
    );
}
