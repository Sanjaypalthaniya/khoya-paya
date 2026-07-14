const coreEnv = ["DATABASE_URL", "JWT_SECRET", "NEXT_PUBLIC_APP_URL"] as const;
const cloudinaryEnv = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const;
const emailEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] as const;
const razorpayEnv = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "NEXT_PUBLIC_RAZORPAY_KEY_ID", "RAZORPAY_WEBHOOK_SECRET"] as const;

function missing(keys: readonly string[]) {
  return keys.filter((key) => !process.env[key] || process.env[key]?.startsWith("your_"));
}

export function getMissingCoreEnv() {
  return missing(coreEnv);
}

export function getFeatureEnvStatus() {
  return {
    core: missing(coreEnv),
    cloudinary: missing(cloudinaryEnv),
    email: missing(emailEnv),
    razorpay: missing(razorpayEnv),
  };
}

export function assertCoreEnv() {
  const missingKeys = getMissingCoreEnv();
  if (missingKeys.length && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variables: ${missingKeys.join(", ")}`);
  }
  return missingKeys;
}
