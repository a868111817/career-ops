import Anthropic from "@anthropic-ai/sdk";

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Missing required environment variable: ANTHROPIC_API_KEY");
  }

  return new Anthropic({ apiKey });
}
