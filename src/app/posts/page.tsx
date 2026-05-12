import { Suspense } from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import CreateFormButton from "@/components/features/admin/CreateFormButton";
import { PostCreateForm } from "@/components/features/posts/PostCreateForm";
import { getPublishedPosts } from "@/lib/queries/posts";
import PostsContent from "./PostsContent";
import PostsFilter from "@/components/features/posts/PostsFilter";
import Loading from "@/app/loading";
import Spinner from "@/components/ui/Feedback/Spinner";
import { PageReveal } from "@/components/layout/PageReveal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/constants/roles";

async function PostsListContainer({ sport, page }: { sport?: string; page: number }) {
  const { posts, total } = await getPublishedPosts(sport, page, 10);
  return (
    <PageReveal>
      <PostsContent initialPosts={posts} total={total} currentPage={page} />
    </PageReveal>
  );
}

function NewPostButton() {
  return (
    <CreateFormButton
      label="Nový příspěvek"
      requiredPermission="posts:write"
      FormComponent={PostCreateForm}
    />
  );
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; page?: string }>;
}) {
  const { sport, page } = await searchParams;
  const currentPage = Number(page) || 1;

  const session = await getServerSession(authOptions);
  const canCreate = session?.user && (session.user.permissions?.["posts:write"] === true || isSuperAdminRole(session.user.role));

  return (
    <div className="stack-page">
      <SectionHeader
        title="Příspěvky"
        as="h1"
        rightContent={
          canCreate ? (
            <Suspense fallback={<Spinner />}>
              <NewPostButton />
            </Suspense>
          ) : null
        }
      />
      <PostsFilter />
      <Suspense fallback={<Loading />}>
        <PostsListContainer sport={sport} page={currentPage} />
      </Suspense>
    </div>
  );
}

