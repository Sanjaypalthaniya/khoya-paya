import { prisma } from "@/lib/prisma";
import { foundReportSchema } from "@/lib/validations/enterprise";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, rateLimitResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { createFoundReportMatches } from "@/lib/matching";
import { normalizeRecoveryCode } from "@/lib/recovery-code";
import { createNotification } from "@/lib/notifications";
import { generateFinderAccessToken } from "@/lib/chat";

export async function POST(request: Request) {
  if (!enforceRateLimit(request, "found-report", 5, 60 * 60 * 1000).allowed) return rateLimitResponse();
  const parsed = foundReportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const data = parsed.data;
  const recoveryCode = data.recoveryCode ? normalizeRecoveryCode(data.recoveryCode) : null;
  const exactItem = recoveryCode ? await prisma.item.findUnique({ where: { recoveryCode }, select: { id: true, userId: true, itemName: true } }) : null;
  try {
    const finderIdentity = (data.finderPhone || data.finderEmail) ? await prisma.finderIdentity.create({ data: { name: data.finderName || null, phone: data.finderPhone || null, whatsapp: data.finderWhatsapp || null, email: data.finderEmail || null } }) : null;
    const report = await prisma.foundReport.create({ data: { recoveryCode, category: data.category, brand: data.brand || null, modelNumber: data.modelNumber || null, color: data.color || null, identifyingMarks: data.identifyingMarks || null, description: data.description, foundLocation: data.foundLocation, foundDate: data.foundDate, photoUrl: data.photoUrl || null, finderName: data.finderName || null, finderPhone: data.finderPhone || null, finderWhatsapp: data.finderWhatsapp || null, finderEmail: data.finderEmail || null, message: data.message, finderIdentityId: finderIdentity?.id, images: { create: data.imageUrls.filter(Boolean).map((imageUrl) => ({ imageUrl })) } } });
    const matches = await createFoundReportMatches(report.id, { ...data, recoveryCode });
    await prisma.foundReport.update({ where: { id: report.id }, data: { status: matches.length ? "MATCHED" : "NEW" } });
    let chatToken: string | null = null;
    const primary = exactItem ?? matches[0]?.item;
    if (primary) {
      chatToken = generateFinderAccessToken();
      const conversation = await prisma.conversation.create({ data: { itemId: primary.id, ownerId: primary.userId, foundReportId: report.id, finderIdentityId: finderIdentity?.id, finderName: data.finderName || null, finderPhone: data.finderPhone || null, finderEmail: data.finderEmail || null, finderAccessToken: chatToken, lastMessageAt: new Date(), messages: { create: { senderType: "FINDER", finderIdentityId: finderIdentity?.id, message: data.message, isReadByFinder: true } } } });
      await prisma.recoveryRequest.create({ data: { itemId: primary.id, ownerId: primary.userId, foundReportId: report.id, conversationId: conversation.id, finderIdentityId: finderIdentity?.id, source: exactItem ? "RECOVERY_ID" : "AI_MATCH", status: "CHAT_STARTED", timeline: { create: [{ type: "FOUND_REPORT", title: "Found report received", description: "A finder submitted details that may match this item.", actorType: "FINDER" }, { type: "CHAT_STARTED", title: "Secure chat started", description: "Anonymous owner-finder chat is ready.", actorType: "SYSTEM" }] } } });
      await createNotification({ userId: primary.userId, type: exactItem ? "FOUND_REPORT" : "POSSIBLE_MATCH", title: exactItem ? "Your Recovery ID was reported" : "Possible item match found", message: `A finder submitted a report for ${primary.itemName}.`, link: "/dashboard/found-reports", metadata: { foundReportId: report.id, conversationId: conversation.id } }).catch(() => null);
    }
    return successResponse("Found report submitted securely.", { reportId: report.id, possibleMatches: matches.length, chatToken }, 201);
  } catch { return errorResponse("Unable to submit found report.", 500); }
}
