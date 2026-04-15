"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount } from "@/actions/settings";

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.")) return;
    if (!confirm("Confermi l'eliminazione definitiva? Tutti i tuoi QR code e dati saranno persi.")) return;

    startTransition(async () => {
      try {
        await deleteAccount();
      } catch {
        toast.error("Errore durante l'eliminazione");
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Una volta eliminato il tuo account, tutti i tuoi QR code, le scansioni e i dati saranno
        permanentemente rimossi. Questa azione non può essere annullata.
      </p>
      <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="mr-2 h-4 w-4" />
        )}
        Elimina Account
      </Button>
    </div>
  );
}
