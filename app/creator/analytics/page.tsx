"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAppData } from "@/providers/AppDataProvider";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from "recharts";

export default function CreatorAnalyticsPage() {

  const router = useRouter();

  const { dashboard } = useAppData();

  const [analytics, setAnalytics] =
    useState<any>(null);

  const [range, setRange] =
    useState<"7d" | "30d">("7d");

  useEffect(() => {

    if (!dashboard?.user?.id) {
      return;
    }

    fetchAnalytics();

  }, [dashboard?.user?.id]);

  const fetchAnalytics =
    async () => {

      try {

        const res =
          await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creator/analytics?user_id=${dashboard.user.id}`
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

  if (!dashboard || !analytics) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );

  }

  const chartData =
    range === "7d"
      ? analytics.revenue_history
      : analytics.revenue_history_30d;

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

        <h1 className="text-lg font-bold">
          Revenue Analytics
        </h1>

      </div>

      {/* Revenue Summary */}

      <div className="bg-gradient-to-br from-[#0f172a] to-[#111827] rounded-3xl p-4 mb-5">

        <p className="text-sm text-white/70 mb-2">
          Estimated Revenue
        </p>

        <h2 className="text-4xl font-bold mb-3">

          $
          {
            Number(
              analytics.last30days
                ?.revenue || 0
            ).toFixed(2)
          }

        </h2>

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs text-white/60">
              Last 30 Days
            </p>

          </div>

          <div className="text-right">

            <p className="text-lg font-bold text-green-400">

              +
              {
                analytics.growth
                  ?.revenue_growth
                  ?.toFixed(1) || "0"
              }%

            </p>

            <p className="text-xs text-white/60">
              Growth
            </p>

          </div>

        </div>

      </div>

      {/* Toggle */}

      <div className="flex gap-2 mb-4">

        <button
          onClick={() =>
            setRange("7d")
          }
          className={`flex-1 py-2 rounded-xl text-sm font-semibold ${
            range === "7d"
              ? "bg-white text-black"
              : "bg-gray-900 text-white"
          }`}
        >
          7 Days
        </button>

        <button
          onClick={() =>
            setRange("30d")
          }
          className={`flex-1 py-2 rounded-xl text-sm font-semibold ${
            range === "30d"
              ? "bg-white text-black"
              : "bg-gray-900 text-white"
          }`}
        >
          30 Days
        </button>

      </div>

      {/* Revenue Chart */}

      <div className="bg-gray-900 rounded-3xl p-4 mb-5">

        <div className="h-56">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={chartData}
            >

              <XAxis
                dataKey="report_date"
                tickFormatter={(value) => {

                  const d =
                    new Date(value);

                  return `${
                    d.getMonth() + 1
                  }/${
                    d.getDate()
                  }`;

                }}
                stroke="#888"
                fontSize={10}
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={3}
                dot={false}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Main Analytics */}

      <div className="grid grid-cols-2 gap-3 mb-5">

        <div className="bg-gray-900 rounded-2xl p-4">

          <p className="text-2xl font-bold">
            {
              Number(
                analytics.last30days
                  ?.impressions || 0
              ).toLocaleString()
            }
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Impressions
          </p>

        </div>

        <div className="bg-gray-900 rounded-2xl p-4">

          <p className="text-2xl font-bold text-yellow-400">

            $
            {
              analytics.today?.ecpm
                ?.toFixed(2) || "0.00"
            }

          </p>

          <p className="text-xs text-gray-400 mt-1">
            eCPM
          </p>

        </div>

      </div>

      {/* Top Countries */}

      <div className="bg-gray-900 rounded-3xl p-4">

        <h3 className="font-semibold mb-4">
          Top Countries
        </h3>

        <div className="space-y-3">

          {
            analytics.top_countries
              ?.map(
                (
                  country: any,
                  index: number
                ) => (

                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-800 pb-3"
                  >

                    <div>

                      <p className="font-semibold">
                        {country.country}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">

                        {
                          Number(
                            country.impressions || 0
                          ).toLocaleString()
                        }

                        {" "}
                        impressions

                      </p>

                    </div>

                    <div className="text-right">

                      <p className="font-bold text-green-400">

                        $
                        {
                          Number(
                            country.revenue || 0
                          ).toFixed(2)
                        }

                      </p>

                      <p className="text-xs text-gray-400 mt-1">

                        eCPM $

                        {
                          Number(
                            country.ecpm || 0
                          ).toFixed(2)
                        }

                      </p>

                    </div>

                  </div>

                )
              )
          }

        </div>

      </div>

    </div>

  );

}