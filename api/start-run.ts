import { OpenAI } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "../utils/cors";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ✅ Always apply CORS headers first
  applyCorsHeaders(req, res);

  // ✅ Short-circuit OPTIONS before doing anything else
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ THEN check POST and safely access req.body
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: question,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID!,
    });

    return res.status(200).json({
      threadId: thread.id,
      runId: run.id,
    });
  } catch (err) {
    console.error("Error starting run:", err);
    return res.status(500).json({ error: "Failed to start run" });
  }
}
