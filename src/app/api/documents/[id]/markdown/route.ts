import { NextResponse } from "next/server";
import {
  getDocumentMarkdownForSession,
  saveDocumentMarkdownForSession,
} from "@/lib/document-service";
import { getOrCreateSessionId } from "@/lib/session";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const sessionId = await getOrCreateSessionId();
  const { id } = await context.params;
  try {
    const markdown = await getDocumentMarkdownForSession(id, sessionId);
    return NextResponse.json({ markdown });
  } catch {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const sessionId = await getOrCreateSessionId();
  const { id } = await context.params;
  const body = (await request.json()) as { markdown?: string };
  if (typeof body.markdown !== "string") {
    return NextResponse.json({ error: "Markdown is required." }, { status: 400 });
  }

  try {
    const document = await saveDocumentMarkdownForSession(
      id,
      sessionId,
      body.markdown,
    );
    return NextResponse.json({ document });
  } catch {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
}
