import { NextResponse } from "next/server";
import { storeUrlForSession } from "@/lib/document-service";
import { getOrCreateSessionId } from "@/lib/session";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const sessionId = await getOrCreateSessionId();
  const body = (await request.json()) as { url?: string };
  if (!body.url) {
    return jsonError("Enter a public file URL.");
  }

  try {
    const document = await storeUrlForSession(sessionId, { url: body.url });
    return NextResponse.json({ document });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Fetch failed.");
  }
}
