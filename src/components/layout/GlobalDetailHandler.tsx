"use client";

import { useCallback, useEffect, useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { getPostDetail, type PostDetailResult } from "@/actions/public/posts";
import { getEventDetail } from "@/actions/public/events";
import { useSports } from "@/components/features/sports/SportsProvider";
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
  const [isLoading, setIsLoading] = useState(false);
  const [postDetail, setPostDetail] = useState<PostDetailResult>(null);
  const [eventDetail, setEventDetail] = useState<UiEvent | null>(null);
  const { sports: availableSports } = useSports();

  const activePostId = searchParams.get("postId");
  const activeEventId = searchParams.get("eventId");
  const isEditing = searchParams.get("edit") === "true";

  // Handle Post Detail
  useEffect(() => {
    let ignore = false;
    setPostDetail(null);
    if (!activePostId) return;

    const id = Number(activePostId);
    if (isNaN(id)) return;

    async function load() {
      setIsLoading(true);
      try {
        const detail = await getPostDetail(id);
        if (!ignore) {
          setPostDetail(detail);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();

    return () => { ignore = true; };
  }, [activePostId]);

  // Handle Event Detail
  useEffect(() => {
    let ignore = false;
    setEventDetail(null);
    if (!activeEventId) return;

    const id = Number(activeEventId);
    if (isNaN(id)) return;

    async function load() {
      setIsLoading(true);
      try {
        const detail = await getEventDetail(id);
        if (!ignore) {
          setEventDetail(detail);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();

    return () => { ignore = true; };
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

    let sports = session.user.role === UserRole.SUPERADMIN
      ? availableSports
      : availableSports.filter(s => session.user.managedSportIds?.includes(s.id));

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
      <AnimatePresence>
        {postDetail && !isEditing && (
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

      <AnimatePresence>
        {eventDetail && !isEditing && (
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
          <>
            {isLoading ? (
              <Modal key="loading" onClose={() => toggleEdit(false)} contentClassName="max-w-md w-full bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10 flex flex-col">
                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                  <Loading />
                  <p className="text-on-surface/60 font-sans">Ověřování oprávnění...</p>
                </div>
              </Modal>
            ) : postDetail && canEditPost ? (
              <PostCreateForm
                key="form-post"
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
                key="form-event"
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
              <Modal key="denied" onClose={closeDetail} contentClassName="max-w-md w-full bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10 flex flex-col">
                <AccessDenied onBack={closeDetail} />
              </Modal>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}

