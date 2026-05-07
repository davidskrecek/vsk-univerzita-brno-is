import SectionHeader from "@/components/Common/SectionHeader";
import CreateFormButton from "@/components/Common/CreateFormButton";
import PostCreateForm from "@/components/Forms/PostCreateForm";
import { getSports } from "@/lib/queries/sports";
import { getPublishedPosts } from "@/lib/queries/posts";
import PostsContent from "./PostsContent";

export default async function PostsPage() {
  const posts = await getPublishedPosts(50);
  const sports = await getSports();

  return (
    <div className="stack-page">
      <SectionHeader
        title="Příspěvky"
        as="h1"
        rightContent={
          <CreateFormButton
            label="Nový příspěvek"
            FormComponent={PostCreateForm}
            sports={sports}
          />
        }
      />
      <PostsContent initialPosts={posts} availableSports={sports} />
    </div>
  );
}
