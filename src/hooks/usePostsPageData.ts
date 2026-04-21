"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  extractPostSports,
  filterPostsBySport,
  mapPostDetailLinks,
  type PostDetailLinkItem,
  type PostDetailResponse,
  type PostListItem,
  type PostsResponse,
} from "@/components/Posts/postUtils";
import { useApiData } from "@/hooks/useApiData";

interface UsePostsPageDataResult {
  loading: boolean;
  error: string | null;
  detailLoading: boolean;
  detailError: string | null;
  selectedSport: string | null;
  setSelectedSport: (sport: string | null) => void;
  sports: string[];
  filteredPosts: PostListItem[];
  activePostId: string | null;
  activePostDetail: PostDetailResponse | null;
  detailLinks: PostDetailLinkItem[];
  getPostHref: (postId: number) => string;
  closePostDetail: () => void;
}

export const usePostsPageData = (): UsePostsPageDataResult => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const activePostId = searchParams.get("postId");

  const { data: postsResponse, loading, error } = useApiData<PostsResponse>({
    url: "/api/posts?limit=50&page=1",
    errorMessage: "Nepodařilo se načíst příspěvky",
  });

  const posts = useMemo(() => postsResponse?.data ?? [], [postsResponse]);

  const {
    data: postDetail,
    loading: detailLoading,
    error: detailError,
  } = useApiData<PostDetailResponse>({
    url: activePostId ? `/api/posts/${activePostId}` : null,
    errorMessage: "Nepodařilo se načíst detail příspěvku",
  });

  const sports = useMemo(() => extractPostSports(posts), [posts]);
  const filteredPosts = useMemo(() => filterPostsBySport(posts, selectedSport), [posts, selectedSport]);

  const activePostDetail = useMemo(() => {
    if (!activePostId || !postDetail) {
      return null;
    }

    return String(postDetail.id) === activePostId ? postDetail : null;
  }, [activePostId, postDetail]);

  const detailLinks = useMemo(() => mapPostDetailLinks(activePostDetail), [activePostDetail]);

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
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/posts';
    router.push(query ? `?${query}` : currentPath, { scroll: false });
  }, [router, searchParams]);

  return {
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
  };
};
