"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { getPostDetail, type PostDetailResult } from "@/actions/public/posts";
import { getEventDetail } from "@/actions/public/events";
import { useSports } from "@/components/features/sports/SportsProvider";
import PostDetail from "@/components/features/posts/PostDetail";
import EventDetail from "@/components/features/events/EventDetail";
import DetailLayout from "@/components/layout/DetailLayout";
import { mapPostDetailLinks } from "@/components/features/posts/postUtils";
import { type UiEvent } from "@/components/features/events/eventUtils";
import EditButton from "@/components/ui/Actions/EditButton";
import { Modal } from "@/components/ui/Overlay/Modal";
import PostCreateForm from "@/components/features/posts/PostCreateForm";
import EventCreateForm from "@/components/features/events/EventCreateForm";
import AccessDenied from "@/components/ui/Feedback/AccessDenied";
import Spinner from "@/components/ui/Feedback/Spinner";
import { sessionHasPermission } from "@/lib/permissions";



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

  // Unified State Synchronizer for Post and Event Detail
  useEffect(() => {
    let ignore = false;

    // Hard deterministic cache purge on ANY context shift
    setPostDetail(null);
    setEventDetail(null);

    const pid = activePostId ? Number(activePostId) : null;
    const eid = activeEventId ? Number(activeEventId) : null;

    if (!pid && !eid) {
      setIsLoading(false);
      return;
    }

    async function load() {
      setIsLoading(true);
      try {
        if (pid && !isNaN(pid)) {
          const detail = await getPostDetail(pid);
          if (!ignore) setPostDetail(detail);
        } else if (eid && !isNaN(eid)) {
          const detail = await getEventDetail(eid);
          if (!ignore) setEventDetail(detail);
        }
      } catch (e) {
        console.error("Global Detail Load Error:", e);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();

    return () => { ignore = true; };
  }, [activePostId, activeEventId]);

  const closeDetail = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("postId");
    params.delete("eventId");
    params.delete("edit");
    const query = params.toString();
    router.push(query ? `?${query}` : window.location.pathname, { scroll: false });

    // Immediate deterministic cache purge on explicit user dismissal
    setPostDetail(null);
    setEventDetail(null);
    setIsLoading(false);
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

    let sports = sessionHasPermission(session, "sports:manage")
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
  const canDeletePost = postDetail?.canDelete ?? false;
  const canEditEvent = eventDetail?.canEdit ?? false;
  const canDeleteEvent = eventDetail?.canDelete ?? false;

  return (
    <>
      <AnimatePresence>
        {(activePostId || activeEventId) && !isEditing && (
          <Modal
            key="persistent-global-modal"
            onClose={closeDetail}
            contentClassName="max-w-2xl w-full bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10 flex flex-col max-h-[85vh]"
          >
            <div className="relative w-full min-h-[400px] flex flex-col flex-1 min-h-0">
              <AnimatePresence initial={false} mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading-stage"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-24"
                  >
                    <Spinner size="lg" />
                  </motion.div>
                ) : postDetail ? (
                  <motion.div
                    key={`post-stage-${postDetail.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col flex-1 min-h-0"
                  >
                    <PostDetail
                      title={postDetail.title}
                      category={postDetail.sport.name.toUpperCase()}
                      date={postDetail.publishedAt ?? postDetail.createdAt}
                      content={postDetail.content}
                      imageUrl={postDetail.imageUrl}
                      links={mapPostDetailLinks(postDetail)}
                      actions={canEditPost ? <EditButton onClick={() => toggleEdit(true)} /> : null}
                      onClose={closeDetail}
                    />
                  </motion.div>
                ) : eventDetail ? (
                  <motion.div
                    key={`event-stage-${eventDetail.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col flex-1 min-h-0"
                  >
                    <EventDetail
                      {...eventDetail}
                      actions={canEditEvent ? <EditButton onClick={() => toggleEdit(true)} /> : null}
                      onClose={closeDetail}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <>
            {isLoading ? (
              <Modal key="loading" onClose={() => toggleEdit(false)} contentClassName="max-w-md w-full bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10 flex flex-col">
                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                  <Spinner size="lg" />
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
                canDelete={canDeletePost}
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
                canDelete={canDeleteEvent}
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


