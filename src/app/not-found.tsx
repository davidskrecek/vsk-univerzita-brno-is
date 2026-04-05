import AppButton from '@/components/Common/AppButton';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="relative">
        <h1 className="text-[10rem] md:text-[15rem] font-display font-bold text-primary/10 leading-none select-none">
          404
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-primary uppercase tracking-display">
            Stránka nenalezena
          </h2>
        </div>
      </div>

      <div className="max-w-md space-y-6">
        <p className="text-xl text-on-surface/60 font-sans">
          Omlouváme se, ale hledaná stránka neexistuje nebo byla přesunuta do jiné části našeho systému.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <AppButton href="/" variant="primary">
            Zpět na domovskou stránku
          </AppButton>
        </div>
      </div>

      {/* Decorative Tonal Element */}
      <div className="w-24 h-1 bg-primary-container rounded-full opacity-20" />
    </div>
  );
}
