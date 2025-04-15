import { OpenAI } from "openai";

export const config = {
  runtime: "edge",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: Request) {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://steveandersonthedeveloper.com",
    "https://stevebot.vercel.app",
  ];
  const origin = req.headers.get("origin") || "";
  const isAllowed = allowedOrigins.includes(origin);

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
      },
    });
  }

  try {
    const body = await req.json();
    const { question } = body;
    if (!question) {
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": isAllowed ? origin : "",
        },
      });
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

    while (runStatus.status !== "completed" && attempts < 20) {
      await new Promise((r) => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
    }

    if (runStatus.status !== "completed") {
      throw new Error("Run did not complete in time");
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find((m) => m.role === "assistant");
    const textBlock = lastMessage?.content?.find(
      (block) => block.type === "text"
    ) as { type: "text"; text: { value: string } } | undefined;

    const answer = textBlock?.text?.value ?? "SteveBot didn't answer the call.";

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("SteveBot error:", err);
    return new Response(JSON.stringify({ error: "Server Error" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Content-Type": "application/json",
      },
    });
  }
}
