import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode, BarChart3, Link2, RefreshCcw, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Code Dinamici",
    description: "Cambia la destinazione del tuo QR code in qualsiasi momento senza doverlo ristampare.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dettagliati",
    description: "Traccia ogni scansione: dispositivo, posizione, browser e molto altro.",
  },
  {
    icon: Link2,
    title: "Short Link Integrati",
    description: "Ogni QR code genera automaticamente un link breve condivisibile.",
  },
  {
    icon: RefreshCcw,
    title: "Aggiornamento Istantaneo",
    description: "Modifica il link di destinazione e il QR code si aggiorna in tempo reale.",
  },
  {
    icon: Shield,
    title: "QR Protetti",
    description: "Aggiungi password o date di scadenza ai tuoi QR code per maggiore sicurezza.",
  },
  {
    icon: Zap,
    title: "Personalizzazione",
    description: "Scegli colori, aggiungi il tuo logo e personalizza ogni aspetto del tuo QR code.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            <span className="font-bold text-lg">QR Generator</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Accedi</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Inizia gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Crea QR Code{" "}
                <span className="text-muted-foreground">dinamici</span>{" "}
                in pochi secondi
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Genera QR code professionali, personalizzabili e tracciabili.
                Cambia la destinazione in qualsiasi momento senza ristampare.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Inizia gratis
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">
                    Ho già un account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Tutto ciò che ti serve
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <feature.icon className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} QR Link Generator. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
