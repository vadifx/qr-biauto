import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Clock className="h-6 w-6" />
          </div>
          <CardTitle>QR Code Non Disponibile</CardTitle>
          <CardDescription>
            Questo QR code è scaduto o è stato disattivato dal proprietario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/">Torna alla home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
