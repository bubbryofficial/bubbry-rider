"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getDeviceSessionId, getRiderId } from "../lib/session";

// Watches the logged-in rider's current_session_id in the riders table. If the
// same rider logs in on another device, this device logs out and goes to /login.
export default function SessionGuard() {
  useEffect(() => {
    let channel: any = null;
    let poll: any = null;
    let cancelled = false;

    function logoutToLogin() {
      try { localStorage.removeItem("bubbry_rider"); } catch {}
      try { localStorage.removeItem("bubbry_rider_device_session_id"); } catch {}
      try { document.cookie = "bubbry_rider=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax"; } catch {}
      const p = window.location.pathname;
      if (p !== "/login" && p !== "/") {
        window.location.href = "/login";
      }
    }

    async function check() {
      const rid = getRiderId();
      const mine = getDeviceSessionId();
      if (!rid || !mine) return;
      try {
        const { data, error } = await supabase
          .from("riders")
          .select("current_session_id")
          .eq("id", rid)
          .single();
        if (error || !data) return;
        if (data.current_session_id && data.current_session_id !== mine) {
          if (!cancelled) logoutToLogin();
        }
      } catch {}
    }

    const rid = getRiderId();
    if (rid && getDeviceSessionId()) {
      channel = supabase
        .channel("session-guard-rider-" + rid)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "riders", filter: "id=eq." + rid },
          (payload: any) => {
            const newId = payload?.new?.current_session_id;
            const mine = getDeviceSessionId();
            if (newId && mine && newId !== mine) logoutToLogin();
          }
        )
        .subscribe();

      poll = setInterval(check, 10000);
      check();
    }

    return () => {
      cancelled = true;
      if (channel) { try { supabase.removeChannel(channel); } catch {} }
      if (poll) clearInterval(poll);
    };
  }, []);

  return null;
}
