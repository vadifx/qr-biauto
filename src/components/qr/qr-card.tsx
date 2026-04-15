"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { QRPreview } from "@/components/qr/qr-preview";
import {
  MoreHorizontal,
  ExternalLink,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { updateQRCode, deleteQRCode } from "@/actions/qr";
import { toast } from "sonner";
import { useTransition } from "react";

interface QRCardProps {
  qr: {
    id: string;
    title: string;
    shortCode: string;
    destinationUrl: string;
    isActive: boolean;
    fgColor: string;
    bgColor: string;
    folder: { name: string; color: string | null } | null;
    _count: { scans: number };
    createdAt: Date;
  };
}

export function QRCard({ qr }: QRCardProps) {
  const [isPending, startTransition] = useTransition();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shortUrl = `${baseUrl}/r/${qr.shortCode}`;

  function copyLink() {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Link copiato!");
  }

  function toggleActive() {
    startTransition(async () => {
      await updateQRCode(qr.id, { isActive: !qr.isActive });
      toast.success(qr.isActive ? "QR disattivato" : "QR attivato");
    });
  }

  function handleDelete() {
    if (!confirm("Sei sicuro di voler eliminare questo QR code?")) return;
    startTransition(async () => {
      await deleteQRCode(qr.id);
      toast.success("QR eliminato");
    });
  }

  return (
    <Card className={`transition-all hover:shadow-md ${!qr.isActive ? "opacity-60" : ""} ${isPending ? "pointer-events-none" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link href={`/qr/${qr.id}`} className="shrink-0">
            <QRPreview
              value={shortUrl}
              fgColor={qr.fgColor}
              bgColor={qr.bgColor}
              size={80}
              className="!p-2 !rounded-lg"
            />
          </Link>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Link href={`/qr/${qr.id}`} className="font-semibold truncate hover:underline">
                {qr.title}
              </Link>
              {!qr.isActive && <Badge variant="secondary">Inattivo</Badge>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{qr.destinationUrl}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{qr._count.scans} scansioni</span>
              {qr.folder && (
                <>
                  <span>&middot;</span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {qr.folder.name}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.location.href = `/qr/${qr.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Dettaglio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `/qr/${qr.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copia Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleActive}>
                {qr.isActive ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Disattiva
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Attiva
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
