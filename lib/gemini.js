import { GoogleGenerativeAI } from "@google/generative-ai";

const KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean);

// Try each key in order; rotate to next on quota/auth error
export async function geminiGenerate(prompt) {
  let lastError;
  for (const key of KEYS) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const msg = err?.message ?? "";
      // Rotate on quota exceeded, invalid key, or rate limit
      if (
        msg.includes("429") ||
        msg.includes("quota") ||
        msg.includes("API_KEY_INVALID") ||
        msg.includes("403") ||
        msg.includes("RESOURCE_EXHAUSTED")
      ) {
        lastError = err;
        continue;
      }
      throw err; // Non-quota errors bubble up immediately
    }
  }
  throw lastError ?? new Error("All Gemini API keys exhausted");
}
