const technicalErrorPattern =
  /(?:__TURBOPACK__|PrismaClient|prisma[.$]|invocation in [A-Z]:\\|server[\\/]chunks|async function)/i;

export function safePublicText(value: string | null | undefined, fallback: string) {
  const text = value?.trim();
  if (!text || technicalErrorPattern.test(text)) return fallback;
  return text;
}
