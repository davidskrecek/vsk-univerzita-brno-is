"use client"

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SectionHeader from "@/components/Common/SectionHeader";
import ViewToggle from "@/components/Common/ViewToggle";
import { EventCard } from "@/components/Events/EventCard";
import { Calendar, CalendarEvent } from "@/components/Events/Calendar/Calendar";

import SportFilter from "@/components/Common/SportFilter/SportFilter";
import EmptyState from "@/components/Common/EmptyState";

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Univerzitní hokejová bitva',
    date: '2024-10-15',
    time: '18:00',
    location: 'Winning Group Arena, Brno',
    sport: 'HOKEJ'
  },
  {
    id: '2',
    title: 'Plavecké závody o pohár rektora',
    date: '2024-10-22',
    time: '09:00',
    location: 'Bazén Lužánky',
    sport: 'PLAVÁNÍ'
  },
  {
    id: '3',
    title: 'Workshop: Sportovní psychologie',
    date: '2024-11-05',
    time: '14:00',
    location: 'Aula FSpS MU',
    sport: 'OSTATNÍ'
  },
  {
    id: '4',
    title: 'UNIVERZITNÍ LIGA',
    date: '2024-11-12',
    time: '18:00',
    location: 'Hala A',
    sport: 'BASKETBAL'
  },
  {
    id: '5',
    title: 'Trénink Volejbal',
    date: '2024-11-05',
    sport: 'VOLEJBAL'
  },
  {
    id: '6',
    title: 'Turnaj v Šachu',
    date: '2024-11-09',
    sport: 'OSTATNÍ'
  },
  {
    id: '7',
    title: 'Nábor nových členů',
    date: '2024-11-15',
    sport: 'ATLETIKA'
  },
  {
    id: '8',
    title: 'Běžecký trénink',
    date: '2024-11-20',
    sport: 'ATLETIKA'
  },
  {
    id: '9',
    title: 'Florbalový zápas',
    date: '2024-11-25',
    sport: 'FLORBAL',
    time: '19:30',
    location: 'Sokolovna'
  }
];

const SPORTS = Array.from(new Set(MOCK_EVENTS.map(e => e.sport))).sort();

type ViewMode = 'calendar' | 'list';

function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const viewMode = (searchParams.get('view') as ViewMode) || 'calendar';
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const setViewMode = (mode: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const toggleOptions = [
    { id: 'calendar' as const, label: 'Kalendář' },
    { id: 'list' as const, label: 'Seznam' }
  ];

  // Map month numbers to Czech abbreviations for EventCard
  const getCzechMonth = (dateStr: string) => {
    const months = ['LED', 'ÚNO', 'BŘE', 'DUB', 'KVĚ', 'ČER', 'ČVC', 'SRP', 'ZÁŘ', 'ŘÍJ', 'LIS', 'PRO'];
    return months[new Date(dateStr).getMonth()];
  };

  const filteredEvents = selectedSport 
    ? MOCK_EVENTS.filter(event => event.sport === selectedSport)
    : MOCK_EVENTS;

  return (
    <div className="stack-page">
      <SectionHeader 
        title="Kalendář akcí" 
        as="h1" 
        rightContent={
          <ViewToggle 
            options={toggleOptions} 
            activeId={viewMode} 
            onChange={setViewMode} 
          />
        }
      />

      {/* FILTER SECTION */}
      <SportFilter 
        sports={SPORTS} 
        selectedSport={selectedSport} 
        onSportChange={setSelectedSport} 
      />

      <div className="min-h-[600px]">
        {viewMode === 'calendar' ? (
          <Calendar events={filteredEvents} />
        ) : (
          <div className="stack-list">
            {filteredEvents.length > 0 ? (
              filteredEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(event => (
                <EventCard 
                  key={event.id}
                  id={event.id}
                  day={String(new Date(event.date).getDate())}
                  month={getCzechMonth(event.date)}
                  category={event.sport}
                  title={event.title}
                  location={event.location || 'Bude upřesněno'}
                  href={`/events/${event.id}`}
                />
              ))
            ) : (
              <EmptyState message="Pro vybraný sport nebyly nalezeny žádné akce." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Načítání...</div>}>
      <EventsContent />
    </Suspense>
  );
}
