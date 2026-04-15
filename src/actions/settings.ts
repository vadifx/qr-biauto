"use server";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autenticato");
  return session.user.id;
}

export async function updateProfile(data: { name: string }) {
  const userId = await getUserId();

  if (!data.name || data.name.length < 2) {
    return { error: "Il nome deve avere almeno 2 caratteri" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const userId = await getUserId();

  if (!data.newPassword || data.newPassword.length < 6) {
    return { error: "La nuova password deve avere almeno 6 caratteri" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) {
    return { error: "Account OAuth - impossibile cambiare password" };
  }

  const isValid = await bcrypt.compare(data.currentPassword, user.password);
  if (!isValid) {
    return { error: "Password attuale non corretta" };
  }

  const hashed = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return { success: true };
}

export async function deleteAccount() {
  const userId = await getUserId();

  await prisma.user.delete({ where: { id: userId } });
  await signOut({ redirectTo: "/" });
}
