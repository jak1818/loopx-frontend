"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppData } from "@/providers/AppDataProvider";
import { useTonConnectUI } from "@tonconnect/ui-react";

type Props = {
  show: boolean;
  onClose: () => void;
  feedItem: any;
};

export default function GiftSheet({
  show,
  onClose,
  feedItem,
}: Props) {

  const router = useRouter();
  const { user } = useAppData();
  const [tonConnectUI] = useTonConnectUI();
  const [diamondGifts, setDiamondGifts] = useState<any[]>([]);
  const [pointsGifts, setPointsGifts] = useState<any[]>([]);
  const [userNfts, setUserNfts] = useState<any[]>([]);
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [showNftModal, setShowNftModal] = useState(false);
  const [toast, setToast] = useState("");
  const [nftTab, setNftTab] = useState<"my" | "platform">("my");
  const [sendingNft, setSendingNft] = useState(false);
  
  const [activeTab, setActiveTab] =
    useState<
      "diamond" |
      "nft" |
      "loopx"
    >("loopx");
	
useEffect(() => {

  if (show) {

    window.dispatchEvent(
      new Event("gift-open")
    );

  } else {

    window.dispatchEvent(
      new Event("gift-close")
    );

  }

  return () => {

    window.dispatchEvent(
      new Event("gift-close")
    );

  };

}, [show]);	
	
	
useEffect(() => {
  if (!show) return;

  fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gifts?type=diamond`
  )
  
    .then((r) => r.json())
    .then((data) => {
      setDiamondGifts(
        data.data || []
      );
    })
    .catch(console.error);
	
	fetch(
  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gifts?type=points`
)
  .then((r) => r.json())
  .then((data) => {
    setPointsGifts(
      data.data || []
    );
  })
  .catch(console.error);

}, [show]);

