import { getPublishedPosts } from "@/lib/queries/posts";
import PostsContent from "./PostsContent";

export default async function PostsPage() {
  const posts = await getPublishedPosts(50);

  return <PostsContent initialPosts={posts} />;
}
