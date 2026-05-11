import React from "react";
import { Shield } from "lucide-react";
import { IoChevronDown } from "react-icons/io5";
import LabeledField from "@/components/ui/Forms/LabeledField";
import { ActionDropdown } from "@/components/ui/Actions/ActionDropdown";
import { CollapsibleSection } from "./CollapsibleSection";

import { usePermission } from "@/hooks/usePermission";

type EditorFieldsProps = {
    editorType: "none" | "editor" | "admin";
    setEditorType: (val: "none" | "editor" | "admin") => void;
    permissions: { posts: string; events: string };
    setPermissions: (val: { posts: string; events: string }) => void;
    disabled?: boolean;
    sportId: string;
    isActive?: boolean;
    children?: React.ReactNode; // For the security section
};

export const EditorFields = ({
    editorType,
    setEditorType,
    permissions,
    setPermissions,
    disabled,
    sportId,
    isActive,
    children
}: EditorFieldsProps) => {
    const { hasPermission } = usePermission();
    const canManageUsers = hasPermission("users:manage");
    const rightsOptions = [
        { label: "Vytvářet a upravovat", value: "write" },
        { label: "Plná správa (včetně mazání)", value: "full" },
    ];

    return (
        <CollapsibleSection title="Administrace a Editor" icon={Shield} defaultOpen={editorType !== "none"}>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <LabeledField label="Systémová role">
                        <ActionDropdown
                            disabled={!sportId || !isActive}
                            trigger={
                                <button type="button" className="flex w-full items-center justify-between bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors">
                                    <span className={editorType === "none" ? "text-on-surface/30" : "text-primary font-bold uppercase text-[11px] tracking-widest"}>
                                        {editorType === "none" ? "Žádný přístup" : editorType === "admin" ? "Správce sportu" : "Editor obsahu"}
                                    </span>
                                    <IoChevronDown size={16} className="text-on-surface/40" />
                                </button>
                            }
                            items={[
                                { key: "none", label: "Žádný přístup", onSelect: () => setEditorType("none") },
                                { key: "editor", label: "Editor obsahu", onSelect: () => setEditorType("editor") },
                                ...(canManageUsers ? [{ key: "admin", label: "Správce sportu", onSelect: () => setEditorType("admin") }] : []),
                            ]}
                            align="start"
                            contentClassName="w-[--radix-dropdown-menu-trigger-width]"
                        />
                    </LabeledField>
                </div>

                {editorType === "editor" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface-container-high/30 rounded-xl border border-outline-variant/5">
                            <LabeledField label="Práva k příspěvkům">
                                <ActionDropdown
                                    disabled={!sportId || !isActive}
                                    trigger={
                                        <button type="button" className="flex w-full items-center justify-between bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors">
                                            <span>{rightsOptions.find(r => r.value === permissions.posts)?.label}</span>
                                            <IoChevronDown size={16} className="text-on-surface/40" />
                                        </button>
                                    }
                                    items={rightsOptions.map(r => ({ key: r.value, label: r.label, onSelect: () => setPermissions({ ...permissions, posts: r.value }) }))}
                                    align="start"
                                    contentClassName="w-[--radix-dropdown-menu-trigger-width]"
                                />
                            </LabeledField>
                            <LabeledField label="Práva k akcím">
                                <ActionDropdown
                                    disabled={!sportId || !isActive}
                                    trigger={
                                        <button type="button" className="flex w-full items-center justify-between bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors">
                                            <span>{rightsOptions.find(r => r.value === permissions.events)?.label}</span>
                                            <IoChevronDown size={16} className="text-on-surface/40" />
                                        </button>
                                    }
                                    items={rightsOptions.map(r => ({ key: r.value, label: r.label, onSelect: () => setPermissions({ ...permissions, events: r.value }) }))}
                                    align="start"
                                    contentClassName="w-[--radix-dropdown-menu-trigger-width]"
                                />
                            </LabeledField>
                        </div>
                        {children}
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
};

