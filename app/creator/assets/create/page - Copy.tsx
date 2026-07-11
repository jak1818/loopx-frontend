"use client";

import { useState } from "react";

export default function CreateAssetPage() {
const [assetType, setAssetType] = useState("ai_image");
const [tier, setTier] = useState("bronze");

const assetTypes = [
  { id: "ai_image", label: "AI Image" },
  { id: "ai_avatar", label: "AI Avatar" },
  { id: "ai_meme", label: "AI Meme" },
  { id: "ai_gift", label: "AI Gift" },
  { id: "video", label: "Existing Video" },
  { id: "music", label: "AI Music" },
];

const tiers = [
{
id: "bronze",
name: "Bronze",
price: 500,
},
{
id: "silver",
name: "Silver",
price: 2500,
},
{
id: "gold",
name: "Gold",
price: 10000,
},
{
id: "legendary",
name: "Legendary",
price: 25000,
},
];

return ( <div className="min-h-screen bg-black text-white p-4 pb-24"> <div className="max-w-2xl mx-auto space-y-5">

    <div className="flex justify-between items-center">
  <button className="text-lg">←</button>

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
  className="w-full bg-[#14233f] rounded-xl p-3"
>
  {assetTypes.map((item) => (
    <option key={item.id} value={item.id}>
      {item.label}
    </option>
  ))}
</select>
    </div>

    {/* Dynamic Form */}

    <div className="bg-[#08162f] rounded-2xl p-4 space-y-4">

      {(assetType !== "video" &&
        assetType !== "music") && (
        <>
          <button className="bg-[#1c2945] rounded-xl px-4 py-2">
            🖼 Reference Image (optional)
          </button>

          <textarea
            rows={5}
            placeholder="Describe your NFT asset..."
            className="w-full bg-[#14233f] rounded-xl p-3"
          />

          <button className="w-full bg-yellow-400 text-black rounded-xl py-3 font-bold">
            Generate Asset
          </button>
        </>
      )}

      {assetType === "music" && (
        <>
          <textarea
            rows={5}
            placeholder="Describe your music..."
            className="w-full bg-[#14233f] rounded-xl p-3"
          />

          <button className="w-full bg-yellow-400 text-black rounded-xl py-3 font-bold">
            Generate Music
          </button>
        </>
      )}

      {assetType === "video" && (
        <>
          <select className="w-full bg-[#14233f] rounded-xl p-3">
            <option>Select My Video</option>
          </select>
        </>
      )}
    </div>

   {/* NFT Tier */}

{assetType !== "video" &&
 assetType !== "music" && (

<div className="bg-[#08162f] rounded-2xl p-4">
  <h2 className="font-semibold mb-4">
    NFT Tier
  </h2>

  <select
    value={tier}
    onChange={(e) => setTier(e.target.value)}
    className="w-full bg-[#14233f] rounded-xl p-3"
  >
    <option value="bronze">Bronze</option>
    <option value="silver">Silver</option>
    <option value="gold">Gold</option>
    <option value="legendary">Legendary</option>
  </select>

  <p className="text-sm text-gray-400 mt-3">
    Mint Cost:
    {
      tier === "bronze"
        ? " 💎 500"
        : tier === "silver"
        ? " 💎 2500"
        : tier === "gold"
        ? " 💎 10000"
        : " 💎 25000"
    }
  </p>

  <p className="text-sm text-gray-400">
    Recycle Value:
    {
      tier === "bronze"
        ? " 💎 350"
        : tier === "silver"
        ? " 💎 1750"
        : tier === "gold"
        ? " 💎 7000"
        : " 💎 17500"
    }
  </p>
</div>

)}

    {/* Preview */}

    <div className="bg-[#08162f] rounded-2xl p-4">
      <h2 className="font-semibold mb-3">
        Preview
      </h2>

   <div className="h-64 bg-[#14233f] rounded-xl flex items-center justify-center text-gray-400">
  Generated Asset Preview
</div>
    </div>

    {/* Mint */}

    <button
      disabled
      className="w-full bg-gray-700 rounded-xl py-4 font-bold opacity-50"
    >
      Mint NFT
    </button>

  </div>
</div>


);
}
