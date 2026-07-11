"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/providers/AppDataProvider";
import {useTonConnectUI} from "@tonconnect/ui-react";
import { MARKETPLACE_ROOT_ADDRESS, } from "@/src/config/marketplaceConfig";
import { buildCreateListingPayload } from "@/lib/ton/buildCreateListingPayload";
import { buildCancelListingPayload }from "@/lib/ton/buildCancelListingPayload";
import { buildUpdatePricePayload } from "@/lib/ton/buildUpdatePricePayload";
import { buildRelistPayload } from "@/lib/ton/buildRelistPayload";
import { Address } from "@ton/core";


const assetTypeLabel: Record<string, string> = {
  ai_avatar: "Avatar",
  ai_image: "Image",
  ai_meme: "Meme",
  ai_gift: "Gift",
  ai_music: "Music",
};

export default function ManageNFTsPage() {
	
  const router = useRouter();
  const { user, refreshAppData } = useAppData();
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const [activeTab, setActiveTab] = useState("my_nfts");
  const [assetFilter, setAssetFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [myNFTs, setMyNFTs] = useState<any[]>([]);
  const [artworkHistory, setArtworkHistory] = useState<any[]>([]);
  const [mintHistory, setMintHistory] = useState<any[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [showRecycleModal, setShowRecycleModal] = useState(false);
  const [showMarketplaceModal,setShowMarketplaceModal] = useState(false);
  const [resumeListing, setResumeListing] = useState<any>(null);
  const [showResumeListingModal, setShowResumeListingModal] = useState(false);
  const [showActiveListingModal,setShowActiveListingModal] = useState(false);
  const [listingPrice,setListingPrice] = useState("");
  const [listingType,setListingType] = useState("0");
  const [auctionDuration, setAuctionDuration] = useState("24");
  const [recycleData, setRecycleData] = useState<any>(null);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [nftFilter, setNftFilter] = useState("all");
  const [recycleHistory, setRecycleHistory] = useState<any[]>([]);
  const [tonConnectUI] = useTonConnectUI();
  const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [offers, setOffers] = useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [showAcceptOfferModal, setShowAcceptOfferModal] = useState(false);
  const [creatingListing, setCreatingListing] = useState(false);
  
  const [showRelistModal, setShowRelistModal] = useState(false);
  const [relistPrice, setRelistPrice] = useState("");
  const [relistListingType, setRelistListingType] = useState("0");
  const [relistAuctionDuration, setRelistAuctionDuration] = useState("24");
  
  useEffect(() => {

    if (!user?.id) return;

    loadAll();

  }, [user?.id]);

  const loadAll = async () => {

    try {

      setLoading(true);

      const [
	    recycleRes,
        nftRes,
        artworkRes,
        mintRes,
      ] = await Promise.all([

		fetch(
		`${API_BASE}/api/recycle/history/${user.id}`
		),
		
        fetch(
          `${API_BASE}/api/nft/my-nfts/${user.id}`
        ),

        fetch(
          `${API_BASE}/api/nft/artwork-history/${user.id}`
        ),

        fetch(
          `${API_BASE}/api/nft/mint-history/${user.id}`
        ),

      ]);
	  
	  	const recycleData =
		await recycleRes.json();

		const nftData =
        await nftRes.json();

		const artworkData =
        await artworkRes.json();

		const mintData =
        await mintRes.json();
		
	  if (recycleData.success) {
		setRecycleHistory(
		recycleData.items || []
		);
		}

      if (nftData.success) {
        setMyNFTs(
          nftData.data || []
        );
      }

      if (artworkData.success) {
        setArtworkHistory(
          artworkData.items || []
        );
      }

      if (mintData.success) {
        setMintHistory(
          mintData.items || []
        );
      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };
  
async function loadOffers() {

  if (!selectedNFT?.marketplace_listing_id)
    return;

  const res = await fetch(

    `${API_BASE}/api/marketplace/offer/list/${selectedNFT.marketplace_listing_id}`

  );

  const data = await res.json();

  if (data.success) {

    setOffers(
      data.offers || []
    );

  }

}
  
  const filteredArtwork =
  assetFilter === "all"
    ? artworkHistory
    : artworkHistory.filter(
        (item) =>
          item.asset_type === assetFilter
      );
	  
const filteredNFTs =

  nftFilter === "all"

    ? myNFTs.filter(
    (nft) =>
       !nft.marketplace_status
  )

    : nftFilter === "gift"

    ? myNFTs.filter(
        (nft) =>
          nft.transaction_type ===
          "gift"
      )

    : nftFilter === "marketplace"

    ? myNFTs.filter(
        (nft) =>
          nft.marketplace_status === "active" ||
          nft.marketplace_status === "reserved" ||
		  nft.marketplace_status === "expired"
      )

    : nftFilter === "recycle"

    ? myNFTs.filter(
        (nft) =>
          nft.transaction_type ===
          "recycle"
      )

    : [];

  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );

  }

  return (
    <div
  className="
    h-full
    overflow-y-auto
    bg-black
    text-white
    p-4
    pb-8
  "
  style={{
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
>

      <div className="max-w-2xl mx-auto">

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
            "
          >
            Manage NFTs
          </h1>

        </div>

        {/* Tabs */}

        <div className="flex gap-2 mb-4">

          <button
            onClick={() =>
              setActiveTab(
                "my_nfts"
              )
            }
            className={`
              flex-1
              py-3
              rounded-xl
              font-semibold
              ${
                activeTab === "my_nfts"
                  ? "bg-yellow-400 text-black"
                  : "bg-[#14233f] text-white"
              }
            `}
          >
            My NFTs
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "artwork"
              )
            }
            className={`
              flex-1
              py-3
              rounded-xl
              font-semibold
              ${
                activeTab === "artwork"
                  ? "bg-yellow-400 text-black"
                  : "bg-[#14233f] text-white"
              }
            `}
          >
            Artwork History
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "mint"
              )
            }
            className={`
              flex-1
              py-3
              rounded-xl
              font-semibold
              ${
                activeTab === "mint"
                  ? "bg-yellow-400 text-black"
                  : "bg-[#14233f] text-white"
              }
            `}
          >
            Mint History
          </button>

        </div>

        {/* MY NFTS */}

        {activeTab === "my_nfts" && (

         <>
		 <div className="flex gap-2 mb-3 overflow-x-auto">

  <button
    onClick={() => setNftFilter("all")}
    className={`
      px-3
      py-2
      rounded-xl
      text-sm
      whitespace-nowrap
      ${
        nftFilter === "all"
          ? "bg-yellow-400 text-black"
          : "bg-[#14233f] text-white"
      }
    `}
  >
    All
  </button>

  <button
    onClick={() => setNftFilter("gift")}
    className={`
      px-3
      py-2
      rounded-xl
      text-sm
      whitespace-nowrap
      ${
        nftFilter === "gift"
          ? "bg-yellow-400 text-black"
          : "bg-[#14233f] text-white"
      }
    `}
  >
    Gift
  </button>

  <button
    onClick={() => setNftFilter("marketplace")}
    className={`
      px-3
      py-2
      rounded-xl
      text-sm
      whitespace-nowrap
      ${
        nftFilter === "marketplace"
          ? "bg-yellow-400 text-black"
          : "bg-[#14233f] text-white"
      }
    `}
  >
    Marketplace
  </button>

  <button
    onClick={() => setNftFilter("recycle")}
    className={`
      px-3
      py-2
      rounded-xl
      text-sm
      whitespace-nowrap
      ${
        nftFilter === "recycle"
          ? "bg-yellow-400 text-black"
          : "bg-[#14233f] text-white"
      }
    `}
  >
    Recycle
  </button>

</div>

{nftFilter === "recycle" && (

  <div className="space-y-3">

    {recycleHistory.map((item) => (

      <div
        key={item.id}
        className="
          bg-[#08162f]
          rounded-2xl
          p-4
        "
      >

        <div className="font-bold">
          Recycle Request
        </div>

        <div className="text-sm text-cyan-400 mt-2">
          Recycle Fund:
          {" "}
          {item.refund_usdt}
          {" "}
          USDT
        </div>

        <div className="text-sm text-yellow-400 mt-1">
          {item.status}
        </div>

        <div className="text-xs text-gray-400 mt-2">
          {new Date(
            item.created_at
          ).toLocaleString()}
        </div>

      </div>

    ))}

  </div>

)}

{nftFilter !== "recycle" && (

<div className="grid grid-cols-2 gap-3">

            {myNFTs.length === 0 && (

              <div className="col-span-2 bg-[#08162f] rounded-2xl p-6 text-center text-gray-400">
                No NFTs Found
              </div>

            )}

            {filteredNFTs.map((item) => (

              <div
                key={item.ownership_id}
				onClick={() => {
				console.log(item);
                setSelectedNFT(item);
                if (
     item.marketplace_status === "active"  ||
	 item.marketplace_status === "reserved" ||
	 item.marketplace_status === "expired"
  ) {
	  
    setSelectedNFT(item);
    setShowActiveListingModal(true);

  } else {
	  
    setSelectedNFT(item);
    setShowNFTModal(true);

  }
               }}
                className="
                  bg-[#08162f]
                  rounded-2xl
                  overflow-hidden
				  cursor-pointer
                "
              >

                <img
                  src={item.thumbnail_url}
                  alt=""
                  className="
                    w-full
                    h-40
                    object-cover
                  "
                />

                <div className="p-3">

                  <div className="font-bold truncate">
                    {item.title}
                  </div>

                  <div className="text-[10px] text-cyan-400 mt-2 break-all">
                    {item.nft_address || "-"}
                  </div>
				  
				  <div
					className="
					mt-2
					text-xs
					text-yellow-400
					font-semibold
				"
				>
				NFT Details →
				</div>

                </div>

              </div>

            ))}

          </div>
		  
		  )}
</>
        )}
		
		{/* ARTWORK HISTORY */}

{activeTab === "artwork" && (

  <>

    <div className="flex gap-2 mb-3 overflow-x-auto">

      <button
        onClick={() =>
          setAssetFilter("all")
        }
        className={`
          px-3
          py-2
          rounded-xl
          text-sm
          whitespace-nowrap
          ${
            assetFilter === "all"
              ? "bg-yellow-400 text-black"
              : "bg-[#14233f] text-white"
          }
        `}
      >
        All
      </button>

      <button
        onClick={() =>
          setAssetFilter("ai_avatar")
        }
        className={`
          px-3
          py-2
          rounded-xl
          text-sm
          whitespace-nowrap
          ${
            assetFilter === "ai_avatar"
              ? "bg-yellow-400 text-black"
              : "bg-[#14233f] text-white"
          }
        `}
      >
        Avatar
      </button>

      <button
        onClick={() =>
          setAssetFilter("ai_image")
        }
        className={`
          px-3
          py-2
          rounded-xl
          text-sm
          whitespace-nowrap
          ${
            assetFilter === "ai_image"
              ? "bg-yellow-400 text-black"
              : "bg-[#14233f] text-white"
          }
        `}
      >
        Image
      </button>

      <button
        onClick={() =>
          setAssetFilter("ai_meme")
        }
        className={`
          px-3
          py-2
          rounded-xl
          text-sm
          whitespace-nowrap
          ${
            assetFilter === "ai_meme"
              ? "bg-yellow-400 text-black"
              : "bg-[#14233f] text-white"
          }
        `}
      >
        Meme
      </button>

    </div>

  <div className="grid grid-cols-2 gap-3">

    {filteredArtwork.length === 0 && (

      <div className="col-span-2 bg-[#08162f] rounded-2xl p-6 text-center text-gray-400">
        No Artwork History
      </div>

    )}

    {filteredArtwork.map((item) => (

      <div
        key={item.id}
		onClick={() => {

    setSelectedArtwork(item);

    setShowArtworkModal(true);

  }}
        className="
          bg-[#08162f]
          rounded-2xl
          overflow-hidden
		  cursor-pointer
        "
      >

        <img
          src={item.generated_image_url}
          alt=""
          className="
            w-full
            h-28
            object-cover
          "
        />

        <div className="p-3">

          <div className="flex justify-between items-center mb-2">

            <div
              className="
                text-xs
                text-gray-400
              "
            >
               {assetTypeLabel[item.asset_type] ||
    item.asset_type}
            </div>

            <div
              className={`
                text-[10px]
                px-2
                py-1
                rounded-full
                ${
                  item.artwork_status === "minted"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }
              `}
            >
              {item.artwork_status === "minted"
  ? "Minted"
  : "Draft"}
            </div>

          </div>

          <div className="flex items-center justify-between mt-2">

  <div className="font-bold truncate">
    {item.nft_title || "Untitled NFT"}
  </div>

  <div
    className="
      text-[10px]
      text-cyan-400
      ml-2
      shrink-0
    "
  >
    {new Date(
      item.created_at
    ).toLocaleDateString()}
  </div>

</div>

        </div>

      </div>

    ))}

  </div>
  
  </>

)}

{/* ARTWORK PREVIEW MODAL */}

{showArtworkModal &&
 selectedArtwork && (

<div
  className="
    fixed
    inset-0
    z-50
    bg-black/90
    overflow-y-auto
    p-4
  "
>

  <div
    className="
      max-w-md
      mx-auto
      mt-6
      bg-[#08162f]
      rounded-3xl
      overflow-hidden
    "
  >

    {/* Header */}

    <div
      className="
        flex
        justify-between
        items-center
        p-4
      "
    >

      <h3 className="font-bold">
        Artwork Preview
      </h3>

      <button
        onClick={() =>
          setShowArtworkModal(false)
        }
        className="
          text-white
          text-xl
        "
      >
        ✕
      </button>

    </div>

    {/* Main Image */}

    <img
      src={
        selectedArtwork.generated_image_url
      }
      alt=""
      className="
        w-full
        object-cover
      "
    />

    <div className="p-4">

      <div className="mb-3">

        <div className="text-sm text-gray-400">
          NFT Title
        </div>

        <div className="font-bold">
          {
            selectedArtwork.nft_title ||
            "Untitled NFT"
          }
        </div>

      </div>

      <div className="mb-3">

        <div className="text-sm text-gray-400">
          Asset Type
        </div>

        <div>
          {
            selectedArtwork.asset_type
          }
        </div>

      </div>

      <div className="mb-3">

        <div className="text-sm text-gray-400">
          Status
        </div>

        <div
          className={
            selectedArtwork.artwork_status ===
            "minted"
              ? "text-green-400"
              : "text-yellow-400"
          }
        >
          {
            selectedArtwork.artwork_status
          }
        </div>

      </div>

      <div className="mb-3">

        <div className="text-sm text-gray-400">
          Prompt
        </div>

        <div className="text-sm">
          {
            selectedArtwork.prompt
          }
        </div>

      </div>
	  
	        {selectedArtwork.reference_image_url && (

        <div className="mb-3">

          <div className="text-sm text-gray-400 mb-2">
            Reference Image
          </div>

          <img
            src={
              selectedArtwork.reference_image_url
            }
            alt=""
            className="
              w-full
              rounded-xl
            "
          />

        </div>

      )}

      <div>

        <div className="text-sm text-gray-400">
          Created
        </div>

        <div>
          {new Date(
            selectedArtwork.created_at
          ).toLocaleString()}
        </div>

      </div>

    </div>

  </div>

</div>

)}

{/* NFT DETAIL MODAL */}

{showNFTModal &&
 selectedNFT && (

<div
  className="
    fixed
    inset-0
    z-50
    bg-black/90
    overflow-y-auto
    p-4
  "
>

  <div
    className="
      max-w-md
      mx-auto
      mt-6
      bg-[#08162f]
      rounded-3xl
      overflow-hidden
    "
  >

    {/* Header */}

    <div
      className="
        flex
        justify-between
        items-center
        p-4
      "
    >

      <h3 className="font-bold">
        NFT Details
      </h3>

      <button
        onClick={() =>
          setShowNFTModal(false)
        }
        className="
          text-white
          text-xl
        "
      >
        ✕
      </button>

    </div>

    {/* NFT IMAGE */}

    <img
      src={
        selectedNFT.thumbnail_url
      }
      alt=""
      className="
        w-full
        object-cover
      "
    />

    <div className="p-4">

     <div className="mb-4">

  <div className="grid grid-cols-2 gap-2">

    <div>

      <div className="text-sm text-gray-400">
        NFT Title
      </div>

      <div className="font-bold">
        {selectedNFT.title}
      </div>

    </div>

    <div>

      <div className="text-sm text-gray-400">
        Token ID
      </div>

      <div className="font-bold">
        #{selectedNFT.token_id}
      </div>

    </div>

  </div>

</div>

      <div className="mb-3">

        <div className="text-sm text-gray-400">
          Description
        </div>

        <div>
          {selectedNFT.description}
        </div>

      </div>

      <div className="mb-3">

        <div className="text-sm text-gray-400">
          NFT Address
        </div>

        <div
          className="
            text-xs
            break-all
            text-cyan-400
          "
        >
          {selectedNFT.nft_address}
        </div>

      </div>
<div className="border-t border-slate-700 pt-4 mt-4 space-y-3">

  <button
   onClick={async () => {

  try {

    setRecycleLoading(true);

    const res =
      await fetch(
        `${API_BASE}/api/recycle/create`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            user_id: user.id,
            nft_address:
              selectedNFT.nft_address
          })
        }
      );

    const data =
      await res.json();

    if (!data.success) {

      alert(
        data.error ||
        "Recycle failed"
      );

      return;

    }

    setRecycleData(
      data.data
    );

    setShowRecycleModal(true);

  } catch (err) {

    console.error(err);

  } finally {

    setRecycleLoading(false);

  }

}}
    className="
      w-full
      py-3
      rounded-xl
      bg-yellow-400
      text-black
      font-bold
    "
  >
    ♻ Recycle NFT

  </button>

  <button
onClick={async () => {

  const checkRes = await fetch(
    `${API_BASE}/api/marketplace/check-listing/${selectedNFT.collectible_id}`
  );

  const checkData = await checkRes.json();

  if (!checkData.success) {
    alert(checkData.error);
    return;
  }

  if (checkData.resume) {

    // 保存 Resume Listing
    setResumeListing(checkData.listing);
	
	setShowMarketplaceModal(false);

    // 开 Resume Modal
    setShowResumeListingModal(true);

    return;

  }

  // 第一次 Listing
  setShowMarketplaceModal(true);

}}
    className="
      w-full
      py-3
      rounded-xl
      bg-[#14233f]
      border
      border-cyan-500
      text-white
      font-bold
    "
  >
    🏪 List For Sale
  </button>

</div>
    </div>

  </div>

</div>

)}

{showRecycleModal &&
 recycleData && (
 
 <div
  className="
    fixed
    inset-0
    z-[60]
    bg-black/90
    flex
    items-center
    justify-center
    p-4
  "
>

<div
  className="
    bg-[#08162f]
    rounded-3xl
    p-5
    w-full
    max-w-md
  "
>

<h3 className="font-bold text-xl mb-4">
  Recycle NFT
</h3>

<div className="mb-3">

<div className="mb-3">

  <div className="text-gray-400 text-sm">
    Mint Cost
  </div>

  <div className="font-bold">
    {recycleData.diamond_value}
    {" "}
    Diamonds
  </div>

</div>

<div className="mb-3">

  <div className="text-gray-400 text-sm">
    Recycle Rate
  </div>

  <div className="font-bold">
    70%
  </div>

</div>

  <div className="text-gray-400 text-sm">
    You Will Receive
  </div>

  <div className="text-green-400 text-xl font-bold">
    {Number(
  recycleData.refund_usdt
).toFixed(2)}
{" "}
    USDT
  </div>

</div>

<div className="mb-4">

  <div className="text-gray-400 text-sm">
    Vault Address
  </div>

  <div className="text-xs break-all text-cyan-400">
    {recycleData.vault_address}
  </div>

</div>

<div
  className="
    mb-4
    rounded-xl
    bg-yellow-500/10
    border
    border-yellow-500/30
    p-3
  "
>

  <div
    className="
      text-yellow-400
      font-semibold
      mb-1
    "
  >
    ⚠ Warning
  </div>

  <div
    className="
      text-xs
      text-gray-300
      leading-relaxed
    "
  >
    This action is irreversible.
    <br />
    Once the NFT is transferred
    to the Vault, it can no
    longer be recovered.
  </div>

</div>

<button
onClick={async () => {

  try {

    // STEP 1
    const initRes =
      await fetch(
        `${API_BASE}/api/nft/transfer/init`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            ownership_id:
              selectedNFT.ownership_id,

            receiver_wallet:
              recycleData.vault_address
          })
        }
      );

    const initData =
      await initRes.json();

    if (!initData.success) {

      alert(
        initData.error ||
        "Transfer init failed"
      );

      return;
    }

 // STEP 2

let tx;

try {

  tx =
    await tonConnectUI.sendTransaction({

      validUntil:
        initData.validUntil,

      messages: [

        {
          address:
            initData.nft_address,

          amount:
            initData.amount,

          payload:
            initData.payload
        }

      ]

    });
	
	const verifyRes =
  await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/nft/transfer/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        ownership_id:
          selectedNFT.ownership_id
      })
    }
  );

const verifyData =
  await verifyRes.json();

alert(
  JSON.stringify(
    verifyData,
    null,
    2
  )
);

  alert(
    "TX SUCCESS"
  );


} catch (err: any) {

console.error(
    "TX ERROR",
    err
  );

  throw err;
}

    // STEP 3

    const completeRes =
      await fetch(
        `${API_BASE}/api/recycle/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({

            recycle_request_id:
              recycleData.id,

            tx_hash:
              tx?.boc || null

          })
        }
      );

    const completeData =
      await completeRes.json();

    if (!completeData.success) {

      alert(
        completeData.error
      );

      return;
    }

    await refreshAppData(user);
	
	await loadAll();
	
	setShowRecycleModal(false);

    setShowNFTModal(false);

    
	 
    alert(
      `Recycle Success\n+${completeData.refund_usdt} USDT`
    );


  } catch (err) {

    console.error(err);

    alert(
      "Recycle failed"
    );

  }

}}
  className="
    w-full
    py-3
    rounded-xl
    bg-yellow-400
    text-black
    font-bold
  "
>
  Continue
</button>

<button
  onClick={() =>
    setShowRecycleModal(false)
  }
  className="
    w-full
    mt-3
    py-3
    rounded-xl
    bg-slate-700
  "
>
  Cancel
</button>

</div>

</div>
)}

{showMarketplaceModal && (

<div
  className="
    fixed
    inset-0
    z-[60]
    bg-black/90
    flex
    items-center
    justify-center
    p-4
  "
>

<div
  className="
    bg-[#08162f]
    rounded-3xl
    p-5
    w-full
    max-w-md
  "
>

<h3 className="font-bold text-xl mb-4">
  Marketplace Listing
</h3>

<div className="mb-4">

  <div className="text-gray-400 text-sm mb-2">
    Price (USDT)
  </div>

  <input
	type="number"
	value={listingPrice}
	onChange={(e) =>
		setListingPrice(e.target.value)
	}
    placeholder="10"
    className="
      w-full
      rounded-xl
      bg-slate-800
      p-3
      text-back
    "
  />

</div>

<div className="mb-4">

  <div className="text-gray-400 text-sm mb-2">
    Listing Type
  </div>

  <select
  value={listingType}
  onChange={(e) =>
    setListingType(e.target.value)
  }
    className="
      w-full
      rounded-xl
      bg-slate-800
      p-3
      text-white
    "
  >

    <option value="0">
      Fixed Price
    </option>

    <option value="1">
      Auction
    </option>

  </select>
  
  {listingType === "1" && (

<div className="mt-4">

  <div className="text-gray-400 text-sm mb-2">
    Auction Duration
  </div>

  <select
    value={auctionDuration}
    onChange={(e) =>
      setAuctionDuration(e.target.value)
    }
    className="
      w-full
      rounded-xl
      bg-slate-800
      p-3
      text-white
    "
  >

    <option value="24">
      24 Hours
    </option>

    <option value="48">
      48 Hours
    </option>

    <option value="72">
      72 Hours
    </option>

  </select>

</div>

)}

</div>

<div
  className="
    mb-4
    rounded-xl
    bg-cyan-500/10
    border
    border-cyan-500/30
    p-3
  "
>

  <div
    className="
      text-cyan-400
      font-semibold
      mb-1
    "
  >
    Marketplace Test
  </div>

  <div
    className="
      text-xs
      text-gray-300
    "
  >
    Next step will transfer NFT
    into Listing Contract Escrow.
  </div>

</div>

<button
  disabled={creatingListing}
  onClick={async () => {
	  
	   if (creatingListing) {

        return;

    }

    setCreatingListing(true);
	  
try{
		const checkRes =
  await fetch(
    `${API_BASE}/api/marketplace/check-listing/${selectedNFT.collectible_id}`
  );

const checkData =
  await checkRes.json();
  
console.log(
  "CHECK LISTING",
  checkData
);

if (!checkData.success) {

  alert(
    checkData.error ||
    "Check listing failed"
  );

  return;

}
		
		if (!selectedNFT) {
  alert("NFT missing");
  return;
}

if (!user?.wallet_address) {
  alert("Wallet not connected");
  return;
}

if (!listingPrice) {
  alert("Please enter price");
  return;
}

alert(
  JSON.stringify(
    selectedNFT,
    null,
    2
  )
);
alert("STEP 1");

const durationSeconds =
  Number(auctionDuration) * 3600;

const listingEndTime =
  BigInt(
    Math.floor(Date.now()/1000) +
    (
      Number(listingType) === 1
        ? durationSeconds
        : 0
    )
  );
  
alert(
  JSON.stringify(
    {
      tokenId:
        selectedNFT?.token_id,

      collectibleId:
        selectedNFT?.collectible_id
    },
    null,
    2
  )
);


alert(
JSON.stringify({
  collectibleId:
    selectedNFT.token_id,

  nftAddress:
    selectedNFT.nft_address,

  seller:
    user.wallet_address,

  creator:
    user.wallet_address,

  platformWallet:
    process.env.NEXT_PUBLIC_PLATFORM_WALLET,

  usdtMaster:
    process.env.NEXT_PUBLIC_USDT_MASTER_ADDRESS,

 priceUsdt:
        BigInt(
            Math.floor(
                Number(listingPrice) * 1_000_000
            )
        ).toString(),

  listingType,

  endTime:
    Number(listingEndTime)
},
null,
2)
);


 alert(
JSON.stringify({
  collectibleId:
    selectedNFT.token_id,

  nftAddress:
    selectedNFT.nft_address,

  creator:
    user.wallet_address,

  priceUsdt:
        BigInt(
            Math.floor(
                Number(listingPrice) * 1_000_000
            )
        ).toString(),

  listingType,

  endTime:
    Number(listingEndTime)
},
null,
2)
);

	  const payload =
	 
  buildCreateListingPayload({

    collectibleId:
      BigInt(
        selectedNFT.token_id
      ),

    nftAddress:
      selectedNFT.nft_address,

    creator:
      user.wallet_address,

    priceUsdt:
		BigInt(
			Math.floor(
				Number(listingPrice) * 1_000_000
			)
		),

    listingType:
      BigInt(listingType),

    endTime:
      listingEndTime

  });
  
  alert(
  `PAYLOAD:\n${payload}`
);
  
  alert("STEP 2");
  console.log(
  "CREATE LISTING PAYLOAD",
  payload
);

console.log(
  "MARKETPLACE ROOT",
  MARKETPLACE_ROOT_ADDRESS
);
  
  alert("STEP 3");

const tx = await tonConnectUI.sendTransaction({

  validUntil:
    Math.floor(
      Date.now()/1000
    ) + 600,

  messages: [

    {
      address:
        MARKETPLACE_ROOT_ADDRESS,

      amount:
        "100000000",

      payload
    }

  ]

});

setShowMarketplaceModal(false);

alert(
  JSON.stringify(
    Object.keys(tx),
    null,
    2
  )
);

alert("STEP 4");

alert(
  JSON.stringify(
    {
      collectible_id:
        selectedNFT.collectible_id,

      nft_address:
        selectedNFT.nft_address,

      listing_address:
        null,

      seller_id:
        user.id,

      seller_wallet:
        user.wallet_address,

      creator_wallet:
        user.wallet_address,

      price_usdt:
        Number(listingPrice),

      listing_type:
        Number(listingType)

    },
    null,
    2
  )
);

const createRes =
  await fetch(
    `${API_BASE}/api/marketplace/create-listing`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        collectible_id:
          selectedNFT.collectible_id,

        nft_address:
          selectedNFT.nft_address,

        listing_address:
          null,

        seller_id:
          user.id,

        seller_wallet:
          user.wallet_address,

        creator_wallet:
          user.wallet_address,

        price_usdt:
          Number(listingPrice),

        listing_type:
          Number(listingType),
		  
      })
    }
  );

  const createData = await createRes.json();
  
    if (!createData.success) {

  alert(
    createData.error
  );

  return;

}
      
  const listingId = createData.listing.id;

  let listingAddress = null;

for (
  let i = 0;
  i < 20;
  i++
) {

  const res =
    await fetch(
      `${API_BASE}/api/marketplace/resolve-pending/${listingId}`
    );

  const data =
    await res.json();

  console.log(
    "RESOLVE",
    data
  );

  if (
    data.success
  ) {

    listingAddress =
      data.listingAddress;

    break;
  }

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        2000
      )
  );
}

if (!listingAddress) {

  alert(
    "Listing contract not found"
  );

  return;
}

alert(
  listingAddress
);

alert(
  JSON.stringify(
    createData,
    null,
    2
  )
);

      const initRes =
        await fetch(
          `${API_BASE}/api/nft/transfer/init`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({

              ownership_id:
                selectedNFT.ownership_id,

              receiver_wallet:
                listingAddress

            })
          }
        );

      const initData =
        await initRes.json();

      console.log(
        "INIT DATA",
        initData
      );

      if (!initData.success) {

        alert(
          initData.error ||
          "Transfer init failed"
        );

        return;
      }

      await tonConnectUI.sendTransaction({

        validUntil:
          initData.validUntil,

        messages: [
          {
            address:
              initData.nft_address,

            amount:
              initData.amount,

            payload:
              initData.payload
          }
        ]

      });

  const verifyRes =
  await fetch(
    `${API_BASE}/api/marketplace/verify-listing`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        marketplace_listing_id:
          listingId
      })
    }
  );

const verifyData =
  await verifyRes.json();

console.log(
  verifyData
);

if (!verifyData.success) {

  alert(
    verifyData.error
  );

  return;

}

 if (
    Number(listingType) === 1
) {

    const auctionRes =
        await fetch(
            `${API_BASE}/api/marketplace/auction/create`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    listing_id:
                        listingId,

                    seller_id:
                        user.id,

                    starting_price:
                        Number(listingPrice),

                    reserve_price:
                        null,

                    end_time:
						new Date(
						Date.now() +
						Number(auctionDuration) *
						60 *
						60 *
						1000
						).toISOString()

                })
            }
        );

    const auctionData =
        await auctionRes.json();

    console.log(
        auctionData
    );

    if (!auctionData.success) {

        alert(
            auctionData.error
        );

        return;

    }

}

if (Number(listingType) === 1) {

    alert("Auction created!");

} else {

    alert("Marketplace Listing Active!");

}

await loadAll();

setShowMarketplaceModal(false);

setShowNFTModal(false);

setSelectedNFT(null);

    }
    catch(err: any){

   console.error(err);
   
   const msg = err?.message || "";

  if (
    err?.constructor?.name === "UserRejectsError" ||
    err?.constructor?.name === "TonConnectUIError" ||
    msg.includes("Transaction was not sent")
  ) {

    alert("Transaction cancelled.");

    return;

  }

  alert("Transaction failed.");


    } finally {

    setCreatingListing(false);

}
	
 
  }}
  className="
    w-full
    py-3
    rounded-xl
    bg-cyan-500
    text-black
    font-bold
  "
>
   {creatingListing
    ? "Creating..."
    : "Continue"}
</button>

<button
  onClick={() =>
    setShowMarketplaceModal(false)
  }
  className="
    w-full
    mt-3
    py-3
    rounded-xl
    bg-slate-700
  "
>
  Cancel
</button>

</div>

</div>

)}

{showActiveListingModal && (
  <div
    className="
      fixed
      inset-0
      z-[60]
      bg-black/80
      flex
      items-center
      justify-center
      p-4
    "
  >
    <div
      className="
        bg-[#0f172a]
        rounded-3xl
        w-full
        max-w-md
        p-6
      "
    >

      <h2 className="text-2xl font-bold mb-4">
        Marketplace Listing
      </h2>

      <div className="space-y-3">

        <div>
          <span className="text-gray-400">
            Title
          </span>

          <div className="font-bold">
            {selectedNFT?.title}
          </div>
        </div>

        <div>
          <span className="text-gray-400">
            Price
          </span>

          <div className="font-bold">
           {Number(
  selectedNFT?.price_usdt ?? 0
).toFixed(2)}
{" "}
USDT
          </div>
        </div>

        <div>
          <span className="text-gray-400">
            Status
          </span>

          <div
  className={
    selectedNFT?.marketplace_status === "reserved"
      ? "text-yellow-400 font-bold"
      : "text-green-400 font-bold"
  }
>
  {selectedNFT?.marketplace_status}
</div>
        </div>

      </div>

<button
  disabled={
    selectedNFT?.marketplace_status === "reserved"
  }
  onClick={async () => {

    try {

      const initRes =
        await fetch(
          `${API_BASE}/api/marketplace/cancel-listing/init`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              marketplace_listing_id:
                selectedNFT.marketplace_listing_id
            })
          }
        );

      const initData =
        await initRes.json();
		
		console.log(initData);

alert(
  JSON.stringify(
    initData,
    null,
    2
  )
);

      if (!initData.success) {

        alert(initData.error);

        return;

      }

      const payload =
        buildCancelListingPayload();
		
		const listingAddress =
			Address
			.parse(initData.listing_address)
			.toString();

      await tonConnectUI.sendTransaction({

        validUntil:
          Math.floor(
            Date.now() / 1000
          ) + 600,

        messages: [

          {
            address: listingAddress,

            amount: initData.amount,

            payload
          }

        ]

      });
	  
	  const verifyRes =
  await fetch(
    `${API_BASE}/api/marketplace/verify-cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        marketplace_listing_id:
          selectedNFT.marketplace_listing_id
      })
    }
  );

const verifyData =
  await verifyRes.json();

if (!verifyData.success) {

  alert(
    verifyData.error
  );

  return;

}

await loadAll();

setShowActiveListingModal(false);

setSelectedNFT(null);

alert(
  "Listing Cancelled"
);


    } catch (err: any) {

      console.error(err);

    alert(JSON.stringify({
    name: err?.name,
    message: err?.message,
    constructor: err?.constructor?.name
  }, null, 2));

    }

  }} 
