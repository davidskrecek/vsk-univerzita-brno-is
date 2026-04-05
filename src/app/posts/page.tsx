"use client"

import { useState } from 'react';
import { PostCard } from "@/components/Posts/PostCard";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import SectionHeader from "@/components/Common/SectionHeader";
import EmptyState from "@/components/Common/EmptyState";

// Mock data for posts
const ALL_POSTS = [
  {
    category: "ATLETIKA",
    title: "Vítězství na akademickém mistrovství v běhu",
    description: "Naši běžci ovládli finálový závod v Praze a domů přivážejí celkem pět zlatých medailí v různých kategoriích.",
    href: "/posts/1"
  },
  {
    category: "BASKETBAL",
    title: "Basketbalisté postoupili do univerzitní ligy",
    description: "Po napínavém souboji s Technickou univerzitou si náš tým vybojoval postup do nejvyšší národní divize.",
    href: "/posts/2"
  },
  {
    category: "VOLEJBAL",
    title: "Otevřený nábor do ženského volejbalového týmu",
    description: "Hledáme nové posily pro nadcházející sezónu. Přijďte ukázat své dovednosti na trénink příští úterý.",
    href: "/posts/3"
  },
  {
    category: "ATLETIKA",
    title: "Nové tréninkové hodiny pro atletický ovál",
    description: "Od příštího měsíce dochází k úpravě tréninkových hodin na hlavním stadionu. Prosíme všechny členy o kontrolu rozpisu.",
    href: "/posts/4"
  },
  {
    category: "BASKETBAL",
    title: "Turnaj 3x3 na letních sportovních hrách",
    description: "Přihlaste svůj tým do letního turnaje v basketbalu 3x3. Ceny pro vítěze a skvělá atmosféra zaručena.",
    href: "/posts/5"
  },
  {
    category: "FOTBAL",
    title: "Přípravné utkání s VUT Brno",
    description: "Naši fotbalisté se v rámci přípravy utkají s městským rivalem. Přijďte podpořit náš tým v boji o vítězství.",
    href: "/posts/6"
  }
];

const SPORTS = Array.from(new Set(ALL_POSTS.map(p => p.category))).sort();

export default function PostsPage() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const filteredPosts = selectedSport 
    ? ALL_POSTS.filter(post => post.category === selectedSport)
    : ALL_POSTS;

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
          filteredPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))
        ) : (
          <EmptyState message="Pro vybraný sport nebyly nalezeny žádné příspěvky." />
        )}
      </div>
    </div>
  );
}
