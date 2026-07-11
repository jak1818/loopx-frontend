"use client";

import { useAppData } from "@/providers/AppDataProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const formatNumber = (
  value: number
) => {

  if (value >= 1000000000) {
    return (
      value / 1000000000
    ).toFixed(1) + "B";
  }

  if (value >= 1000000) {
    return (
      value / 1000000
    ).toFixed(1) + "M";
  }

  if (value >= 1000) {
    return (
      value / 1000
    ).toFixed(1) + "K";
  }

  return value.toString();
};

export default function CreatorDashboardPage() {
  const router = useRouter();
  const {
  dashboard,
  analytics,
} = useAppData();

  if (
  !dashboard ||
  !dashboard.user ||
  !analytics
) {
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
  

useEffect(() => {

  setAdsEnabled(
    user.ads_enabled
  );

}, [user.ads_enabled]);

const saveMonetizationSettings =
  async () => {
 alert(process.env.NEXT_PUBLIC_API_URL);
    try {

      const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/creator/monetization`,
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      user_id: user.id,
      ads_enabled: adsEnabled,
    }),
  }
);

const data = await res.json();

alert(JSON.stringify(data));

    } catch (err) {

      console.error(err);

   alert(
  err instanceof Error
    ? err.message
    : String(err)
);

    }

  };
  
  return (
    <div
  className="
    h-full
    overflow-y-auto
    bg-black
    text-white
    max-w-[430px]
    mx-auto
    px-4
    py-6
    pb-10
  "
  style={{
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <h1 className="text-xl font-bold">LoopX Studio</h1>
      </div>


{/* Hero Revenue Card */}

<div className="bg-gradient-to-br from-[#0f172a] to-[#111827] rounded-3xl p-2 mb-3">
<div className="flex items-center justify-between mb-2">
  <p className="text-sm text-white/80">
    Total Revenue
  </p>
  
  <button
    onClick={() =>
      router.push(
        "/creator/revenue"
      )
    }
    className="text-xs text-blue-400"
  >
    View More →
  </button>
</div>

  <h2 className="text-3xl font-bold mb-2">
    $
    {
     Number(
  (
    Number(
      analytics?.last30days?.revenue || 0
    ) +

    Number(
      today_earnings || 0
    )
  )
).toFixed(2)
    }
  </h2>

  <div className="flex items-end justify-between mt-3">

    <div>

      <p className="text-xs text-white/70">
        Last 30 Days
      </p>

    </div>

    <div className="text-right">

      <p className="text-base font-bold">

        {
          analytics?.growth
            ?.revenue_growth
            ?.toFixed(1) || "0"
        }%

      </p>

      <p className="text-xs text-white/70">
        Revenue Growth
      </p>

    </div>

  </div>

</div>

{/* Creator Analytics */}

<div className="bg-gray-900 rounded-3xl p-4 mb-3">

  <h3 className="font-semibold mb-4">
    Creator Analytics
  </h3>

  <div className="grid grid-cols-4 gap-3 text-center">

    <div>
      <p className="text-lg font-bold">
        {
           formatNumber(
				total_views || 0
			)
        }
      </p>

      <p className="text-[11px] text-gray-400">
        Post Views
      </p>
    </div>

    <div>
      <p className="text-lg font-bold">
       {
  formatNumber(
    followers || 0
  )
}
      </p>

      <p className="text-[11px] text-gray-400">
        Followers
      </p>
    </div>

    <div>
      <p className="text-lg font-bold">
        {
          formatNumber(
			dashboard.total_profile_visits || 0
			)
        }
      </p>

      <p className="text-[11px] text-gray-400">
        Profile Views
      </p>
    </div>

    <div>
      <p className="text-lg font-bold">
        {
           formatNumber(
			dashboard.total_shares || 0
			)
        }
      </p>

      <p className="text-[11px] text-gray-400">
        Shares
      </p>
    </div>

  </div>

</div>

 {/* Performance */}

<div className="bg-gray-900 rounded-3xl p-4 mb-3">

  <h3 className="font-semibold mb-4">
    Performance
  </h3>

  <div className="grid grid-cols-4 gap-3 text-center">

    <div>

      <p className="text-2lg font-bold">
        {avg_completion_rate}%
      </p>

      <p className="text-[11px] text-gray-400">
        Avg Completion
      </p>

    </div>

    <div>

      <p className="text-2lg font-bold">
        {avg_watch_seconds}s
      </p>

      <p className="text-[11px] text-gray-400">
        Avg Watch Time
      </p>

    </div>

    <div>

      <p className="text-2lg font-bold">
        {total_likes}
      </p>

      <p className="text-[11px] text-gray-400">
        Likes
      </p>

    </div>

    <div>

      <p className="text-2lg font-bold">
        {total_comments}
      </p>

      <p className="text-[11px] text-gray-400">
        Comments
      </p>

    </div>

  </div>

</div>

{/* NFT Studio */}

<div className="bg-gray-900 rounded-3xl p-4 mb-6">

  <div className="flex items-center justify-between mb-4">

    <h3 className="font-semibold">
      NFT Studio
    </h3>

    <button
      onClick={() =>
        router.push(
          "/creator/assets/create"
        )
      }
      className="
        bg-pink-500
        px-4
        py-2
        rounded-full
        text-sm
        font-semibold
      "
    >
      + Create Asset
    </button>

  </div>

  <button
    onClick={() =>
      router.push(
        "/creator/assets"
      )
    }
    className="
      w-full
      bg-gray-800
      py-3
      rounded-xl
      font-semibold
    "
  >
      Manage NFTs →
  </button>

</div>
	  
	  {/* Monetization */}

<div className="bg-gray-900 rounded-2xl p-3 mb-4">

  <h3 className="text-sm font-semibold mb-4">
    Monetization
  </h3>

  <div className="flex items-center justify-between mb-3">

    <p className="text-sm">
      Ads Enabled
    </p>

    <button
      onClick={() =>
        setAdsEnabled(
          !adsEnabled
        )
      }
      className={`px-4 py-2.5 rounded-full text-sm font-semibold ${
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
  
  <div className="grid grid-cols-2 gap-3 mt-4">

  <button
    onClick={() =>
      router.push(
        "/creator/analytics"
      )
    }
    className="bg-gray-800 py-2.5 rounded-xl font-semibold"
  >
    Analytics
  </button>

  <button
    onClick={() =>
      router.push(
        "/creator/videos"
      )
    }
    className="bg-gray-800 py-3 rounded-xl font-semibold"
  >
    Videos
  </button>

</div>

</div>

    </div>
  );
}