className={`
  w-full
  mt-6
  py-3
  rounded-xl
  text-white
  font-bold
  ${
    selectedNFT?.marketplace_status === "reserved"
      ? "bg-gray-500 cursor-not-allowed opacity-60"
      : "bg-red-500"
  }
`}
>
  Cancel Listing
</button>

{selectedNFT?.marketplace_status !== "expired" && (

<button
  disabled={
    selectedNFT?.marketplace_status === "reserved"
  }
  onClick={() => {

     setShowUpdatePriceModal(true);

  }}
  className={`
    w-full
    mt-3
    py-3
    rounded-xl
    font-bold
    ${
      selectedNFT?.marketplace_status === "reserved"
        ? "bg-gray-500 text-white cursor-not-allowed opacity-60"
        : "bg-cyan-500 text-black"
    }
`}
>
  Edit Price
</button>
)}

{selectedNFT?.marketplace_status !== "expired" && (
<button
  onClick={async () => {

    await loadOffers();

    setShowOffersModal(true);

  }}
  className="
    w-full
    mt-3
    py-3
    rounded-xl
    bg-yellow-400
    text-black
    font-bold
  "
>
  Offers
</button>
)}

{selectedNFT?.marketplace_status === "expired" && (

<button
  onClick={() => {

    setShowRelistModal(true);

  }}
  className="
    w-full
    mt-3
    py-3
    rounded-xl
    bg-cyan-500
    text-black
    font-bold
  "
>
  Relist NFT
</button>

)}
      <button
        onClick={() => {

          setShowActiveListingModal(false);

        }}
        className="
          w-full
          mt-3
          py-3
          rounded-xl
          bg-slate-700
          text-white
        "
      >
        Close
      </button>

    </div>
  </div>
)}


