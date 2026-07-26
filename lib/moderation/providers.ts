import { z } from "zod";
import type { ModerationResult } from "./engine";

export type MediaModerationInput = {
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl?: string;
  altText: string;
  selectedCategory?: string;
  contentHash: string;
};
export interface MediaModerationProvider {
  readonly name: string;
  moderate(input: MediaModerationInput): Promise<ModerationResult>;
}

const responseSchema = z.object({
  decision: z.enum(["APPROVED", "UNDER_REVIEW", "REJECTED"]),
  riskScore: z.number().min(0).max(1),
  reasonCode: z.string().min(1).max(80),
  userMessage: z.string().min(1).max(500),
  signals: z.array(z.string().max(80)).max(30).default([]),
  detectedLabels: z.array(z.string().max(80)).max(30).optional(),
  categoryMatch: z.boolean().optional(),
});

export function normalizeMediaProviderResult(
  value: unknown,
  provider: string,
  input: MediaModerationInput,
): ModerationResult {
  const parsed = responseSchema.parse(value);
  if (parsed.categoryMatch === false)
    return {
      ...parsed,
      decision: "UNDER_REVIEW",
      riskScore: Math.max(parsed.riskScore, 0.72),
      reasonCode: "CATEGORY_MISMATCH",
      userMessage:
        "This image does not appear to match the selected category. Please correct the category or replace the media.",
      signals: [...new Set([...parsed.signals, "CATEGORY_MISMATCH"])],
      provider,
      contentHash: input.contentHash,
    };
  return { ...parsed, provider, contentHash: input.contentHash };
}

export class SelfHostedMediaModerationProvider implements MediaModerationProvider {
  readonly name = "self-hosted-media-v1";
  constructor(
    private endpoint: string,
    private token?: string,
  ) {}
  async moderate(input: MediaModerationInput) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok)
      throw new Error(`Media moderation provider returned ${response.status}.`);
    return normalizeMediaProviderResult(
      await response.json(),
      this.name,
      input,
    );
  }
}
