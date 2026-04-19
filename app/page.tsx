"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace("/delivery");
      } else {
        router.replace("/login");
      }
    });
  }, []);

  // Show nothing while checking session
  return null;
}
