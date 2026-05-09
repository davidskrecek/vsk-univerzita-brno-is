"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { Modal } from "@/components/Overlay/Modal";
import EmptyState from "@/components/Common/EmptyState";
import PostDetail from "@/components/Posts/PostDetail";
import { PostCard } from "@/components/Posts/PostCard";
import Loading from "@/app/loading";
import EditButton from "@/components/Common/EditButton";
import PostCreateForm from "@/components/Forms/PostCreateForm";
import {
  mapPostDetailLinks,
  type PostListItem,
} from "@/components/Posts/postUtils";
import { getPostDetail, type PostDetailResult } from "@/actions/public/posts";

interface PostsContentProps {
  initialPosts: PostListItem[];
  availableSports: Array<{ id: number; name: string }>;
}

function PostsContentInner({ initialPosts, availableSports }: PostsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const selectedSport = searchParams.get("sport");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pendingEditPost, setPendingEditPost] = useState<PostDetailResult>(null);

  const accessibleSports =
    !session?.user
      ? []
      : session.user.role === "superadmin"
        ? availableSports
        : availableSports.filter((sport) => session.user.managedSportIds?.includes(sport.id));


  const openEditForPost = useCallback((detail: PostDetailResult) => {
    if (!detail) return;
    setPendingEditPost(detail);
    setIsEditOpen(true);

    // Close the detail modal
    const params = new URLSearchParams(searchParams.toString());
    params.delete("postId");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <div className="flex flex-col gap-8">
      <div className="stack-list">
        {initialPosts.length > 0 ? (
          initialPosts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              category={post.sport.name.toUpperCase()}
              title={post.title}
              description={post.excerpt ?? "Pro tento příspěvek není dostupný stručný popis."}
              imageUrl={post.imageUrl}
            />
          ))
        ) : (
          <EmptyState message="Pro vybraný sport nebyly nalezeny žádné příspěvky." />
        )}
      </div>

      <AnimatePresence>
        {isEditOpen && pendingEditPost && (
          <Modal
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
    </div>
  );
}

export default function PostsContent({ initialPosts, availableSports }: PostsContentProps) {
  return <PostsContentInner initialPosts={initialPosts} availableSports={availableSports} />;
}
