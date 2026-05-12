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
  url: string;
}

export const mapPostDetailLinks = (postDetail: PostDetailResponse | null): PostDetailLinkItem[] => {
  if (!postDetail) {
    return [];
  }

  return postDetail.links.map((link, index) => ({
    label: link.alias?.trim() || `Odkaz ${index + 1}`,
    url: link.url,
  }));
};


