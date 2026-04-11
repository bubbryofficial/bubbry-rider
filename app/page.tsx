"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace("/login"); }, []);
  return null;
}
