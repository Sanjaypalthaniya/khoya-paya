import { prisma } from "@/lib/prisma";

export type MatchableReport = { recoveryCode?: string | null; category: string; brand?: string | null; modelNumber?: string | null; color?: string | null; identifyingMarks?: string | null; description: string; foundLocation: string };
export type MatchableItem = { recoveryCode?: string | null; category: string; brand?: string | null; modelNumber?: string | null; color?: string | null; identifyingMarks?: string | null; description: string; lastSeenLocation?: string | null };

export function normalizeText(value?: string | null) {
  return (value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function containsEither(left?: string | null, right?: string | null) {
  const a = normalizeText(left); const b = normalizeText(right);
  return Boolean(a && b && (a.includes(b) || b.includes(a)));
}

export function compareItemAttributes(report: MatchableReport, item: MatchableItem) {
  const exactRecovery = normalizeText(report.recoveryCode) && normalizeText(report.recoveryCode) === normalizeText(item.recoveryCode);
  if (exactRecovery) return { score: 100, reasons: ["Exact Recovery ID"] };
  const matches = {
    category: normalizeText(report.category) === normalizeText(item.category),
    brand: containsEither(report.brand, item.brand),
    color: containsEither(report.color, item.color),
    model: containsEither(report.modelNumber, item.modelNumber),
    location: containsEither(report.foundLocation, item.lastSeenLocation),
    marks: containsEither(report.identifyingMarks, item.identifyingMarks),
    description: normalizeText(report.description).split(" ").filter((word) => word.length > 3).some((word) => normalizeText(item.description).includes(word)),
  };
  let score = matches.category ? 20 : 0;
  if (matches.brand) score += 20;
  if (matches.color) score += 15;
  if (matches.model) score += 20;
  if (matches.location) score += 20;
  if (matches.marks) score += 20;
  if (matches.description) score += 10;
  return { score: Math.min(score, 95), reasons: Object.entries(matches).filter(([, yes]) => yes).map(([key]) => key) };
}

export function calculateMatchScore(report: MatchableReport, item: MatchableItem) {
  return compareItemAttributes(report, item).score;
}

export async function findPossibleMatches(report: MatchableReport) {
  const items = await prisma.item.findMany({ where: { OR: [{ status: "LOST" }, { publicSearchVisible: true }] }, select: { id: true, userId: true, itemName: true, recoveryCode: true, category: true, brand: true, modelNumber: true, color: true, identifyingMarks: true, description: true, lastSeenLocation: true } });
  return items.map((item) => ({ item, ...compareItemAttributes(report, item) })).filter((match) => match.score >= 50).sort((a, b) => b.score - a.score).slice(0, 10);
}

export async function createFoundReportMatches(foundReportId: string, report: MatchableReport) {
  const matches = await findPossibleMatches(report);
  if (matches.length) await prisma.foundReportMatch.createMany({ data: matches.map(({ item, score, reasons }) => ({ foundReportId, itemId: item.id, matchScore: score, matchReason: reasons.join(", "), status: "OWNER_NOTIFIED" })) });
  return matches;
}
