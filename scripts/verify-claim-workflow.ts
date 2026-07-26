import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  answerQuestions,
  confirmHandover,
  createClaim,
  generateHandoverCode,
  proposeReturn,
  transitionClaim,
  verifyHandoverCode,
} from "../lib/claims/service";
const prisma = new PrismaClient();
let tempUserId: string | undefined,
  claimId: string | undefined,
  conversationId: string | undefined;
async function main() {
  const post = await prisma.communityPost.findFirst({
    where: {
      status: "PUBLISHED",
      moderationStatus: "APPROVED",
      deletedAt: null,
      postType: {
        in: [
          "LOST_ITEM",
          "FOUND_ITEM",
          "MISSING_PET",
          "LOST_DOCUMENT",
          "FOUND_DOCUMENT",
          "VEHICLE",
        ],
      },
    },
    select: { id: true, authorId: true, postType: true },
  });
  if (!post)
    throw new Error("No eligible public post exists for runtime verification.");
  const user = await prisma.user.create({
    data: {
      name: "Runtime Verification User",
      email: `claim-runtime-${Date.now()}@example.invalid`,
      passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
    },
  });
  tempUserId = user.id;
  const type = post.postType.startsWith("FOUND")
      ? "CLAIM_FOUND_ITEM"
      : "FOUND_LOST_ITEM",
    clientRequestId = crypto.randomUUID();
  const first = await createClaim(user.id, {
    postId: post.id,
    claimType: type,
    publicMessage: "Runtime verification claim with privacy-safe details.",
    privateMessage: "Private encrypted verification context.",
    clientRequestId,
  });
  claimId = first.id;
  const duplicate = await createClaim(user.id, {
    postId: post.id,
    claimType: type,
    publicMessage: "Retry must remain idempotent.",
    clientRequestId,
  });
  if (duplicate.id !== first.id)
    throw new Error("Claim retry was not idempotent.");
  const claim = await prisma.claimRequest.findUniqueOrThrow({
    where: { id: first.id },
    include: { questions: true },
  });
  conversationId = claim.conversationId ?? undefined;
  await answerQuestions(
    claim.id,
    user.id,
    claim.questions.map((question) => ({
      questionId: question.id,
      answer: "private runtime answer",
    })),
  );
  await prisma.claimVerificationAnswer.updateMany({
    where: { question: { claimId: claim.id } },
    data: {
      reviewStatus: "ACCEPTED",
      scoreAwarded: 10,
      reviewedById: post.authorId,
      reviewedAt: new Date(),
    },
  });
  await transitionClaim(
    claim.id,
    { id: post.authorId, role: "USER", isBlocked: false },
    "VERIFIED",
    "Runtime owner verification accepted.",
  );
  await proposeReturn(claim.id, user.id, {
    approximatePlace: "Public police help desk",
    scheduledAt: new Date(Date.now() + 864e5),
    safetyAcknowledged: true,
  });
  await proposeReturn(claim.id, post.authorId, {
    approximatePlace: "Public police help desk",
    scheduledAt: new Date(Date.now() + 864e5),
    safetyAcknowledged: true,
  });
  const code = await generateHandoverCode(claim.id, post.authorId);
  await verifyHandoverCode(claim.id, user.id, code);
  const oneSide = await confirmHandover(claim.id, user.id);
  if (oneSide.bothConfirmed)
    throw new Error("One-sided confirmation completed recovery.");
  const stored = await prisma.claimRequest.findUniqueOrThrow({
    where: { id: claim.id },
    include: {
      questions: { include: { answers: true } },
      returnArrangement: true,
      conversation: true,
    },
  });
  if (
    stored.questions.some((question) =>
      question.answers.some((answer) =>
        answer.answerCipher.includes("private runtime answer"),
      ),
    )
  )
    throw new Error("Raw verification answer was stored.");
  console.log(
    JSON.stringify({
      claimCreated: true,
      idempotent: true,
      encryptedAnswers: true,
      secureConversation: Boolean(stored.conversation),
      handoverCodeHashed: Boolean(
        stored.returnArrangement?.handoverCodeHash === null,
      ),
      oneSideDidNotRecover: true,
    }),
  );
}
main().finally(async () => {
  if (claimId)
    await prisma.claimRequest
      .delete({ where: { id: claimId } })
      .catch(() => null);
  if (conversationId)
    await prisma.conversation
      .delete({ where: { id: conversationId } })
      .catch(() => null);
  if (tempUserId)
    await prisma.user.delete({ where: { id: tempUserId } }).catch(() => null);
  await prisma.$disconnect();
});
