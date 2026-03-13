import { GoogleGenAI } from "@google/genai";
import type { HintRequest, HintResponse } from "./hints.types";
import env from "@/config/env";
import { ApiError } from "@/utils/apiHandler";

export async function getHint(payload: HintRequest): Promise<HintResponse> {
  if (!env.geminiApiKey)
    throw new ApiError(503, "LLM API key is not configured.");

  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

  const systemPrompt = [
    "You are a SQL tutor helping students learn SQL.",
    "Given the student's question, their attempted query, and the table schema, provide a short, helpful hint.",
    "Do NOT give the full answer — guide the student toward discovering it themselves.",
  ].join(" ");

  const userPrompt = [
    `Question: ${payload.question}`,
    `Student's query: ${payload.query}`,
    `Schema:\n${payload.schema}`,
  ].join("\n\n");

  let hint: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });
    hint = response.text?.trim();
    console.log("[GEMINI API RESPONSE]", { hint });
  } catch (error) {
    console.error("[GEMINI API ERROR]", error);
    throw new ApiError(502, "Failed to get hint from Gemini API");
  }

  if (!hint) throw new ApiError(502, "Gemini API did not return a valid hint");

  return { hint };
}
