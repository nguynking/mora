import { sessionClient, allowedEmail } from "@/lib/supabase";
import { getDatabase } from "@/lib/database";
import { redirect } from "next/navigation";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const SIGN_IN_PATH = "/signin";
const SIGN_OUT_PATH = "/signout";
const CALLBACK_PATH = "/auth/callback";

// Keep the public helper contract; identity now comes from a verified session.
export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const client = await sessionClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.email || !user.email_confirmed_at || !allowedEmail(user.email)) return null;
  // Preserve imported Sites member IDs only after verifying ownership of the email.
  const matches = await getDatabase().prepare('SELECT id FROM members WHERE lower(email)=lower(?)').bind(user.email).all<{id:string}>();
  if (matches.results.length > 1) throw new Error('Ambiguous legacy member email.');
  const fullName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null;
  return { userId: matches.results[0]?.id ?? user.id, displayName: fullName || user.email, email: user.email, fullName };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}
