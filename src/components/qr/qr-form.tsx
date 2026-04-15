"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQRCode, updateQRCode } from "@/actions/qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRPreview } from "@/components/qr/qr-preview";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface Folder {
  id: string;
  name: string;
}

interface QRFormProps {
  folders: Folder[];
  initialData?: {
    id: string;
    title: string;
    destinationUrl: string;
    folderId: string | null;
    fgColor: string;
    bgColor: string;
    cornerRadius: number;
    expiresAt: Date | null;
    password: string | null;
  };
}

export function QRForm({ folders, initialData }: QRFormProps) {
  const isEditing = !!initialData;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.title || "");
  const [destinationUrl, setDestinationUrl] = useState(initialData?.destinationUrl || "");
  const [folderId, setFolderId] = useState(initialData?.folderId || "");
  const [fgColor, setFgColor] = useState(initialData?.fgColor || "#000000");
  const [bgColor, setBgColor] = useState(initialData?.bgColor || "#FFFFFF");
  const [cornerRadius, setCornerRadius] = useState(initialData?.cornerRadius || 0);
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expiresAt ? initialData.expiresAt.toISOString().split("T")[0] : ""
  );
  const [password, setPassword] = useState(initialData?.password || "");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const previewUrl = destinationUrl || "https://example.com";

  function handleSubmit() {
    startTransition(async () => {
      try {
        const data = {
          title,
          destinationUrl,
          folderId: folderId || null,
          fgColor,
          bgColor,
          cornerRadius,
          expiresAt: expiresAt || null,
          password: password || null,
        };

        if (isEditing) {
          await updateQRCode(initialData.id, data);
          toast.success("QR code aggiornato");
          router.push(`/qr/${initialData.id}`);
          router.refresh();
        } else {
          await createQRCode(data);
          toast.success("QR code creato");
        }
      } catch {
        toast.error("Si è verificato un errore");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                placeholder="Es: Sito web aziendale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL di Destinazione</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://esempio.com"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
              />
            </div>
            {folders.length > 0 && (
              <div className="space-y-2">
                <Label>Cartella</Label>
                <Select value={folderId} onValueChange={(v) => setFolderId(v || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nessuna cartella" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuna cartella</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalizzazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fgColor">Colore QR</Label>
                <div className="flex gap-2">
                  <Input
                    id="fgColor"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bgColor">Colore Sfondo</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cornerRadius">
                Arrotondamento angoli: {cornerRadius}
              </Label>
              <input
                id="cornerRadius"
                type="range"
                min="0"
                max="50"
                value={cornerRadius}
                onChange={(e) => setCornerRadius(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opzioni Avanzate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Data di Scadenza (opzionale)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (opzionale)</Label>
              <Input
                id="password"
                type="text"
                placeholder="Lascia vuoto per nessuna protezione"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={isPending || !title || !destinationUrl}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditing ? "Aggiorna QR Code" : "Crea QR Code"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Annulla
          </Button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle>Anteprima</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <QRPreview
                value={`${baseUrl}/r/preview`}
                fgColor={fgColor}
                bgColor={bgColor}
                size={220}
              />
              <div className="text-center space-y-1">
                <p className="font-medium text-sm">{title || "Titolo QR Code"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                  {previewUrl}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
