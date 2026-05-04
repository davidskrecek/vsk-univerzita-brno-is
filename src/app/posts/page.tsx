import SectionHeader from "@/components/Common/SectionHeader";
import { getPublishedPosts } from "@/lib/queries/posts";
import PostsContent from "./PostsContent";

export default async function PostsPage() {
  const posts = await getPublishedPosts(50);

  return (
    <div className="stack-page">
      <SectionHeader title="Příspěvky" as="h1" />
      <PostsContent initialPosts={posts} />
    </div>
  );
}
