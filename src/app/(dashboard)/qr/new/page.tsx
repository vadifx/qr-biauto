import { QRForm } from "@/components/qr/qr-form";
import { getFolders } from "@/actions/folders";

export default async function NewQRPage() {
  const folders = await getFolders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuovo QR Code</h1>
        <p className="text-muted-foreground">Crea un nuovo QR code dinamico</p>
      </div>
      <QRForm folders={folders} />
    </div>
  );
}
