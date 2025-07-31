export const logger = {
  info: (...args: unknown[]) => console.log("[INFO]", ...args),
  debug: (...args: unknown[]) => console.log("[DEBUG]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
};
