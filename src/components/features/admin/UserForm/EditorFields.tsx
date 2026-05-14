import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Shield } from "lucide-react";
import { IoChevronDown } from "react-icons/io5";

import LabeledField from "@/components/ui/Forms/LabeledField";
import { ActionDropdown } from "@/components/ui/Actions/ActionDropdown";
import { CollapsibleSection } from "./CollapsibleSection";
import { usePermission } from "@/hooks/usePermission";

type EditorFieldsProps = {
  disabled?: boolean;
  sportId?: string;
  isActive?: boolean;
  children?: React.ReactNode;
};

export const EditorFields = ({ disabled, sportId, isActive, children }: EditorFieldsProps) => {
  const { control, watch } = useFormContext();
  const { hasPermission } = usePermission();
  const canManageUsers = hasPermission("users:manage");

  const editorType = watch("editorType");
  const permissions = watch("permissions");

  const rightsOptions = [
    { label: "Vytvářet a upravovat", value: "write" },
    { label: "Plná správa (včetně mazání)", value: "full" },
  ];

  const isFieldDisabled = !sportId || !isActive || disabled;

  return (
    <CollapsibleSection title="Administrace a Editor" icon={Shield} defaultOpen={editorType !== "none"}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <Controller
            name="editorType"
            control={control}
            render={({ field }) => (
              <LabeledField label="Systémová role">
                <ActionDropdown
                  disabled={isFieldDisabled}
                  trigger={
                    <button
                      type="button"
                      disabled={isFieldDisabled}
                      className="flex w-full items-center justify-between bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span
                        className={
                          field.value === "none"
                            ? "text-on-surface/30"
                            : "text-primary font-bold uppercase text-[11px] tracking-widest"
                        }
                      >
                        {field.value === "none"
                          ? "Žádný přístup"
                          : field.value === "admin"
                            ? "Správce sportu"
                            : "Editor obsahu"}
                      </span>
                      <IoChevronDown size={16} className="text-on-surface/40" />
                    </button>
                  }
                  items={[
                    { key: "none", label: "Žádný přístup", onSelect: () => field.onChange("none") },
                    { key: "editor", label: "Editor obsahu", onSelect: () => field.onChange("editor") },
                    ...(canManageUsers ? [{ key: "admin", label: "Správce sportu", onSelect: () => field.onChange("admin") }] : []),
                  ]}
                  align="start"
                  contentClassName="w-[--radix-dropdown-menu-trigger-width]"
                />
              </LabeledField>
            )}
          />
        </div>

        {editorType === "editor" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface-container-high/30 rounded-xl border border-outline-variant/5">
              <Controller
                name="permissions"
                control={control}
                render={({ field }) => (
                  <>
                    <LabeledField label="Práva k příspěvkům">
                      <ActionDropdown
                        disabled={isFieldDisabled}
                        trigger={
                          <button
                            type="button"
                            disabled={isFieldDisabled}
                            className="flex w-full items-center justify-between bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span>{rightsOptions.find((r) => r.value === permissions?.posts)?.label}</span>
                            <IoChevronDown size={16} className="text-on-surface/40" />
                          </button>
                        }
                        items={rightsOptions.map((r) => ({
                          key: r.value,
                          label: r.label,
                          onSelect: () => field.onChange({ ...permissions, posts: r.value }),
                        }))}
                        align="start"
                        contentClassName="w-[--radix-dropdown-menu-trigger-width]"
                      />
                    </LabeledField>

                    <LabeledField label="Práva k akcím">
                      <ActionDropdown
                        disabled={isFieldDisabled}
                        trigger={
                          <button
                            type="button"
                            disabled={isFieldDisabled}
                            className="flex w-full items-center justify-between bg-surface-container-high rounded-md px-4 py-3 text-sm font-sans text-on-surface/70 outline-none border border-outline-variant/10 focus:border-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span>{rightsOptions.find((r) => r.value === permissions?.events)?.label}</span>
                            <IoChevronDown size={16} className="text-on-surface/40" />
                          </button>
                        }
                        items={rightsOptions.map((r) => ({
                          key: r.value,
                          label: r.label,
                          onSelect: () => field.onChange({ ...permissions, events: r.value }),
                        }))}
                        align="start"
                        contentClassName="w-[--radix-dropdown-menu-trigger-width]"
                      />
                    </LabeledField>
                  </>
                )}
              />
            </div>
            {children}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
