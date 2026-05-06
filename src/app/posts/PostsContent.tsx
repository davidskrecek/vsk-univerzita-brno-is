"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/Overlay/Modal";
import EmptyState from "@/components/Common/EmptyState";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import PostDetail from "@/components/Posts/PostDetail";
import { PostCard } from "@/components/Posts/PostCard";
import PostEditButton from "@/components/Posts/PostEditButton";
import PostCreateForm from "@/components/Forms/PostCreateForm";
import {
  extractPostSports,
  filterPostsBySport,
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

  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [postDetail, setPostDetail] = useState<PostDetailResult>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isPreparingEdit, setIsPreparingEdit] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pendingEditPost, setPendingEditPost] = useState<PostDetailResult>(null);
  const [isPending, startTransition] = useTransition();

  const activePostId = searchParams.get("postId");

  const postSports = useMemo(() => extractPostSports(initialPosts), [initialPosts]);
  const filteredPosts = useMemo(
    () => filterPostsBySport(initialPosts, selectedSport),
    [initialPosts, selectedSport]
  );

  useEffect(() => {
    if (!activePostId) {
      setPostDetail(null);
      setDetailError(null);
      return;
    }

    const postIdNum = Number(activePostId);
    if (!Number.isInteger(postIdNum) || postIdNum <= 0) {
      setDetailError("Neplatné ID příspěvku");
      return;
    }

    startTransition(async () => {
      try {
        setDetailError(null);
        const detail = await getPostDetail(postIdNum);
        setPostDetail(detail);
        if (!detail) {
          setDetailError("Příspěvek nebyl nalezen");
        }
      } catch {
        setDetailError("Nepodařilo se načíst detail příspěvku");
      }
    });
  }, [activePostId]);

  useEffect(() => {
    if (!activePostId && pendingEditPost && !isEditOpen) {
      setIsEditOpen(true);
      setIsPreparingEdit(false);
    }
  }, [activePostId, pendingEditPost, isEditOpen]);

  const activePostDetail = useMemo(() => {
    if (!activePostId || !postDetail) {
      return null;
    }
    return String(postDetail.id) === activePostId ? postDetail : null;
  }, [activePostId, postDetail]);

  const detailLinks = useMemo(() => {
    if (!activePostDetail) return [];
    return mapPostDetailLinks(activePostDetail);
  }, [activePostDetail]);

  const accessibleSports = useMemo(() => {
    if (!session?.user) return [];
    if (session.user.role === "superadmin") return availableSports;
    return availableSports.filter((sport) => session.user.managedSportIds.includes(sport.id));
  }, [availableSports, session?.user]);

  const canEditActivePost = Boolean(
    activePostDetail &&
      session?.user &&
      (session.user.role === "superadmin" || session.user.role === "sport_manager") &&
      accessibleSports.some((sport) => sport.id === activePostDetail.sport.id)
  );

  const getPostHref = useCallback(
    (postId: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("postId", String(postId));
      return `/posts?${params.toString()}`;
    },
    [searchParams]
  );

  const closePostDetail = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("postId");
    const query = params.toString();
    router.push(query ? `?${query}` : "/posts", { scroll: false });
  }, [router, searchParams]);

  const openEditForPost = useCallback(() => {
    if (!activePostDetail) return;
    setPendingEditPost(activePostDetail);
    setIsPreparingEdit(true);
    setIsEditOpen(false);
    closePostDetail();
  }, [activePostDetail, closePostDetail]);

  return (
    <div className="stack-page">
      <SportFilter
        sports={postSports}
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
      />

      <div className="stack-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const href = getPostHref(post.id);

            return (
              <PostCard
                key={post.id}
                category={post.sport.name.toUpperCase()}
                title={post.title}
                description={post.excerpt ?? "Pro tento příspěvek není dostupný stručný popis."}
                href={href}
                imageUrl={post.imageUrl}
              />
            );
          })
        ) : (
          <EmptyState message="Pro vybraný sport nebyly nalezeny žádné příspěvky." />
        )}
      </div>

      {activePostId && isPending ? (
        <p className="text-sm font-sans text-on-surface/60">Načítání detailu příspěvku...</p>
      ) : null}

      {activePostId && detailError ? (
        <p className="text-sm font-sans text-red-500">{detailError}</p>
      ) : null}

      {activePostDetail && !isPreparingEdit ? (
        <PostDetail
          title={activePostDetail.title}
          category={activePostDetail.sport.name.toUpperCase()}
          date={activePostDetail.publishedAt ?? activePostDetail.createdAt}
          content={activePostDetail.content}
          imageUrl={activePostDetail.imageUrl}
          links={detailLinks}
          actions={canEditActivePost ? <PostEditButton onClick={openEditForPost} /> : null}
          onClose={closePostDetail}
        />
      ) : null}

      {isEditOpen && pendingEditPost ? (
        <Modal
          onClose={() => {
            setIsEditOpen(false);
            setPendingEditPost(null);
          }}
          contentClassName="max-w-4xl w-full"
        >
          <div className="rounded-md border border-outline-variant/10 bg-surface-container-low p-6 shadow-ambient sm:p-8">
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
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default function PostsContent({ initialPosts, availableSports }: PostsContentProps) {
  return <PostsContentInner initialPosts={initialPosts} availableSports={availableSports} />;
}
