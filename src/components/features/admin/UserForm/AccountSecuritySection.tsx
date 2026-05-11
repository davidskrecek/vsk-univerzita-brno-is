import AppButton from "@/components/ui/Actions/AppButton";
import { useUserInvitation } from "@/hooks/useUserInvitation";
import { useOptimistic } from "react";

type AccountSecuritySectionProps = {
    userId: number;
    email: string;
    editor?: any;
    invitations?: any[];
    onResult: () => void;
};

export const AccountSecuritySection = ({
    userId,
    email,
    editor,
    invitations,
    onResult
}: AccountSecuritySectionProps) => {
    const { handleResend: originalHandleResend, isPending } = useUserInvitation(userId, email, onResult);

    const [optimisticInvitations, addOptimisticInvitation] = useOptimistic(
        invitations || [],
        (state: any[]) => [
            {
                id: -1,
                expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                isOptimistic: true,
            },
            ...state,
        ]
    );

    const handleResend = () => {
        addOptimisticInvitation(null);
        originalHandleResend();
    };

    if (!editor) return null;

    const isPendingAccount = editor.passwordHash === "PENDING";
    const lastInvitation = optimisticInvitations?.[0];

    const getStatusText = () => {
        if (lastInvitation?.isOptimistic) return "Odesílám pozvánku... (probíhá zápis)";
        if (!isPendingAccount) return "Uživatel má nastavené heslo. Můžete mu zaslat odkaz pro reset.";
        if (!lastInvitation) return "Uživatel ještě nemá nastavené heslo. Pozvánku můžete odeslat zde.";
        if (lastInvitation.usedAt) return "Pozvánka byla využita, uživatel by si měl nastavit heslo.";

        const isExpired = new Date(lastInvitation.expiresAt) < new Date();
        if (isExpired) return "Předchozí pozvánka již vypršela. Pošlete prosím novou.";

        return `Pozvánka odeslána. Platí do ${new Date(lastInvitation.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    };

    return (
        <div className="mt-6 pt-6 border-t border-outline-variant/5">
            <div className="flex items-center justify-between bg-primary/5 rounded-xl p-4 border border-primary/10">
                <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest">
                        Zabezpečení účtu
                    </h4>
                    <p className="text-xs text-on-surface/50 mt-1">
                        {getStatusText()}
                    </p>
                </div>
                <AppButton
                    type="button"
                    variant="tertiary"
                    className="text-xs whitespace-nowrap"
                    onClick={handleResend}
                    isLoading={isPending}
                >
                    {isPendingAccount ? "Znovu poslat pozvánku" : "Resetovat heslo"}
                </AppButton>
            </div>
        </div>
    );
};

