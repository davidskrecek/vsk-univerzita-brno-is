"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Overlay/Modal";
import SetPasswordForm from "@/components/features/auth/SetPasswordForm";
import { getUserByInvitationToken } from "@/actions/auth/invitations";
import { AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

export const SetPasswordModal = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const isReset = searchParams.get("reset") === "true";

    const [userData, setUserData] = useState<{ email: string; hasPassword: boolean; isFirstTime?: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (token) {
            setIsOpen(true);
            setLoading(true);
            getUserByInvitationToken(token).then((data) => {
                setUserData(data);
                setLoading(false);
            }).catch(() => {
                setLoading(false);
            });
        } else {
            setIsOpen(false);
        }
    }, [token]);

    const closeModal = () => {
        setIsOpen(false);
        // Remove token from URL
        const params = new URLSearchParams(searchParams.toString());
        params.delete("token");
        params.delete("reset");
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Modal onClose={closeModal} contentClassName="max-w-md w-full">
                    <div className="rounded-md border border-outline-variant/10 bg-surface-container-low p-6 shadow-ambient sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-display font-bold text-on-surface">
                                {userData?.isFirstTime ? "Aktivace účtu" : (userData?.hasPassword ? "Reset hesla" : "Nastavení hesla")}
                            </h2>
                            {loading ? (
                                <div className="mt-2 h-4 w-32 animate-pulse bg-on-surface/10 rounded" />
                            ) : userData ? (
                                <p className="mt-1 text-sm text-on-surface/60">
                                    Pro účet: <span className="text-primary font-medium">{userData.email}</span>
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-error">Neplatný nebo vypršelý odkaz.</p>
                            )}
                        </div>

                        {!loading && userData && (
                            <SetPasswordForm
                                token={token!}
                                onSuccess={closeModal}
                                showOldPassword={userData.hasPassword}
                            />
                        )}

                        {!loading && !userData && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Zavřít
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </AnimatePresence>
    );
};

