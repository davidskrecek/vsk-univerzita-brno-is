"use client";

import { useState } from "react";
import { Modal } from "@/components/Overlay/Modal";
import SectionActionButton from "@/components/Common/SectionActionButton";
import PostCreateForm from "@/components/Forms/PostCreateForm";

interface PostsCreateButtonProps {
  sports: Array<{ id: number; name: string }>;
}

export const PostsCreateButton = ({ sports }: PostsCreateButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <SectionActionButton
        label="Nový příspěvek"
        onClick={() => setIsOpen(true)}
        requiredRoles={["sport_manager", "superadmin"]}
      />

      {isOpen ? (
        <Modal onClose={handleClose} contentClassName="max-w-4xl w-full">
          <div className="rounded-md border border-outline-variant/10 bg-surface-container-low p-6 shadow-ambient sm:p-8">
            <PostCreateForm sports={sports} onCancel={handleClose} onSuccess={handleClose} />
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default PostsCreateButton;