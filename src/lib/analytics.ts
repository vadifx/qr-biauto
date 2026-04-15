import { UAParser } from "ua-parser-js";

export interface ScanInfo {
  ip: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  referer: string | null;
}

export function parseUserAgent(userAgent: string | null): {
  device: string | null;
  browser: string | null;
  os: string | null;
} {
  if (!userAgent) return { device: null, browser: null, os: null };

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  let device = "desktop";
  if (result.device.type === "mobile") device = "mobile";
  else if (result.device.type === "tablet") device = "tablet";

  return {
    device,
    browser: result.browser.name || null,
    os: result.os.name || null,
  };
}

export function extractScanInfo(request: Request): ScanInfo {
  const userAgent = request.headers.get("user-agent");
  const { device, browser, os } = parseUserAgent(userAgent);

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || null;
  const referer = request.headers.get("referer");

  return { ip, device, browser, os, referer };
}