{showUpdatePriceModal && (

<div
  className="
    fixed
    inset-0
    z-[70]
    bg-black/80
    flex
    items-center
    justify-center
    p-4
  "
>

<div
  className="
    bg-[#0f172a]
    rounded-3xl
    w-full
    max-w-md
    p-6
  "
>

<h2 className="text-2xl font-bold mb-4">
  Update Price
</h2>

<input
  type="number"
  placeholder="Enter new price"
  value={newPrice}
  onChange={(e) =>
    setNewPrice(e.target.value)
  }
  className="
    w-full
    rounded-xl
    p-3
    bg-slate-800
    text-white
    mb-4
  "
/>

<button

  onClick={async () => {

  try {

    // ===== 这里开始 =====

    if (!newPrice) {

      alert("Please enter a price.");
      return;

    }

    const price = Number(newPrice);

    if (price <= 0) {

      alert("Invalid price.");
      return;

    }

    const payload =
      buildUpdatePricePayload(
        BigInt(
          Math.floor(
            price * 1000000
          )
        )
      );

    const initRes =
      await fetch(
        `${API_BASE}/api/marketplace/update-price/init`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            marketplace_listing_id:
              selectedNFT.marketplace_listing_id
          })
        }
      );

    const initData =
      await initRes.json();

    if (!initData.success) {

      alert(initData.error);
      return;

    }

    const listingAddress =
      Address
        .parse(initData.listing_address)
        .toString();

    await tonConnectUI.sendTransaction({

      validUntil:
        Math.floor(
          Date.now() / 1000
        ) + 600,

      messages: [

        {
          address: listingAddress,
          amount: initData.amount,
          payload
        }

      ]

    });

    const verifyRes =
      await fetch(
        `${API_BASE}/api/marketplace/verify-update-price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            marketplace_listing_id:
              selectedNFT.marketplace_listing_id
          })
        }
      );

    const verifyData =
      await verifyRes.json();

    if (!verifyData.success) {

      alert(verifyData.error);
      return;

    }

    await loadAll();

    setShowUpdatePriceModal(false);

    setShowActiveListingModal(false);

    setSelectedNFT(null);

    alert("Price Updated!");

    // ===== 这里结束 =====

  } catch (err: any) {

    console.error(err);

    if (
      err?.constructor?.name ===
      "UserRejectsError"
    ) {

      alert("Transaction cancelled.");
      return;

    }

    alert(
      err?.message ||
      "Transaction failed."
    );

  }

}}
  className="
    w-full
    py-3
    rounded-xl
    bg-cyan-500
    text-black
    font-bold
  "
>
  Confirm
</button>

<button
  onClick={() => {

    setShowUpdatePriceModal(false);

    setNewPrice("");

  }}
  className="
    w-full
    mt-3
    py-3
    rounded-xl
    bg-slate-700
  "
>
  Cancel
</button>

</div>

</div>

)}

{showRelistModal && (

<div
  className="
    fixed
    inset-0
    z-[70]
    bg-black/80
    flex
    items-center
    justify-center
    p-4
  "
>

<div
  className="
    bg-[#0f172a]
    rounded-3xl
    w-full
    max-w-md
    p-6
  "
>

<h2 className="text-2xl font-bold mb-4">
  Relist NFT
</h2>

<input
  type="number"
  placeholder="Enter new price"
  value={relistPrice}
  onChange={(e) =>
    setRelistPrice(e.target.value)
  }
  className="
    w-full
    rounded-xl
    p-3
    bg-slate-800
    text-white
    mb-4
  "
/>

<div className="mb-4">

  <div className="text-gray-400 text-sm mb-2">
    Listing Type
  </div>

  <select
    value={relistListingType}
    onChange={(e) =>
      setRelistListingType(e.target.value)
    }
    className="
      w-full
      rounded-xl
      bg-slate-800
      p-3
      text-white
    "
  >

    <option value="0">
      Fixed Price
    </option>

    <option value="1">
      Auction
    </option>

  </select>
  
{relistListingType === "1" && (

<div className="mt-4">

  <div className="text-gray-400 text-sm mb-2">
    Auction Duration
  </div>

  <select
    value={relistAuctionDuration}
    onChange={(e) =>
      setRelistAuctionDuration(
        e.target.value
      )
    }
    className="
      w-full
      rounded-xl
      bg-slate-800
      p-3
      text-white
    "
  >

    <option value="24">
      24 Hours
    </option>

    <option value="48">
      48 Hours
    </option>

    <option value="72">
      72 Hours
    </option>

  </select>

</div>

)}

</div>

<button

  onClick={async () => {

try {

    if (!relistPrice) {

      alert("Please enter a price.");
      return;

    }

    const price = Number(relistPrice);
	
    if (price <= 0) {

      alert("Invalid price.");
      return;

    }

const durationSeconds =
  Number(relistAuctionDuration) *3600;

const endTime =
  relistListingType === "1"
    ? BigInt(
        Math.floor(Date.now() / 1000) +
        durationSeconds
      )
    : 0n;
	
	const payload =
  buildRelistPayload(
    BigInt(
      Math.floor(price * 1_000_000)
    ),
    BigInt(relistListingType),
    endTime
  );

const initRes =
  await fetch(
    `${API_BASE}/api/marketplace/relist/init`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        marketplace_listing_id:
          selectedNFT.marketplace_listing_id
      })
    }
  );

const initData =
  await initRes.json();

if (!initData.success) {

  alert(initData.error);

  return;

}

const listingAddress =
  Address
    .parse(initData.listing_address)
    .toString();

await tonConnectUI.sendTransaction({

  validUntil:
    Math.floor(
      Date.now() / 1000
    ) + 600,

  messages: [

    {
      address: listingAddress,

      amount: initData.amount,

      payload
    }

  ]

});

const verifyRes =
  await fetch(
    `${API_BASE}/api/marketplace/verify-relist`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        marketplace_listing_id:
          selectedNFT.marketplace_listing_id
      })
    }
  );

const verifyData =
  await verifyRes.json();

if (!verifyData.success) {

  alert(
    verifyData.error
  );

  return;

}

await loadAll();

setShowRelistModal(false);

setShowActiveListingModal(false);

setSelectedNFT(null);

setRelistPrice("");

setRelistListingType("0");

setRelistAuctionDuration("24");

alert("NFT Relisted!");

  } catch (err) {

    console.error(err);

  }

}}
  className="
    w-full
    py-3
    rounded-xl
    bg-cyan-500
    text-black
    font-bold
  "
>
  Confirm
</button>

<button
  onClick={() => {

    setShowRelistModal(false);

    setRelistPrice("");
	
	setRelistListingType("0");

    setRelistAuctionDuration("24");

  }}
  className="
    w-full
    mt-3
    py-3
    rounded-xl
    bg-slate-700
  "
>
  Cancel
</button>

</div>

</div>

)}



{showResumeListingModal && resumeListing && (

<div
  className="
    fixed
    inset-0
    z-[60]
    bg-black/90
    flex
    items-center
    justify-center
    p-4
  "
>

<div
  className="
    bg-[#08162f]
    rounded-3xl
    p-5
    w-full
    max-w-md
  "
>

<h3 className="font-bold text-xl mb-4">
  Continue Listing
</h3>

<div className="mb-4">

  <div className="text-green-400">
    ✅ Listing Contract Created
  </div>

  <div className="text-yellow-400 mt-2">
    Only one step remaining.
  </div>

  <div className="text-sm text-gray-300 mt-1">
    Transfer your NFT into Marketplace Escrow.
  </div>

</div>

<button
  onClick={async () => {

    // 下一步放 Resume Transfer Code
	
	const listingId = resumeListing.id;
	const listingAddress = resumeListing.listing_address;

	if (!listingAddress) {
		alert("Listing address not found");
		return;
		}
	
	const initRes =
  await fetch(
    `${API_BASE}/api/nft/transfer/init`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ownership_id: selectedNFT.ownership_id,
        receiver_wallet: listingAddress
      })
    }
  );

const initData = await initRes.json();

if (!initData.success) {

  alert(
    initData.error ||
    "Transfer init failed"
  );

  return;
}

await tonConnectUI.sendTransaction({

  validUntil: initData.validUntil,

  messages: [

    {
      address: initData.nft_address,
      amount: initData.amount,
      payload: initData.payload
    }

  ]

});

const verifyRes =
  await fetch(
    `${API_BASE}/api/marketplace/verify-listing`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        marketplace_listing_id: listingId
      })
    }
  );

const verifyData = await verifyRes.json();

if (!verifyData.success) {
  alert(verifyData.error);
  return;
}

await loadAll();

setShowResumeListingModal(false);

setShowMarketplaceModal(false);

setShowNFTModal(false);

setSelectedNFT(null);

alert("Marketplace Listing Active!");

  }}
  className="
    w-full
    py-3
    rounded-xl
    bg-cyan-500
    text-black
    font-bold
  "
>
  Continue
</button>

<button
  onClick={() => {

    setShowResumeListingModal(false);

  }}
  className="
    w-full
    mt-3
    py-3
    rounded-xl
    bg-slate-700
  "
>
  Cancel
</button>

</div>

</div>

)}

{/* ===== Offer List Modal ===== */}

{showOffersModal && (

<div
  className="
    fixed
    inset-0
    z-[80]
    bg-black/90
    flex
    items-center
    justify-center
    p-4
  "
>

<div
  className="
    bg-[#08162f]
    rounded-3xl
    w-full
    max-w-md
    p-5
    max-h-[80vh]
    overflow-y-auto
  "
>

<h2 className="text-2xl font-bold mb-4">
  Offers
</h2>

{offers.length === 0 && (

<div className="text-gray-400 text-center py-6">

No Offers Yet

</div>

)}

{offers.map((offer:any)=>(

<div
key={offer.id}
className="
border
border-slate-700
rounded-xl
p-4
mb-3
"
>

<div className="flex justify-between">

<div>

<div className="font-bold">

{offer.username}

</div>

<div className="text-cyan-400 text-sm">

{Number(offer.offer_price).toFixed(2)} USDT

</div>

</div>

<div>

<div
className="
text-xs
text-yellow-400
"
>

{offer.status}

</div>

</div>

</div>

{offer.status==="pending" && (

<button

onClick={()=>{

setSelectedOffer(offer);
setShowAcceptOfferModal(true);
}}

className="
w-full
mt-3
py-2
rounded-xl
bg-yellow-400
text-black
font-bold
"

>

Accept

</button>

)}

</div>

))}

<button

onClick={()=>{

setShowOffersModal(false);

}}

className="
w-full
mt-3
py-3
rounded-xl
bg-slate-700
"

>

Close

</button>

</div>

</div>

)}

{showAcceptOfferModal &&
 selectedOffer && (

<div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4">

<div className="bg-[#08162f] rounded-3xl w-full max-w-md p-6">

<h2 className="text-2xl font-bold mb-4">
Accept Offer
</h2>

<div className="space-y-3">

<div>

<div className="text-gray-400 text-sm">
Current Listing Price
</div>

<div className="font-bold">
{Number(selectedNFT.price_usdt).toFixed(2)} USDT
</div>

</div>

<div>

<div className="text-gray-400 text-sm">
Offer Price
</div>

<div className="font-bold text-yellow-400">
{Number(selectedOffer.offer_price).toFixed(2)} USDT
</div>

</div>

<div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm">

Accepting this offer will reserve
this NFT for the buyer.

The buyer has 24 hours to
complete the payment.

</div>

</div>

<button
disabled={!selectedOffer}
onClick={async () => {

  try {

    if (!selectedOffer) {

  alert("Offer not found.");

  return;

}

const acceptRes =
  await fetch(
    `${API_BASE}/api/marketplace/offer/accept`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({

        offer_id:
          selectedOffer.id,

        seller_id:
          user?.id

      })
    }
  );

const acceptData =
  await acceptRes.json();

if (!acceptData.success) {

  alert(acceptData.error);
  return;

}

    await loadAll();

    await loadOffers();

    setShowAcceptOfferModal(false);

    setShowOffersModal(false);

    setSelectedOffer(null);

    setShowActiveListingModal(false);

    setSelectedNFT(null);

    alert("Offer Accepted!");

    // ===== 这里结束 =====

  } catch (err: any) {

    console.error(err);

    if (
      err?.constructor?.name ===
      "UserRejectsError"
    ) {

      alert("Transaction cancelled.");
      return;

    }

    alert(
      err?.message ||
      "Transaction failed."
    );

  }

}}

className="
w-full
mt-5
py-3
rounded-xl
bg-yellow-400
text-black
font-bold
"

>

Continue

</button>

<button

onClick={()=>{

setShowAcceptOfferModal(false);

}}

className="
w-full
mt-3
py-3
rounded-xl
bg-slate-700
"

>

Cancel

</button>

</div>

</div>

)}

{/* MINT HISTORY */}

{activeTab === "mint" && (

  <div className="space-y-3">

    {mintHistory.length === 0 && (

      <div className="bg-[#08162f] rounded-2xl p-6 text-center text-gray-400">
        No Mint History
      </div>

    )}

    {mintHistory.map((item) => (

      <div
        key={item.id}
        className="
          bg-[#08162f]
          rounded-2xl
          p-3
        "
      >

        <div className="flex gap-3">

          <img
            src={item.thumbnail_url}
            alt=""
            className="
              w-20
              h-20
              rounded-xl
              object-cover
            "
          />

          <div className="flex-1">

            <div className="font-bold">

              {item.title ||
                "Untitled NFT"}

            </div>

            <div
              className={`
                text-sm
                mt-1
                ${
                  item.mint_status === "minted"
                    ? "text-green-400"
                    : item.mint_status === "failed"
                    ? "text-red-400"
                    : item.mint_status === "processing"
                    ? "text-cyan-400"
                    : "text-yellow-400"
                }
              `}
            >
              {item.mint_status}
            </div>

            <div
              className="
                text-xs
                text-gray-400
                mt-2
              "
            >
              Created:
              {" "}
              {new Date(
                item.created_at
              ).toLocaleDateString()}
            </div>

            {item.minted_at && (

              <div
                className="
                  text-xs
                  text-green-400
                  mt-1
                "
              >
                Minted:
                {" "}
                {new Date(
                  item.minted_at
                ).toLocaleDateString()}
              </div>

            )}

            {item.error_message && (

              <div
                className="
                  text-xs
                  text-red-400
                  mt-1
                "
              >
                 Mint Failed
              </div>

            )}

          </div>

        </div>

      </div>

    ))}

  </div>

)}

      </div>

    </div>
  );
}