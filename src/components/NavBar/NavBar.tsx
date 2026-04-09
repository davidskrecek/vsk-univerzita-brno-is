"use client"

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaFacebookF, FaInstagram } from 'react-icons/fa6';
import { IoMenu } from 'react-icons/io5';
import AppLink from '../Common/AppLink';

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
  ];

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="w-full bg-surface font-sans text-on-surface">
      <div className="container mx-auto max-w-6xl flex h-(--size-navbar-h) items-center justify-between gap-4 px-4 sm:px-6">

        <div className="flex items-center justify-start">
          <NextLink href="/" className="transition-transform hover:scale-105 active:scale-95">
            <Image
              src="/logo.svg"
              alt="VSK Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
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
                  className="z-[2100] min-w-[14rem] rounded-md p-1 shadow-ambient border border-outline-variant/10 bg-surface-container-low animate-in fade-in zoom-in-95 duration-200"
                  sideOffset={10}
                  align="end"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  {navLinks.map((link) => (
                    <DropdownMenu.Item
                      key={link.href}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-md outline-none transition-colors cursor-pointer uppercase tracking-wider ${
                        isActive(link.href)
                          ? 'text-primary bg-primary/10'
                          : 'text-on-surface/80 hover:text-primary hover:bg-primary/10'
                      }`}
                      onSelect={() => {
                        router.push(link.href);
                      }}
                    >
                      {link.name}
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator className="my-1 h-px bg-outline-variant/20" />
                  <DropdownMenu.Item asChild>
                    <a
                      href="https://www.facebook.com/VSKUniverzitaBrno"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-on-surface/80 hover:text-primary hover:bg-primary/10 rounded-md outline-none transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      <FaFacebookF size={14} />
                      Facebook
                    </a>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <a
                      href="https://www.instagram.com/vskunibrno/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-on-surface/80 hover:text-primary hover:bg-primary/10 rounded-md outline-none transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      <FaInstagram size={16} />
                      Instagram
                    </a>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          <NextLink
            href="https://facebook.com"
            target="_blank"
            className="hidden lg:inline-flex text-on-surface/40 hover:text-primary transition-colors"
          >
            <FaFacebookF size={18} />
          </NextLink>
          <NextLink
            href="https://instagram.com"
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
