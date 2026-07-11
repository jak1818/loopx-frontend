"use client";

import { useAppData } from "@/providers/AppDataProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { dashboard } = useAppData();

  if (!dashboard || !dashboard.user) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const {
    user,
    total_views,
	total_impressions,
    followers_gained,
    avg_completion_rate,
    avg_watch_seconds,
    total_likes,
    total_comments,
    total_shares,
    total_bookmarks,
    followers,
    diamond_balance,
    usdt_balance,
    today_earnings,
	today_ad_revenue,
    today_views,
    videos,
  } = dashboard;

const [adsEnabled, setAdsEnabled] =
  useState(
    user.ads_enabled
  );
  
  const [
  analytics,
  setAnalytics,
] = useState<any>(null);

const fetchAnalytics =
  async () => {

    try {

      const res =
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/creator/analytics?user_id=${user.id}`
        );

      const data =
        await res.json();

      if (data.success) {

        setAnalytics(
          data.data
        );

      }

    } catch (err) {

      console.error(err);

    }

  };

useEffect(() => {

  if (user?.id) {

    fetchAnalytics();

  }

}, [user?.id]);

useEffect(() => {

  setAdsEnabled(
    user.ads_enabled
  );

}, [user.ads_enabled]);

const saveMonetizationSettings =
  async () => {

    try {

      await fetch(
        `${process.env
          .NEXT_PUBLIC_API_BASE}/api/creator/monetization`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            user_id: user.id,

            ads_enabled:
              adsEnabled,


          }),
        }
      );

      alert(
        "Monetization settings updated"
      );

    } catch (err) {

      console.error(err);

      alert(
        "Failed to update settings"
      );

    }

  };
  
  return (
    <div className="min-h-screen bg-black text-white max-w-[430px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <h1 className="text-xl font-bold">LoopX Studio</h1>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src={user.avatar_url || "https://i.pravatar.cc/80"}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <p className="font-semibold">@{user.username}</p>
          <p className="text-sm text-gray-400">Level {user.level}</p>
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-2xl font-bold">{Number(total_views || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400">Total Views</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-2xl font-bold">{followers || 0}</p>
          <p className="text-xs text-gray-400">Followers</p>
        </div>
<div className="bg-gray-900 rounded-xl p-4">
  <p className="text-2xl font-bold">
    {Number(
  total_impressions || 0
).toLocaleString()}
  </p>
  <p className="text-xs text-gray-400">
    Impressions
  </p>
</div>

<div className="bg-gray-900 rounded-xl p-4">
  <p className="text-2xl font-bold">
    {followers_gained}
  </p>
  <p className="text-xs text-gray-400">
    Followers Gained
  </p>
</div>
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-2xl font-bold">{today_views}</p>
          <p className="text-xs text-gray-400">Views Today</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-2xl font-bold">${ Number(today_earnings || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-400">Gift Revenue Today</p>
        </div>
		<div className="bg-gray-900 rounded-xl p-4">
  <p className="text-2xl font-bold">
    $
    {
  Number(
    today_ad_revenue || 0
  ).toFixed(2)
}
  </p>

  <p className="text-xs text-gray-400">
    Ad Revenue Today
  </p>
</div>
      </div>

      {/* Engagement overview */}
      <div className="bg-gray-900 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3">Engagement</h3>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <p className="text-lg font-bold">{total_likes}</p>
            <p className="text-gray-400">Likes</p>
          </div>
          <div>
            <p className="text-lg font-bold">{total_comments}</p>
            <p className="text-gray-400">Comments</p>
          </div>
          <div>
            <p className="text-lg font-bold">{total_shares}</p>
            <p className="text-gray-400">Shares</p>
          </div>
          <div>
            <p className="text-lg font-bold">{total_bookmarks}</p>
            <p className="text-gray-400">Saves</p>
          </div>
        </div>
      </div>

      {/* Watch quality */}
      <div className="bg-gray-900 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3">Watch Quality</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-lg font-bold">{avg_completion_rate}%</p>
            <p className="text-gray-400">Avg. Completion</p>
          </div>
          <div>
            <p className="text-lg font-bold">{avg_watch_seconds}s</p>
            <p className="text-gray-400">Avg. Watch Time</p>
          </div>
        </div>
      </div>
	  
	  {/* Monetization */}

<div className="bg-gray-900 rounded-xl p-4 mb-6">

  <h3 className="text-sm font-semibold mb-4">
    Monetization
  </h3>

  <div className="flex items-center justify-between mb-4">

    <p className="text-sm">
      Ads Enabled
    </p>

    <button
      onClick={() =>
        setAdsEnabled(
          !adsEnabled
        )
      }
      className={`px-4 py-2 rounded-full text-sm font-semibold ${
        adsEnabled
          ? "bg-green-500 text-black"
          : "bg-gray-700 text-white"
      }`}
    >
      {adsEnabled
        ? "ON"
        : "OFF"}
    </button>

  </div>

  <button
    onClick={
      saveMonetizationSettings
    }
    className="w-full bg-white text-black py-3 rounded-xl font-semibold"
  >
    Save Settings
  </button>

</div>

{/* Revenue Analytics */}

<div className="bg-gray-900 rounded-xl p-4 mb-6">

  <h3 className="text-sm font-semibold mb-4">
    Revenue Analytics
  </h3>

  <div className="grid grid-cols-2 gap-3">

    {/* Ad Revenue Today */}

    <div className="bg-black rounded-xl p-3">

      <p className="text-lg font-bold text-green-400">
        $
        {
  Number(
    today_ad_revenue || 0
  ).toFixed(4)
}
      </p>

      <p className="text-xs text-gray-400">
        Today Revenue
      </p>

    </div>

    {/* eCPM */}

    <div className="bg-black rounded-xl p-3">

      <p className="text-lg font-bold text-yellow-400">
        $
{
analytics?.today?.ecpm
  ? analytics.today.ecpm.toFixed(2)
  : "..."
}
      </p>

      <p className="text-xs text-gray-400">
        Estimated eCPM
      </p>

    </div>

    {/* Impressions */}

    <div className="bg-black rounded-xl p-3">

      <p className="text-lg font-bold text-blue-400">
        {
  Number(
    total_impressions || 0
  ).toLocaleString()
}
      </p>

      <p className="text-xs text-gray-400">
        Total Impressions
      </p>

    </div>

    {/* Ads Status */}

    <div className="bg-black rounded-xl p-3">

      <p className="text-lg font-bold text-pink-400">
        {adsEnabled
          ? "Enabled"
          : "Disabled"}
      </p>

      <p className="text-xs text-gray-400">
        Monetization
      </p>

    </div>

  </div>

</div>

          {/* Balance quick info */}
         <div className="bg-gray-900 rounded-xl p-4 mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm font-bold">💎 {diamond_balance}</p>
          <p className="text-xs text-gray-400">Diamond</p>
        </div>
        <div>
          <p className="text-sm font-bold">💵 {parseFloat(usdt_balance).toFixed(2)}</p>
          <p className="text-xs text-gray-400">USDT</p>
        </div>
      </div>

      {/* Videos list */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Recent Videos</h3>
        <div className="space-y-3">
          {videos.map((v: any) => (
            <div
              key={v.id}
              className="flex gap-3 bg-gray-900 rounded-xl p-2 cursor-pointer"
              onClick={() => router.push(`/feed?start=${v.id}`)}
            >
              <video
                src={v.video_url}
                className="w-16 h-24 object-cover rounded"
                muted
              />
              <div className="flex-1">
                <p className="text-xs text-gray-400 line-clamp-2">{v.caption || "No caption"}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                  <span>👁 {v.total_views}</span>
                  <span>❤️ {v.likes}</span>
                  <span>💬 {v.comments}</span>
				  <span>📢 {v.impressions}</span>
                  <span>👥 {v.follows_generated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}