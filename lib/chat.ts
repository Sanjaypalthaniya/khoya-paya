import crypto from "crypto";
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export function generateFinderAccessToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function getFinderChatUrl(token: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${baseUrl}/chat/finder/${token}`;
}

export async function ensureConversationForFinderMessage(
  finderMessageId: string,
  ownerId?: string,
  db: DatabaseClient = prisma,
) {
  const existing = await db.conversation.findUnique({ where: { finderMessageId } });
  if (existing) {
    if (ownerId && existing.ownerId !== ownerId) return null;
    return existing;
  }

  const finderMessage = await db.finderMessage.findFirst({
    where: { id: finderMessageId, ...(ownerId ? { item: { userId: ownerId } } : {}) },
    select: {
      id: true,
      itemId: true,
      finderName: true,
      finderPhone: true,
      finderEmail: true,
      finderMessage: true,
      createdAt: true,
      item: { select: { userId: true } },
    },
  });
  if (!finderMessage) return null;

  try {
    return await db.conversation.create({
      data: {
        itemId: finderMessage.itemId,
        ownerId: finderMessage.item.userId,
        finderMessageId: finderMessage.id,
        finderName: finderMessage.finderName,
        finderPhone: finderMessage.finderPhone,
        finderEmail: finderMessage.finderEmail,
        finderAccessToken: generateFinderAccessToken(),
        lastMessageAt: finderMessage.createdAt,
        messages: {
          create: {
            senderType: "FINDER",
            message: finderMessage.finderMessage,
            isReadByOwner: false,
            isReadByFinder: true,
            createdAt: finderMessage.createdAt,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return db.conversation.findUnique({ where: { finderMessageId } });
    }
    throw error;
  }
}
