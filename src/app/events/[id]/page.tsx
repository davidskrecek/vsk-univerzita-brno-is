"use client"

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import EventDetail from "@/components/Events/EventDetail";

// Mock data - should be shared or from a central source
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'VSK BRNO VS. UK PRAHA',
    sport: 'MISTROVSKÉ UTKÁNÍ',
    date: '2024-12-14',
    time: '18:30',
    location: 'Hala VSK, Technická 3013/14, Brno',
    description: 'Přijďte podpořit náš tým v klíčovém 12. kole Univerzitní ligy! Souboj mezi VSK UNIVERZITA BRNO a UK Praha slibuje špičkovou sportovní úroveň a napínavou atmosféru.\n\nVstupenky jsou k dispozici na místě nebo v předprodeji na sekretariátu klubu. Studenti VUT mají vstup zdarma po předložení ISIC karty. Těšíme se na vaši podporu v hledišti.'
  },
  {
    id: '2',
    title: 'Plavecké závody o pohár rektora',
    sport: 'PLAVÁNÍ',
    date: '2024-10-22',
    time: '09:00',
    location: 'Bazén Lužánky',
    description: 'Tradiční plavecké závody pro studenty i zaměstnance. Přijďte si zazávodit v různých disciplínách nebo podpořit své kolegy.'
  },
  {
    id: '3',
    title: 'Workshop: Sportovní psychologie',
    sport: 'OSTATNÍ',
    date: '2024-11-05',
    time: '14:00',
    location: 'Aula FSpS MU',
    description: 'Jak se mentálně připravit na vrcholný výkon? Přední čeští odborníci se podělí o své zkušenosti s přípravou profesionálních sportovců.'
  },
  {
    id: '4',
    title: 'UNIVERZITNÍ LIGA',
    sport: 'BASKETBAL',
    date: '2024-11-12',
    time: '18:00',
    location: 'Hala A',
    description: 'Další domácí zápas našich basketbalistů v rámci Univerzitní ligy. Přijďte vytvořit bouřlivou atmosféru!'
  },
  {
    id: '5',
    title: 'Trénink Volejbal',
    sport: 'VOLEJBAL',
    date: '2024-11-05',
    description: 'Pravidelný trénink volejbalového týmu. Noví zájemci jsou vítáni.'
  },
  {
    id: '6',
    title: 'Turnaj v Šachu',
    sport: 'OSTATNÍ',
    date: '2024-11-09',
    description: 'Otevřený šachový turnaj pro všechny úrovně. Registrace na místě.'
  },
  {
    id: '7',
    title: 'Nábor nových členů',
    sport: 'ATLETIKA',
    date: '2024-11-15',
    description: 'Hledáme nové talenty do atletického oddílu! Přijďte si vyzkoušet trénink pod vedením zkušených koučů.'
  },
  {
    id: '8',
    title: 'Běžecký trénink',
    sport: 'ATLETIKA',
    date: '2024-11-20',
    description: 'Kondiční běžecký trénink pro veřejnost i členy klubu.'
  },
  {
    id: '9',
    title: 'Florbalový zápas',
    sport: 'FLORBAL',
    date: '2024-11-25',
    time: '19:30',
    location: 'Sokolovna',
    description: 'Napínavý florbalový souboj. Vstup volný.'
  }
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;

  const event = MOCK_EVENTS.find(e => e.id === eventId);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h1 className="text-2xl font-display font-bold text-on-surface">Událost nenalezena</h1>
        <p className="text-on-surface/60">Je nám líto, ale požadovaná událost neexistuje.</p>
        <button 
          onClick={() => router.push('/events')}
          className="btn-primary mt-4"
        >
          Zpět na kalendář
        </button>
      </div>
    );
  }

  return (
    <main className="py-12 px-4 flex justify-center items-center min-h-[80vh]">
      <EventDetail 
        key={eventId}
        {...event} 
        onClose={() => {
          const currentParams = searchParams.toString();
          router.push(`/events${currentParams ? `?${currentParams}` : ''}`);
        }}
      />
    </main>
  );
}