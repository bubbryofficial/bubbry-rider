import { supabase } from "./supabase";

// Single-device login for riders. Riders aren't Supabase Auth users; the login
// row is stored as JSON in localStorage("bubbry_rider") and a cookie. We add a
// current_session_id to the riders table and enforce it the same way.

const SESSION_ID_KEY = "bubbry_rider_device_session_id";
const RIDER_KEY = "bubbry_rider";

export function getDeviceSessionId(): string | null {
  try { return localStorage.getItem(SESSION_ID_KEY); } catch { return null; }
}

function makeId(): string {
  return (
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

export function getRiderId(): string | null {
  try {
    const raw = localStorage.getItem(RIDER_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.id ? String(obj.id) : null;
  } catch {
    return null;
  }
}

// Call right after a successful rider login.
export async function setCurrentSession(riderId: string): Promise<void> {
  const sid = makeId();
  try { localStorage.setItem(SESSION_ID_KEY, sid); } catch {}
  try {
    await supabase.from("riders").update({ current_session_id: sid }).eq("id", riderId);
  } catch {}
}
