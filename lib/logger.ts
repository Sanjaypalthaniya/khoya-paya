export function reportServerError(context: string, error: unknown) {
  const detail = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`${JSON.stringify({ level: "error", context, detail, timestamp: new Date().toISOString() })}\n`);
}
