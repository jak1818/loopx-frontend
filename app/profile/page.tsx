"use client";

import { useAppData } from "@/providers/AppDataProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { user } = useAppData();
  const router = useRouter();

  const [today, setToday] = useState(0);
  const [ranking, setRanking] = useState("--");

  // 📈 Today earnings
  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:5000/api/user/today-earnings/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setToday(data.total);
        }
      });
  }, [user]);

  // 🏆 Ranking
  useEffect(() => {
    if (!user?.id) return;

    fetch("http://localhost:5000/api/leaderboard/creators")
      .then(res => res.json())
      .then(data => {
        const index = data.data.findIndex(
          (c: any) => c.user_id === user.id
        );

        if (index !== -1) {
          setRanking(index + 1);
        }
      });
  }, [user]);

  if (!user) return null;

  return (
    <div className="p-4 text-white bg-black min-h-screen">

      {/* 👤 User Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {user.username || "User"}
        </h1>
        <p className="text-gray-400">Level {user.level}</p>
      </div>

      {/* 📊 Stats */}
      <div className="mb-6 space-y-2">
        <p>🏆 Ranking: #{ranking}</p>
        <p>📈 Today Earnings: ${today}</p>
        <p>⚡ Points: {user.points}</p>
      </div>

      {/* 💰 Balance Shortcut */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/balance")}
          className="bg-green-500 w-full py-3 rounded-xl font-bold"
        >
          💰 Go to Balance
        </button>
      </div>

      {/* 💎 Quick Info */}
      <div className="space-y-1 text-gray-300">
        <p>💎 Diamond: {user.diamond}</p>
        <p>💵 USDT: {user.usdt}</p>
      </div>

    </div>
  );
}