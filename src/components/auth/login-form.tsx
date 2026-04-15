"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, QrCode } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      // Auth.js signIn throws a NEXT_REDIRECT on success — let the browser follow it
      if (err instanceof Error && err.message?.includes("NEXT_REDIRECT")) {
        window.location.href = "/dashboard";
        return;
      }
      setError("Si è verificato un errore. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center">
        <div className="text-center space-y-6 p-12">
          <QrCode className="w-24 h-24 text-primary-foreground mx-auto" />
          <h2 className="text-3xl font-bold text-primary-foreground">QR Link Generator</h2>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Crea, gestisci e traccia i tuoi QR code dinamici in un unico posto.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-none lg:shadow-sm lg:border">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center lg:hidden mb-4">
              <QrCode className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-bold">Bentornato</CardTitle>
            <CardDescription>Accedi al tuo account per continuare</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="la-tua@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Accedi
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Non hai un account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Registrati
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
