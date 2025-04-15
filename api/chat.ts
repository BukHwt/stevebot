import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Missing question" });
  }

  try {
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: question,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId!,
    });

    let runStatus = run;
    let attempts = 0;

    // Poll until run completes
    while (runStatus.status !== "completed" && attempts < 20) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("SteveBot error:", err);
    return res
      .status(500)
      .json({ error: "SteveBot had a mishap on the field" });
  }
}
