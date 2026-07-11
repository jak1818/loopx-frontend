"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/providers/AppDataProvider";

export default function CreateAssetPage() {
  const router = useRouter();

  const [assetType, setAssetType] = useState("ai_image");
  const [tier, setTier] = useState("bronze");
  const [prompt, setPrompt] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [showTierModal, setShowTierModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);
  const [showReferencePreview, setShowReferencePreview] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState(false);
  const [remainingRegenerates] = useState(3);
  const [hasPaidForGeneration, setHasPaidForGeneration] = useState(false);
  const { user, balance } = useAppData();
  const userId = user?.id;
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedVideoData, setSelectedVideoData] = useState<any>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  
  const [nftTitle, setNftTitle] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  
  const [mintRequestId, setMintRequestId] = useState("");
  const [mintStatus, setMintStatus] = useState("");
  const [showMintModal, setShowMintModal] = useState(false);
  const [generatedImageUrl,setGeneratedImageUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const draftItem = historyItems.find(item =>!item.is_minted && item.asset_type === assetType);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [freeRemaining, setFreeRemaining] = useState(0);
  const [freeLimit, setFreeLimit] = useState(0);
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {

  if (
    historyItems[historyIndex]
  ) {

    setSelectedSessionId(
      historyItems[historyIndex].id
    );

  }

}, [
  historyIndex,
  historyItems
]);

useEffect(() => {

  if (!user?.id) return;

  loadHistory();

}, [user?.id]);

useEffect(() => {

  if (!user?.id) return;

  loadHistory();

}, [
  assetType
]);

