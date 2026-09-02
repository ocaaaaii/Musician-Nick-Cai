"use client";

import { useState, type FormEvent } from "react";
import { login } from "@/app/admin/login/actions";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.message);
      setSubmitting(false);
    }
    // On success, login() calls redirect("/admin") server-side, which
    // throws internally and never returns here.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          密碼
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
      </div>

      {error && (
        <p className="font-mono text-[11px] text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 border border-ink/30 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "登入中…" : "登入"}
      </button>
    </form>
  );
}
