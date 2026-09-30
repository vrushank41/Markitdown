import { NextResponse } from "next/server";
import { convertDocumentForSession } from "@/lib/document-service";
import { getOrCreateSessionId } from "@/lib/session";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const sessionId = await getOrCreateSessionId();
  const { id } = await context.params;
  try {
    const document = await convertDocumentForSession(id, sessionId);
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Conversion failed." },
      { status: 400 },
    );
  }
}
