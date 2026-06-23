/**
 * Central AI model configuration — change DEFAULT_AI_MODEL here to swap models app-wide.
 *
 * OpenAI API model id: gpt-5.5 (snapshot: gpt-5.5-2026-04-23)
 * @see https://developers.openai.com/api/docs/models/gpt-5.5
 */
export const DEFAULT_AI_MODEL = "gpt-5.5";

/** Pinned snapshot for production stability (optional override) */
export const DEFAULT_AI_MODEL_SNAPSHOT = "gpt-5.5-2026-04-23";

/** Used when the primary model is unavailable on the provider */
export const FALLBACK_AI_MODEL = "gpt-5-mini";

export type AiModelOption = {
  id: string;
  label: string;
  description?: string;
};

/** Models exposed in the UI model selector */
export const AI_MODEL_OPTIONS: AiModelOption[] = [
  { id: "gpt-5.5", label: "GPT-5.5", description: "Best quality — default" },
  { id: "gpt-5.5-2026-04-23", label: "GPT-5.5 (pinned)", description: "Fixed snapshot" },
  { id: "gpt-5-mini", label: "GPT-5 Mini", description: "Faster, lower cost" },
  { id: "gpt-5.1", label: "GPT-5.1", description: "Previous generation" },
];

const allowedModelIds = new Set(AI_MODEL_OPTIONS.map((m) => m.id));

/** Resolve client-requested model id, falling back to default if unknown */
export function resolveAiModel(requested?: string | null): string {
  if (requested && allowedModelIds.has(requested)) {
    return requested;
  }
  return DEFAULT_AI_MODEL;
}

export function isAllowedAiModel(model: string): boolean {
  return allowedModelIds.has(model);
}

/** Server override via AI_MODEL env; client always uses DEFAULT_AI_MODEL */
export function getEffectiveDefaultModel(): string {
  if (typeof process !== "undefined" && process.env.AI_MODEL?.trim()) {
    const envModel = process.env.AI_MODEL.trim();
    if (allowedModelIds.has(envModel)) return envModel;
    return envModel;
  }
  return DEFAULT_AI_MODEL;
}

/** Ordered list for retry when the provider rejects a model id */
export function getModelFallbackChain(requested?: string | null): string[] {
  const primary = resolveAiModel(requested);
  const chain = [primary];
  if (primary !== FALLBACK_AI_MODEL) chain.push(FALLBACK_AI_MODEL);
  return chain;
}
