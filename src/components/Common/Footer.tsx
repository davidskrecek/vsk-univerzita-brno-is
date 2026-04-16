"use client";

import React from 'react';
import Image from 'next/image';
import AppLink from '@/components/Common/AppLink';
import { useAuthModal } from '@/components/Auth/AuthModalProvider';

const SPONSORS = [
  { name: 'Jihomoravský kraj', src: '/sponsors/jmk.jpg' },
  { name: 'Město Brno', src: '/sponsors/mb.jpg' },
  { name: 'MŠMT', src: '/sponsors/msmt.jpg' },
  { name: 'Národní sportovní agentura', src: '/sponsors/nsa.png' },
];

export const Footer = () => {
  const { openModal } = useAuthModal();

  return (
    <footer className="w-full bg-surface-lowest pt-12 sm:pt-16 pb-8 text-on-surface/60">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Sponsors Logos Section */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 mb-10 sm:mb-12">
          {SPONSORS.map((sponsor) => (
            <div
              key={sponsor.name}
              className="relative h-10 w-28 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            >
              <Image
                src={sponsor.src}
                alt={sponsor.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm font-medium mb-6">
          <AppLink href="/privacy">
            Zásady ochrany osobních údajů
          </AppLink>

          <button
            onClick={openModal}
            className="text-on-surface/60 hover:text-primary transition-colors focus:outline-none"
          >
            Přihlášení
          </button>
        </div>

        {/* Copyright */}
        <div className="text-xs tracking-wide opacity-40">
          © VSK Univerzita Brno
        </div>
      </div>
    </footer>
  );
};
