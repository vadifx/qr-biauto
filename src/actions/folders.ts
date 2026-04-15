"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { folderSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autenticato");
  return session.user.id;
}

export async function createFolder(data: { name: string; color?: string | null }) {
  const userId = await getUserId();
  const validated = folderSchema.parse(data);

  const folder = await prisma.folder.create({
    data: {
      name: validated.name,
      color: validated.color || null,
      userId,
    },
  });

  revalidatePath("/folders");
  revalidatePath("/qr");
  return folder;
}

export async function updateFolder(id: string, data: { name: string; color?: string | null }) {
  const userId = await getUserId();
  const validated = folderSchema.parse(data);

  await prisma.folder.updateMany({
    where: { id, userId },
    data: {
      name: validated.name,
      color: validated.color || null,
    },
  });

  revalidatePath("/folders");
  revalidatePath("/qr");
}

export async function deleteFolder(id: string) {
  const userId = await getUserId();

  await prisma.folder.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/folders");
  revalidatePath("/qr");
}

export async function getFolders() {
  const userId = await getUserId();

  return prisma.folder.findMany({
    where: { userId },
    include: { _count: { select: { qrCodes: true } } },
    orderBy: { createdAt: "desc" },
  });
}
