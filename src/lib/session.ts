import { cookies } from "next/headers";

const SESSION_COOKIE = "markitdown_session";

export async function getOrCreateSessionId() {
  const cookieStore = await cookies();
  const current = cookieStore.get(SESSION_COOKIE)?.value;
  if (current) {
    return current;
  }

  const sessionId = crypto.randomUUID();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return sessionId;
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}
