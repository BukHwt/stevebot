import { OpenAI } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "./cors.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { threadId, runId } = req.body;
  if (!threadId || !runId) {
    return res.status(400).json({ error: "Missing threadId or runId" });
  }

  try {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (run.status !== "completed") {
      return res.status(200).json({ status: run.status });
    }

    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data.find((m) => m.role === "assistant");

    const textBlock = lastMessage?.content?.find(
      (block) => block.type === "text"
    ) as { type: "text"; text: { value: string } } | undefined;

    return res.status(200).json({
      status: "completed",
      answer: textBlock?.text?.value ?? "No answer found.",
    });
  } catch (err) {
    console.error("Error checking run status:", err);
    return res.status(500).json({ error: "Failed to check run status" });
  }
}
