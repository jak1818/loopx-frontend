"use client";

import React, { useState } from "react";
import { useAppData } from "@/providers/AppDataProvider";

type Props = {
  video: any;
  user_id: string;
  API_BASE: string;

  setVideos: React.Dispatch<
    React.SetStateAction<any[]>
  >;

  loadingRewardId: string | null;

  setLoadingRewardId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  
  onRewardSuccess: () => void;
};

function RewardCard({
  video,
  user_id,
  API_BASE,
  setVideos,
  loadingRewardId,
  setLoadingRewardId,
  onRewardSuccess,
}: Props) {

const { refreshAppData } = useAppData();

  return (
  <>
    <div
      className="
        h-[100dvh]
		w-full
        snap-start
        snap-always
        flex
        items-center
        justify-center
        bg-black
        text-white
      "
    >

      <div className="text-center">

        <div className="text-5xl mb-6">
          🎁
        </div>

        <div className="text-2xl font-bold mb-2">
          Earn LoopX
        </div>

        <div className="text-gray-400 mb-6">
          Watch short ad
          and earn rewards
        </div>

        <button
          onClick={async () => {

  setLoadingRewardId(video.id);

  try {

    const showAd =
      (window as any).show_10915445;
	  
    if (
      typeof window === "undefined" ||
      !showAd
    ) {

      alert("Ad not ready");

      setLoadingRewardId(null);
	  
      return;

    }

    const eventId =
      crypto.randomUUID();

    await fetch(
      `${API_BASE}/api/monetag/init`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          user_id,
          event_id: eventId,
		  ad_type: "rewarded",
        }),
      }
    );
	
	await showAd({
  ymid: eventId,
});

await refreshAppData();

onRewardSuccess();

setVideos(prev =>
  prev.filter(
    v =>
      !(
        v.type === "reward_card" &&
        v.id === video.id
      )
  )
);

  } catch (err) {

    console.error(
      "Reward ad error",
      err
    );

  } finally {

    setLoadingRewardId(null);

  }

}}
          className="
            bg-pink-500
            px-6
            py-3
            rounded-full
          "
        >
          {
            loadingRewardId === video.id
              ? "Loading Ad..."
              : "Watch Now"
          }
        </button>

      </div>

    </div>
	

	
	</>
  );
}

export default React.memo(
  RewardCard
);