useEffect(() => {
  if (
    !show ||
    activeTab !== "nft" ||
    !user?.id
  ) {
    return;
  }

  fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/nft/my-nfts/${user.id}`
  )
    .then((r) => r.json())
    .then((data) => {
      setUserNfts(
        data.data || []
      );
    })
    .catch(console.error);

}, [
  show,
  activeTab,
  user?.id,
]);

  if (!show) return null;
  
  return (
  <>
    <div
      className="
        fixed
        inset-0
        z-[9999]
        bg-black/60
        flex
        items-end
      "
      onClick={onClose}
    >

      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          w-full
          h-[70vh]
          bg-[#1f1f1f]
          rounded-t-3xl
          flex
          flex-col
        "
      >

        {/* Drag Bar */}
      <div
  className="
    flex
    items-center
    justify-between
    px-4
    pt-3
  "
>

  <div className="w-8" />

  <div
    className="
      w-12
      h-1
      rounded-full
      bg-gray-500
    "
  />

  <button
    onClick={onClose}
    className="
      text-gray-400
      text-xl
      leading-none
    "
  >
    ✕
  </button>

</div>

   

        {/* Creator */}
        <div className="px-4 pt-3">

          <div className="text-gray-400 text-sm">
            Send Gift To
          </div>

          <div className="text-white font-medium">
            {feedItem?.username ||
             "Creator"}
          </div>

        </div>

        {/* Content */}
        <div
          className="
            flex-1
            overflow-y-auto
			overscroll-contain
            px-4
            pt-4
          "
		  style={{
    WebkitOverflowScrolling: "touch",
  }}
        >
		
		{activeTab === "loopx" && (

  <div
    className="
      grid
      grid-cols-4
      gap-4
    "
  >

    {pointsGifts.map((gift) => (

      <GiftCard
        key={gift.id}
        gift={gift}
        feedItem={feedItem}
		giftType="points"
      />

    ))}
	

  </div>

)}

          {activeTab === "diamond" && (

            <div
              className="
                grid
                grid-cols-4
                gap-4
              "
            >

              {/* TODO API */}

             {diamondGifts.map((gift) => (

  <GiftCard
    key={gift.id}
    gift={gift}
    feedItem={feedItem}
	giftType="diamond"
  />

))}

            </div>

          )}

          {activeTab === "nft" && (
		   <>
		   
		       <div
      className="
        flex
        gap-2
        mb-4
      "
    >

      <button
        onClick={() =>
          setNftTab("my")
        }
        className={`
          px-3
          py-1
          rounded-full
          text-xs
          ${
            nftTab === "my"
              ? "bg-pink-500 text-white"
              : "bg-zinc-800 text-gray-300"
          }
        `}
      >
        My NFTs
      </button>

      <button
        onClick={() =>
          setNftTab("platform")
        }
        className={`
          px-3
          py-1
          rounded-full
          text-xs
          ${
            nftTab === "platform"
              ? "bg-pink-500 text-white"
              : "bg-zinc-800 text-gray-300"
          }
        `}
      >
        Platform NFTs
      </button>

    </div>

            <div
              className="
                grid
                grid-cols-4
                gap-3
              "
            >

              {/* TODO:
                  GET /api/nft/my-nfts
              */}
			  
			  {nftTab === "my" && (

  <>

    {userNfts.length === 0 && (

      <div
        className="
          col-span-4
          text-center
          text-gray-400
          py-10
        "
      >
        <p>No NFT Found</p>

        <button
          onClick={() =>
            router.push(
              "/creator/assets/create"
            )
          }
          className="
            mt-4
            px-4
            py-2
            rounded-full
            bg-pink-500
            text-white
            text-sm
          "
        >
          Create NFT
        </button>
      </div>

    )}

    {userNfts.map((nft) => (

      <NFTCard
        key={nft.ownership_id}
        image={nft.thumbnail_url}
        title={nft.title}
        onClick={() => {
          setSelectedNft(nft);
          setShowNftModal(true);
        }}
      />

    ))}

  </>

)}

{nftTab === "platform" && (

  <div
    className="
      col-span-4
      text-center
      text-gray-400
      py-10
    "
  >
    Platform NFTs Coming Soon
  </div>

)}

            </div>
			
			 </>

          )}

       

        </div>

        {/* Bottom Bar */}
        <div
          className="
            border-t
            border-zinc-700
            px-4
            py-3
            flex
            items-center
            justify-between
          "
        >

          <div className="flex gap-3">

            <button
              onClick={() =>
                setActiveTab(
                  "loopx"
                )
              }
              className={`
                px-4
                py-2
                rounded-full
                text-sm
                ${
                  activeTab ===
                  "loopx"
                    ? "bg-pink-500 text-white"
                    : "bg-zinc-800 text-gray-300"
                }
              `}
            >
              Popular
            </button>

            <button
              onClick={() =>
                setActiveTab(
                  "diamond"
                )
              }
              className={`
                px-4
                py-2
                rounded-full
                text-sm
                ${
                  activeTab ===
                  "diamond"
                    ? "bg-pink-500 text-white"
                    : "bg-zinc-800 text-gray-300"
                }
              `}
            >
              Premium
            </button>

            <button
              onClick={() =>
                setActiveTab(
                  "nft"
                )
              }
              className={`
                px-4
                py-2
                rounded-full
                text-sm
                ${
                  activeTab ===
                  "nft"
                    ? "bg-pink-500 text-white"
                    : "bg-zinc-800 text-gray-300"
                }
              `}
            >
              Collectibles NFT
            </button>

          </div>

          <button
            onClick={() =>
              router.push(
                "/buy-diamonds"
              )
            }
            className="
              bg-pink-500
              text-white
              px-4
              py-2
              rounded-full
              text-sm
              font-medium
            "
          >
            Buy 💎
          </button>

        </div>
		
		 {/* NFT Preview Modal */}

        {showNftModal &&
          selectedNft && (

          <div
            className="
              fixed
              inset-0
              z-[10001]
              bg-black/80
              flex
              items-center
              justify-center
              px-6
            "
          >

            <div
              className="
                bg-zinc-900
                rounded-2xl
                overflow-hidden
                w-full
                max-w-sm
              "
            >

              <img
                src={
                  selectedNft.thumbnail_url
                }
                className="
                  w-full
                  aspect-square
                  object-cover
                "
              />

              <div className="p-4">

                <div
                  className="
                    text-white
                    font-semibold
                    text-lg
                  "
                >
                  {selectedNft.title}
                </div>

                <div
                  className="
                    text-gray-400
                    text-sm
                    mt-1
                  "
                >
                  Token #
                  {selectedNft.token_id}
                </div>

                <div
                  className="
                    text-gray-300
                    text-sm
                    mt-4
                  "
                >
                  Send this NFT to
                  {" "}
                  <span
                    className="
                      text-pink-400
                    "
                  >
                    {feedItem?.username}
                  </span>
                  ?
                </div>

                <div
                  className="
                    flex
                    gap-3
                    mt-6
                  "
                >

                  <button
                    onClick={() =>
                      setShowNftModal(
                        false
                      )
                    }
                    className="
                      flex-1
                      py-3
                      rounded-xl
                      bg-zinc-700
                      text-white
                    "
                  >
                    Cancel
                  </button>

           <button
onClick={async () => {
	
	if (sendingNft) return;

setSendingNft(true);
	
	setToast(
  "STEP 1"
);

setTimeout(() => {
  setToast("");
}, 1500);

  if (
  !feedItem?.wallet_address
) {

  setToast(
    "Creator has not connected a wallet yet."
  );

  setTimeout(() => {
    setToast("");
  }, 2500);

  return;

}

try {

  const initRes =
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/nft/transfer/init`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({

          ownership_id:
            selectedNft.ownership_id,

          receiver_wallet:
            feedItem.wallet_address

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

  console.log(
    "NFT INIT",
    initData
  );
  
try {

  const txData = {

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

};


const tx =
  await tonConnectUI.sendTransaction(
    txData
  );


} catch (err: any) {

  console.error(err);
  
   setSendingNft(false);
  
  return;

}
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
          selectedNft.ownership_id,
		  sender_user_id: user.id,
		  receiver_user_id: feedItem.user_id
      })
    }
  );

