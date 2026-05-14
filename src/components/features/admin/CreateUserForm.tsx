"use client";

import { useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AppButton from "@/components/ui/Actions/AppButton";
import CloseButton from "@/components/ui/Actions/CloseButton";
import Modal from "@/components/ui/Overlay/Modal";
import { Role } from "@/lib/queries/roles";
import { isSuperAdminRole } from "@/lib/constants/roles";
import { createUserAction } from "@/actions/admin/users/create-user";
import { updateUserAction } from "@/actions/admin/users/update-user";
import { deleteUserAction, activateUserAction } from "@/actions/admin/users/delete-user";
import { FullUser } from "@/actions/admin/users/schemas";
import { useConfirm } from "@/hooks/useConfirm";
import { createUserFormSchema, type CreateUserFormData } from "@/schemas/users/createUserFormSchema";
import { useSports } from "@/components/features/sports/SportsProvider";

import { BasicInfoFields } from "@/components/features/admin/UserForm/BasicInfoFields";
import { TrainerFields } from "@/components/features/admin/UserForm/TrainerFields";
import { EditorFields } from "@/components/features/admin/UserForm/EditorFields";
import { AccountSecuritySection } from "@/components/features/admin/UserForm/AccountSecuritySection";

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
    return sports.filter((s) => session.user.managedSportIds?.includes(s.id));
  }, [sports, session]);

  const defaultPermissions = useMemo(() => {
    const existing = user?.editor?.permissions as Record<string, boolean> | undefined;
    return {
      posts: existing?.["posts:full"] ? "full" : "write",
      events: existing?.["events:full"] ? "full" : "write",
    };
  }, [user]);

  const defaultValues: CreateUserFormData = {
    fullName: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    phone: user?.phone || "",
    sportId: user?.sportId ? String(user.sportId) : "",
    editorType: user?.editor?.editorRole?.name === "sport_manager" ? "admin" : user?.editor ? "editor" : "none",
    permissions: defaultPermissions,
    trainerCategory: user?.trainer?.category || "",
  };

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema) as any,
    defaultValues,
    mode: "onChange",
  });

  const {
    formState: { isSubmitting },
    watch,
    setValue,
  } = form;

  const selectedSportId = watch("sportId");
  const isActive = user?.isActive ?? true;

  useEffect(() => {
    if (!user && !form.getValues("sportId") && accessibleSports.length === 1) {
      setValue("sportId", String(accessibleSports[0].id), { shouldValidate: true });
    }
  }, [accessibleSports, form, setValue, user]);

  const handleDelete = async () => {
    if (!user?.id) return;
    const isConfirmed = await confirm({
      title: "Smazat kontakt",
      message: "Opravdu chcete tento kontakt odstranit ze systému? Tato akce je nevratná.",
      confirmLabel: "Smazat",
      type: "danger",
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
      type: "primary",
    });
    if (!isConfirmed) return;

    const result = await activateUserAction({ id: Number(user.id) });
    if (result.success) onResult();
    else onResult(result.error);
  };

  const handleSubmit = async (data: CreateUserFormData) => {
    if (user && user.isActive) {
      const isConfirmed = await confirm({
        title: "Uložit změny",
        message: "Opravdu chcete uložit provedené změny v profilu uživatele?",
        confirmLabel: "Uložit",
        type: "primary",
      });
      if (!isConfirmed) return;
    }

    const [firstName = "", ...lastNames] = data.fullName.trim().split(/\s+/);
    const lastName = lastNames.join(" ");

    const formData = new FormData();
    if (user?.id) formData.append("personnelId", String(user.id));
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    if (data.sportId) formData.append("sportId", data.sportId);
    formData.append("isActive", String(user?.isActive ?? true));

    const hasAccess = data.editorType !== "none";
    if (hasAccess) {
      const roleName = data.editorType === "admin" ? "sport_manager" : "editor";
      const targetRole = roles.find((r) => r.name === roleName);
      if (targetRole) formData.append("editorRoleId", String(targetRole.id));

      if (data.sportId) {
        formData.append("managedSportIds", JSON.stringify([Number(data.sportId)]));
      }

      const finalPerms: Record<string, boolean> = {};
      if (data.editorType === "admin") {
        finalPerms["users:manage"] = true;
        finalPerms["posts:write"] = true;
        finalPerms["posts:full"] = true;
        finalPerms["events:write"] = true;
        finalPerms["events:full"] = true;
      } else {
        finalPerms["posts:write"] = true;
        if (data.permissions?.posts === "full") finalPerms["posts:full"] = true;
        finalPerms["events:write"] = true;
        if (data.permissions?.events === "full") finalPerms["events:full"] = true;
      }

      formData.append("permissions", JSON.stringify(finalPerms));
    }

    if (data.trainerCategory) {
      formData.append("isTrainer", "true");
      formData.append("trainerCategory", data.trainerCategory);
    }

    const result = user?.id ? await updateUserAction(formData) : await createUserAction(formData);

    if (result.success) onResult();
    else onResult(result.error);
  };

  return (
    <Modal onClose={onCancel} contentClassName="max-w-4xl w-full">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="relative w-full h-full">
          {onCancel && <CloseButton onClick={onCancel} ariaLabel="Zavřít formulář" />}

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

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar" style={{ scrollbarGutter: "stable both-edges" }}>
              <fieldset disabled={!isActive} className="space-y-8">
                <BasicInfoFields sports={accessibleSports} disabled={!isActive} />

                <fieldset disabled={!selectedSportId || !isActive} className="space-y-4">
                  <TrainerFields defaultOpen={!!user?.trainer} disabled={!isActive} />

                  <EditorFields sportId={selectedSportId as string | undefined} isActive={isActive} roles={roles} disabled={!isActive}>
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
                {user &&
                  (isActive ? (
                    <AppButton type="button" variant="danger" onClick={handleDelete} isUppercase className="px-6">
                      Smazat kontakt
                    </AppButton>
                  ) : (
                    <AppButton type="button" variant="primary" onClick={handleActivate} isUppercase className="px-6">
                      Aktivovat kontakt
                    </AppButton>
                  ))}
                <div className="flex gap-3">
                  <AppButton type="button" variant="tertiary" onClick={onCancel} isUppercase className="px-6">
                    {user && !user.isActive ? "Zavřít" : "Zrušit"}
                  </AppButton>
                  {isActive && (
                    <AppButton
                      type="submit"
                      variant="primary"
                      isUppercase
                      className="px-6"
                      disabled={isSubmitting || !selectedSportId}
                    >
                      {isSubmitting ? "Ukládám..." : user ? "Uložit změny" : "Vytvořit kontakt"}
                    </AppButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
