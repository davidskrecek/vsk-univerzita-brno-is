"use client";

import React, { createContext, useState, useCallback } from "react";
import { ConfirmOptions, ConfirmContextValue } from "@/types/feedback";
import { ConfirmationDialog } from "@/components/ui/Overlay/ConfirmationDialog";

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
    const [config, setConfig] = useState<ConfirmOptions | null>(null);
    const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfig(options);
            setResolveCallback(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        resolveCallback?.(true);
        setConfig(null);
    };

    const handleCancel = () => {
        resolveCallback?.(false);
        setConfig(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <ConfirmationDialog
                isOpen={!!config}
                title={config?.title || ""}
                message={config?.message || ""}
                confirmLabel={config?.confirmLabel}
                cancelLabel={config?.cancelLabel}
                type={config?.type}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
};

