import AppButton from "@/components/Common/AppButton";

interface ErrorScreenProps {
  code: string;
  title: string;
  description: string;
}

export const ErrorScreen = ({
  code,
  title,
  description,
}: ErrorScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="relative">
        <h1 className="text-[10rem] md:text-[15rem] font-display font-bold text-primary/10 leading-none select-none">
          {code}
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-primary uppercase tracking-display">
            {title}
          </h2>
        </div>
      </div>

      <div className="max-w-md space-y-6">
        <p className="text-xl text-on-surface/60 font-sans">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <AppButton href="/" variant="primary">
            Zpět na domovskou stránku
          </AppButton>
        </div>
      </div>

      <div className="w-24 h-1 bg-primary-container rounded-full opacity-20" />
    </div>
  );
};

export default ErrorScreen;
