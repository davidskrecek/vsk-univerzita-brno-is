"use client"

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaFacebookF, FaInstagram } from 'react-icons/fa6';
import { IoMenu } from 'react-icons/io5';
import AppLink from '@/components/ui/Actions/AppLink';

export const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { name: 'DOMŮ', href: '/' },
    { name: 'PŘÍSPĚVKY', href: '/posts' },
    { name: 'AKCE', href: '/events' },
    { name: 'SPORTY', href: '/sports' },
    { name: 'KONTAKTY', href: '/contacts' },
    { name: 'FORMULÁŘE', href: '/forms' },
    { name: 'OSTATNÍ', href: '/other' },
  ];

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="w-full bg-surface font-sans text-on-surface">
      <div className="container mx-auto max-w-6xl flex h-(--size-navbar-h) items-center justify-between gap-4 px-4 sm:px-6">

        <div className="flex items-center justify-start">
          <NextLink href="/" className="transition-transform hover:scale-105 active:scale-95">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.svg"
                alt="VSK Logo"
                fill
                sizes="3rem"
                className="object-contain"
                priority
              />
            </div>
          </NextLink>
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-2">
          <NextLink href="/" className="group block text-center">
            <span className="block truncate text-base font-display font-bold uppercase tracking-display transition-colors group-hover:text-primary sm:text-xl md:text-2xl">
              VSK UNIVERZITA BRNO
            </span>
          </NextLink>
        </div>

        <div className="relative z-20 flex shrink-0 items-center justify-end gap-3 sm:gap-6">
          <div className="lg:hidden">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation menu"
                  className="relative z-20 rounded-lg bg-surface-container-low p-2 text-on-surface/60 shadow-ambient transition-colors hover:bg-surface-container hover:text-on-surface"
                >
                  <IoMenu size={20} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-[2100] min-w-[70vw] rounded-xl p-2 shadow-2xl border border-outline-variant/20 bg-surface-container-low/95 backdrop-blur-md animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-300"
                  sideOffset={12}
                  align="end"
                >
                  <div className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <DropdownMenu.Item
                        key={link.href}
                        onSelect={() => router.push(link.href)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg outline-none transition-all cursor-pointer tracking-tight ${isActive(link.href)
                          ? 'text-primary bg-primary/10'
                          : 'text-on-surface/90 hover:bg-white/5 active:scale-[0.98]'
                          }`}
                      >
                        {link.name}
                      </DropdownMenu.Item>
                    ))}
                  </div>

                  <DropdownMenu.Separator className="my-2 h-px bg-outline-variant/10" />

                  <div className="grid grid-cols-2 gap-2 p-1">
                    <DropdownMenu.Item asChild>
                      <a
                        href="https://www.facebook.com/VSKUniverzitaBrno"
                        target="_blank"
                        className="flex justify-center items-center gap-2 p-2 text-[10px] font-bold text-on-surface/60 hover:text-[#1877F2] hover:bg-[#1877F2]/10 rounded-lg transition-colors uppercase"
                      >
                        <FaFacebookF size={14} /> FB
                      </a>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <a
                        href="https://www.instagram.com/vskunibrno/"
                        target="_blank"
                        className="flex justify-center items-center gap-2 p-2 text-[10px] font-bold text-on-surface/60 hover:text-[#E4405F] hover:bg-[#E4405F]/10 rounded-lg transition-colors uppercase"
                      >
                        <FaInstagram size={14} /> IG
                      </a>
                    </DropdownMenu.Item>
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          <NextLink
            href="https://www.facebook.com/VSKUniverzitaBrno"
            target="_blank"
            className="hidden lg:inline-flex text-on-surface/40 hover:text-primary transition-colors"
          >
            <FaFacebookF size={18} />
          </NextLink>
          <NextLink
            href="https://www.instagram.com/vskunibrno/"
            target="_blank"
            className="hidden lg:inline-flex text-on-surface/40 hover:text-primary transition-colors"
          >
            <FaInstagram size={20} />
          </NextLink>
        </div>
      </div>

      {/* PRIMARY TIER (Nav Bar) - Glassmorphism & Tonal layering */}
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 hidden lg:block">
        <NavigationMenu.Root className="relative z-10 w-full rounded-md bg-surface-container-low p-1 shadow-ambient">
          <NavigationMenu.List className="flex list-none items-center gap-1.5 overflow-x-auto whitespace-nowrap md:justify-center">

            {navLinks.map((link) => (
              <NavigationMenu.Item key={link.href}>
                <NavigationMenu.Link asChild>
                  <AppLink
                    href={link.href}
                    showUnderline={true}
                    className="px-4 sm:px-6 md:px-8 py-3 text-xs sm:text-[0.875rem] font-bold tracking-wider uppercase no-underline outline-none"
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

