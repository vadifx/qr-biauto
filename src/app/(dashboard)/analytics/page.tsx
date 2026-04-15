import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardStats, getScansForChart } from "@/actions/qr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanChart } from "@/components/analytics/scan-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { StatCard } from "@/components/analytics/stats-cards";
import { Badge } from "@/components/ui/badge";
import { QrCode, Eye, BarChart3, Activity, Monitor, Globe, Smartphone } from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const stats = await getDashboardStats();
  const chartData = await getScansForChart(undefined, 30);

  const [deviceStats, browserStats, topQR] = await Promise.all([
    prisma.scan.groupBy({
      by: ["device"],
      where: { qrCode: { userId } },
      _count: true,
      orderBy: { _count: { device: "desc" } },
    }),
    prisma.scan.groupBy({
      by: ["browser"],
      where: { qrCode: { userId } },
      _count: true,
      orderBy: { _count: { browser: "desc" } },
      take: 5,
    }),
    prisma.qRCode.findMany({
      where: { userId },
      include: { _count: { select: { scans: true } } },
      orderBy: { scans: { _count: "desc" } },
      take: 10,
    }),
  ]);

  const deviceData = deviceStats.map((d) => ({
    name: d.device || "Sconosciuto",
    value: d._count,
  }));

  const browserData = browserStats.map((b) => ({
    name: b.browser || "Sconosciuto",
    value: b._count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Panoramica delle scansioni di tutti i tuoi QR code</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Scansioni Totali" value={stats.totalScans} icon={Eye} description="Da sempre" />
        <StatCard title="Oggi" value={stats.scansToday} icon={BarChart3} description="Scansioni oggi" />
        <StatCard title="Questa Settimana" value={stats.scansWeek} icon={Activity} description="Ultimi 7 giorni" />
        <StatCard title="Questo Mese" value={stats.scansMonth} icon={BarChart3} description="Ultimi 30 giorni" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scansioni ultimi 30 giorni</CardTitle>
        </CardHeader>
        <CardContent>
          <ScanChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Dispositivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceChart data={deviceData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Browser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceChart data={browserData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Top QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topQR.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessun dato ancora
              </p>
            ) : (
              <div className="space-y-3">
                {topQR.map((qr, i) => (
                  <Link
                    key={qr.id}
                    href={`/qr/${qr.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground w-5">
                        {i + 1}.
                      </span>
                      <span className="text-sm truncate">{qr.title}</span>
                    </div>
                    <Badge variant="secondary">{qr._count.scans}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
