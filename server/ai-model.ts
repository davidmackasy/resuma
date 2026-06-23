import { FALLBACK_AI_MODEL } from "@shared/ai-config";

export function isModelUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { status?: number; code?: string; message?: string; error?: { code?: string; message?: string } };
  const code = err.code ?? err.error?.code ?? "";
  const message = (err.message ?? err.error?.message ?? "").toLowerCase();
  if (err.status === 404) return true;
  if (code === "model_not_found" || code === "invalid_model") return true;
  return (
    message.includes("model") &&
    (message.includes("not found") ||
      message.includes("does not exist") ||
      message.includes("not available") ||
      message.includes("invalid"))
  );
}

export async function runWithModelFallback<T>(
  models: string[],
  run: (model: string) => Promise<T>,
): Promise<{ result: T; modelUsed: string; usedFallback: boolean }> {
  let lastError: unknown;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const result = await run(model);
      return {
        result,
        modelUsed: model,
        usedFallback: i > 0,
      };
    } catch (error) {
      lastError = error;
      const hasNext = i < models.length - 1;
      if (!hasNext || !isModelUnavailableError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}
