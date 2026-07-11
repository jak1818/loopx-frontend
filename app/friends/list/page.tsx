"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/providers/AppDataProvider";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function FriendsListPage() {
  const router = useRouter();
  const { telegramUser, webUser } = useAppData();
  const user = telegramUser || webUser;
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    if (!user?.id) return;
    fetch(`${BACKEND}/api/referral/list?user_id=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setFriends(d.friends || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  const renderFriend = (f: any) => {
    const name = f.username || f.name || `User#${f.id.slice(0, 4).toUpperCase()}`;
    return (
      <div
        key={f.id}
        className="flex justify-between items-center bg-gray-900 rounded-2xl p-3 mb-2 border border-gray-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
            {name[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-medium text-sm">{name}</p>
            <p className="text-[10px] text-gray-500">  Joined{" "}{new Date(f.created_at).toLocaleDateString("en-GB")}</p>
          </div>
        </div>
    <div className="text-right space-y-1">

  <div>
    <p className="text-sm font-bold text-pink-400">
      {Number(f.total_referral_usdt || 0) > 0
    ? `+${Number(f.total_referral_usdt).toFixed(2)} USDT`
    : "—"}
    </p>

    <p className="text-[10px] text-gray-500">
      Gift Referral Revenue
    </p>
  </div>

  <div>
    <p className="text-sm font-bold text-yellow-400">
      {Number(f.total_ads_points || 0) > 0
    ? `+${Number(f.total_ads_points).toLocaleString()} LoopX Coins`
    : "—"}
    </p>

    <p className="text-[10px] text-gray-500">
      Ads Referral Rewards
    </p>
  </div>

</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white max-w-[430px] mx-auto px-4 pt-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Your Friends</h1>
      </div>

      {friends.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No friends yet. Share your link to start earning!
        </p>
      )}

      {friends.map((f) => renderFriend(f))}
    </div>
  );
}