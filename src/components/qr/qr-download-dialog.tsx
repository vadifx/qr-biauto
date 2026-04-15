"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QRDownloadDialogProps {
  qrId: string;
  title: string;
  children?: React.ReactNode;
}

export function QRDownloadDialog({ qrId, title, children }: QRDownloadDialogProps) {
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState("800");
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/qr/${qrId}/download?format=${format}&size=${size}`);
      if (!res.ok) throw new Error("Download fallito");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download completato");
    } catch {
      toast.error("Errore durante il download");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        {children || (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Scarica
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scarica QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Formato</Label>
            <Select value={format} onValueChange={(v) => v && setFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (Immagine)</SelectItem>
                <SelectItem value="svg">SVG (Vettoriale)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {format === "png" && (
            <div className="space-y-2">
              <Label>Dimensione</Label>
              <Select value={size} onValueChange={(v) => v && setSize(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">400x400 px</SelectItem>
                  <SelectItem value="800">800x800 px</SelectItem>
                  <SelectItem value="1200">1200x1200 px</SelectItem>
                  <SelectItem value="2000">2000x2000 px (Stampa)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={handleDownload} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Scarica {format.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
