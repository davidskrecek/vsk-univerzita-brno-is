"use client";

import React from "react";
import Modal from "@/components/ui/Overlay/Modal";
import AppButton from "@/components/ui/Actions/AppButton";
import { AlertTriangle, Info } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: "primary" | "danger";
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationDialog = ({
    isOpen,
    title,
    message,
    confirmLabel = "Potvrdit",
    cancelLabel = "Zrušit",
    type = "primary",
    onConfirm,
    onCancel
}: ConfirmationDialogProps) => {
    const isDanger = type === "danger";

    return (
        <AnimatePresence>
            {isOpen && (
                <Modal onClose={onCancel} contentClassName="max-w-md w-full">
                    <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 shadow-ambient overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isDanger ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}>
                                    {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
                                </div>
                                <h3 className="text-xl font-bold text-on-surface">
                                    {title}
                                </h3>
                            </div>

                            <p className="text-on-surface/70 leading-relaxed text-sm sm:text-base">
                                {message}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 mt-8">
                                <AppButton
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={onCancel}
                                >
                                    {cancelLabel}
                                </AppButton>
                                <AppButton
                                    variant={isDanger ? "danger" : "primary"}
                                    className="flex-1"
                                    onClick={onConfirm}
                                >
                                    {confirmLabel}
                                </AppButton>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationDialog;

