import { supabase } from "@/integrations/supabase/client";

const REMEMBER_KEY = "tebma.auth.remember";
const EMAIL_KEY = "tebma.auth.lastEmail";
const TAB_MARKER = "tebma.auth.tabAlive";

export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
    sessionStorage.setItem(TAB_MARKER, "1");
  } catch {
    /* storage unavailable */
  }
}

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(REMEMBER_KEY) !== "0";
  } catch {
    return true;
  }
}

export function rememberEmail(email: string) {
  if (typeof window === "undefined") return;
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function getRememberedEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

/**
 * When the user opted out of "keep me signed in", the session must not survive
 * a full browser restart. A sessionStorage marker dies with the tab/browser,
 * so its absence on boot means this is a fresh browser session.
 */
export async function enforceSessionPersistence() {
  if (typeof window === "undefined") return;
  let remember = true;
  let freshBrowserSession = false;
  try {
    remember = localStorage.getItem(REMEMBER_KEY) !== "0";
    freshBrowserSession = sessionStorage.getItem(TAB_MARKER) !== "1";
    sessionStorage.setItem(TAB_MARKER, "1");
  } catch {
    return;
  }

  if (remember || !freshBrowserSession) return;

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    await supabase.auth.signOut();
  }
}
