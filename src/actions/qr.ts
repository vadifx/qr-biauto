"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qrCreateSchema, qrUpdateSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customAlphabet } from "nanoid";

const generateShortCode = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  8
);

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autenticato");
  return session.user.id;
}

export async function createQRCode(data: {
  title: string;
  destinationUrl: string;
  folderId?: string | null;
  fgColor?: string;
  bgColor?: string;
  cornerRadius?: number;
  expiresAt?: string | null;
  password?: string | null;
}) {
  const userId = await getUserId();
  const validated = qrCreateSchema.parse(data);

  let shortCode = generateShortCode();
  // Ensure uniqueness
  while (await prisma.qRCode.findUnique({ where: { shortCode } })) {
    shortCode = generateShortCode();
  }

  const qr = await prisma.qRCode.create({
    data: {
      title: validated.title,
      destinationUrl: validated.destinationUrl,
      shortCode,
      folderId: validated.folderId || null,
      fgColor: validated.fgColor,
      bgColor: validated.bgColor,
      cornerRadius: validated.cornerRadius,
      expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
      password: validated.password || null,
      userId,
    },
  });

  revalidatePath("/qr");
  revalidatePath("/dashboard");
  redirect(`/qr/${qr.id}`);
}

export async function updateQRCode(
  id: string,
  data: {
    title?: string;
    destinationUrl?: string;
    folderId?: string | null;
    isActive?: boolean;
    fgColor?: string;
    bgColor?: string;
    cornerRadius?: number;
    expiresAt?: string | null;
    password?: string | null;
  }
) {
  const userId = await getUserId();
  const validated = qrUpdateSchema.parse(data);

  const existing = await prisma.qRCode.findFirst({
    where: { id, userId },
  });

  if (!existing) throw new Error("QR code non trovato");

  // Track URL changes in history
  if (validated.destinationUrl && validated.destinationUrl !== existing.destinationUrl) {
    await prisma.linkHistory.create({
      data: {
        qrCodeId: id,
        oldUrl: existing.destinationUrl,
        newUrl: validated.destinationUrl,
      },
    });
  }

  await prisma.qRCode.update({
    where: { id },
    data: {
      ...validated,
      expiresAt: validated.expiresAt !== undefined
        ? validated.expiresAt ? new Date(validated.expiresAt) : null
        : undefined,
    },
  });

  revalidatePath("/qr");
  revalidatePath(`/qr/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteQRCode(id: string) {
  const userId = await getUserId();

  await prisma.qRCode.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/qr");
  revalidatePath("/dashboard");
  redirect("/qr");
}

export async function getQRCodes(params?: {
  search?: string;
  folderId?: string;
  status?: "active" | "inactive" | "expired";
  page?: number;
  limit?: number;
}) {
  const userId = await getUserId();
  const page = params?.page || 1;
  const limit = params?.limit || 12;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };

  if (params?.search) {
    where.OR = [
      { title: { contains: params.search } },
      { destinationUrl: { contains: params.search } },
      { shortCode: { contains: params.search } },
    ];
  }

  if (params?.folderId) {
    where.folderId = params.folderId;
  }

  if (params?.status === "active") {
    where.isActive = true;
  } else if (params?.status === "inactive") {
    where.isActive = false;
  }

  const [qrCodes, total] = await Promise.all([
    prisma.qRCode.findMany({
      where,
      include: {
        _count: { select: { scans: true } },
        folder: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.qRCode.count({ where }),
  ]);

  return {
    qrCodes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getQRCode(id: string) {
  const userId = await getUserId();

  return prisma.qRCode.findFirst({
    where: { id, userId },
    include: {
      _count: { select: { scans: true } },
      folder: true,
      history: { orderBy: { changedAt: "desc" }, take: 20 },
    },
  });
}

export async function getDashboardStats() {
  const userId = await getUserId();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  const [totalQR, activeQR, totalScans, scansToday, scansWeek, scansMonth, recentQR] =
    await Promise.all([
      prisma.qRCode.count({ where: { userId } }),
      prisma.qRCode.count({ where: { userId, isActive: true } }),
      prisma.scan.count({
        where: { qrCode: { userId } },
      }),
      prisma.scan.count({
        where: { qrCode: { userId }, scannedAt: { gte: todayStart } },
      }),
      prisma.scan.count({
        where: { qrCode: { userId }, scannedAt: { gte: weekStart } },
      }),
      prisma.scan.count({
        where: { qrCode: { userId }, scannedAt: { gte: monthStart } },
      }),
      prisma.qRCode.findMany({
        where: { userId },
        include: { _count: { select: { scans: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return {
    totalQR,
    activeQR,
    totalScans,
    scansToday,
    scansWeek,
    scansMonth,
    recentQR,
  };
}

export async function getScansForChart(qrCodeId?: string, days = 30) {
  const userId = await getUserId();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const where: Record<string, unknown> = {
    scannedAt: { gte: since },
  };

  if (qrCodeId) {
    where.qrCodeId = qrCodeId;
    where.qrCode = { userId };
  } else {
    where.qrCode = { userId };
  }

  const scans = await prisma.scan.findMany({
    where,
    select: { scannedAt: true },
    orderBy: { scannedAt: "asc" },
  });

  const chartData: { date: string; scans: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    chartData.push({ date: dateStr, scans: 0 });
  }

  for (const scan of scans) {
    const dateStr = scan.scannedAt.toISOString().split("T")[0];
    const entry = chartData.find((d) => d.date === dateStr);
    if (entry) entry.scans++;
  }

  return chartData;
}
