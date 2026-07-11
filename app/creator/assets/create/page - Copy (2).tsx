"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAssetPage() {
  const router = useRouter();

  const [assetType, setAssetType] = useState("ai_image");
  const [tier, setTier] = useState("bronze");

  const [prompt, setPrompt] = useState("");

  const [showTierModal, setShowTierModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [generatedAsset, setGeneratedAsset] = useState(false);

  const [remainingRegenerates] = useState(3);

  const assetTypes = [
    { id: "ai_image", label: "AI Image" },
    { id: "ai_avatar", label: "AI Avatar" },
    { id: "ai_meme", label: "AI Meme" },
    { id: "ai_gift", label: "AI Gift" },
    { id: "video", label: "Existing Video" },
    { id: "music", label: "AI Music" },
  ];

  return (
    <>
      <div className="min-h-screen bg-black text-white p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-lg"
            >
              ←
            </button>

            <h1 className="text-xl font-bold">
              Create NFT
            </h1>

            <div className="w-6" />
          </div>

          {/* Asset Type */}
          <div className="bg-[#08162f] rounded-2xl p-4">
            <h2 className="font-semibold mb-4">
              Asset Type
            </h2>

            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full bg-[#14233f] rounded-xl p-3 outline-none"
            >
              {assetTypes.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* NFT Tier */}
          <div className="bg-[#08162f] rounded-2xl p-4">
            <h2 className="font-semibold mb-4">
              NFT Tier
            </h2>

            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full bg-[#14233f] rounded-xl p-3 outline-none"
            >
              <option value="bronze">
                Bronze • 💎500
              </option>

              <option value="silver">
                Silver • 💎2500
              </option>

              <option value="gold">
                Gold • 💎10000
              </option>

              <option value="legendary">
                Legendary • 💎25000
              </option>
            </select>

            <button
              onClick={() => setShowTierModal(true)}
              className="mt-3 text-yellow-400 text-sm"
            >
              ⓘ View Tier Examples
            </button>
          </div>

          {/* Prompt */}
          <div className="bg-[#08162f] rounded-2xl p-4 space-y-4">
            <h2 className="font-semibold">
              Prompt
            </h2>

            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your NFT asset..."
              className="w-full bg-[#14233f] rounded-xl p-3 outline-none resize-none"
            />

            <button className="w-full bg-[#1c2945] rounded-xl py-3 font-medium">
              ✨ AI Storyboard (Free)
            </button>

            <button
              onClick={() => setGeneratedAsset(true)}
              className="w-full bg-yellow-400 text-black rounded-xl py-3 font-bold"
            >
              Generate NFT Asset
            </button>
          </div>

          {/* Generated NFT */}
          {generatedAsset && (
            <div className="bg-[#08162f] rounded-2xl p-4 space-y-3">
              <h2 className="font-semibold">
                Generated NFT
              </h2>

              <button
                onClick={() => setShowPreviewModal(true)}
                className="w-full bg-[#14233f] rounded-xl py-3"
              >
                👁 Preview My NFT
              </button>

              <button className="w-full bg-[#14233f] rounded-xl py-3">
                <div>Regenerate</div>

                <div className="text-xs text-gray-400">
                  {remainingRegenerates} Free Remaining
                </div>
              </button>

              <button className="w-full bg-yellow-400 text-black rounded-xl py-3 font-bold">
                Mint NFT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tier Modal */}
      {showTierModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#08162f] rounded-2xl p-4 w-full max-w-md">

            <h2 className="font-bold mb-4">
              NFT Tier Examples
            </h2>

            <div className="space-y-4 text-sm">

              <div>
                <div className="font-semibold">
                  Bronze
                </div>
                <div className="text-gray-400">
                  Original Artwork (No Frame)
                </div>
              </div>

              <div>
                <div className="font-semibold">
                  Silver
                </div>
                <div className="text-gray-400">
                  Silver Frame
                </div>
              </div>

              <div>
                <div className="font-semibold">
                  Gold
                </div>
                <div className="text-gray-400">
                  Gold Frame
                </div>
              </div>

              <div>
                <div className="font-semibold">
                  Legendary
                </div>
                <div className="text-gray-400">
                  Animated Legendary Frame 👑
                </div>
              </div>

            </div>

            <button
              onClick={() => setShowTierModal(false)}
              className="mt-4 w-full bg-yellow-400 text-black rounded-xl py-3 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#08162f] rounded-2xl p-4 w-full max-w-md">

            <div className="h-64 bg-[#14233f] rounded-xl flex items-center justify-center text-gray-400">
              NFT Preview
            </div>

            <button
              onClick={() => setShowPreviewModal(false)}
              className="mt-4 w-full bg-yellow-400 text-black rounded-xl py-3 font-bold"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </>
  );
}