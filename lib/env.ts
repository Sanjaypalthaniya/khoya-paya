import { z } from "zod";

const configured = (value?: string) => Boolean(value && !/^(your_|production_|replace_)/i.test(value));
const coreEnv = ["DATABASE_URL", "JWT_SECRET", "NEXT_PUBLIC_APP_URL", "CLAIM_ENCRYPTION_KEY"] as const;
const cloudinaryEnv = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const;
const emailEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] as const;
const razorpayEnv = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "NEXT_PUBLIC_RAZORPAY_KEY_ID", "RAZORPAY_WEBHOOK_SECRET"] as const;

const schema = z.object({
  DATABASE_URL: z.string().min(1), JWT_SECRET: z.string().min(32), NEXT_PUBLIC_APP_URL: z.string().url(), CLAIM_ENCRYPTION_KEY: z.string().min(32),
  DIRECT_URL: z.string().url().optional(), CLOUDINARY_CLOUD_NAME: z.string().optional(), CLOUDINARY_API_KEY: z.string().optional(), CLOUDINARY_API_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(), SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(), SMTP_USER: z.string().optional(), SMTP_PASS: z.string().optional(), SMTP_FROM: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(), RAZORPAY_KEY_SECRET: z.string().optional(), NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(), RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

function missing(keys: readonly string[]) { return keys.filter(key => !configured(process.env[key])); }
export function getMissingCoreEnv() { return missing(coreEnv); }
export function getFeatureEnvStatus() { return { core: missing(coreEnv), cloudinary: missing(cloudinaryEnv), email: missing(emailEnv), razorpay: missing(razorpayEnv) }; }
export function assertCoreEnv() {
  const result = schema.safeParse(process.env);
  const missingKeys = getMissingCoreEnv();
  if (process.env.NODE_ENV === "production" && (!result.success || missingKeys.length)) {
    const names = new Set([...missingKeys, ...(result.success ? [] : result.error.issues.map(issue => String(issue.path[0]))) ]);
    throw new Error(`Production environment is invalid. Check: ${[...names].join(", ")}`);
  }
  return missingKeys;
}
