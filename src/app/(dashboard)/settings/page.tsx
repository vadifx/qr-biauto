import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";

export default async function SettingsPage() {
  const session = await auth();
  const user = session!.user!;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground">Gestisci il tuo profilo e le preferenze</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
          <CardDescription>Aggiorna le informazioni del tuo account</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={{ name: user.name || "", email: user.email || "" }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambia Password</CardTitle>
          <CardDescription>Aggiorna la tua password di accesso</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zona Pericolosa</CardTitle>
          <CardDescription>
            Azioni irreversibili sul tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  );
}
