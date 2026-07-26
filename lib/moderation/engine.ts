import { createHash } from "crypto";

export type ModerationDecision = "APPROVED" | "UNDER_REVIEW" | "REJECTED";
export type ModerationResult = {
  decision: ModerationDecision;
  riskScore: number;
  reasonCode: string;
  userMessage: string;
  signals: string[];
  provider: string;
  contentHash: string;
  detectedLabels?: string[];
  categoryMatch?: boolean;
};

const severe = [
  ["SEXUAL_CONTENT", /\b(porn|nudes?|xxx|sex video|onlyfans)\b/i],
  ["HATE_OR_HARASSMENT", /\b(kill yourself|kys|rape|lynch|terrorize)\b/i],
  ["THREAT", /\b(i will|we will|gonna)\s+(kill|shoot|stab|bomb|hurt)\b/i],
  [
    "ILLEGAL_TRADE",
    /\b(buy|sell|dealer|delivery)\b.{0,30}\b(cocaine|heroin|meth|gun|pistol|rifle)\b/i,
  ],
] as const;
const review = [
  [
    "SCAM_OR_FAKE_REWARD",
    /\b(guaranteed reward|pay.*fee|upi.*first|otp|bank pin|crypto payment|double your money)\b/i,
  ],
  ["ABUSIVE_LANGUAGE", /\b(idiot|stupid|moron|bastard|shut up)\b/i],
  [
    "WEAPON_OR_DRUG_REFERENCE",
    /\b(gun|pistol|rifle|knife|cocaine|heroin|meth|weed)\b/i,
  ],
  [
    "PROMOTIONAL_SPAM",
    /\b(buy now|limited offer|discount code|subscribe now|follow my page|earn money)\b/i,
  ],
  [
    "COPYRIGHT_OR_ENTERTAINMENT",
    /\b(full movie|watch movie|pirated|torrent|copyrighted clip)\b/i,
  ],
  [
    "POLITICAL_OR_UNRELATED",
    /\b(vote for|political rally|election campaign|party propaganda)\b/i,
  ],
] as const;
const relevant =
  /\b(lost|missing|found|find|finder|return|returned|recovered|recovery|help|success story|wallet|phone|mobile|keys?|laptop|bag|pet|dog|cat|document|passport|license|vehicle|car|bike|watch|jewel(?:ry|lery)|item|belonging|owner)\b/i;

export function normalizeModerationText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " url ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function moderationHash(value: string) {
  return createHash("sha256")
    .update(normalizeModerationText(value))
    .digest("hex");
}

export function textSimilarity(left: string, right: string) {
  const a = new Set(normalizeModerationText(left).split(" ").filter(Boolean));
  const b = new Set(normalizeModerationText(right).split(" ").filter(Boolean));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / (a.size + b.size - intersection);
}

export function moderateText(input: {
  text: string;
  requireRelevance?: boolean;
}): ModerationResult {
  const text = input.text.trim();
  const signals: string[] = [];
  for (const [code, pattern] of severe)
    if (pattern.test(text)) signals.push(code);
  if (signals.length)
    return result(
      "REJECTED",
      0.98,
      signals[0],
      "This content cannot be published because it may contain prohibited or dangerous material.",
      signals,
      text,
    );
  for (const [code, pattern] of review)
    if (pattern.test(text)) signals.push(code);
  const links = text.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (links > 1) signals.push("SUSPICIOUS_LINKS");
  const emoji = text.match(/\p{Extended_Pictographic}/gu)?.length ?? 0;
  if (emoji > 10) signals.push("EXCESSIVE_EMOJI");
  if (/(.)\1{7,}/i.test(text)) signals.push("REPEATED_CHARACTERS");
  if (input.requireRelevance && !relevant.test(text))
    signals.push("LOW_RELEVANCE");
  if (signals.length)
    return result(
      "UNDER_REVIEW",
      Math.min(0.9, 0.52 + signals.length * 0.1),
      signals[0],
      "Your content is under review. It will become visible after a safety check.",
      signals,
      text,
    );
  return result("APPROVED", 0.05, "SAFE", "Content approved.", [], text);
}

function result(
  decision: ModerationDecision,
  riskScore: number,
  reasonCode: string,
  userMessage: string,
  signals: string[],
  text: string,
): ModerationResult {
  return {
    decision,
    riskScore,
    reasonCode,
    userMessage,
    signals,
    provider: "local-rules-v1",
    contentHash: moderationHash(text),
  };
}
