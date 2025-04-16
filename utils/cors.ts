import type { VercelRequest, VercelResponse } from "@vercel/node";

const allowedOrigins = [
  "http://localhost:5173",
  "https://stevebot.vercel.app",
  "https://steveandersonthedeveloper.com",
  "https://portfolio-project-5gl6dwvna-steve-andersons-projects-d862a8e0.vercel.app",
];

export function applyCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || "";
  const isAllowed = allowedOrigins.includes(origin);

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
