import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Feedback/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VSK Univerzita Brno",
  description: "Informační systém VSK Univerzita Brno",
  icons: {
    icon: "/logo.svg",
  },
};

import { AuthModalProvider } from "@/components/features/auth/AuthModalProvider";
import { AuthModal } from "@/components/features/auth/AuthModal";
import { AppSessionProvider } from "@/components/features/auth/AppSessionProvider";
import GlobalDetailHandler from "@/components/features/admin/GlobalDetailHandler";
import { SetPasswordModal } from "@/components/features/auth/SetPasswordModal";
import { Suspense } from "react";

import { PageReveal } from "@/components/layout/PageReveal";


import { ConfirmProvider } from "@/components/ui/Overlay/ConfirmProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-surface text-on-surface flex flex-col min-h-screen selection:bg-primary/30 selection:text-primary">
        <AppSessionProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AuthModalProvider>
                <NavBar />
                <main className="grow container mx-auto px-4 sm:px-6 pb-12 pt-0 max-w-6xl">
                  {children}
                </main>
                <Footer />
                <AuthModal />
                <Suspense fallback={null}>
                  <SetPasswordModal />
                  <GlobalDetailHandler />
                </Suspense>
              </AuthModalProvider>
            </ConfirmProvider>
          </ToastProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}

