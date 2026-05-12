import { type PostListItem } from "@/components/features/posts/postUtils";
import { PostCard } from "@/components/features/posts/PostCard";
import EmptyState from "@/components/ui/Feedback/EmptyState";
import Pagination from "@/components/ui/Navigation/Pagination";

interface PostsContentProps {
  initialPosts: PostListItem[];
  total: number;
  currentPage: number;
}

export default function PostsContent({ initialPosts, total, currentPage }: PostsContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="stack-list">
        {initialPosts.length > 0 ? (
          initialPosts.map((post) => (
            <PostCard
              key={post.id}
              postId={String(post.id)}
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

      <Pagination total={total} limit={10} currentPage={currentPage} />
    </div>
  );
}

