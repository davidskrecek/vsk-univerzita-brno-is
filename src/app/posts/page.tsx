import SectionHeader from "@/components/Common/SectionHeader";
import { getSports } from "@/lib/queries/sports";
import { getPublishedPosts } from "@/lib/queries/posts";
import PostsContent from "./PostsContent";
import PostsCreateButton from "@/components/Posts/PostsCreateButton";

export default async function PostsPage() {
  const posts = await getPublishedPosts(50);
  const sports = await getSports();

  return (
    <div className="stack-page">
      <SectionHeader title="Příspěvky" as="h1" rightContent={<PostsCreateButton sports={sports} />} />
      <PostsContent initialPosts={posts} availableSports={sports} />
    </div>
  );
}
