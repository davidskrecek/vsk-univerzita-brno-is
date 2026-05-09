"use client";

import {useSession} from "next-auth/react";
import React, {useState} from "react";
import SectionActionButton from "@/components/Common/SectionActionButton";
import {AnimatePresence} from "framer-motion";
import CreateUserForm from "@/components/Forms/CreateUserForm";
import Modal from "@/components/Overlay/Modal";
import {Role} from "@/lib/queries/roles";
import {useToast} from "@/hooks/useToast";
import {Sport} from "@/lib/queries/sports";

type CreateUserFormButtonProps = {
    label: string;
    roles: Role[];
    sports: Sport[];
}

export const CreateUserFormButton = ({ label, roles, sports }: CreateUserFormButtonProps) => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    const toast = useToast();

    const handleResult = (error?: string) => {
        if(error) {
            toast.error("Chyba při vytváření uživatele: " + error);
        } else {
            toast.success("Uživatel byl vytvořen");
        }

        setIsOpen(false);
    }

    return (
        <>
            <SectionActionButton label={label} onClick={() => setIsOpen(true)} requiredRoles={["superadmin"]}/>

            <AnimatePresence>
                {isOpen && (
                    <Modal onClose={() => setIsOpen(false)} contentClassName="max-w-4xl w-full">
                        <div className="rounded-md border border-outline-variant bg-surface-container-low p-6 shadow-ambient">
                            <CreateUserForm onResult={(error) => handleResult(error)} roles={roles} sports={sports}/>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
};

