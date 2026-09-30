import { NextResponse } from "next/server";
import { getDocumentFileForSession } from "@/lib/document-service";
import { getOrCreateSessionId } from "@/lib/session";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const sessionId = await getOrCreateSessionId();
  const { id } = await context.params;
  const result = await getDocumentFileForSession(id, sessionId);
  if (!result) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  return new NextResponse(result.bytes, {
    headers: {
      "content-disposition": `inline; filename="${result.document.fileName}"`,
      "content-type": result.document.mimeType,
    },
  });
}
