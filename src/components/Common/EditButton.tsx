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
      isUppercase
      className="w-full sm:w-auto py-3 px-6"
      onClick={onClick}
    >
      {label}
    </AppButton>
  );
};

export default EditButton;
