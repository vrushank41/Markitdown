import { NextResponse } from "next/server";
import {
  deleteDocumentForSession,
  getDocumentForSession,
} from "@/lib/document-service";
import { getOrCreateSessionId } from "@/lib/session";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const sessionId = await getOrCreateSessionId();
  const { id } = await context.params;
  const document = await getDocumentForSession(id, sessionId);
  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  return NextResponse.json({ document });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const sessionId = await getOrCreateSessionId();
  const { id } = await context.params;
  try {
    await deleteDocumentForSession(id, sessionId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
}
