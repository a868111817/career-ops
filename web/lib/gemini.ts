import type { GenerateContentStreamResult } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODEL_FALLBACK_CHAIN = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

export type GeminiModel = (typeof GEMINI_MODEL_FALLBACK_CHAIN)[number];

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing required environment variable: GEMINI_API_KEY");
  }

  return new GoogleGenerativeAI(apiKey);
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message;
  return (
    msg.includes("503") ||
    msg.includes("Service Unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("high demand")
  );
}

/**
 * Try generateContentStream across the model fallback chain.
 * Returns the first successful stream and the model name used.
 */
export async function streamWithFallback(
  prompt: string,
  generationConfig: { maxOutputTokens?: number } = {}
): Promise<{ modelName: GeminiModel; result: GenerateContentStreamResult }> {
  const genAI = getGeminiClient();
  let lastError: unknown;

  for (const modelName of GEMINI_MODEL_FALLBACK_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
      });
      const result = await model.generateContentStream(prompt);
      return { modelName, result };
    } catch (error) {
      if (isRetryableError(error)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error("All Gemini models are unavailable");
}
