"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WebLogin() {

  const router = useRouter();

  const [webUser, setWebUser] =
    useState<any>(null);

  // ✅ Telegram Mini App 不显示 WebLogin
  if (
  
    typeof window !== "undefined" &&
    (window as any)?.Telegram?.WebApp?.initData
  ) {
	  

    return null;
  }

  // 初始化：从 localStorage 读取
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("user");

      if (stored) {
        setWebUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // 监听 auth-change
  useEffect(() => {
    const handler = () => {
      try {
        const stored =
          localStorage.getItem("user");

        setWebUser(
          stored
            ? JSON.parse(stored)
            : null
        );
      } catch {}
    };

    window.addEventListener(
      "auth-change",
      handler
    );

    return () =>
      window.removeEventListener(
        "auth-change",
        handler
      );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");

    setWebUser(null);

    window.dispatchEvent(
      new Event("auth-change")
    );

    router.push("/");
  };

  return (
    <div className="flex justify-end items-center px-4 pt-3 pb-1 bg-black">
      {!webUser ? (
        <button
          onClick={() =>
            router.push("/auth")
          }
          className="bg-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold"
        >
          Log in
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">
            {webUser.email}
          </span>

          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 underline"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}