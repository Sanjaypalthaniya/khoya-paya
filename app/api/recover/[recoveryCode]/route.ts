import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { normalizeRecoveryCode } from "@/lib/recovery-code";
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ recoveryCode: string }> }) {
  const { recoveryCode } = await params;
  const item = await prisma.item.findUnique({ where: { recoveryCode: normalizeRecoveryCode(recoveryCode) }, select: { itemName: true, category: true, description: true, brand: true, modelNumber: true, color: true, status: true, recoveryCode: true, lostModeEnabled: true, rewardAmount: true, imageUrl: true, images: { orderBy: { sortOrder: "asc" }, select: { imageUrl: true } }, user: { select: { createdAt: true, verificationLevel: true } }, verifications: { where: { status: "APPROVED" }, select: { id: true } } } });
  if (!item) return errorResponse("Recovery ID not found.", 404);
  return successResponse("Recovery item found.", { item: { ...item, rewardAmount: item.lostModeEnabled && item.rewardAmount ? item.rewardAmount.toString() : null, owner: { memberSince: item.user.createdAt, verificationLevel: item.user.verificationLevel }, user: undefined, verifiedItem: item.verifications.length > 0, verifications: undefined } });
}
