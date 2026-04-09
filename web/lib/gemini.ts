import { GoogleGenerativeAI } from "@google/generative-ai";

export const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing required environment variable: GEMINI_API_KEY");
  }

  return new GoogleGenerativeAI(apiKey);
}
