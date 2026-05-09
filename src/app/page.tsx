import { Suspense } from "react";
import AppLink from "@/components/Common/AppLink";
import { Banner } from "@/components/Common/Banner";
import { PostCard } from "@/components/Posts/PostCard";
import { EventCard } from "@/components/Events/EventCard";
import SectionHeader from "@/components/Common/SectionHeader";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getPublicEvents } from "@/lib/queries/events";
import { getCzechMonthShort, getEventDayOfMonth } from "@/components/Events/eventUtils";
import Loading from "./loading";

async function PostListContainer() {
  const latestPosts = await getPublishedPosts(undefined, 3);
  return (
    <div className="stack-list">
      {latestPosts.map((post) => (
        <PostCard
          key={post.id}
          postId={String(post.id)}
          category={post.sport.name.toUpperCase()}
          title={post.title}
          description={post.excerpt ?? "Pro tento příspěvek není dostupný stručný popis."}
          imageUrl={post.imageUrl}
        />
      ))}
    </div>
  );
}

async function UpcomingEventsContainer() {
  const upcomingEvents = (await getPublicEvents()).slice(0, 3).sort(
    (a, b) => new Date(a.startTimeIso).getTime() - new Date(b.startTimeIso).getTime()
  );

  return (
    <div className="stack-list">
      {upcomingEvents.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          day={getEventDayOfMonth(event.date)}
          month={getCzechMonthShort(event.date)}
          category={event.sport}
          title={event.title}
          location={event.location || "Bude upřesněno"}
          isInline
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col space-y-(--spacing-section) pt-(--spacing-list-gap) pb-0">

      {/* BANNER SECTION */}
      <div className="hidden md:block">
        <Banner
          title="Staň se součástí elity"
          subtitle="Hledáme talentované sportovce i nadšence."
          buttonText="Přidej se k nám!"
          href="/join"
        />
      </div>

      {/* POSTS SECTION */}
      <section className="stack-section">
        <SectionHeader
          title="Nejnovější příspěvky"
          rightContent={
            <AppLink href="/posts" className="text-[10px] font-display font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors no-underline">
              Všechny<span className="hidden sm:inline">&nbsp;příspěvky</span>
            </AppLink>
          }
        />
        <Suspense fallback={<Loading />}>
          <PostListContainer />
        </Suspense>
      </section>

      {/* EVENTS SECTION */}
      <section className="stack-section">
        <SectionHeader
          title="Nejbližší akce"
          rightContent={
            <AppLink href="/events" className="text-[10px] font-display font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors no-underline">
              Všechny<span className="hidden sm:inline">&nbsp;akce</span>
            </AppLink>
          }
        />
        <Suspense fallback={<Loading />}>
          <UpcomingEventsContainer />
        </Suspense>
      </section>

      {/* STATS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto pt-(--spacing-editorial) border-t border-outline-variant/10">
        <div className="bg-surface-container-low p-8 rounded-md group hover:bg-surface-container transition-colors">
          <div className="stat-block-number">24</div>
          <div className="stat-block-label">Aktivních sportů</div>
          <p className="mt-4 text-on-surface/40 text-sm font-sans">Široká škála sportovních disciplín pro každého studenta.</p>
        </div>
        <div className="bg-surface-container-low p-8 rounded-md group hover:bg-surface-container transition-colors">
          <div className="stat-block-number">150+</div>
          <div className="stat-block-label">Členů klubu</div>
          <p className="mt-4 text-on-surface/40 text-sm font-sans">Silná komunita sportovců a akademických pracovníků.</p>
        </div>

        <div className="bg-surface-container-low p-8 rounded-md group hover:bg-surface-container transition-colors">
          <div className="stat-block-number">1962</div>
          <div className="stat-block-label">Rok založení</div>
          <p className="mt-4 text-on-surface/40 text-sm font-sans">Dlouholetá tradice brněnského vysokoškolského sportu.</p>
        </div>
      </section>
    </div>
  );
}
