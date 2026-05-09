import { Suspense } from "react";
import SectionHeader from "@/components/Common/SectionHeader";
import CreateFormButton from "@/components/Common/CreateFormButton";
import { PostCreateForm } from "@/components/Forms/PostCreateForm";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getSports } from "@/lib/queries/sports";
import PostsContent from "./PostsContent";
import PostsFilter from "@/components/Posts/PostsFilter";
import Loading from "@/app/loading";
import MiniSpinner from "@/components/Common/MiniSpinner";
import { PageReveal } from "@/components/Common/PageReveal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function PostsListContainer({ sport, sports }: { sport?: string; sports: any[] }) {
  const posts = await getPublishedPosts(sport);
  return (
    <PageReveal>
      <PostsContent initialPosts={posts} availableSports={sports} />
    </PageReveal>
  );
}

async function NewPostButton() {
  const sports = await getSports();
  return <CreateFormButton label="Nový příspěvek" FormComponent={PostCreateForm} sports={sports} />;
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const { sport } = await searchParams;
  const sports = await getSports();
  const sportNames = sports.map(s => s.name);
  
  const session = await getServerSession(authOptions);
  const canCreate = session?.user && (session.user.role === "superadmin" || session.user.role === "sport_manager");

  return (
    <div className="stack-page">
      <SectionHeader
        title="Příspěvky"
        as="h1"
        rightContent={
          canCreate ? (
            <Suspense fallback={<MiniSpinner />}>
              <NewPostButton />
            </Suspense>
          ) : null
        }
      />
      <PostsFilter availableSports={sportNames} />
      <Suspense fallback={<Loading />}>
        <PostsListContainer sport={sport} sports={sports} />
      </Suspense>
    </div>
  );
}
