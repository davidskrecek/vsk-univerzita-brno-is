"use client";

import AppButton from "@/components/Common/AppButton";

interface EditButtonProps {
  onClick: () => void;
  label?: string;
}

export const EditButton = ({ onClick, label = "Upravit" }: EditButtonProps) => {
  const parts = label.split(" ");
  const mainText = parts[0];
  const subText = parts.slice(1).join(" ");

  return (
    <AppButton
      type="button"
      variant="secondary"
      isUppercase
      className="w-full sm:w-auto py-3 px-6"
      onClick={onClick}
    >
      {mainText}
      {subText && <span className="hidden sm:inline">&nbsp;{subText}</span>}
    </AppButton>
  );
};

export default EditButton;
