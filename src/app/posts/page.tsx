import { Suspense } from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import CreateFormButton from "@/components/features/admin/CreateFormButton";
import { PostCreateForm } from "@/components/features/posts/PostCreateForm";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getSports } from "@/lib/queries/sports";
import PostsContent from "./PostsContent";
import PostsFilter from "@/components/features/posts/PostsFilter";
import Loading from "@/app/loading";
import MiniSpinner from "@/components/ui/Feedback/MiniSpinner";
import { PageReveal } from "@/components/layout/PageReveal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isEditorialRole } from "@/lib/constants/roles";

async function PostsListContainer({ sport, sports, page }: { sport?: string; sports: any[]; page: number }) {
  const { posts, total } = await getPublishedPosts(sport, page, 10);
  return (
    <PageReveal>
      <PostsContent initialPosts={posts} availableSports={sports} total={total} currentPage={page} />
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
  searchParams: Promise<{ sport?: string; page?: string }>;
}) {
  const { sport, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const sports = await getSports();

  const session = await getServerSession(authOptions);
  const canCreate = isEditorialRole(session?.user?.role);

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
      <PostsFilter availableSports={sports} />
      <Suspense fallback={<Loading />}>
        <PostsListContainer sport={sport} sports={sports} page={currentPage} />
      </Suspense>
    </div>
  );
}

