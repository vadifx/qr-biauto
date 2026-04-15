import { notFound } from "next/navigation";
import Link from "next/link";
import { getQRCode } from "@/actions/qr";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRPreview } from "@/components/qr/qr-preview";
import { QRDownloadDialog } from "@/components/qr/qr-download-dialog";
import { CopyButton } from "@/components/qr/copy-button";
import {
  Edit,
  ExternalLink,
  Monitor,
  Globe,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface QRDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QRDetailPage({ params }: QRDetailPageProps) {
  const { id } = await params;
  const qr = await getQRCode(id);

  if (!qr) notFound();

  const session = await auth();
  const recentScans = await prisma.scan.findMany({
    where: { qrCodeId: qr.id, qrCode: { userId: session!.user!.id! } },
    orderBy: { scannedAt: "desc" },
    take: 10,
  });

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const shortUrl = `${baseUrl}/r/${qr.shortCode}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{qr.title}</h1>
          <p className="text-muted-foreground">
            Creato il {format(qr.createdAt, "dd MMMM yyyy", { locale: it })}
          </p>
        </div>
        <div className="flex gap-2">
          <QRDownloadDialog qrId={qr.id} title={qr.title} />
          <Button asChild>
            <Link href={`/qr/${qr.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <QRPreview
              value={shortUrl}
              fgColor={qr.fgColor}
              bgColor={qr.bgColor}
              size={200}
            />
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={qr.isActive ? "default" : "secondary"}>
                  {qr.isActive ? "Attivo" : "Inattivo"}
                </Badge>
                {qr.folder && (
                  <Badge variant="outline">{qr.folder.name}</Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                  <span className="text-muted-foreground truncate flex-1 mr-2">
                    {shortUrl}
                  </span>
                  <CopyButton text={shortUrl} />
                </div>

                <div className="flex items-start gap-2 p-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <a
                    href={qr.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all hover:underline"
                  >
                    {qr.destinationUrl}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{qr._count.scans}</p>
                  <p className="text-xs text-muted-foreground">Scansioni</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{qr.history.length}</p>
                  <p className="text-xs text-muted-foreground">Modifiche URL</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="scans">
            <TabsList>
              <TabsTrigger value="scans">Scansioni Recenti</TabsTrigger>
              <TabsTrigger value="history">Cronologia Link</TabsTrigger>
            </TabsList>

            <TabsContent value="scans">
              <Card>
                <CardHeader>
                  <CardTitle>Ultime scansioni</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentScans.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nessuna scansione ancora
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentScans.map((scan) => (
                        <div
                          key={scan.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {scan.browser || "Sconosciuto"} &middot; {scan.os || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {scan.device || "desktop"} &middot;{" "}
                                {scan.country || "Sconosciuto"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(scan.scannedAt, "dd/MM/yy HH:mm")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Cronologia modifiche URL</CardTitle>
                </CardHeader>
                <CardContent>
                  {qr.history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nessuna modifica URL ancora
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {qr.history.map((h) => (
                        <div key={h.id} className="p-3 rounded-lg border space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(h.changedAt, "dd MMMM yyyy HH:mm", { locale: it })}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="truncate text-muted-foreground">{h.oldUrl}</span>
                            <ArrowRight className="h-4 w-4 shrink-0" />
                            <span className="truncate font-medium">{h.newUrl}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
