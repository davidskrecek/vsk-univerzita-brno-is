"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/Common/EmptyState";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import PostDetail from "@/components/Posts/PostDetail";
import { PostCard } from "@/components/Posts/PostCard";
import {
  extractPostSports,
  filterPostsBySport,
  mapPostDetailLinks,
  type PostListItem,
} from "@/components/Posts/postUtils";
import { getPostDetail, type PostDetailResult } from "@/actions/public/posts";

interface PostsContentProps {
  initialPosts: PostListItem[];
}

function PostsContentInner({ initialPosts }: PostsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [postDetail, setPostDetail] = useState<PostDetailResult>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activePostId = searchParams.get("postId");

  const sports = useMemo(() => extractPostSports(initialPosts), [initialPosts]);
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

  const activePostDetail = useMemo(() => {
    if (!activePostId || !postDetail) {
      return null;
    }
    return String(postDetail.id) === activePostId ? postDetail : null;
  }, [activePostId, postDetail]);

  const detailLinks = useMemo(() => {
    if (!activePostDetail) return [];
    return mapPostDetailLinks({
      id: activePostDetail.id,
      title: activePostDetail.title,
      content: activePostDetail.content,
      imageUrl: activePostDetail.imageUrl,
      publishedAt: activePostDetail.publishedAt,
      createdAt: activePostDetail.createdAt,
      sport: activePostDetail.sport,
      media: activePostDetail.media,
    });
  }, [activePostDetail]);

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

  return (
    <div className="stack-page">
      <SportFilter
        sports={sports}
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

      {activePostDetail ? (
        <PostDetail
          title={activePostDetail.title}
          category={activePostDetail.sport.name.toUpperCase()}
          date={activePostDetail.publishedAt ?? activePostDetail.createdAt}
          content={activePostDetail.content}
          imageUrl={activePostDetail.imageUrl}
          links={detailLinks}
          onClose={closePostDetail}
        />
      ) : null}
    </div>
  );
}

export default function PostsContent({ initialPosts }: PostsContentProps) {
  return <PostsContentInner initialPosts={initialPosts} />;
}
