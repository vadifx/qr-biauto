import { notFound } from "next/navigation";
import { getQRCode } from "@/actions/qr";
import { getFolders } from "@/actions/folders";
import { QRForm } from "@/components/qr/qr-form";

interface EditQRPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQRPage({ params }: EditQRPageProps) {
  const { id } = await params;
  const [qr, folders] = await Promise.all([getQRCode(id), getFolders()]);

  if (!qr) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modifica QR Code</h1>
        <p className="text-muted-foreground">Aggiorna le informazioni del tuo QR code</p>
      </div>
      <QRForm
        folders={folders}
        initialData={{
          id: qr.id,
          title: qr.title,
          destinationUrl: qr.destinationUrl,
          folderId: qr.folderId,
          fgColor: qr.fgColor,
          bgColor: qr.bgColor,
          cornerRadius: qr.cornerRadius,
          expiresAt: qr.expiresAt,
          password: qr.password,
        }}
      />
    </div>
  );
}
