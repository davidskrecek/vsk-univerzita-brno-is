"use client";

import { useState } from "react";
import SectionActionButton from "@/components/ui/Actions/SectionActionButton";
import { AnimatePresence } from "framer-motion";
import CreateUserForm from "@/components/features/admin/CreateUserForm";
import Modal from "@/components/ui/Overlay/Modal";
import { Role } from "@/lib/queries/roles";
import { useToast } from "@/hooks/useToast";
import { Pencil } from "lucide-react";
import Spinner from "@/components/ui/Feedback/Spinner";
import { getUserById } from "@/actions/admin/users/get-user";
import { FullUser as User } from "@/actions/admin/users/schemas";

type EditUserButtonProps = {
    label?: string;
    roles: Role[];
    userId?: string;
    iconOnly?: boolean;
    children?: React.ReactNode;
    disabled?: boolean;
}

export const EditUserButton = ({ label, roles, userId, iconOnly, children, disabled }: EditUserButtonProps) => {

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
            } catch {
                toast.error("Nepodařilo se načíst kontakt");
                setIsOpen(false);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResult = (error?: string) => {
        if (error) {
            toast.error(
                isEdit
                    ? "Chyba při editaci uživatele: " + error
                    : "Chyba při vytváření uživatele: " + error
            );
        } else {
            toast.success(
                isEdit
                    ? "Kontakt byl upraven"
                    : "Kontakt byl vytvořen"
            );
        }

        setIsOpen(false);
    };

    return (
        <>
            {children ? (
                disabled ? (
                    children
                ) : (
                    <div onClick={openModal} className="cursor-pointer">
                        {children}
                    </div>
                )
            ) : iconOnly ? (
                <Pencil size={14} onClick={openModal} className="absolute bottom-10 right-4 text-primary/70 transition-colors hover:text-primary cursor-pointer" />
            ) : (
                <SectionActionButton label={label ?? ""} onClick={openModal} requiredPermission="users:manage" />
            )}

            <AnimatePresence>
                {isOpen && (
                    <>
                        {loading ? (
                            <Modal onClose={() => setIsOpen(false)} contentClassName="max-w-md w-full">
                                <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-12 flex justify-center">
                                    <Spinner size="lg" />
                                </div>
                            </Modal>
                        ) : (
                            <CreateUserForm
                                user={user ?? undefined}
                                onResult={(error) => handleResult(error)}
                                onCancel={() => setIsOpen(false)}
                                roles={roles}
                            />
                        )}
                    </>
                )}
            </AnimatePresence>
        </>
    );
};


