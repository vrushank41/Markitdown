import { NextResponse } from "next/server";
import { storeUploadForSession } from "@/lib/document-service";
import { getOrCreateSessionId } from "@/lib/session";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const sessionId = await getOrCreateSessionId();
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError("Select a file to upload.");
  }

  try {
    const document = await storeUploadForSession(sessionId, {
      bytes: Buffer.from(await file.arrayBuffer()),
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
    });
    return NextResponse.json({ document });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Upload failed.");
  }
}
