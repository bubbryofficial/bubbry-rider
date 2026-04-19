"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check localStorage first
    const saved = localStorage.getItem("bubbry_rider");
    if (saved) { router.replace("/delivery"); return; }
    // Check cookie
    const match = document.cookie.split("; ").find(row => row.startsWith("bubbry_rider="));
    if (match) {
      const data = decodeURIComponent(match.split("=").slice(1).join("="));
      localStorage.setItem("bubbry_rider", data);
      router.replace("/delivery");
      return;
    }
    // No session found
    router.replace("/login");
  }, []);

  // Show nothing while checking session
  return null;
}
