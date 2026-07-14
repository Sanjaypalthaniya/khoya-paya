import { prisma } from "@/lib/prisma";
import { buildPublicFinderUrl, generateQRCodeDataURL, generateUniqueQRCode } from "@/lib/qr";

export async function createQrForItem(itemId: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const uniqueCode = generateUniqueQRCode();
    const publicUrl = buildPublicFinderUrl(uniqueCode);
    const imageUrl = await generateQRCodeDataURL(publicUrl);

    try {
      return await prisma.qRCode.create({ data: { itemId, uniqueCode, publicUrl, imageUrl } });
    } catch {
      if (attempt === 4) throw new Error("Unable to generate unique QR code.");
    }
  }

  throw new Error("Unable to generate unique QR code.");
}

export async function generateMissingQrCodes(itemIds: string[], userId: string) {
  const items = await prisma.item.findMany({
    where: { id: { in: itemIds }, userId },
    include: { qrCode: true },
  });

  const generated = [];
  const skipped = [];

  for (const item of items) {
    if (item.qrCode) {
      skipped.push(item.id);
      continue;
    }

    const qrCode = await createQrForItem(item.id);
    generated.push({ itemId: item.id, qrCode });
  }

  return { requestedCount: itemIds.length, ownedCount: items.length, generated, skipped };
}
