import { NextResponse } from "next/server";
import { listDocumentsForSession } from "@/lib/document-service";
import { getOrCreateSessionId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const sessionId = await getOrCreateSessionId();
  const documents = await listDocumentsForSession(sessionId);
  return NextResponse.json({ documents });
}
