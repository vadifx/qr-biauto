import { getFolders } from "@/actions/folders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, QrCode } from "lucide-react";
import { FolderActions } from "@/components/folders/folder-actions";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import Link from "next/link";

export default async function FoldersPage() {
  const folders = await getFolders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartelle</h1>
          <p className="text-muted-foreground">Organizza i tuoi QR code in cartelle</p>
        </div>
        <CreateFolderDialog />
      </div>

      {folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nessuna cartella</h3>
          <p className="text-muted-foreground mt-1">Crea la tua prima cartella per organizzare i QR code</p>
          <div className="mt-4">
            <CreateFolderDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Card key={folder.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: folder.color || "#6B7280" }}
                  />
                  <CardTitle className="text-base">{folder.name}</CardTitle>
                </div>
                <FolderActions folder={folder} />
              </CardHeader>
              <CardContent>
                <Link
                  href={`/qr?folder=${folder.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  {folder._count.qrCodes} QR code
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
