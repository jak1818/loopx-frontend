"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "";
  
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || ""; // 自动读取推荐码

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = isLogin ? "login" : "register";
    try {
      const body: any = { email, password };
      if (!isLogin) {
        body.name = name;
        // 如果有推荐码，带上
        if (refCode) body.referral_code = refCode;
      }

      const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        setLoading(false);
        return;
      }
      // 保存用户到本地状态
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-change"));
      router.push("/"); // 回到主页
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-black text-white min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {isLogin ? "Welcome back" : "Create account"}
      </h1>

      {/* 推荐人提示 */}
      {!isLogin && refCode && (
        <div className="mb-4 p-3 bg-pink-900/20 border border-pink-700 rounded-lg text-sm text-pink-200">
          🎁 You're invited! You'll receive <strong>100 LoopX Points</strong> after sign up.
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-4 p-3 bg-red-900/30 rounded-lg">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-pink-500"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-pink-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-pink-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 py-3 rounded-lg font-bold text-lg transition"
        >
          {loading ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-gray-400">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          className="text-pink-400 underline font-medium"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}

// 用 Suspense 包裹，因为 useSearchParams 需要
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AuthForm />
    </Suspense>
  );
}