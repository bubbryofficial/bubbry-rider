"use client";

// Bubbry web-push client helper.
// Usage: call enableWebPush(userId) after login / from a "Turn on notifications"
// button. It registers the service worker, asks permission, subscribes, and
// saves the subscription to Supabase (push_subscriptions).

import { supabase } from "./supabase";

// Your VAPID PUBLIC key — set NEXT_PUBLIC_VAPID_PUBLIC_KEY in env.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export async function enableWebPush(userId: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    if (!isPushSupported()) return { ok: false, reason: "unsupported" };
    if (!VAPID_PUBLIC_KEY) return { ok: false, reason: "no_vapid_key" };

    const reg = await navigator.serviceWorker.register("/sw.js");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "denied" };

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const json: any = sub.toJSON();
    await supabase.from("push_subscriptions").upsert({
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    }, { onConflict: "endpoint" });

    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: e?.message || "error" };
  }
}

export async function disableWebPush(): Promise<void> {
  try {
    if (!isPushSupported()) return;
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      const json: any = sub.toJSON();
      await supabase.from("push_subscriptions").delete().eq("endpoint", json.endpoint);
      await sub.unsubscribe();
    }
  } catch (_) {}
}