const verifyData =
  await verifyRes.json();
  
  if (!verifyData.success) {

setSendingNft(false);
  alert(
    verifyData.error ||
    "NFT transfer verification failed"
  );

  return;

}
  
 if (verifyData.success) {

setSendingNft(false);

  setUserNfts(prev =>
    prev.filter(
      nft =>
        nft.ownership_id !==
        selectedNft.ownership_id
    )
  );

  setShowNftModal(false);

  setSelectedNft(null);
  
  onClose();

  alert(
    "🎁 NFT sent successfully!"
  );

}


} catch (err) {

  console.error(err);
 setSendingNft(false);
 
}

}}
  disabled={sendingNft}
className="
  flex-1
  py-3
  rounded-xl
  bg-pink-500
  text-white
  disabled:opacity-50
"
>
 {sendingNft
    ? "Sending..."
    : "Send NFT"}
</button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
	
	{toast && (

  <div
    className="
      fixed
      top-6
      left-1/2
      -translate-x-1/2
      z-[10050]
      bg-black/90
      text-white
      px-4
      py-3
      rounded-xl
      text-sm
      border
      border-zinc-700
    "
  >
    {toast}
  </div>

)}
</>
  );
}

function GiftCard({
  gift,
  feedItem,
  giftType,
}: any) {
	
	      const { user } = useAppData();
		  
	 const handleSendGift = async () => {
		 
		 console.log(
  "CURRENT USER",
  user
);
	
	console.log({
  sender_id: user?.id,
  video_id: feedItem?.id,
  gift_id: gift?.id,
  type:
    giftType === "points"
      ? "points"
      : "paid",
});

    try {


		
	

      const res = await fetch(
       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-gift`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_id: user?.id,
            video_id: feedItem.id,
            gift_id: gift.id,
            type:
				giftType === "points"
				? "points"
				: "paid",
          }),
        }
      );

      const data = await res.json();
	  
	  console.log(
  "SEND GIFT RESPONSE",
  data
);

      if (!data.success) {
        alert(data.error);
        return;
      }

      alert("Gift sent ❤️");

    } catch (err) {

      console.error(err);

      alert("Gift failed");
    }
  };

  return (
    <button
	  onClick={handleSendGift}
      className="
        flex
        flex-col
        items-center
		gap-2
      "
    >

      <div
        className="
          w-16
          h-16
          rounded-2xl
          bg-zinc-800
          flex
          items-center
          justify-center
          text-3xl
        "
      >
        <img
  src={gift.image_url}
  alt={gift.name}
  className="
    w-16
    h-16
    object-contain
    mx-auto
  "
/>
      </div>

      <div className="text-white text-xs mt-2">
        {gift.name}
      </div>

      <div className="text-yellow-400 text-xs">
         {giftType === "points"
    ? "🪙"
    : "💎"}

  {" "}
  {gift.price}
      </div>

    </button>
  );
}

function NFTCard({
  image,
  title,
  onClick,
}: any) {

  return (
    <button
	  onClick={onClick}
      className="
        bg-zinc-800
        rounded-lg
        overflow-hidden
      "
    >

      <img
        src={image}
        alt={title}
        className="
          w-full
          h-16
          object-cover
        "
      />

      <div className="p-1.5">

        <div className="text-white text-xs truncate">
          {title}
        </div>

      </div>

    </button>
  );
}