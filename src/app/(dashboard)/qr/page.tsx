import Link from "next/link";
import { getQRCodes } from "@/actions/qr";
import { QRCard } from "@/components/qr/qr-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface QRListPageProps {
  searchParams: Promise<{ search?: string; page?: string; folder?: string }>;
}

export default async function QRListPage({ searchParams }: QRListPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { qrCodes, pagination } = await getQRCodes({
    search: params.search,
    folderId: params.folder,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">I miei QR Code</h1>
          <p className="text-muted-foreground">
            {pagination.total} QR code totali
          </p>
        </div>
        <Button asChild>
          <Link href="/qr/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo QR
          </Link>
        </Button>
      </div>

      <form className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Cerca per titolo, URL o codice..."
            defaultValue={params.search}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Cerca
        </Button>
      </form>

      {qrCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nessun QR code trovato</h3>
          <p className="text-muted-foreground mt-1">
            {params.search
              ? "Prova a modificare i termini di ricerca"
              : "Crea il tuo primo QR code per iniziare"}
          </p>
          {!params.search && (
            <Button asChild className="mt-4">
              <Link href="/qr/new">
                <Plus className="mr-2 h-4 w-4" />
                Crea QR Code
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {qrCodes.map((qr) => (
              <QRCard key={qr.id} qr={qr} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/qr?page=${p}${params.search ? `&search=${params.search}` : ""}`}
                    >
                      {p}
                    </Link>
                  </Button>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
