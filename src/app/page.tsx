import AppLink from "@/components/Common/AppLink";
import { Banner } from "@/components/Common/Banner";
import { PostCard } from "@/components/Posts/PostCard";
import { EventCard } from "@/components/Events/EventCard";
import SectionHeader from "@/components/Common/SectionHeader";

const latestPosts = [
  {
    id: "1",
    category: "ATLETIKA",
    title: "Vítězství na akademickém mistrovství v běhu",
    description: "Naši běžci ovládli finálový závod v Praze a domů přivážejí celkem pět zlatých medailí v různých kategoriích.",
  },
  {
    id: "2",
    category: "BASKETBAL",
    title: "Basketbalisté postoupili do univerzitní ligy",
    description: "Po napínavém souboji s Technickou univerzitou si náš tým vybojoval postup do nejvyšší národní divize.",
  },
  {
    id: "3",
    category: "VOLEJBAL",
    title: "Otevřený nábor do ženského volejbalového týmu",
    description: "Hledáme nové posily pro nadcházející sezónu. Přijďte ukázat své dovednosti na trénink příští úterý.",
  },
];

const upcomingEvents = [
  {
    day: "15",
    month: "ŘÍJ",
    category: "HOKEJ",
    title: "Univerzitní hokejová bitva",
    location: "Winning Group Arena, Brno"
  },
  {
    day: "22",
    month: "ŘÍJ",
    category: "PLAVÁNÍ",
    title: "Plavecké závody o pohár rektora",
    location: "Bazén Lužánky"
  },
  {
    day: "05",
    month: "LIS",
    category: "OSTATNÍ",
    title: "Workshop: Sportovní psychologie",
    location: "Aula FSpS MU"
  }
];

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
              Všechny příspěvky
            </AppLink>
          }
        />

        <div className="stack-list">
          {latestPosts.map((post) => (
            <PostCard
              key={post.id}
              href={`/posts?postId=${post.id}`}
              category={post.category}
              title={post.title}
              description={post.description}
            />
          ))}
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section className="stack-section">
        <SectionHeader
          title="Nejbližší akce"
          rightContent={
            <AppLink href="/events" className="text-[10px] font-display font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors no-underline">
              Všechny akce
            </AppLink>
          }
        />

        <div className="stack-list">
          {upcomingEvents.map((event, index) => (
            <EventCard
              key={index}
              id={String(index + 1)}
              {...event}
              isInline
            />
          ))}
        </div>
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
