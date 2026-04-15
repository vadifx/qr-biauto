import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">La pagina che cerchi non esiste.</p>
        <Button asChild>
          <Link href="/">Torna alla home</Link>
        </Button>
      </div>
    </div>
  );
}
