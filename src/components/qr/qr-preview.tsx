"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRPreviewProps {
  value: string;
  fgColor?: string;
  bgColor?: string;
  size?: number;
  className?: string;
}

export function QRPreview({
  value,
  fgColor = "#000000",
  bgColor = "#FFFFFF",
  size = 256,
  className,
}: QRPreviewProps) {
  const url = value || "https://example.com";

  return (
    <div
      className={className}
      style={{ background: bgColor, padding: 16, borderRadius: 12, display: "inline-block" }}
    >
      <QRCodeSVG
        value={url}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level="H"
        includeMargin={false}
      />
    </div>
  );
}
