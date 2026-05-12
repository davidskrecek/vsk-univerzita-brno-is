"use client";

import { useSession } from "next-auth/react";
import { IoAdd } from "react-icons/io5";
import AppButton from "@/components/ui/Actions/AppButton";
import { sessionHasPermission, type Permission } from "@/lib/permissions";

interface SectionActionButtonProps {
  label: string;
  onClick: () => void;
  requiredPermission?: string;
  isUppercase?: boolean;
}

export const SectionActionButton = ({
  label,
  onClick,
  requiredPermission,
  isUppercase = true,
}: SectionActionButtonProps) => {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  if (requiredPermission && !sessionHasPermission(session, requiredPermission as Permission)) {
    return null;
  }

  return (
    <AppButton
      type="button"
      variant="secondary"
      isUppercase={isUppercase}
      onClick={onClick}
      className={`h-10 w-10 p-0 flex items-center justify-center rounded-full md:rounded-md md:w-auto md:h-auto md:py-3 md:px-8`}
    >
      <span className="md:hidden">
        <IoAdd size={24} className="text-primary" />
      </span>
      <span className="hidden md:block">
        {label}
      </span>
    </AppButton>
  );
};

export default SectionActionButton;
