"use client";

import React from 'react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import AppLink from '@/components/Common/AppLink';
import { useAuthModal } from '@/components/Auth/AuthModalProvider';

const SPONSORS = [
  { name: 'Jihomoravský kraj', src: '/sponsors/jmk.jpg', href: 'https://www.jmk.cz/' },
  { name: 'Město Brno', src: '/sponsors/mb.jpg', href: 'https://www.brno.cz/' },
  { name: 'MŠMT', src: '/sponsors/msmt.jpg', href: 'https://msmt.gov.cz/' },
  { name: 'Národní sportovní agentura', src: '/sponsors/nsa.png', href: 'https://nsa.gov.cz/' },
];

export const Footer = () => {
  const { openModal } = useAuthModal();
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const userLabel = session?.user?.email ?? session?.user?.name ?? 'Přihlášený uživatel';

  return (
    <footer className="w-full bg-surface-lowest pt-12 sm:pt-16 pb-8 text-on-surface/60">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Sponsors Logos Section */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 mb-10 sm:mb-12">
          {SPONSORS.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.href}
              target="_blank"
              rel="noreferrer"
              className="relative h-10 w-28 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500 block"
            >
              <Image
                src={sponsor.src}
                alt={sponsor.name}
                fill
                sizes="7rem"
                className="object-contain"
              />
            </a>
          ))}
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm font-medium mb-6">
          <AppLink href="/privacy">
            Zásady ochrany osobních údajů
          </AppLink>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-on-surface/55 text-xs sm:text-sm">Přihlášen: {userLabel}</span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-on-surface/60 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-lowest"
              >
                Odhlásit se
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openModal}
              className="text-on-surface/60 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-lowest"
            >
              Přihlášení
            </button>
          )}
        </div>

        {/* Copyright */}
        <div className="text-xs tracking-wide opacity-40">
          © VSK Univerzita Brno
        </div>
      </div>
    </footer>
  );
};
