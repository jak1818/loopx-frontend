"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/providers/AppDataProvider";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function FriendsPage() {
  const router = useRouter();
  const { telegramUser, webUser } = useAppData();
  const user = telegramUser || webUser;
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);


  // 获取推荐统计
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${BACKEND}/api/referral/stats?user_id=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d);
      });
  }, [user]);

  const handleCopy = () => {
    if (!stats?.referral_code) return;
    const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || "LoopXAppBot";
    const link =`https://t.me/${BOT_USERNAME}?startapp=${stats.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

const handleShare = async () => {
  if (!stats?.referral_code || !user) return;

  const tg = (window as any)?.Telegram?.WebApp;
  if (tg && tg.shareMessage) {
    // 在 Telegram Mini App 内 → 使用原生分享
    try {
      const res = await fetch(`${BACKEND}/api/invite/prepared`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
         telegram_user_id:
            telegramUser?.telegram_id ??
            user?.telegram_id,
          ref_code: stats.referral_code
        })
      });
      const data = await res.json();
      if (data.success && data.prepared_message_id) {
        tg.shareMessage(data.prepared_message_id);
      } else {
        alert('Failed to prepare invite');
      }
    } catch {
      alert('Share failed');
    }
  } else {
    // 非 Telegram 环境 → 复制链接或 Web Share
    const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || "LoopXAppBot";

    const link =`https://t.me/${BOT_USERNAME}?startapp=${stats.referral_code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join LoopCast', url: link });
      } catch {}
    } else {
      navigator.clipboard.writeText(link);
      alert('Link copied!');
    }
  }
};

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Please log in first
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  const { total_l1, total_points_earned } = stats;

  return (
    <div className="min-h-screen bg-black text-white max-w-[430px] mx-auto px-4 pt-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400">
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Invite Friends</h1>
      </div>

      {/* Stats Card */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <p className="text-xs text-gray-400 mb-2">Your invitation earnings</p>
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-400">{total_l1}</p>
            <p className="text-xs text-gray-500">Friends Invited</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {total_points_earned}
            </p>
            <p className="text-xs text-gray-500">LoopX Points Earned</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/friends/list")}
          className="mt-3 w-full bg-gray-800 py-2 rounded-full text-sm font-semibold"
        >
          View my friends ({total_l1})
        </button>
      </div>

      {/* Invite Code Card */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <p className="text-xs text-gray-400 mb-2">Your invite code</p>
        <div className="flex items-center justify-between bg-black rounded-xl px-4 py-3">
          <span className="text-xl font-mono tracking-widest text-pink-400">
            {stats.referral_code}
          </span>
          <button
            onClick={handleCopy}
            className="bg-pink-600 px-4 py-1.5 rounded-full text-xs font-bold active:scale-95"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button
          onClick={handleShare}
          className="mt-3 w-full bg-blue-600 py-2 rounded-full text-sm font-semibold"
        >
          Share invite link
        </button>
      </div>

      {/* Reward Rules */}
      <div className="bg-gray-900 rounded-2xl p-4">
        <p className="text-sm font-semibold mb-2">Referral rewards</p>
        <div className="space-y-2 text-xs text-gray-300">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="font-semibold text-pink-400">Sign-up bonus</p>
            <p>Both you and your friend get 100 LoopX Points</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="font-semibold text-pink-400">First purchase</p>
            <p>You get 200 extra LoopX Points (coming soon)</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="font-semibold text-pink-400">Diamond gifts</p>
            <p>Earn 2% of the USDT earned from every diamond gift received by creators you invited.</p>
          </div>
        </div>
      </div>
    </div>
  );
}