// components/SignInForm.tsx
"use client";
import { signIn } from "next-auth/react";
import type React from "react";
import { useState } from "react";

export default function SignInForm({
  callbackUrl = "/",
}: {
  callbackUrl?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      setBusy(false);
      if (!res) {
        setError("No response from signIn");
        return;
      }
      if (res.error) {
        setError(res.error);
        return;
      }
      // success: redirect
      if (res.url) window.location.href = res.url as string;
    } catch (err: any) {
      setBusy(false);
      setError(err.message || String(err));
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md p-6 bg-white rounded shadow space-y-4"
    >
      <h3 className="text-lg font-semibold">Sign in</h3>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 bg-slate-800 text-white rounded"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <a className="text-sm text-slate-500" href="/auth/forgot">
          Forgot?
        </a>
      </div>
    </form>
  );
}
