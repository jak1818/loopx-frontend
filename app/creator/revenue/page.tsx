"use client";

import { useRouter } from "next/navigation";

import { useAppData } from "@/providers/AppDataProvider";

export default function CreatorRevenuePage() {

  const router = useRouter();

  const {
    analytics,
    dashboard,
  } = useAppData();

  if (
    !analytics ||
    !dashboard
  ) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );

  }

  const totalRevenue =
    Number(
      analytics?.last30days?.revenue || 0
    ) +
    Number(
      dashboard?.today_earnings || 0
    );

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
    pb-8
  "
  style={{
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
>

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <button
          onClick={() => router.back()}
          className="text-lg"
        >
          ←
        </button>

        <h1 className="text-xl font-bold">
          Revenue Details
        </h1>

      </div>

      {/* Total Revenue */}

      <div className="bg-gradient-to-br from-[#0f172a] to-[#111827] rounded-3xl p-5 mb-5">

        <p className="text-sm text-white/70 mb-2">
          Total Revenue
        </p>

        <h2 className="text-4xl font-bold">

          $
          {
            totalRevenue.toFixed(2)
          }

        </h2>

        <p className="text-xs text-white/60 mt-3">
          Withdrawable creator earnings
        </p>

      </div>

      {/* Revenue Sources */}

      <div className="bg-gray-900 rounded-3xl p-4 mb-5">

        <h3 className="font-semibold mb-5">
          Revenue Sources
        </h3>

        <div className="space-y-4">

          {/* Ads */}

          <div className="flex items-center justify-between">

            <div>

              <p className="font-medium">
                Ads Revenue
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Monetag earnings
              </p>

            </div>

            <p className="font-bold text-green-400">

              $
              {
                Number(
                  analytics?.last30days?.revenue || 0
                ).toFixed(2)
              }

            </p>

          </div>

          {/* Gifts */}

          <div className="flex items-center justify-between">

            <div>

              <p className="font-medium">
                Gift Revenue
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Creator gifts
              </p>

            </div>

            <p className="font-bold text-pink-400">

              $
              {
                Number(
                  dashboard?.today_earnings || 0
                ).toFixed(2)
              }

            </p>

          </div>

        </div>

      </div>

      {/* NFT Gifts */}

      <div className="bg-gray-900 rounded-3xl p-4 mb-5">

        <h3 className="font-semibold mb-4">
          NFT Gifts
        </h3>

        <div className="space-y-3">

          <div className="flex items-center justify-between">

            <div>

              <p className="font-medium">
                NFT Assets Received
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Not withdrawable yet
              </p>

            </div>

            <p className="font-bold">
              0
            </p>

          </div>

          <div className="flex items-center justify-between">

            <div>

              <p className="font-medium">
                Marketplace Sales
              </p>

              <p className="text-xs text-gray-400 mt-1">
                NFT sold revenue
              </p>

            </div>

            <p className="font-bold text-green-400">
              $0.00
            </p>

          </div>

        </div>

      </div>

      {/* LoopX Gifts */}

      <div className="bg-gray-900 rounded-3xl p-4">

        <h3 className="font-semibold mb-4">
          LoopX Gifts
        </h3>

        <div className="flex items-center justify-between">

          <div>

            <p className="font-medium">
              LoopX Points
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Future ecosystem rewards
            </p>

          </div>

          <p className="font-bold text-yellow-400">
            0
          </p>

        </div>

      </div>

    </div>

  );

}