useEffect(() => {

  const draft =
    historyItems.find(
      (item) =>
        !item.is_minted &&
        item.asset_type === assetType
    );

  if (!draft) return;

  setGeneratedAsset(true);

  setGeneratedImageUrl(
    draft.generated_image_url
  );

  setSelectedSessionId(
    draft.id
  );
  
   setCurrentDraftId(
    draft.draft_id
  );

  setPrompt(
    draft.prompt || ""
  );
  
  setNftTitle(
  draft.nft_title || ""
);

setNftDescription(
  draft.nft_description || ""
);

}, [
  historyItems,
  assetType,
]);


 const handleThumbnailUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file = e.target.files?.[0];

  if (!file) return;

  setThumbnailFile(file);

  const previewUrl =
    URL.createObjectURL(file);

  setThumbnailPreview(previewUrl);

  try {

    const formData =
      new FormData();

    formData.append(
      "thumbnail",
      file
    );

    const res = await fetch(
      `${API_BASE}/api/upload/nft-thumbnail`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data =
      await res.json();

    if (data.success) {

      setThumbnailUrl(
        data.url
      );

      console.log(
        "NFT Thumbnail Uploaded:",
        data.url
      );

    }

  } catch (err) {

    console.error(
      "Thumbnail Upload Error",
      err
    );

  }

};
  
  useEffect(() => {
  if (assetType !== "video" || !userId) return;
  const fetchVideos = async () => {
    setVideoLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/user/profile-full/${userId}?viewer_id=${userId}`
      );
      const data = await res.json();
      if (data.success) {
        setUserVideos(data.videos || []);
      }
    } catch (err) {
      console.error("Failed to load user videos", err);
    } finally {
      setVideoLoading(false);
    }
  };
  fetchVideos();
}, [assetType, userId]);

useEffect(() => {

  if (!mintRequestId) return;

  const interval = setInterval(async () => {

    try {

      const res = await fetch(
        `${API_BASE}/api/nft/status/${mintRequestId}`
      );

      const data = await res.json();

      if (!data.success) return;

      const status =
        data.data.mint_status;

      setMintStatus(status);

      if (status === "minted") {

        await loadHistory();
		
		setHistoryItems([]);
		
        setHistoryIndex(0);
		
		setSelectedSessionId("");

        setGeneratedImageUrl("");  

        setCurrentDraftId(null);

        setPrompt("");

        setNftTitle("");

        setNftDescription("");

        setReferencePreview("");

        setReferenceFile(null);
		
		setReferenceUrl("");

        setGeneratedAsset(false);		

        setShowPreviewModal(false);

      }

      if (
        status === "minted" ||
        status === "failed"
      ) {
        clearInterval(interval);
      }

    } catch (err) {
      console.error(err);
    }

  }, 3000);

  return () => clearInterval(interval);

}, [mintRequestId]);

  // 费用映射
  const tierCosts: Record<string, number> = {
    bronze: 500,
    silver: 2500,
    gold: 10000,
    legendary: 25000,
  };
  const videoCost = 500;
  const musicCost = 500;
  
  const currentMintCost =
  assetType === "video"
    ? videoCost
    : assetType === "music"
    ? musicCost
    : tierCosts[tier] || 0;

const hasEnoughDiamonds =
  Number(
    balance?.diamond_balance || 0
  ) >= currentMintCost;

  // 当前资产生成费用（仅 AI 生成类有效）
  const currentGenerationCost =
    assetType === "music"
      ? musicCost
      : tierCosts[tier] ?? 0;
	  
  const isAIImageType =
		assetType === "ai_image" ||
		assetType === "ai_avatar" ||
		assetType === "ai_meme" ||
		assetType === "ai_gift";

  const assetTypes = [
    { id: "ai_image", label: "AI Image" },
    { id: "ai_avatar", label: "AI Avatar" },
    { id: "ai_meme", label: "AI Meme" },
    { id: "ai_gift", label: "AI Gift" },
    { id: "video", label: "Existing Video" },
    { id: "music", label: "AI Music" },
  ];
  
  const handleAIStoryboard = async () => {

  if (!prompt.trim()) {
    alert("Please enter a prompt");
    return;
  }

  try {

    setOptimizing(true);

    const res = await fetch(
      `${API_BASE}/api/ai/optimize-image-prompt`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          prompt,
          user_id: user?.id,
          type: "image",
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      alert(data.error || "Failed");
      return;
    }

    // 🔥 直接覆盖 Prompt

    setPrompt(
      data.optimized_prompt ||
      data.prompt ||
      prompt
    );

  } catch (err) {

    console.error(err);

    alert("Storyboard failed");

  } finally {

    setOptimizing(false);

  }
};

  // 处理生成（AI 图像/头像/表情/礼物 或 音乐）
const handleGenerate = async () => {
  const activeDraftId =
  historyItems.length > 0
    ? currentDraftId
    : null;
	
  if (!prompt.trim()) {
    alert("Please enter a prompt");
    return;
  }

setIsGenerating(true);

  try {

    const res = await fetch(
      `${API_BASE}/api/ai/generate-image`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          prompt,
          tier,
		  asset_type: assetType,
          user_id: user?.id,
		  reference_image_url:referenceUrl || null,
		  draft_id: activeDraftId,
		  nft_title: nftTitle,
          nft_description: nftDescription,
        }),
      }
    );

    const data =
      await res.json();

    if (!data.success) {
	  setIsGenerating(false);
		
      alert(
        data.error ||
        "Generation failed"
      );
      return;
    }

    setGeneratedImageUrl(
      data.image_url
    );
	
	setSessionId(
		data.session_id
		);
		
	if (data.draft_id) {

		setCurrentDraftId(
		data.draft_id
		);

	}
		
	setSelectedSessionId(
		data.session_id
		);

		console.log(
		"AI SESSION:",
		data.session_id
		);
		
    await loadHistory();
		
    setGeneratedAsset(true);
    setIsGenerating(false);
    setShowPreviewModal(true);
	

  } catch (err) {

    console.error(err);
    setIsGenerating(false);
    alert("Network error");

  }

};

// 统一 Mint 入口
const handleMint = async () => {
  if (!userId) {
    alert("User not loaded");
    return;
  }

  // 🔥 实时获取最新用户资料，拿到最新的 wallet_address
  let walletAddress = "";
  try {
    const profileRes = await fetch(`${API_BASE}/api/user/profile?user_id=${userId}&_t=${Date.now()}`);
    const profileData = await profileRes.json();
    if (profileData.success && profileData.data?.wallet_address) {
      walletAddress = profileData.data.wallet_address;
    } else {
      alert("Could not fetch wallet address. Please connect wallet in Balance page.");
      return;
    }
  } catch (err) {
    console.error(err);
    alert("Failed to fetch user profile");
    return;
  }

  if (!walletAddress) {
    alert("Please connect your TON wallet first (Balance → Connect).");
    return;
  }

  let assetId: string | undefined;
  if (assetType === "video") {
    assetId = selectedVideoData?.id;
    if (!assetId) {
      alert("Please select a video.");
      return;
    }
  } else if (
  assetType === "ai_image" ||
  assetType === "ai_avatar" ||
  assetType === "ai_meme" ||
  assetType === "ai_gift"
) {

  assetId = selectedSessionId;
  
  if (!selectedSessionId) {
    alert("Please generate artwork first.");
    return;
  }

} else {
    alert("Minting for this asset type is not available yet.");
    return;
  }

  const payload: Record<string, any> = {
    user_id: userId,
    asset_type: assetType,
    asset_id: assetId,
    wallet_address: walletAddress,
	
	nft_title: nftTitle,
    nft_description: nftDescription,
	
	thumbnail_url: thumbnailUrl,
  };
  if (assetType.startsWith("ai_")) {
    payload.tier = tier;
  }

  try {
    const res = await fetch(`${API_BASE}/api/nft/mint-asset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
       setMintRequestId(data.request_id);

	   setMintStatus("pending");

       setShowMintModal(true);

    } else {
      alert(data.error || "Mint failed");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
};

const loadHistory = async () => {

  if (!user?.id) return;
  
  const res = await fetch(
    `${API_BASE}/api/nft/ai/generation-history/${user.id}?asset_type=${assetType}`
  );

  const data = await res.json();

  if (data.success) {

    const items =
		data.items || [];
		
	if (items.length > 0) {

  const latestTier =
    items[0].tier;

  const limits = {
    bronze: 3,
    silver: 10,
    gold: 20,
    legendary: 99,
  };

  const limit =
    limits[latestTier] || 3;

  setFreeLimit(limit);

const latestItem =
  items[0];
  
  console.log(
  "LATEST ITEM",
  latestItem
);

items.forEach(item => {

  console.log(
    item.generated_count,
    item.is_minted,
    item.minted_collectible_id
  );

});

const regenerateCount =
  Math.max(
    0,
    (latestItem.generated_count || 1) - 1
  );

setFreeRemaining(
  Math.max(
    0,
    limit - regenerateCount
  )
);

}

		setHistoryItems(items);

  if (items.length > 0) {

		setSelectedSessionId(
			items[0].id
		);

		}
    setHistoryIndex(0);

  }

};
  

  return (
    <>
      <div
  className="
    h-full
    overflow-y-auto
    bg-black
    text-white
    p-4
    pb-40
  "
  style={{
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
>
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Header */}
          <div className="relative flex items-center mb-5">
           <button
  onClick={() => router.back()}
  className="
    absolute
    left-0
    text-white
    text-xl
  "
>
  ←
</button>
            <h1
  className="
    w-full
    text-center
    text-3xl
    font-bold
    text-white
  "
>
  Create NFT
</h1>
			
	<div
  className="
    absolute
    right-0
    bg-[#14233f]
    px-3
    py-2
    rounded-xl
    text-yellow-400
    font-bold
  "
>
  💎 {Number(
  balance?.diamond_balance || 0
).toLocaleString()}
</div>

            <div className="w-6" />
          </div>

          {/* Asset Type */}
          <div className="bg-[#08162f] rounded-2xl p-4">
            <h2 className="font-semibold mb-4">Asset Type</h2>
            <select
              value={assetType}
              onChange={(e) => {
                setAssetType(e.target.value);
                // 切换类型时重置生成/付费状态
                setGeneratedAsset(false);
                setHasPaidForGeneration(false);
                setPrompt("");
                setSelectedVideoId("");
				setCurrentDraftId(null);
				setSelectedSessionId("");
				setHistoryItems([]);
				setHistoryIndex(0);
              }}
              className="w-full bg-[#14233f] rounded-xl p-3 outline-none"
            >
              {assetTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Existing Video Section (only for video) */}
 {assetType === "video" && (
  <div className="bg-[#08162f] rounded-2xl p-4 space-y-4">
    <h2 className="font-semibold">Select My Video</h2>

    {videoLoading ? (
      <p className="text-gray-400 text-sm">Loading your videos...</p>
    ) : userVideos.length > 0 ? (
      <select
        value={selectedVideoId}
        onChange={(e) => {
          const vid = e.target.value;
          setSelectedVideoId(vid);
          const found = userVideos.find(v => v.id === vid);
          setSelectedVideoData(found || null);
        }}
        className="w-full bg-[#14233f] rounded-xl p-3 outline-none"
      >
        <option value="">-- Choose a video --</option>
        {userVideos.map((v, idx) => (
          <option key={v.id} value={v.id}>
            {v.caption || `Video ${idx + 1}`}
            {v.duration ? ` (${v.duration.toFixed(1)}s)` : ''}
          </option>
        ))}
      </select>
    ) : (
      <p className="text-gray-400 text-sm">You haven't uploaded any videos yet.</p>
    )}

    {selectedVideoData && (
      <div className="bg-black rounded-xl overflow-hidden h-48 w-full">
        <video
          src={selectedVideoData.video_url}
          className="w-full h-full object-contain"
          controls
          autoPlay
          muted
          playsInline
        />
      </div>
    )}
	
	<div className="space-y-2">

  <input
    value={nftTitle}
    onChange={(e) => setNftTitle(e.target.value)}
    placeholder="NFT Title"
    className="w-full bg-[#14233f] rounded-xl p-2"
  />

  <textarea
    value={nftDescription}
    onChange={(e) => setNftDescription(e.target.value)}
    placeholder="NFT Description"
    rows={3}
    className="w-full bg-[#14233f] rounded-xl p-2"
  />

</div>

<label
  htmlFor="thumbnail-upload"
  className="
    bg-[#14233f]
    rounded-xl
    p-2
    text-center
    cursor-pointer
    block
  "
>
  📷 Upload NFT Thumbnail
</label>

<input
  id="thumbnail-upload"
  type="file"
  accept="image/*"
  hidden
  onChange={handleThumbnailUpload}
/>

{thumbnailPreview && (
  <button
    type="button"
    onClick={() => setShowThumbnailPreview(true)}
    className="
      text-yellow-400
      text-sm
      font-medium
      mt-2
      flex
      items-center
      gap-1
    "
  >
    👁 Preview Thumbnail
  </button>
)}

    <div className="bg-[#14233f] rounded-xl p-3 flex justify-between items-center">
      <span className="text-yellow-400 font-bold">NFT Cost: 💎 500</span>
	  {!hasEnoughDiamonds && (
  <div className="text-red-400 text-xs mt-1">
    Insufficient Diamonds
  </div>
)}
     <button
  onClick={() => {

    if (!hasEnoughDiamonds) {

      router.push("/buy-diamonds")

      return;
    }

    handleMint();

  }}
  disabled={!selectedVideoData}
  className={`px-6 py-2 rounded-xl font-bold ${
    !selectedVideoData
      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
      : hasEnoughDiamonds
      ? "bg-yellow-400 text-black"
      : "bg-red-500 text-white"
  }`}
>
  {hasEnoughDiamonds
    ? "Mint NFT"
    : "Buy Diamonds"}
</button>
    </div>
  </div>
)}
     		  
		  {/* NFT Tier (only for AI image/avatar/meme/gift) */}
{["ai_image", "ai_avatar", "ai_meme", "ai_gift"].includes(assetType) && (
  <div className="bg-[#08162f] rounded-2xl p-3">

    <div className="flex items-center justify-between mb-2">
      <h2 className="font-semibold">
        NFT Tier
      </h2>

      <button
        onClick={() => setShowTierModal(true)}
        className="text-yellow-400 text-sm"
      >
        ⓘ View Tier Examples
      </button>
    </div>

    <select
      value={tier}
      onChange={(e) => {
        setTier(e.target.value);
        setHasPaidForGeneration(false);
      }}
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

  </div>
)}

{/* NFT Information */}
{assetType !== "video" && (
  <div className="bg-[#08162f] rounded-2xl p-3 space-y-2">

    <h2 className="font-semibold">
      NFT Information
    </h2>

    <input
      value={nftTitle}
      onChange={(e) => setNftTitle(e.target.value)}
      placeholder="NFT Title"
      className="
        w-full
        bg-[#14233f]
        rounded-xl
        p-3
        outline-none
      "
    />

    <textarea
      value={nftDescription}
      onChange={(e) =>
        setNftDescription(e.target.value)
      }
      placeholder="NFT Description"
      rows={3}
      className="
        w-full
        bg-[#14233f]
        rounded-xl
        p-3
        outline-none
        resize-none
      "
    />

  </div>
)}

          {/* Prompt & Generate (for AI image types and music) */}
          {assetType !== "video" && (
            <div className="bg-[#08162f] rounded-2xl p-2 space-y-1">
              <h2 className="font-semibold">Prompt</h2>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your NFT asset..."
                className="w-full bg-[#14233f] rounded-xl p-3 outline-none resize-none"
              />
			  {assetType !== "music" && (

  <div className="flex gap-2">

    <label
      htmlFor="reference-upload"
      className="
        flex-1
        bg-[#14233f]
        rounded-xl
        p-3
        text-center
        cursor-pointer
      "
    >
      {referenceFile
        ? "🖼 Change Reference Image"
        : "🖼 Reference Image (Optional)"}
    </label>

    {referencePreview && (

      <button
        type="button"
        onClick={() =>
			setShowReferencePreview(true)
			}
        className="
           bg-[#14233f]
		   rounded-xl
           w-14
           flex
           items-center
           justify-center
           text-xl
        "
      >
        👁
      </button>

    )}

  </div>

)}

<input
  id="reference-upload"
  type="file"
  accept="image/*"
  hidden
 onChange={async (e) => {

  const file =
    e.target.files?.[0];

  if (!file) return;

  setReferenceFile(file);

  setReferencePreview(
    URL.createObjectURL(file)
  );

  try {

    const formData =
      new FormData();

    formData.append(
      "reference",
      file
    );

    const res = await fetch(
      `${API_BASE}/api/upload/reference-image`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data =
      await res.json();

    if (data.success) {

      setReferenceUrl(
        data.url
      );

      console.log(
        "Reference Uploaded:",
        data.url
      );

    }

  } catch (err) {

    console.error(
      "Reference Upload Error",
      err
    );

  }

}}
/>
              <button
  onClick={handleAIStoryboard}
  disabled={optimizing}
  className="w-full bg-[#1c2945] rounded-xl py-3 font-medium"
>
  {optimizing
    ? "Generating Storyboard..."
    : "✨ AI Storyboard (Free)"}
</button>
             <button
  onClick={() => {

    if (
      isAIImageType &&
      draftItem
    ) {

      const index =
        historyItems.findIndex(
          (item) =>
            item.id === draftItem.id
        );

      if (index >= 0) {

        setHistoryIndex(index);

        setGeneratedImageUrl(
          draftItem.generated_image_url
        );
		
		 setPrompt(
		  draftItem.prompt || ""
		);
		
		 setSelectedSessionId(
          draftItem.id
        );

        setGeneratedAsset(true);

        setShowPreviewModal(true);

      }

      return;
    }

    handleGenerate();

  }}
  className="
    w-full
    bg-yellow-400
    text-black
    rounded-xl
    py-3
    font-bold
  "
>
  {isAIImageType && draftItem
    ? "👁 Open Last Artwork"
    : assetType === "music"
    ? `Generate Music • 💎 ${musicCost}`
    : `Generate NFT Asset • 💎 ${currentGenerationCost}`}
</button>
            </div>
          )}

          {/* Music Cost Card (only for music) */}
          {assetType === "music" && (
            <div className="bg-[#08162f] rounded-2xl p-4">
              <h2 className="font-semibold mb-2">NFT Cost</h2>
              <div className="text-yellow-400 font-bold">💎 {musicCost} Diamonds</div>
            </div>
          )}

         {/* Generated NFT card (only for non-video after generation) */}
{generatedAsset && assetType !== "video" && (
  <div className="bg-[#08162f] rounded-2xl p-3 space-y-2">

    <h2 className="font-semibold">
      Generated Artwork Ready
    </h2>

    <button
      onClick={() => setShowPreviewModal(true)}
      className="w-full bg-[#14233f] rounded-xl py-3"
    >
      🎨 Open Artwork Preview
    </button>

  </div>
)}
        </div>
      </div>

      {/* Tier Modal (unchanged) */}
      {showTierModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#08162f] rounded-2xl p-4 w-full max-w-md">
            <h2 className="font-bold mb-4">NFT Tier Examples</h2>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-semibold">Bronze</div>
                <div className="text-gray-400">Original Artwork (No Frame)</div>
              </div>
              <div>
                <div className="font-semibold">Silver</div>
                <div className="text-gray-400">Silver Frame</div>
              </div>
              <div>
                <div className="font-semibold">Gold</div>
                <div className="text-gray-400">Gold Frame</div>
              </div>
              <div>
                <div className="font-semibold">Legendary</div>
                <div className="text-gray-400">Animated Legendary Frame 👑</div>
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

      {/* Preview Modal (unchanged) */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div
  className="
    bg-[#08162f]
    rounded-2xl
    p-4
    w-full
    max-w-md
    max-h-[90vh]
    overflow-y-auto
  "
  style={{
    WebkitOverflowScrolling: "touch",
  }}
>
  <div
  className="
    flex
    items-center
    justify-between
    mb-4
  "
>

  <h2
    className="
      text-xl
      font-bold
      text-white
    "
  >
    Generated Artwork
  </h2>

  <button
    onClick={() =>
      setShowPreviewModal(false)
    }
    className="
      text-2xl
      text-gray-400
    "
  >
    ✕
  </button>

</div>

<div className="mb-3 text-center">

  {historyItems[historyIndex]?.is_minted ? (

    <div className="text-green-400 font-bold">
      ✅ Minted
    </div>

  ) : (

    <div className="text-yellow-400 font-bold">
      🟡 Not Minted
    </div>

  )}
  
   <div className="text-sm text-cyan-400 mt-1">
    Free Regenerates Left:
    {freeRemaining} / {freeLimit}
  </div>

</div>

<div
  className="
    h-72
    bg-[#14233f]
    rounded-xl
    flex
    items-center
    justify-center
    text-gray-400
  "
>
  {generatedImageUrl ? (
  <img
    src={historyItems[historyIndex]?.generated_image_url || generatedImageUrl}
    alt=""
    className="
      w-full
      h-full
      object-contain
    "
  />
) : (
  "Generated Artwork Preview"
)}
</div>

<div className="flex gap-2 mt-2">

  <button
  onClick={() => {
	  
	const newIndex =
		Math.max(
			0,
			historyIndex - 1
		);

    setHistoryIndex(
      newIndex
    );

    setPrompt(
      historyItems[newIndex]
        ?.prompt || ""
    );

  }}
    disabled={historyIndex === 0}
    className="flex-1 bg-[#14233f] text-white rounded-xl py-3"
  >
    ← Previous
  </button>
  
<div
  className="
    min-w-[50px]
    text-center
    text-gray-300
    text-base
    font-medium
    flex
    items-center
    justify-center
  "
>
  {historyItems.length > 0
    ? `${historyIndex + 1} / ${historyItems.length}`
    : "1 / 1"}
</div>

  <button
    onClick={() => {
   
    const newIndex =
      Math.min(
        historyItems.length - 1,
        historyIndex + 1
      );
  

    setHistoryIndex(
      newIndex
    );

    setPrompt(
      historyItems[newIndex]
        ?.prompt || ""
    );

  }}
    disabled={
      historyIndex >=
      historyItems.length - 1
    }
    className="flex-1 bg-[#14233f] text-white rounded-xl py-3"
  >
    Next →
  </button>

</div> 

<textarea
   value={prompt}
   onChange={(e) =>
    setPrompt(e.target.value)
  }
  rows={4}
  placeholder="Edit Prompt..."
  className="
    mt-4
    w-full
    bg-[#14233f]
	text-white
    rounded-xl
    p-3
    outline-none
    resize-none
  "
/>

<div className="mt-2">

  <div className="flex gap-2">

    <button
  type="button"
  onClick={() =>
    document
      .getElementById(
        "reference-upload"
      )
      ?.click()
  }
  className="
    flex-1
    bg-[#14233f]
	text-white
    rounded-xl
    py-3
  "
>
  {
    referenceUrl
      ? "🖼 Change Reference Image"
      : "🖼 Reference Image (Optional)"
  }
</button>

    {historyItems[
      historyIndex
    ]?.reference_image_url && (

      <button
        type="button"
        onClick={() =>
          setShowReferencePreview(
            true
          )
        }
        className="
          w-14
          bg-[#14233f]
          rounded-xl
          flex
          items-center
          justify-center
        "
      >
        👁
      </button>

    )}

  </div>

</div>

<button
  onClick={handleAIStoryboard}
  disabled={optimizing}
  className="
    mt-2
    w-full
    bg-[#1c2945]
	text-white
    rounded-xl
    py-3
    font-medium
  "
>
  {optimizing
    ? "Generating..."
    : "✨ Enhance Prompt"}
</button>

<button
  onClick={handleGenerate}
  disabled={isGenerating}
  className={`
 mt-2
 w-full
 rounded-xl
text-white
 py-3
 ${
   isGenerating
     ? "bg-gray-700"
     : "bg-[#14233f]"
 }
`}
>
  {
    freeRemaining > 0
      ? "Generate Again"
      : "Generate Again • 💎20"
  }
</button>

<button
  onClick={handleMint}
  disabled={
    historyItems[historyIndex]?.is_minted
  }
  className="
    mt-2
    w-full
    bg-yellow-400
    text-black
    rounded-xl
    py-3
    font-bold
  "
>
  {historyItems[historyIndex]?.is_minted
  ? "Already Minted"
  : "Mint NFT"}
</button>
    
          </div>
        </div>
      )}
	  
	  {showThumbnailPreview && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
    <div className="bg-[#08162f] rounded-2xl p-4 w-full max-w-md">

   <h2 className="text-xl font-bold text-white mb-4">
  NFT Thumbnail Preview
</h2>
      <img
        src={thumbnailPreview}
        className="w-full rounded-xl"
      />

      <button
        onClick={() => setShowThumbnailPreview(false)}
        className="
          mt-4
          w-full
          bg-yellow-400
          text-black
          rounded-xl
          py-3
          font-bold
        "
      >
        Close
      </button>

    </div>
  </div>
)}

{showReferencePreview && (

  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">

    <div className="bg-[#08162f] rounded-2xl p-4 w-full max-w-md">

      <h2 className="text-xl font-bold text-white mb-4">
        Reference Image
      </h2>

     <img
  src={
    historyItems[
      historyIndex
    ]?.reference_image_url
  }
  className="w-full rounded-xl"
/>

      <button
        onClick={() =>
          setShowReferencePreview(false)
        }
        className="
          mt-4
          w-full
          bg-yellow-400
          text-black
          rounded-xl
          py-3
          font-bold
        "
      >
        Close
      </button>

    </div>

  </div>

)}

{showMintModal && (

  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">

    <div className="bg-[#08162f] rounded-2xl p-4 w-full max-w-md">

      <h2 className="text-xl font-bold text-white mb-4">

        NFT Mint Status

      </h2>

      {mintStatus === "pending" && (
        <div className="text-center text-lg text-white">
          ⏳ Mint Request Submitted! Please wait... 
        </div>
      )}

      {mintStatus === "processing" && (
        <div className="text-center text-lg text-white">
          🚀 Minting NFT...
        </div>
      )}

{mintStatus === "minted" && (
  <>
    <div className="text-center text-lg text-white">
      🎉 NFT Minted Successfully
    </div>

    <button
      onClick={() =>
        router.push("/creator/assets")
      }
      className="
        mt-4
        w-full
        bg-green-500
        text-white
        rounded-xl
        py-3
        font-bold
      "
    >
      View My NFTs
    </button>
  </>
)}

      {mintStatus === "failed" && (
        <div className="text-center text-xl text-white font-bold">
          ❌ NFT Mint Failed
          <br />
          Diamonds Refunded
        </div>
      )}

     {(mintStatus === "minted" ||
  mintStatus === "failed") && (

  <button
    onClick={() => setShowMintModal(false)}
    className="
      mt-4
      w-full
      bg-yellow-400
      text-black
      rounded-xl
      py-3
      font-bold
    "
  >
    Close
  </button>

)}

    </div>

  </div>

)}

{isGenerating && (
  <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">

    <div className="bg-[#0b1220] p-8 rounded-2xl text-center">

      <div className="text-4xl mb-4">
        🎨
      </div>

      <div className="text-xl text-white font-bold">
        Generating AI Artwork...
      </div>

      <div className="text-gray-400 mt-2">
        This may take 10-30 seconds
      </div>

    </div>

  </div>
)}
    </>
  );
}