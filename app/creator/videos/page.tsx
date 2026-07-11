"use client";

import { useRouter } from "next/navigation";

import { useAppData } from "@/providers/AppDataProvider";

export default function CreatorVideosPage() {

  const router = useRouter();

  const { dashboard } = useAppData();

  if (!dashboard) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );

  }

  const { videos } = dashboard;

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
          Video Analytics
        </h1>

      </div>

      {/* Summary */}

      <div className="bg-gradient-to-br from-[#0f172a] to-[#111827] rounded-3xl p-4 mb-5">

        <p className="text-sm text-white/70 mb-2">
          Total Videos
        </p>

        <h2 className="text-4xl font-bold mb-3">

          {videos.length}

        </h2>

        <p className="text-xs text-white/60">
          Published Content
        </p>

      </div>

      {/* Videos List */}

      <div className="space-y-4">

        {
          videos.map((v: any) => {

            const engagement =
              (v.likes || 0) +
              (v.comments || 0) +
              (v.shares || 0);

            return (

              <div
                key={v.id}
                className="bg-gray-900 rounded-3xl p-3"
              >

                <div className="flex gap-3">

                  {/* Video */}

                  <video
                    src={v.video_url}
                    className="w-24 h-32 object-cover rounded-2xl"
                    muted
                  />

                  {/* Info */}

                  <div className="flex-1">

                    <p className="text-sm text-gray-300 line-clamp-2 mb-3">

                      {v.caption || "No caption"}

                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">

                      <div>

                        <p className="text-lg font-bold">

                          {
                            Number(
                              v.total_views || 0
                            ).toLocaleString()
                          }

                        </p>

                        <p className="text-gray-400">
                          Views
                        </p>

                      </div>

                      <div>

                        <p className="text-lg font-bold">

                          {
                            Number(
                              v.impressions || 0
                            ).toLocaleString()
                          }

                        </p>

                        <p className="text-gray-400">
                          Impressions
                        </p>

                      </div>

                      <div>

                        <p className="text-lg font-bold">

                          {engagement}

                        </p>

                        <p className="text-gray-400">
                          Engagement
                        </p>

                      </div>

                      <div>

                        <p className="text-lg font-bold">

                          {
                            Number(
                              v.follows_generated || 0
                            ).toLocaleString()
                          }

                        </p>

                        <p className="text-gray-400">
                          Followers
                        </p>

                      </div>

                    </div>

                    {/* Completion */}

                    <div className="mt-4">

                      <div className="flex items-center justify-between mb-1">

                        <p className="text-xs text-gray-400">
                          Completion Rate
                        </p>

                        <p className="text-xs text-white">

                          {
                            Number(
                              v.avg_completion_rate || 0
                            ).toFixed(1)
                          }%

                        </p>

                      </div>

                      <div className="w-full bg-gray-800 rounded-full h-2">

                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              Number(
                                v.avg_completion_rate || 0
                              ) * 100
                            }%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            );

          })
        }

      </div>

    </div>

  );

}