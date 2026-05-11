"use client";

import { useCallback, useEffect, useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { getPostDetail, type PostDetailResult } from "@/actions/public/posts";
import { getEventDetail } from "@/actions/public/events";
import { getAvailableSports } from "@/actions/public/sports";
import PostDetail from "@/components/features/posts/PostDetail";
import EventDetail from "@/components/features/events/EventDetail";
import { mapPostDetailLinks } from "@/components/features/posts/postUtils";
import { type UiEvent } from "@/components/features/events/eventUtils";
import EditButton from "@/components/ui/Actions/EditButton";
import { Modal } from "@/components/ui/Overlay/Modal";
import PostCreateForm from "@/components/features/posts/PostCreateForm";
import EventCreateForm from "@/components/features/events/EventCreateForm";
import AccessDenied from "@/components/ui/Feedback/AccessDenied";
import Loading from "@/app/loading";
import { UserRole } from "@/lib/constants/roles";



export default function GlobalDetailHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const [postDetail, setPostDetail] = useState<PostDetailResult>(null);
  const [eventDetail, setEventDetail] = useState<UiEvent | null>(null);
  const [availableSports, setAvailableSports] = useState<Array<{ id: number; name: string }>>([]);

  const activePostId = searchParams.get("postId");
  const activeEventId = searchParams.get("eventId");
  const isEditing = searchParams.get("edit") === "true";

  // Fetch available sports if user is logged in
  useEffect(() => {
    if (session?.user) {
      getAvailableSports().then(setAvailableSports);
    }
  }, [session]);

  // Handle Post Detail
  useEffect(() => {
    if (!activePostId) {
      setPostDetail(null);
      return;
    }

    const id = Number(activePostId);
    if (isNaN(id)) return;

    startTransition(async () => {
      const detail = await getPostDetail(id);
      setPostDetail(detail);
    });
  }, [activePostId]);

  // Handle Event Detail
  useEffect(() => {
    if (!activeEventId) {
      setEventDetail(null);
      return;
    }

    const id = Number(activeEventId);
    if (isNaN(id)) return;

    startTransition(async () => {
      const detail = await getEventDetail(id);
      setEventDetail(detail);
    });
  }, [activeEventId]);

  const closeDetail = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("postId");
    params.delete("eventId");
    params.delete("edit");
    const query = params.toString();
    router.push(query ? `?${query}` : window.location.pathname, { scroll: false });
  }, [router, searchParams]);

  const toggleEdit = useCallback((edit: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (edit) {
      params.set("edit", "true");
    } else {
      params.delete("edit");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const accessibleSports = useMemo(() => {
    if (!session?.user || availableSports.length === 0) return [];

    // Start with sports the user manages
    let sports = session.user.role === UserRole.SUPERADMIN
      ? availableSports
      : availableSports.filter(s => session.user.managedSportIds?.includes(s.id));

    // ALWAYS include the current item's sport if we are editing
    if (isEditing) {
      const currentSportId = postDetail?.sport.id || eventDetail?.sportId;
      if (currentSportId) {
        const currentSport = availableSports.find(s => s.id === currentSportId);
        if (currentSport && !sports.find(s => s.id === currentSportId)) {
          sports = [...sports, currentSport];
        }
      }
    }

    return sports.sort((a, b) => a.name.localeCompare(b.name, "cs"));
  }, [session, availableSports, isEditing, postDetail, eventDetail]);

  const canEditPost = postDetail?.canEdit ?? false;
  const canEditEvent = eventDetail?.canEdit ?? false;


  return (
    <>
      <AnimatePresence mode="wait">
        {postDetail && !activeEventId && !isEditing && (
          <PostDetail
            key={`post-${postDetail.id}`}
            title={postDetail.title}
            category={postDetail.sport.name.toUpperCase()}
            date={postDetail.publishedAt ?? postDetail.createdAt}
            content={postDetail.content}
            imageUrl={postDetail.imageUrl}
            links={mapPostDetailLinks(postDetail)}
            actions={canEditPost ? <EditButton onClick={() => toggleEdit(true)} /> : null}
            onClose={closeDetail}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {eventDetail && !activePostId && !isEditing && (
          <EventDetail
            key={`event-${eventDetail.id}`}
            {...eventDetail}
            actions={canEditEvent ? <EditButton onClick={() => toggleEdit(true)} /> : null}
            onClose={closeDetail}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <Modal onClose={() => toggleEdit(false)} contentClassName="w-[95vw] md:w-[85vw] lg:w-full max-w-5xl">
            {isPending ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <Loading />
                <p className="text-on-surface/60 font-sans">Ověřování oprávnění...</p>
              </div>
            ) : postDetail && canEditPost ? (
              <PostCreateForm
                mode="edit"
                sports={accessibleSports}
                initialValues={{
                  id: postDetail.id,
                  sportId: postDetail.sport.id,
                  title: postDetail.title,
                  content: postDetail.content,
                  imageUrl: postDetail.imageUrl,
                  publishedAt: postDetail.publishedAt,
                  links: postDetail.links,
                }}
                onCancel={() => toggleEdit(false)}
                onDeleted={closeDetail}
                onSuccess={closeDetail}
              />
            ) : eventDetail && canEditEvent ? (
              <EventCreateForm
                mode="edit"
                sports={accessibleSports}
                initialValues={{
                  id: Number(eventDetail.id),
                  sportId: eventDetail.sportId,
                  title: eventDetail.title,
                  description: eventDetail.description,
                  location: eventDetail.location,
                  startTime: eventDetail.startTimeIso,
                  links: eventDetail.links,
                }}
                onCancel={() => toggleEdit(false)}
                onDeleted={closeDetail}
                onSuccess={closeDetail}
              />
            ) : (
              <AccessDenied onBack={closeDetail} />
            )}
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

