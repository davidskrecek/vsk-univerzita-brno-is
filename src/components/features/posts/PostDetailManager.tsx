"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import PostDetail from "@/components/features/posts/PostDetail";
import Loading from "@/app/loading";
import EditButton from "@/components/ui/Actions/EditButton";
import { Modal } from "@/components/ui/Overlay/Modal";
import PostCreateForm from "@/components/features/posts/PostCreateForm";
import { mapPostDetailLinks } from "@/components/features/posts/postUtils";
import { getPostDetail, type PostDetailResult } from "@/actions/public/posts";

interface PostDetailManagerProps {
  availableSports: Array<{ id: number; name: string }>;
}

export default function PostDetailManager({ availableSports }: PostDetailManagerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [activePostDetail, setActivePostDetail] = useState<PostDetailResult>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pendingEditPost, setPendingEditPost] = useState<PostDetailResult>(null);

  const postIdParam = searchParams.get("postId");

  useEffect(() => {
    if (postIdParam) {
      setIsDetailLoading(true);
      getPostDetail(Number(postIdParam)).then((detail) => {
        setActivePostDetail(detail);
        setIsDetailLoading(false);
      });
    } else {
      setActivePostDetail(null);
    }
  }, [postIdParam]);

  const closeDetail = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("postId");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const openEditForPost = useCallback((detail: PostDetailResult) => {
    if (!detail) return;
    setPendingEditPost(detail);
    setIsEditOpen(true);
    closeDetail();
  }, [closeDetail]);

  const canEditPost = (post: PostDetailResult) => {
    if (!post || !session?.user) return false;
    if (session.user.role === "superadmin") return true;
    if (post.author && Number(session.user.personnelId) === post.author.id) return true;
    return session.user.managedSportIds?.includes(post.sport.id);
  };

  const accessibleSports =
    !session?.user
      ? []
      : session.user.role === "superadmin"
        ? availableSports
        : availableSports.filter((sport) => session.user.managedSportIds?.includes(sport.id));

  return (
    <AnimatePresence>
      {isDetailLoading && <Loading />}

      {activePostDetail && !isEditOpen && (
        <PostDetail
          key={`detail-${activePostDetail.id}`}
          title={activePostDetail.title}
          category={activePostDetail.sport.name.toUpperCase()}
          date={activePostDetail.publishedAt || activePostDetail.createdAt}
          content={activePostDetail.content}
          imageUrl={activePostDetail.imageUrl}
          links={mapPostDetailLinks(activePostDetail)}
          onClose={closeDetail}
          actions={
            canEditPost(activePostDetail) ? (
              <EditButton onClick={() => openEditForPost(activePostDetail)} />
            ) : null
          }
        />
      )}

      {isEditOpen && pendingEditPost && (
        <Modal
          key={`edit-${pendingEditPost.id}`}
          onClose={() => {
            setIsEditOpen(false);
            setPendingEditPost(null);
          }}
          contentClassName="max-w-4xl w-full"
        >
          <PostCreateForm
            mode="edit"
            sports={accessibleSports}
            initialValues={{
              id: pendingEditPost.id,
              sportId: pendingEditPost.sport.id,
              title: pendingEditPost.title,
              excerpt: null,
              content: pendingEditPost.content,
              imageUrl: pendingEditPost.imageUrl,
              publishedAt: pendingEditPost.publishedAt,
              links: pendingEditPost.links,
            }}
            onCancel={() => {
              setIsEditOpen(false);
              setPendingEditPost(null);
            }}
            onDeleted={() => {
              setIsEditOpen(false);
              setPendingEditPost(null);
            }}
            onSuccess={() => {
              setIsEditOpen(false);
              setPendingEditPost(null);
            }}
          />
        </Modal>
      )}
    </AnimatePresence>
  );
}

