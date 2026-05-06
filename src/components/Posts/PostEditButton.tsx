"use client";

import AppButton from "@/components/Common/AppButton";

interface PostEditButtonProps {
  onClick: () => void;
}

export const PostEditButton = ({ onClick }: PostEditButtonProps) => {
  return (
    <AppButton
      type="button"
      variant="secondary"
      className="w-full sm:w-auto font-display uppercase tracking-widest text-[11px] py-3 px-6"
      onClick={onClick}
    >
      Upravit příspěvek
    </AppButton>
  );
};

export default PostEditButton;