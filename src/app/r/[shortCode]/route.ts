import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  const qr = await prisma.qRCode.findUnique({
    where: { shortCode },
  });

  if (!qr) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  if (!qr.isActive) {
    return NextResponse.redirect(new URL("/expired", request.url));
  }

  if (qr.expiresAt && new Date() > qr.expiresAt) {
    return NextResponse.redirect(new URL("/expired", request.url));
  }

  if (qr.password) {
    const url = new URL(`/r/${shortCode}/verify`, request.url);
    return NextResponse.redirect(url);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    null;

  prisma.scan.create({
    data: {
      qrCodeId: qr.id,
      ip,
    },
  }).catch(() => {});

  return NextResponse.redirect(qr.destinationUrl, { status: 302 });
}
