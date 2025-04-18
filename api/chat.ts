import { OpenAI } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://stevebot.vercel.app",
  "https://steveandersonthedeveloper.com",
  "https://portfolio-project-5gl6dwvna-steve-andersons-projects-d862a8e0.vercel.app",
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || "";
  const isAllowed = allowedOrigins.includes(origin);

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).send("SteveBot is online.");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { question } = body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const assistantId = process.env.OPENAI_ASSISTANT_ID!;
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: question,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    let runStatus = run;
    let attempts = 0;
    const maxAttempts = 10;

    while (
      runStatus.status !== "completed" &&
      runStatus.status !== "failed" &&
      runStatus.status !== "requires_action" &&
      attempts < maxAttempts
    ) {
      await new Promise((r) => setTimeout(r, 750));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
    }

    if (runStatus.status === "failed") {
      throw new Error("Assistant run failed.");
    }

    if (runStatus.status === "requires_action") {
      throw new Error("Assistant requires action and can't continue.");
    }

    if (runStatus.status !== "completed") {
      console.warn("SteveBot timed out. Status was:", runStatus.status);
      return res.status(200).json({
        answer:
          "I'm thinking real hard about that one. Try again in a few seconds!",
      });
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find((m) => m.role === "assistant");

    const textBlock = lastMessage?.content?.find(
      (block) => block.type === "text"
    ) as { type: "text"; text: { value: string } } | undefined;

    const answer = textBlock?.text?.value ?? "SteveBot didn't answer the call.";

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("🔥 SteveBot Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //
}
