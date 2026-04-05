"use client"

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import NextLink from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaInstagram } from 'react-icons/fa6';
import AppLink from '../Common/AppLink';

export const NavBar = () => {
  const navLinks = [
    { name: 'DOMŮ', href: '/' },
    { name: 'PŘÍSPĚVKY', href: '/posts' },
    { name: 'AKCE', href: '/events' },
    { name: 'SPORTY', href: '/sports' },
    { name: 'KONTAKTY', href: '/contacts' },
    { name: 'FORMULÁŘE', href: '/forms' },
  ];

  return (
    <header className="w-full bg-surface font-sans text-on-surface">
      <div className="container mx-auto max-w-6xl flex h-(--size-navbar-h) items-center justify-between px-6">

        <div className="w-1/4 flex justify-start">
          <NextLink href="/" className="transition-transform hover:scale-105 active:scale-95">
            <Image
              src="/logo.svg"
              alt="VSK Logo"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </NextLink>
        </div>

        <div className="flex w-1/2 justify-center">
          <NextLink href="/" className="group text-center">
            <span className="text-2xl font-display font-bold tracking-display uppercase transition-colors group-hover:text-primary">
              VSK UNIVERZITA BRNO
            </span>
          </NextLink>
        </div>

        <div className="flex w-1/4 justify-end gap-6">
          <NextLink
            href="https://facebook.com"
            target="_blank"
            className="text-on-surface/40 hover:text-primary transition-colors"
          >
            <FaFacebookF size={18} />
          </NextLink>
          <NextLink
            href="https://instagram.com"
            target="_blank"
            className="text-on-surface/40 hover:text-primary transition-colors"
          >
            <FaInstagram size={20} />
          </NextLink>
        </div>
      </div>

      {/* PRIMARY TIER (Nav Bar) - Glassmorphism & Tonal layering */}
      <div className="container mx-auto max-w-6xl px-6">
        <NavigationMenu.Root className="relative z-10 w-full rounded-md bg-surface-container-low p-1 shadow-ambient">
          <NavigationMenu.List className="flex list-none items-center justify-center gap-1.5">

            {navLinks.map((link) => (
              <NavigationMenu.Item key={link.href}>
                <NavigationMenu.Link asChild>
                  <AppLink
                    href={link.href}
                    showUnderline={true}
                    className="px-8 py-3.5 text-[0.875rem] font-bold tracking-wider uppercase no-underline outline-none"
                  >
                    {link.name}
                  </AppLink>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            ))}

          </NavigationMenu.List>

          <div className="absolute left-0 top-full flex w-full justify-center">
            <NavigationMenu.Viewport className="glass-overlay mt-0.5 rounded-md border border-outline-variant" />
          </div>
        </NavigationMenu.Root>
      </div>
    </header>
  );
};
