import React from 'react';
import AppButton from '../Common/AppButton';

interface BannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  href: string;
}

export const Banner = ({ title, subtitle, buttonText, href }: BannerProps) => {
  return (
    <div className="w-full bg-secondary rounded-md overflow-hidden relative group shadow-ambient/10 h-(--size-banner-h) flex items-center">
      {/* Background Soul - subtle darker gradient to keep it premium */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent" />
      
      <div className="relative w-full px-8 flex items-center justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <h2 className="text-lg md:text-xl font-display font-bold text-on-secondary uppercase tracking-tight whitespace-nowrap">
            {title}
            <span className="hidden md:inline mx-4 opacity-20">|</span>
          </h2>
          <p className="hidden md:block text-xs md:text-sm text-on-secondary/70 font-sans italic truncate">
            {subtitle}
          </p>
        </div>

        <AppButton 
          href={href} 
          variant="secondary" 
          className="text-[0.625rem] py-1.5 px-4 uppercase tracking-widest whitespace-nowrap bg-on-secondary text-secondary hover:bg-on-secondary/90 border-none"
        >
          {buttonText}
        </AppButton>
      </div>
    </div>
  );
};
