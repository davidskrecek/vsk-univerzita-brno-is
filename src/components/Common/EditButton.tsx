"use client";

import AppButton from "@/components/Common/AppButton";

interface EditButtonProps {
  onClick: () => void;
  label?: string;
}

export const EditButton = ({ onClick, label = "Upravit" }: EditButtonProps) => {
  return (
    <AppButton
      type="button"
      variant="secondary"
      className="w-full sm:w-auto font-display uppercase tracking-widest text-[11px] py-3 px-6"
      onClick={onClick}
    >
      {label}
    </AppButton>
  );
};

export default EditButton;
