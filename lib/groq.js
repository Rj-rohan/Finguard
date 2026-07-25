import Groq from "groq-sdk";

const KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean);

export async function groqGenerate(prompt) {
  let lastError;
  for (const key of KEYS) {
    try {
      const groq = new Groq({ apiKey: key });
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 512,
      });
      return completion.choices[0]?.message?.content ?? "";
    } catch (err) {
      const msg = err?.message ?? "";
      if (
        msg.includes("429") ||
        msg.includes("quota") ||
        msg.includes("rate_limit") ||
        msg.includes("401") ||
        msg.includes("invalid_api_key") ||
        msg.includes("RESOURCE_EXHAUSTED")
      ) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("All Groq API keys exhausted");
}
