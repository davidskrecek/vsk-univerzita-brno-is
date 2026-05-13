"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isSuperAdminRole } from "@/lib/constants/roles";
import AppButton from "@/components/ui/Actions/AppButton";
import { IoClose } from "react-icons/io5";
import { FullUser } from "@/actions/admin/users/schemas";
import { Role } from "@/lib/queries/roles";
import { createUserAction } from "@/actions/admin/users/create-user";
import { updateUserAction } from "@/actions/admin/users/update-user";
import { deleteUserAction, activateUserAction } from "@/actions/admin/users/delete-user";
import { useConfirm } from "@/hooks/useConfirm";

import { BasicInfoFields } from "./UserForm/BasicInfoFields";
import { TrainerFields } from "./UserForm/TrainerFields";
import { EditorFields } from "./UserForm/EditorFields";
import { AccountSecuritySection } from "./UserForm/AccountSecuritySection";
import Modal from "@/components/ui/Overlay/Modal";
import { useSports } from "@/components/features/sports/SportsProvider";

type CreateUserFormProps = {
    onResult: (error?: string) => void;
    onCancel?: () => void;
    roles: Role[];
    user?: FullUser;
};

export default function CreateUserForm({ onResult, onCancel, roles, user }: CreateUserFormProps) {
    const { data: session } = useSession();
    const { sports } = useSports();
    const confirm = useConfirm();

    const accessibleSports = useMemo(() => {
        if (!session?.user) return [];
        const isSuperAdmin = isSuperAdminRole(session.user.role);
        if (isSuperAdmin) return sports;
        return sports.filter(s => session.user.managedSportIds?.includes(s.id));
    }, [sports, session]);

    const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [sportId, setSportId] = useState(user?.sportId ? String(user.sportId) : "");
    const [editorType, setEditorType] = useState<"none" | "editor" | "admin">(
        user?.editor?.editorRole?.name === "sport_manager" ? "admin" : (user?.editor ? "editor" : "none")
    );
    const [permissions, setPermissions] = useState(() => {
        const existing = user?.editor?.permissions as Record<string, boolean> | undefined;
        return {
            posts: existing?.["posts:full"] ? "full" : existing?.["posts:write"] ? "write" : "write",
            events: existing?.["events:full"] ? "full" : existing?.["events:write"] ? "write" : "write"
        };
    });
    const [trainerCategory, setTrainerCategory] = useState(user?.trainer?.category || "");

    useEffect(() => {
        if (!user && !sportId && accessibleSports.length === 1) {
            setSportId(String(accessibleSports[0].id));
        }
    }, [accessibleSports, user, sportId]);

    const handleDelete = async () => {
        if (!user?.id) return;
        const isConfirmed = await confirm({
            title: "Smazat kontakt",
            message: "Opravdu chcete tento kontakt odstranit ze systému? Tato akce je nevratná.",
            confirmLabel: "Smazat",
            type: "danger"
        });
        if (!isConfirmed) return;

        const result = await deleteUserAction({ id: Number(user.id) });
        if (result.success) onResult();
        else onResult(result.error);
    };
    const handleActivate = async () => {
        if (!user?.id) return;
        const isConfirmed = await confirm({
            title: "Aktivovat kontakt",
            message: "Opravdu chcete tento kontakt znovu aktivovat? Bude se opět zobrazovat v seznamu kontaktů.",
            confirmLabel: "Aktivovat",
            type: "primary"
        });
        if (!isConfirmed) return;

        const result = await activateUserAction({ id: Number(user.id) });
        if (result.success) onResult();
        else onResult(result.error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user && user.isActive) {
            const isConfirmed = await confirm({
                title: "Uložit změny",
                message: "Opravdu chcete uložit provedené změny v profilu uživatele?",
                confirmLabel: "Uložit",
                type: "primary"
            });
            if (!isConfirmed) return;
        }

        const [firstName = "", ...lastNames] = fullName.trim().split(/\s+/);
        const lastName = lastNames.join(" ");

        const formData = new FormData();
        if (user?.id) formData.append("personnelId", String(user.id));
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("email", email);
        formData.append("phone", phone);
        if (sportId) formData.append("sportId", sportId);
        formData.append("isActive", String(user?.isActive ?? true));

        const hasAccess = editorType !== "none";
        formData.append("isEditor", String(hasAccess));

        if (hasAccess) {
            const roleName = editorType === "admin" ? "sport_manager" : "editor";
            const targetRole = roles.find(r => r.name === roleName);
            if (targetRole) formData.append("editorRoleId", String(targetRole.id));

            const finalPerms: Record<string, boolean> = {};
            if (editorType === "admin") {
                finalPerms["users:manage"] = true;
                finalPerms["posts:write"] = true;
                finalPerms["posts:full"] = true;
                finalPerms["events:write"] = true;
                finalPerms["events:full"] = true;
            } else {
                finalPerms["posts:write"] = true;
                if (permissions.posts === "full") finalPerms["posts:full"] = true;
                finalPerms["events:write"] = true;
                if (permissions.events === "full") finalPerms["events:full"] = true;
            }
            formData.append("permissions", JSON.stringify(finalPerms));
        }

        if (trainerCategory) {
            formData.append("isTrainer", "true");
            formData.append("trainerCategory", trainerCategory);
        }

        const result = user?.id
            ? await updateUserAction(formData)
            : await createUserAction(formData);

        if (result.success) onResult();
        else onResult(result.error);
    };

    const isActive = user?.isActive ?? true;

    return (
        <Modal onClose={onCancel} contentClassName="max-w-4xl w-full">
            <form onSubmit={handleSubmit} className="relative w-full h-full">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="absolute right-4 top-4 z-20 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
                        aria-label="Zavřít formulář"
                    >
                        <IoClose size={20} />
                    </button>
                )}
                <div className="flex flex-col max-h-[calc(100vh-10rem)] bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
                    <div className="px-6 py-6 sm:px-8 bg-surface-container-low border-b border-outline-variant/5 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wider text-on-surface">
                                {user ? "Upravit uživatele" : "Nový uživatel"}
                            </h2>
                            <p className="text-[11px] font-sans uppercase tracking-widest text-on-surface/30 mt-1">
                                {user ? "Administrace uživatelského účtu" : "Vytvoření nového kontaktu"}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar" style={{ scrollbarGutter: 'stable both-edges' }}>
                        <fieldset disabled={!isActive} className="space-y-8">
                            <BasicInfoFields
                                fullName={fullName} setFullName={setFullName}
                                email={email} setEmail={setEmail}
                                phone={phone} setPhone={setPhone}
                                sportId={sportId} setSportId={setSportId}
                                sports={accessibleSports}
                                disabled={!isActive}
                            />

                            <fieldset disabled={!sportId || !isActive} className="space-y-4">
                                <TrainerFields
                                    category={trainerCategory}
                                    setCategory={setTrainerCategory}
                                    defaultOpen={!!user?.trainer}
                                    disabled={!isActive}
                                />

                                <EditorFields
                                    editorType={editorType}
                                    setEditorType={setEditorType}
                                    permissions={permissions}
                                    setPermissions={setPermissions}
                                    sportId={sportId}
                                    isActive={isActive}
                                >
                                    {user && (
                                        <AccountSecuritySection
                                            userId={user.id}
                                            email={user.email}
                                            editor={user.editor}
                                            invitations={user.invitationsReceived}
                                            onResult={onResult}
                                        />
                                    )}
                                </EditorFields>
                            </fieldset>
                        </fieldset>
                    </div>

                    <div className="p-4 sm:p-6 bg-surface-container-low border-t border-outline-variant/5">
                        <div className={`flex flex-row items-center gap-3 ${user ? "justify-between" : "justify-end"}`}>
                            {user && (
                                isActive ? (
                                    <AppButton type="button" variant="danger" onClick={handleDelete} isUppercase className="px-6">
                                        Smazat kontakt
                                    </AppButton>
                                ) : (
                                    <AppButton type="button" variant="primary" onClick={handleActivate} isUppercase className="px-6">
                                        Aktivovat kontakt
                                    </AppButton>
                                )
                            )}
                            <div className="flex gap-3">
                                <AppButton type="button" variant="tertiary" onClick={onCancel} isUppercase className="px-6">
                                    {user && !user.isActive ? "Zavřít" : "Zrušit"}
                                </AppButton>
                                {isActive && (
                                    <AppButton type="submit" variant="primary" isUppercase className="px-6" disabled={!fullName || !email || !sportId}>
                                        {user ? "Uložit změny" : "Vytvořit kontakt"}
                                    </AppButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

