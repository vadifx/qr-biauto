import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { shortCode, password } = await request.json();

  if (!shortCode || !password) {
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  }

  const qr = await prisma.qRCode.findUnique({
    where: { shortCode },
  });

  if (!qr) {
    return NextResponse.json({ error: "QR non trovato" }, { status: 404 });
  }

  // Simple password comparison (stored as plaintext for QR passwords)
  if (qr.password !== password) {
    return NextResponse.json({ error: "Password non valida" }, { status: 403 });
  }

  return NextResponse.json({ url: qr.destinationUrl });
}
