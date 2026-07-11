"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Server error");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 p-8">

        <h1 className="text-3xl font-bold text-white text-center mb-8">
          LoopCast Admin
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-3 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}