"use client";

import React, {useState} from "react";
import SectionActionButton from "@/components/Common/SectionActionButton";
import {AnimatePresence} from "framer-motion";
import CreateUserForm from "@/components/Forms/CreateUserForm";
import Modal from "@/components/Overlay/Modal";
import {Role} from "@/lib/queries/roles";
import {useToast} from "@/hooks/useToast";
import {Sport} from "@/lib/queries/sports";
import {Pencil} from "lucide-react";
import MiniSpinner from "@/components/Common/MiniSpinner";
import {getUserById, User} from "@/actions/admin/users";

type UserFormModalButtonProps = {
    label?: string;
    roles: Role[];
    sports: Sport[];

    userId?: string;
    iconOnly?: boolean;
}

export const UserFormModalButton = ({label, roles, sports, userId, iconOnly}: UserFormModalButtonProps) => {

    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>();
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const isEdit = !!userId;

    const openModal = async () => {
        setIsOpen(true);

        if (userId) {
            try {
                setLoading(true);
                const loadedUser = (await getUserById(Number(userId))) as User;
                setUser(loadedUser);
            } catch (e) {
                toast.error("Nepodařilo se načíst uživatele");
                setIsOpen(false);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResult = (error?: string) => {
        if(error) {
            toast.error(
                isEdit
                    ? "Chyba při editaci uživatele: " + error
                    : "Chyba při vytváření uživatele: " + error
            );
        } else {
            toast.success(
                isEdit
                    ? "Uživatel byl upraven"
                    : "Uživatel byl vytvořen"
            );
        }

        setIsOpen(false);
    };

    return (
        <>
            {iconOnly ? (
                <Pencil size={14} onClick={openModal} className="absolute bottom-4 right-4 text-primary/70 transition-colors hover:text-primary cursor-pointer"/>
            ) : (
                <SectionActionButton label={label ?? ""} onClick={openModal} requiredRoles={["superadmin"]}/>
            )}

            <AnimatePresence>
                {isOpen && (
                    <Modal onClose={() => setIsOpen(false)} contentClassName="max-w-4xl w-full">
                        <div className="rounded-md border border-outline-variant bg-surface-container-low p-6 shadow-ambient">

                            {loading ? (
                                <MiniSpinner />
                            ) : (
                                <CreateUserForm user={user ?? undefined} onResult={(error) => handleResult(error)} roles={roles} sports={sports}/>
                            )}

                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
};
