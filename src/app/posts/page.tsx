"use client";

import { Suspense } from "react";
import EmptyState from "@/components/Common/EmptyState";
import SectionHeader from "@/components/Common/SectionHeader";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import PostDetail from "@/components/Posts/PostDetail";
import { PostCard } from "@/components/Posts/PostCard";
import { usePostsPageData } from "@/hooks/usePostsPageData";

function PostsContent() {
  const {
    loading,
    error,
    detailLoading,
    detailError,
    selectedSport,
    setSelectedSport,
    sports,
    filteredPosts,
    activePostId,
    activePostDetail,
    detailLinks,
    getPostHref,
    closePostDetail,
  } = usePostsPageData();

  return (
    <div className="stack-page">
      <SectionHeader title="Příspěvky" as="h1" />

      <SportFilter sports={sports} selectedSport={selectedSport} onSportChange={setSelectedSport} />

      <div className="stack-list">
        {loading ? (
          <p className="text-sm font-sans text-on-surface/60">Načítání příspěvků...</p>
        ) : error ? (
          <EmptyState message={error} />
        ) : filteredPosts.length > 0 ? (
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

      {activePostId && detailLoading ? (
        <p className="text-sm font-sans text-on-surface/60">Načítání detailu příspěvku...</p>
      ) : null}

      {activePostId && detailError ? <p className="text-sm font-sans text-red-500">{detailError}</p> : null}

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

export default function PostsPage() {
  return (
    <Suspense fallback={<div>Načítání...</div>}>
      <PostsContent />
    </Suspense>
  );
}
