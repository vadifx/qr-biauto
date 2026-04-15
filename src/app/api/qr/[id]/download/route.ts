import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRBuffer, generateQRSVG } from "@/lib/qr";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { id } = await params;
  const qr = await prisma.qRCode.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!qr) {
    return NextResponse.json({ error: "QR non trovato" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "png";
  const size = Number(searchParams.get("size")) || 800;

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const redirectUrl = `${baseUrl}/r/${qr.shortCode}`;

  if (format === "svg") {
    const svg = await generateQRSVG(redirectUrl, {
      fgColor: qr.fgColor,
      bgColor: qr.bgColor,
    });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${qr.title}.svg"`,
      },
    });
  }

  const buffer = await generateQRBuffer(redirectUrl, {
    width: size,
    fgColor: qr.fgColor,
    bgColor: qr.bgColor,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${qr.title}.png"`,
    },
  });
}
