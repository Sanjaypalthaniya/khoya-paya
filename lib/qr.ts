import crypto from "crypto";
import QRCode from "qrcode";

export function generateUniqueQRCode() {
  return `kp_${crypto.randomBytes(9).toString("base64url")}`;
}

export function buildPublicFinderUrl(uniqueCode: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/found/${uniqueCode}`;
}

export async function generateQRCodeDataURL(publicUrl: string) {
  return QRCode.toDataURL(publicUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 720,
    color: {
      dark: "#102A43",
      light: "#FFFFFF",
    },
  });
}
