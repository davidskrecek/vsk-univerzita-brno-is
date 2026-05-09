"use client";

import { useCallback, useEffect, useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { getPostDetail, type PostDetailResult } from "@/actions/public/posts";
import { getEventDetail } from "@/actions/public/events";
import { getAvailableSports } from "@/actions/public/sports";
import PostDetail from "@/components/Posts/PostDetail";
import EventDetail from "@/components/Events/EventDetail";
import { mapPostDetailLinks } from "@/components/Posts/postUtils";
import { type UiEvent } from "@/components/Events/eventUtils";
import EditButton from "@/components/Common/EditButton";
import { Modal } from "@/components/Overlay/Modal";
import PostCreateForm from "@/components/Forms/PostCreateForm";
import EventCreateForm from "@/components/Forms/EventCreateForm";

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
    if (!session?.user) return [];
    if (session.user.role === "superadmin") return availableSports;
    return availableSports.filter((sport) => 
      session.user.managedSportIds?.includes(sport.id)
    );
  }, [session, availableSports]);

  const canEditPost = Boolean(
    postDetail && 
    session?.user && 
    (session.user.role === "superadmin" || session.user.role === "sport_manager") &&
    accessibleSports.some(s => s.id === postDetail.sport.id)
  );

  const canEditEvent = Boolean(
    eventDetail && 
    session?.user && 
    (session.user.role === "superadmin" || session.user.role === "sport_manager") &&
    accessibleSports.some(s => s.id === eventDetail.sportId)
  );

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
            actions={canEditPost ? <EditButton label="Upravit příspěvek" onClick={() => toggleEdit(true)} /> : null}
            onClose={closeDetail}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {eventDetail && !activePostId && !isEditing && (
          <EventDetail
            key={`event-${eventDetail.id}`}
            {...eventDetail}
            actions={canEditEvent ? <EditButton label="Upravit akci" onClick={() => toggleEdit(true)} /> : null}
            onClose={closeDetail}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <Modal onClose={() => toggleEdit(false)} contentClassName="max-w-4xl w-full">
            {postDetail && (
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
            )}
            {eventDetail && (
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
                }}
                onCancel={() => toggleEdit(false)}
                onDeleted={closeDetail}
                onSuccess={closeDetail}
              />
            )}
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
