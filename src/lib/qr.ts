import QRCode from "qrcode";

interface QROptions {
  width?: number;
  margin?: number;
  fgColor?: string;
  bgColor?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export async function generateQRDataURL(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const {
    width = 400,
    margin = 2,
    fgColor = "#000000",
    bgColor = "#FFFFFF",
    errorCorrectionLevel = "H",
  } = options;

  return QRCode.toDataURL(text, {
    width,
    margin,
    color: { dark: fgColor, light: bgColor },
    errorCorrectionLevel,
  });
}

export async function generateQRBuffer(
  text: string,
  options: QROptions = {}
): Promise<Buffer> {
  const {
    width = 800,
    margin = 2,
    fgColor = "#000000",
    bgColor = "#FFFFFF",
    errorCorrectionLevel = "H",
  } = options;

  return QRCode.toBuffer(text, {
    width,
    margin,
    color: { dark: fgColor, light: bgColor },
    errorCorrectionLevel,
  });
}

export async function generateQRSVG(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const {
    margin = 2,
    fgColor = "#000000",
    bgColor = "#FFFFFF",
    errorCorrectionLevel = "H",
  } = options;

  return QRCode.toString(text, {
    type: "svg",
    margin,
    color: { dark: fgColor, light: bgColor },
    errorCorrectionLevel,
  });
}
