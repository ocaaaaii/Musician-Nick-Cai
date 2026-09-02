"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginResult = { ok: true } | { ok: false; message: string };

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  if (!email.trim() || !password) {
    return { ok: false, message: "請輸入 Email 與密碼" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { ok: false, message: "帳號或密碼錯誤" };
  }

  redirect("/admin");
}
