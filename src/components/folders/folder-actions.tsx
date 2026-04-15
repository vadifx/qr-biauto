"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { deleteFolder } from "@/actions/folders";
import { toast } from "sonner";

interface FolderActionsProps {
  folder: { id: string; name: string };
}

export function FolderActions({ folder }: FolderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Eliminare la cartella "${folder.name}"? I QR code non saranno eliminati.`)) return;
    startTransition(async () => {
      try {
        await deleteFolder(folder.id);
        toast.success("Cartella eliminata");
        router.refresh();
      } catch {
        toast.error("Errore durante l'eliminazione");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Elimina
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
