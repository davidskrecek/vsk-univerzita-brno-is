export interface PostListItem {
  id: number;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  sport: {
    id: number;
    name: string;
  };
}

export interface PostsResponse {
  data: PostListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface PostMediaItem {
  id: number;
  mediaUrl: string;
  mediaType: string;
}

export interface PostDetailResponse {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  sport: {
    id: number;
    name: string;
  };
  media: PostMediaItem[];
  links: Array<{ url: string; alias: string | null }>;
}

export interface PostDetailLinkItem {
  label: string;
  href: string;
}

export const mapPostDetailLinks = (postDetail: PostDetailResponse | null): PostDetailLinkItem[] => {
  if (!postDetail) {
    return [];
  }

  return postDetail.links.map((link, index) => ({
    label: link.alias?.trim() || `Odkaz ${index + 1}`,
    href: link.url,
  }));
};

export const extractPostSports = (posts: PostListItem[]) =>
  Array.from(new Set(posts.map((post) => post.sport.name))).sort((a, b) => a.localeCompare(b, "cs"));

export const filterPostsBySport = (posts: PostListItem[], selectedSport: string | null): PostListItem[] =>
  selectedSport ? posts.filter((post) => post.sport.name === selectedSport) : posts;