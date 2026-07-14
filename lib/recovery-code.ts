import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function generateRecoveryCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const bytes = randomBytes(6);
    const suffix = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
    const recoveryCode = `KP-${suffix}`;
    if (!await prisma.item.findUnique({ where: { recoveryCode }, select: { id: true } })) return recoveryCode;
  }
  throw new Error("Unable to generate a unique recovery code.");
}

export function normalizeRecoveryCode(value: string) {
  const compact = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^KP/, "");
  return compact ? `KP-${compact}` : "";
}
