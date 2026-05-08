"use client";

import { useState } from "react";
import AppButton from "@/components/Common/AppButton";
import Modal from "@/components/Overlay/Modal";
import UsersTable from "@/components/Admin/UserTable";
import CreateUserForm from "@/components/Forms/CreateUserForm";

export default function UserManagementClient({ users, roles }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">
                    Správa uživatelů
                </h1>

                <AppButton onClick={() => setOpen(true)}>
                    Vytvořit uživatele
                </AppButton>
            </div>

            <UsersTable users={users}/>

            {open && (
                <Modal onClose={() => setOpen(false)}  contentClassName="max-w-lg w-full">
                    <div className="rounded-md border border-outline-variant bg-surface-container-low p-6 shadow-ambient">
                        <CreateUserForm onSuccess={() => setOpen(false)} roles={roles}/>
                    </div>
                </Modal>
            )}
        </>
    );
}
