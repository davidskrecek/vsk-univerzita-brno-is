"use client"

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { PostCard } from "@/components/Posts/PostCard";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import SectionHeader from "@/components/Common/SectionHeader";
import EmptyState from "@/components/Common/EmptyState";
import PostDetail from "@/components/Posts/PostDetail";

interface PostItem {
  id: string;
  category: string;
  title: string;
  description: string;
  date: string;
  content: string;
  imageUrl?: string | null;
  links: { label: string; href: string }[];
}

// Mock data for posts
const ALL_POSTS: PostItem[] = [
  {
    id: "1",
    category: "ATLETIKA",
    title: "Vítězství na akademickém mistrovství v běhu",
    description: "Naši běžci ovládli finálový závod v Praze a domů přivážejí celkem pět zlatých medailí v různých kategoriích.",
    date: "2024-10-12",
    content:
      "První domácí utkání letošní sezóny přineslo dramatickou podívanou.\n\nNaši hráči si šli od začátku za vítězstvím a postupně přidávali na tempu.\n\nDěkujeme fanouškům za skvělou atmosféru.",
    links: [
      { label: "Fotografie", href: "https://example.com/fotografie" },
      { label: "Výsledky", href: "https://example.com/vysledky" },
    ],
  },
  {
    id: "2",
    category: "BASKETBAL",
    title: "Basketbalisté postoupili do univerzitní ligy",
    description: "Po napínavém souboji s Technickou univerzitou si náš tým vybojoval postup do nejvyšší národní divize.",
    date: "2024-10-08",
    content:
      "Po vyrovnaném průběhu rozhodla poslední čtvrtina.\n\nDíky týmovému výkonu a pevné obraně si odvážíme zasloužený postup.",
    links: [{ label: "Článek", href: "https://example.com/clanek" }],
  },
  {
    id: "3",
    category: "VOLEJBAL",
    title: "Otevřený nábor do ženského volejbalového týmu",
    description: "Hledáme nové posily pro nadcházející sezónu. Přijďte ukázat své dovednosti na trénink příští úterý.",
    date: "2024-09-29",
    content:
      "Zveme všechny zájemkyně na otevřený trénink.\n\nStačí sportovní oblečení a chuť si zahrát.",
    links: [{ label: "Přihláška", href: "https://example.com/prihlaska" }],
  },
  {
    id: "4",
    category: "ATLETIKA",
    title: "Nové tréninkové hodiny pro atletický ovál",
    description: "Od příštího měsíce dochází k úpravě tréninkových hodin na hlavním stadionu. Prosíme všechny členy o kontrolu rozpisu.",
    date: "2024-09-18",
    content:
      "Od příštího měsíce dochází k úpravě tréninkových hodin.\n\nProsíme všechny členy o kontrolu nového rozpisu.",
    links: [{ label: "Rozpis", href: "https://example.com/rozpis" }],
  },
  {
    id: "5",
    category: "BASKETBAL",
    title: "Turnaj 3x3 na letních sportovních hrách",
    description: "Přihlaste svůj tým do letního turnaje v basketbalu 3x3. Ceny pro vítěze a skvělá atmosféra zaručena.",
    date: "2024-07-01",
    content:
      "Letní sportovní hry přináší turnaj 3x3.\n\nPřihlaste svůj tým a přijďte si užít den plný sportu.",
    links: [{ label: "Registrace", href: "https://example.com/registrace" }],
  },
  {
    id: "6",
    category: "FOTBAL",
    title: "Přípravné utkání s VUT Brno",
    description: "Naši fotbalisté se v rámci přípravy utkají s městským rivalem. Přijďte podpořit náš tým v boji o vítězství.",
    date: "2024-06-11",
    content:
      "Přípravné utkání proběhne na hlavním hřišti.\n\nTěšíme se na podporu fanoušků.",
    links: [{ label: "Detaily", href: "https://example.com/detaily" }],
  }
];

const SPORTS = Array.from(new Set(ALL_POSTS.map(p => p.category))).sort();

function PostsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const filteredPosts = selectedSport 
    ? ALL_POSTS.filter(post => post.category === selectedSport)
    : ALL_POSTS;

  const activePostId = searchParams.get("postId");
  const activePost = activePostId ? ALL_POSTS.find((p) => p.id === activePostId) : null;
  const closePostDetail = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("postId");
    const query = params.toString();
    router.push(query ? `?${query}` : "/posts", { scroll: false });
  };

  return (
    <div className="stack-page">
      {/* HEADER SECTION */}
      <SectionHeader 
        title="Příspěvky" 
        as="h1"
      />

      {/* FILTER SECTION */}
      <SportFilter 
        sports={SPORTS} 
        selectedSport={selectedSport} 
        onSportChange={setSelectedSport} 
      />

      {/* LIST SECTION */}
      <div className="stack-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("postId", post.id);
            const href = `/posts?${params.toString()}`;
            return (
              <PostCard
                key={post.id}
                category={post.category}
                title={post.title}
                description={post.description}
                href={href}
                imageUrl={post.imageUrl}
              />
            );
          })
        ) : (
          <EmptyState message="Pro vybraný sport nebyly nalezeny žádné příspěvky." />
        )}
      </div>

      {activePost && (
        <PostDetail
          title={activePost.title}
          category={activePost.category}
          date={activePost.date}
          content={activePost.content}
          imageUrl={activePost.imageUrl}
          links={activePost.links}
          onClose={closePostDetail}
        />
      )}
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div>Načítání...</div>}>
      <PostsContent />
    </Suspense>
  );
}
