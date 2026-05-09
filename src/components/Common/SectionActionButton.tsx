"use client";

import { useSession } from "next-auth/react";
import { IoAdd } from "react-icons/io5";
import AppButton from "@/components/Common/AppButton";

interface SectionActionButtonProps {
  label: string;
  onClick: () => void;
  requiredRoles?: string[];
  requiredSportIds?: number[];
  isUppercase?: boolean;
}

export const SectionActionButton = ({
  label,
  onClick,
  requiredRoles = ["sport_manager"],
  requiredSportIds,
  isUppercase = true,
}: SectionActionButtonProps) => {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  const userRole = session?.user?.role;
  if (!requiredRoles.includes(userRole)) {
    return null;
  }

  if (requiredSportIds && requiredSportIds.length > 0) {
    const hasAccess = requiredSportIds.some((sportId) =>
      session?.user?.managedSportIds?.includes(sportId)
    );
    if (!hasAccess) {
      return null;
    }
  }

  return (
    <AppButton
      type="button"
      variant="secondary"
      isUppercase={false} // Handle casing manually to avoid small text on mobile icon
      onClick={onClick}
      className={`!p-0 h-10 w-10 flex items-center justify-center rounded-full md:rounded-md md:w-auto md:h-auto md:py-2 md:px-5 ${isUppercase ? "uppercase tracking-widest text-[11px]" : ""}`}
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