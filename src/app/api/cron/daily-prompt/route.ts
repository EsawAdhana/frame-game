import { NextResponse, type NextRequest } from "next/server";
import { promoteTodayPrompt } from "@/lib/db/prompts";

/**
 * Vercel-compatible cron endpoint. Add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/daily-prompt", "schedule": "0 0 * * *" }] }
 * Protected by CRON_SECRET when set (Vercel sends it as the "Authorization"
 * header "Bearer <secret>").
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }
  const prompt = await promoteTodayPrompt();
  if (!prompt) {
    return NextResponse.json(
      { ok: false, error: "prompt_pool empty" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, prompt });
}
