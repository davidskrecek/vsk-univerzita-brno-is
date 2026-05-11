import { useTransition } from "react";
import { resendInvitationAction } from "@/actions/admin/users/manage-invitations";
import { useToast } from "@/hooks/useToast";

export function useUserInvitation(userId: number, email: string, onResult: () => void) {
    const [isPending, startTransition] = useTransition();
    const toast = useToast();

    const handleResend = () => {
        startTransition(async () => {
            try {
                const res = await resendInvitationAction({ personnelId: userId, email });
                if (res.success) {
                    toast.success("E-mail byl úspěšně odeslán.");
                    onResult();
                } else {
                    toast.error(res.error || "Chyba při odesílání e-mailu.");
                }
            } catch (error) {
                toast.error("Neočekávaná chyba při odesílání e-mailu.");
            }
        });
    };

    return {
        handleResend,
        isPending
    };
}

