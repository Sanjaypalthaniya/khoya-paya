import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata,
    },
  });
}

export async function createFinderMessageNotification(input: { userId: string; itemId: string; itemName: string; finderMessageId: string }) {
  return createNotification({
    userId: input.userId,
    type: "FINDER_MESSAGE",
    title: "New finder message received",
    message: `Someone found your item "${input.itemName}" and sent you a message.`,
    link: "/dashboard/messages",
    metadata: { itemId: input.itemId, finderMessageId: input.finderMessageId },
  });
}

export async function createQrScanNotification(input: { userId: string; itemId: string; itemName: string }) {
  return createNotification({
    userId: input.userId,
    type: "QR_SCAN",
    title: "Your lost item QR was scanned",
    message: `Your item "${input.itemName}" QR code was scanned recently.`,
    link: "/dashboard/scans",
    metadata: { itemId: input.itemId },
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
