import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů | VSK Univerzita Brno",
  description: "Informace o zpracování osobních údajů v informačním systému VSK Univerzita Brno.",
};

export default function PrivacyPage() {
  return (
    <article className="stack-page max-w-4xl mx-auto">
      <header className="stack-section">
        <div className="meta-eyebrow">Právní informace</div>
        <h1 className="text-4xl md:text-6xl font-display font-bold">Ochrana osobních údajů</h1>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Vážíme si vašeho soukromí. Tento dokument vysvětluje, jaké osobní údaje sbíráme,
          jak s nimi nakládáme a jaká jsou vaše práva v souladu s nařízením GDPR.
        </p>
      </header>

      <section className="stack-section">
        <h2 className="text-2xl font-display font-bold text-primary">1. Správce osobních údajů</h2>
        <div className="card-surface cursor-default">
          <p className="font-bold text-lg mb-2">Vysokoškolský sportovní klub Univerzita Brno</p>
          <ul className="text-on-surface-variant space-y-1">
            <li>Sídlo: Brno, Česká republika</li>
            <li>E-mail: admin@vsk.cz</li>
          </ul>
        </div>
      </section>

      <section className="stack-section">
        <h2 className="text-2xl font-display font-bold text-primary">2. Rozsah a účel zpracování</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card-surface cursor-default">
            <h3 className="font-bold text-secondary mb-2">Identifikační a kontaktní údaje</h3>
            <p className="text-sm text-on-surface-variant">
              Jméno, příjmení, role, e-mail a telefon. Tyto údaje využíváme pro správu členství,
              pořádání sportovních akcí a komunikaci v rámci klubu.
            </p>
          </div>
          <div className="card-surface cursor-default">
            <h3 className="font-bold text-secondary mb-2">Technické údaje a logy</h3>
            <p className="text-sm text-on-surface-variant">
              IP adresa, časy přihlášení a záznamy o změnách v systému (auditní logy).
              Tyto údaje zpracováváme na základě oprávněného zájmu za účelem zajištění bezpečnosti systému.
            </p>
          </div>
          <div className="card-surface cursor-default">
            <h3 className="font-bold text-secondary mb-2">Veřejné kontakty</h3>
            <p className="text-sm text-on-surface-variant">
              U aktivních trenérů a funkcionářů zveřejňujeme jméno a pracovní kontakt v adresáři,
              aby byla umožněna komunikace veřejnosti s klubem.
            </p>
          </div>
          <div className="card-surface cursor-default">
            <h3 className="font-bold text-secondary mb-2">Obsah a média</h3>
            <p className="text-sm text-on-surface-variant">
              Texty a fotografie u příspěvků a akcí jsou zpracovávány za účelem informování o činnosti klubu.
            </p>
          </div>
        </div>
      </section>

      <section className="stack-section">
        <h2 className="text-2xl font-display font-bold text-primary">3. Soubory cookies</h2>
        <p className="text-on-surface-variant">
          Systém využívá pouze nezbytné technické soubory cookies pro zajištění funkčnosti přihlášení
          a bezpečnosti (NextAuth). Tyto cookies jsou vyžadovány pro správný chod aplikace
          a nelze je v systému deaktivovat.
        </p>
      </section>

      <section className="stack-section">
        <h2 className="text-2xl font-display font-bold text-primary">4. Příjemci osobních údajů</h2>
        <p className="text-on-surface-variant mb-4">
          Vaše údaje jsou u nás v bezpečí. K datům mají přístup pouze pověřené osoby klubu a naši prověření zpracovatelé:
        </p>
        <ul className="list-disc list-inside text-on-surface-variant space-y-2 ml-4">
          <li>Poskytovatel hostingových služeb (infrastruktura aplikace).</li>
          <li>Poskytovatel e-mailových služeb (odesílání pozvánek a oznámení).</li>
          <li>OpenStreetMap / Mapbox (zobrazení mapových podkladů u sportovních akcí).</li>
        </ul>
      </section>

      <section className="stack-section">
        <h2 className="text-2xl font-display font-bold text-primary">5. Vaše práva</h2>
        <p className="text-on-surface-variant">
          Podle GDPR máte právo na přístup ke svým údajům, jejich opravu, přenositelnost nebo výmaz.
          Můžete také vznést námitku proti zpracování na základě oprávněného zájmu.
          Se svými požadavky se na nás můžete kdykoliv obrátit na e-mailu <span className="text-primary">admin@vsk.cz</span>.
        </p>
      </section>

      <footer className="pt-12 border-t border-outline-variant/10 text-meta-caption">
        Poslední aktualizace: 21. dubna 2026
      </footer>
    </article>
  );
}
