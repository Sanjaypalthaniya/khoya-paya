-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'CLOSED', 'SPAM');

-- CreateEnum
CREATE TYPE "ChatSenderType" AS ENUM ('OWNER', 'FINDER', 'SYSTEM');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "finderMessageId" TEXT,
    "finderName" TEXT,
    "finderPhone" TEXT,
    "finderEmail" TEXT,
    "finderAccessToken" TEXT NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderType" "ChatSenderType" NOT NULL,
    "senderUserId" TEXT,
    "message" TEXT NOT NULL,
    "isReadByOwner" BOOLEAN NOT NULL DEFAULT false,
    "isReadByFinder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_finderMessageId_key" ON "Conversation"("finderMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_finderAccessToken_key" ON "Conversation"("finderAccessToken");

-- CreateIndex
CREATE INDEX "Conversation_ownerId_lastMessageAt_idx" ON "Conversation"("ownerId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_itemId_idx" ON "Conversation"("itemId");

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "ChatMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_isReadByOwner_idx" ON "ChatMessage"("conversationId", "isReadByOwner");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_isReadByFinder_idx" ON "ChatMessage"("conversationId", "isReadByFinder");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_finderMessageId_fkey" FOREIGN KEY ("finderMessageId") REFERENCES "FinderMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
