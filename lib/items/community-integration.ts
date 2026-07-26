import {
  Prisma,
  type CommunityItemCategory,
  type CommunityPostType,
  type Item,
  type ItemStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { moderateText } from "@/lib/moderation/engine";

const categoryMap: Record<string, CommunityItemCategory> = {
  Mobile: "MOBILE",
  Wallet: "WALLET",
  Keys: "KEYS",
  Documents: "DOCUMENTS",
  Bag: "BAG",
  Pet: "PET",
  Vehicle: "VEHICLE",
  Laptop: "ELECTRONICS",
  Electronics: "ELECTRONICS",
  "Travel Luggage": "BAG",
  "School Item": "OTHER",
  "Office Asset": "OTHER",
  Other: "OTHER",
};

export type CommunityMapping = {
  postType: CommunityPostType;
  category: CommunityItemCategory;
};

/** The only item-status/category to public-post mapping used by item flows. */
export function communityMapping(
  status: ItemStatus,
  category: string,
): CommunityMapping | null {
  if (status === "SAFE" || status === "RECOVERED") return null;
  let postType: CommunityPostType;
  if (status === "FOUND")
    postType = category === "Documents" ? "FOUND_DOCUMENT" : "FOUND_ITEM";
  else if (category === "Pet") postType = "MISSING_PET";
  else if (category === "Documents") postType = "LOST_DOCUMENT";
  else if (category === "Vehicle") postType = "VEHICLE";
  else postType = "LOST_ITEM";
  return { postType, category: categoryMap[category] ?? "OTHER" };
}

export function defaultCommunityPublication(status: ItemStatus) {
  return status === "LOST" || status === "FOUND" || status === "MISSING";
}

function assertPublishable(
  item: Pick<
    Item,
    "itemName" | "description" | "lostDate" | "lastSeenLocation"
  >,
) {
  if (item.itemName.trim().length < 3)
    throw new Error("A public item needs a descriptive title.");
  if (item.description.trim().length < 20)
    throw new Error("Add a public description of at least 20 characters.");
  if (!item.lostDate)
    throw new Error(
      "Lost/found date is required for Community Feed publication.",
    );
  if (!item.lastSeenLocation?.trim())
    throw new Error(
      "A public-safe location is required for Community Feed publication.",
    );
}

function postData(
  item: Item,
  userId: string,
  mapping: CommunityMapping,
): Prisma.CommunityPostUncheckedCreateInput {
  const moderation = moderateText({
    text: `${item.itemName}\n${item.description}`,
    requireRelevance: true,
  });
  const approved = moderation.decision === "APPROVED";
  return {
    itemId: item.id,
    authorId: userId,
    postType: mapping.postType,
    itemCategory: mapping.category,
    title: item.itemName.trim(),
    description: item.description.trim(),
    status: approved ? "PUBLISHED" : "DRAFT",
    visibility: "PUBLIC",
    publishedAt: approved ? new Date() : null,
    recoveredAt: null,
    closedAt: null,
    rewardOffered: item.rewardAmount !== null,
    rewardAmount: item.rewardAmount,
    rewardCurrency: "INR",
    eventDate: item.lostDate,
    publicLocationName: item.lastSeenLocation?.trim() || null,
    contactPreference: "PLATFORM_MESSAGE",
    moderationStatus: approved
      ? "APPROVED"
      : moderation.decision === "REJECTED"
        ? "REJECTED"
        : "PENDING",
    moderationReason: moderation.userMessage,
    allowComments: true,
    allowSharing: true,
  };
}

async function upsertCommunityPost(
  tx: Prisma.TransactionClient,
  item: Item,
  userId: string,
) {
  const mapping = communityMapping(item.status, item.category);
  if (!mapping) return null;
  assertPublishable(item);
  const data = postData(item, userId, mapping);
  const moderation = moderateText({
    text: `${item.itemName}\n${item.description}`,
    requireRelevance: true,
  });
  const post = await tx.communityPost.upsert({
    where: { itemId: item.id },
    create: {
      ...data,
      media: item.imageUrl
        ? {
            create: {
              ownerId: userId,
              mediaType: "IMAGE",
              url: item.imageUrl,
              mimeType: "image/*",
              fileSize: 0,
              altText: item.itemName,
              processingStatus: "READY",
            },
          }
        : undefined,
    },
    update: {
      postType: data.postType,
      itemCategory: data.itemCategory,
      title: data.title,
      description: data.description,
      status: data.status,
      visibility: "PUBLIC",
      rewardOffered: data.rewardOffered,
      rewardAmount: data.rewardAmount,
      eventDate: data.eventDate,
      publicLocationName: data.publicLocationName,
      recoveredAt: null,
      closedAt: null,
      deletedAt: null,
      publishedAt: data.publishedAt,
      moderationStatus: data.moderationStatus,
      moderationReason: data.moderationReason,
    },
  });
  // Approved text appears immediately; unapproved media remains excluded by
  // the public media query until its independent safety review is complete.
  await tx.moderationCase.create({
    data: {
      targetType: "POST",
      targetId: post.id,
      ownerId: userId,
      decision: moderation.decision,
      source: "LOCAL_RULES",
      provider: moderation.provider,
      riskScore: moderation.riskScore,
      reasonCode: moderation.reasonCode,
      userMessage: moderation.userMessage,
      signals: moderation.signals,
      contentHash: moderation.contentHash,
      modelVersion: "1",
    },
  });
  if (item.imageUrl) {
    const media = await tx.postMedia.findFirst({
      where: {
        postId: post.id,
        ownerId: userId,
        mediaType: "IMAGE",
        deletedAt: null,
      },
    });
    if (media)
      await tx.postMedia.update({
        where: { id: media.id },
        data: {
          url: item.imageUrl,
          altText: item.itemName,
          processingStatus: "READY",
          moderationStatus: "PENDING",
          moderationReason: "Item-derived media requires review.",
        },
      });
    else
      await tx.postMedia.create({
        data: {
          postId: post.id,
          ownerId: userId,
          mediaType: "IMAGE",
          url: item.imageUrl,
          mimeType: "image/*",
          fileSize: 0,
          altText: item.itemName,
          processingStatus: "READY",
          moderationStatus: "PENDING",
          moderationReason: "Item-derived media requires review.",
        },
      });
  }
  return post;
}

function refreshItemSurfaces() {
  for (const path of [
    "/",
    "/dashboard/items",
    "/dashboard/community-posts",
    "/lost-items",
  ])
    revalidatePath(path);
}

export async function createItemWithCommunityIntegration(
  userId: string,
  input: Prisma.ItemUncheckedCreateInput,
  publishToCommunity?: boolean,
) {
  const shouldPublish =
    publishToCommunity ?? defaultCommunityPublication(input.status ?? "SAFE");
  if (input.clientRequestId) {
    const existing = await prisma.item.findFirst({
      where: { userId, clientRequestId: input.clientRequestId },
      include: { communityPost: true },
    });
    if (existing)
      return {
        item: existing,
        communityPost: existing.communityPost,
        duplicate: true,
      };
  }
  const result = await prisma.$transaction(
    async (tx) => {
      const item = await tx.item.create({ data: input });
      const communityPost = shouldPublish
        ? await upsertCommunityPost(tx, item, userId)
        : null;
      return { item, communityPost, duplicate: false };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
  refreshItemSurfaces();
  return result;
}

export async function updateItemWithCommunityIntegration(
  userId: string,
  itemId: string,
  updates: Prisma.ItemUncheckedUpdateInput,
  publishToCommunity?: boolean,
) {
  const result = await prisma.$transaction(
    async (tx) => {
      const existing = await tx.item.findFirst({
        where: { id: itemId, userId, deletedAt: null },
        include: { communityPost: true },
      });
      if (!existing) throw new Error("Item not found.");
      const item = await tx.item.update({
        where: { id: itemId },
        data: updates,
      });
      let communityPost = existing.communityPost;
      if (item.status === "RECOVERED" && communityPost) {
        communityPost = await tx.communityPost.update({
          where: { id: communityPost.id },
          data: { status: "RECOVERED", recoveredAt: new Date() },
        });
      } else if (
        item.status === "SAFE" &&
        communityPost &&
        publishToCommunity === false
      ) {
        communityPost = await tx.communityPost.update({
          where: { id: communityPost.id },
          data: { status: "CLOSED", closedAt: new Date() },
        });
      } else if (
        publishToCommunity ??
        (defaultCommunityPublication(item.status) || Boolean(communityPost))
      ) {
        communityPost = await upsertCommunityPost(tx, item, userId);
      }
      return { item, communityPost };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
  refreshItemSurfaces();
  return result;
}

export async function closeItemCommunityPost(userId: string, itemId: string) {
  const post = await prisma.communityPost.findFirst({
    where: { itemId, authorId: userId, deletedAt: null },
  });
  if (!post) throw new Error("Community post not found.");
  const updated = await prisma.communityPost.update({
    where: { id: post.id },
    data: { status: "CLOSED", closedAt: new Date() },
  });
  refreshItemSurfaces();
  return updated;
}

export async function softDeleteItemWithCommunityIntegration(
  userId: string,
  itemId: string,
) {
  await prisma.$transaction(async (tx) => {
    const item = await tx.item.findFirst({
      where: { id: itemId, userId, deletedAt: null },
      select: { id: true },
    });
    if (!item) throw new Error("Item not found.");
    await tx.item.update({
      where: { id: itemId },
      data: {
        deletedAt: new Date(),
        publicSearchVisible: false,
        lostModeEnabled: false,
      },
    });
    await tx.communityPost.updateMany({
      where: { itemId, authorId: userId, deletedAt: null },
      data: { status: "CLOSED", closedAt: new Date() },
    });
  });
  refreshItemSurfaces();
}
