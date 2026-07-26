export function logMobileSecurityEvent(event: string, detail: Record<string, string | number | boolean | null> = {}) {
  process.stdout.write(`${JSON.stringify({
    level: "info",
    scope: "mobile-auth",
    event,
    ...detail,
    timestamp: new Date().toISOString(),
  })}\n`);
}
