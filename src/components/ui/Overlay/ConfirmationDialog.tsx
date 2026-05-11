"use client";

import React from "react";
import Modal from "@/components/ui/Overlay/Modal";
import AppButton from "@/components/ui/Actions/AppButton";
import { AlertTriangle, Info } from "lucide-react";

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
    if (!isOpen) return null;

    const isDanger = type === "danger";

    return (
        <Modal onClose={onCancel} contentClassName="max-w-md w-full">
            <div className="bg-surface-container-high rounded-3xl border border-outline-variant/10 overflow-hidden shadow-2xl">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDanger ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
                            }`}>
                            {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
                        </div>
                        <h3 className="text-xl font-bold text-on-surface">
                            {title}
                        </h3>
                    </div>

                    <p className="text-on-surface/70 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-10">
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
    );
};

export default ConfirmationDialog;

