import Link from "next/link";
import { getDashboardStats } from "@/actions/qr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Activity, Plus, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { title: "QR Totali", value: stats.totalQR, icon: QrCode, description: "Codici creati" },
    { title: "QR Attivi", value: stats.activeQR, icon: Activity, description: "Attualmente attivi" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Panoramica dei tuoi QR code</p>
        </div>
        <Button asChild>
          <Link href="/qr/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo QR
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>QR Recenti</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/qr">
              Vedi tutti
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentQR.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessun QR code ancora. Creane uno!
              </p>
            ) : (
              stats.recentQR.map((qr) => (
                <Link
                  key={qr.id}
                  href={`/qr/${qr.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <QrCode className="h-8 w-8 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{qr.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        /r/{qr.shortCode}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{qr._count.scans} scan</Badge>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
