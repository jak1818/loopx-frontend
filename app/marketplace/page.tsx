"use client";

import { useEffect, useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useAppData } from "@/providers/AppDataProvider";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://cycling-directive-rational-buys.trycloudflare.com";

export default function MarketplacePage() {

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [myAuctionOrders, setMyAuctionOrders] = useState([]);
  const [selected, setSelected] = useState<any>(null);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [auctionDetail, setAuctionDetail] = useState<any>(null);
  const [loadingAuction, setLoadingAuction] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [marketplaceTab, setMarketplaceTab] = useState("marketplace");
  const [orderTab, setOrderTab] = useState("all");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidPrice, setBidPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [payingOffer, setPayingOffer] = useState(false);
  const [buyingNFT, setBuyingNFT] = useState(false);
  const [myPurchases, setMyPurchases] = useState([]);
  const [tonConnectUI] = useTonConnectUI();
  const { user } = useAppData();
  
  async function buyNFT(item: any) {
	  
	    if (buyingNFT) {

        return;

    }

    setBuyingNFT(true);
try {
	  
	  if (!user?.id) {
  alert("User not loaded.");
  return;
}

if (!tonConnectUI.account?.address) {
  alert("Please connect your TON wallet.");
  return;
}

  const res = await fetch(
    `${API_URL}/api/marketplace/buy/init`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        marketplace_listing_id: item.id,
		buyer_id: user?.id,  
		buyer_wallet: tonConnectUI.account?.address
      })
    }
  );

const data = await res.json();

if (!data.success) {
  alert(data.error);
  return;
}

await tonConnectUI.sendTransaction({
    validUntil:
        Math.floor(Date.now() / 1000) + 600,

    messages: [
        {
            address: data.buyer_jetton_wallet,
            amount: "100000000", // 0.1 TON 给 Jetton Wallet 做 gas
            payload: data.jetton_payload
        }
    ]
});

const verifyRes = await fetch(
  `${API_URL}/api/marketplace/verify-buy`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      marketplace_listing_id: item.id
    })
  }
);

const verifyData = await verifyRes.json();

if (!verifyData.success) {
  alert(verifyData.error);
  return;
}

await fetchListings();

setSelected(null);

alert("NFT purchased successfully!");


} finally {

    setBuyingNFT(false);

}
}

async function proceedPayment(offer: any) {

if (payingOffer) {

    return;

}

setPayingOffer(true);

try {

if (!user?.id) {

    alert("User not loaded.");

    return;

}

if (!tonConnectUI.account?.address) {

    alert("Please connect your TON wallet.");

    return;

}

const res = await fetch(
`${API_URL}/api/marketplace/offer/payment/init`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

offer_id:offer.id,

buyer_id:user.id,

buyer_wallet:
tonConnectUI.account.address

})
}
);

const data=await res.json();

if (!data.success) {

    alert(data.error);

    return;

}

await tonConnectUI.sendTransaction({

    validUntil:
        Math.floor(Date.now()/1000)+600,

    messages:[
        {

            address:
                data.buyer_jetton_wallet,

            amount:"100000000",

            payload:
                data.jetton_payload

        }

    ]

});

const verifyRes = await fetch(
    `${API_URL}/api/marketplace/offer/verify-payment`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
           offer_id: offer.id
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

await fetchListings();
await fetchMyOffers();
setSelected(null);
alert("Offer payment completed!");

} finally {

    setPayingOffer(false);

}
}

async function proceedAuctionPayment(auction: any) {

if (payingOffer) {

    return;

}

setPayingOffer(true);

try {

if (!user?.id) {

    alert("User not loaded.");

    return;

}

if (!tonConnectUI.account?.address) {

    alert("Please connect your TON wallet.");

    return;

}

const res = await fetch(
`${API_URL}/api/marketplace/auction/payment/init`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

auction_id: auction.id,

buyer_id: user.id,

buyer_wallet:
tonConnectUI.account.address

})
}
);

const data = await res.json();

if (!data.success) {

    alert(data.error);

    return;

}

await tonConnectUI.sendTransaction({

    validUntil:
        Math.floor(Date.now()/1000)+600,

    messages:[
        {

            address:
                data.buyer_jetton_wallet,

            amount:"100000000",

            payload:
                data.jetton_payload

        }

    ]

});

const verifyRes = await fetch(
`${API_URL}/api/marketplace/auction/verify-payment`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

auction_id: auction.id

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

await fetchAuctions();

await fetchMyAuctionOrders();

alert("Auction payment completed!");

} finally {

setPayingOffer(false);

}

}

async function makeOffer(item: any) {
	
	if (submittingOffer) {

    return;

}

    setSubmittingOffer(true);

try {
	
    if (!user?.id) {
        alert("User not loaded.");
        return;
    }
	
	const price = Number(offerPrice);

if (isNaN(price) || price <= 0) {

    alert("Please enter a valid offer price.");

    return;

}

    const res = await fetch(
        `${API_URL}/api/marketplace/offer/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                listing_id: item.id,
                buyer_id: user.id,
                offer_price: price
            })
        }
    );

    const data = await res.json();

    if (!data.success) {
        alert(data.error);
        return;
    }

    alert("Offer submitted!");

    setShowOfferModal(false);
	
	setSelected(null);

    setOfferPrice("");
	
	await fetchMyOffers();

} finally {

    setSubmittingOffer(false);

}
}

async function placeBid() {

    try {

        const res = await fetch(

            `${API_URL}/api/marketplace/auction/bid`,

            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({

                    auction_id: selectedAuction.id,

                    bidder_id: user.id,

                    bid_price: bidPrice,

                }),

            }

        );
		
		   console.log("HTTP Status:", res.status);

        const text = await res.text();

        console.log("Response:", text);

        const data = JSON.parse(text);
		
		if (data.success) {

    alert("Bid placed successfully!");

    setShowBidModal(false);

    setBidPrice("");

    await fetchAuctions();

    await fetchAuctionDetail(selectedAuction.id);

} else {

    alert(data.error);

}


    } catch (err) {

        console.error(err);

        alert(err.message);

    }

}
	
useEffect(() => {

  fetchListings();

  fetchAuctions();

  if (user?.id) {

    fetchMyOffers();
	
	fetchMyAuctionOrders();
	
	fetchMyPurchases();
	

  }

}, [user?.id]);

  async function fetchListings() {
    try {

      const res = await fetch(
        `${API_URL}/api/marketplace/listings`
      );

      const data =
        await res.json();

      if (data.success) {
		  
		console.log(data.listings);
        setListings(
          data.listings || []
        );
      }

    } catch (err) {

      console.error(
        "Marketplace Error",
        err
      );

    } finally {

      setLoading(false);

    }
  }
  
  async function fetchAuctions() {

  try {

    const res = await fetch(
      `${API_URL}/api/marketplace/auction/list`
    );

    const data = await res.json();

    if (data.success) {

      setAuctions(
        data.auctions || []
      );

    }

  } catch (err) {

    console.error(
      "Auction Error",
      err
    );

  }

}

async function fetchAuctionDetail(id: string) {

  setLoadingAuction(true);

  try {

    const res = await fetch(
      `${API_URL}/api/marketplace/auction/${id}`
    );

    const data = await res.json();

 if (data.success) {

  console.log(data);

  setAuctionDetail(data);

  setTimeLeft(
    formatTimeLeft(
      data.auction.end_time
    )
  );

}

  } catch (err) {

    console.error(err);

  } finally {

    setLoadingAuction(false);

  }

}

useEffect(() => {

  if (!auctionDetail) return;

  const timer = setInterval(() => {

    setTimeLeft(
      formatTimeLeft(
        auctionDetail.auction.end_time
      )
    );

  }, 60000);

  return () => clearInterval(timer);

}, [auctionDetail]);

function formatTimeLeft(endTime: string) {

  const diff =
    new Date(endTime).getTime() - Date.now();

  if (diff <= 0) {

    return "Auction Ended";

  }

  const hours =
    Math.floor(diff / (1000 * 60 * 60));

  const minutes =
    Math.floor(
      (diff % (1000 * 60 * 60)) /
      (1000 * 60)
    );

  return `${hours}h ${minutes}m`;

}
  
  async function fetchMyOffers() {

  if (!user?.id) return;

  const res = await fetch(
    `${API_URL}/api/marketplace/offer/my/${user.id}`
  );

  const data = await res.json();

  if (data.success) {

    setMyOffers(
      data.offers || []
    );

  }

}

async function fetchMyAuctionOrders() {
  
  try {

    const res = await fetch(
      `${API_URL}/api/marketplace/auction/my-orders/${user.id}`
    );

    const data = await res.json();
	
	console.log("Auction Orders:", data);

    if (data.success) {
	  
      setMyAuctionOrders(data.orders);

    }

  } catch (err) {

    console.error(err);

  }

}

async function fetchMyPurchases() {

  try {

    const res = await fetch(
      `${API_URL}/api/marketplace/purchases/${user.id}`
    );

    const data = await res.json();

    if (data.success) {
	   
      setMyPurchases(data.purchases);

    }

  } catch (err) {

    console.error(err);

  }

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

      {/* Header */}

      <div className="
        sticky
        top-0
        z-20
        bg-black
        px-4
        py-4
        border-b
        border-slate-800
      ">
        <h1 className="
          text-3xl
          font-bold
          text-center
        ">
          NFT Marketplace
        </h1>
      </div>

      {/* Filters */}

      <div className="
        flex
        gap-2
        px-4
        py-4
      ">
        <button
		  onClick={() => setMarketplaceTab("marketplace")}
           className={`
    px-4
    py-2
    rounded-xl
    font-bold
    ${
      marketplaceTab === "marketplace"
        ? "bg-yellow-400 text-black"
        : "bg-slate-900 text-white"
    }
  `}
        >
          Marketplace
        </button>

        <button
		  onClick={() => setMarketplaceTab("auction")}
           className={`
    px-4
    py-2
    rounded-xl
    ${
      marketplaceTab === "auction"
        ? "bg-yellow-400 text-black"
        : "bg-slate-900 text-white"
    }
  `}
        >
          Auction
        </button>
		
		<button
  onClick={() => setMarketplaceTab("offers")}
  className={`
    px-4
    py-2
    rounded-xl
    ${
      marketplaceTab === "offers"
        ? "bg-yellow-400 text-black"
        : "bg-slate-900 text-white"
    }
  `}
>
  My Orders
</button>

      </div>

      {/* Loading */}

      {loading && (
        <div className="
          text-center
          py-10
        ">
          Loading Marketplace...
        </div>
      )}

      {/* Empty */}
      {!loading &&
 marketplaceTab === "marketplace" &&
 listings.length === 0 && (

    <div className="
      text-center
      py-20
      text-slate-400
    ">

      No NFTs Listed

    </div>

)}

{!loading &&
 marketplaceTab === "auction" &&
 auctions.length === 0 && (

    <div className="
      text-center
      py-20
      text-slate-400
    ">

      No Auctions

    </div>

)}

      {/* Grid */}
{marketplaceTab !== "offers" && (

      <div className="
        grid
        grid-cols-2
        gap-3
        px-4
      ">
	  {/* Marketplace */}

{marketplaceTab === "marketplace" && (
<>

        {listings.map(
          (item: any) => (

          <div
            key={item.id}
            onClick={() =>
              setSelected(item)
            }
            className="
              bg-[#02153d]
              rounded-2xl
              overflow-hidden
              cursor-pointer
            "
          >

            <img
              src={
                item.thumbnail_url
              }
              alt=""
              className="
                w-full
                h-44
                object-cover
              "
            />

            <div className="p-3">

              <h3 className="
                font-bold
                text-lg
                line-clamp-1
              ">
                {item.title}
              </h3>

              <p className="
                text-xs
                text-cyan-400
                mt-2
                line-clamp-1
              ">
                @{item.username}
              </p>

              <div className="
                mt-3
                text-yellow-400
                font-bold
              ">
				💰 {Number(item.price_usdt).toFixed(2)}  USDT
              </div>

              <div className="
                mt-2
                text-yellow-400
                text-sm
                font-bold
              ">
                NFT Details →
              </div>

            </div>

          </div>

        ))}
		
	</>
	)}
	
	{/* Auction */}
	{marketplaceTab === "auction" && (
	<>
		
		{auctions.map((item:any)=>(

<div
key={item.id}
onClick={() => {

    setSelectedAuction(item);

    fetchAuctionDetail(item.id);

}}
className="
bg-[#02153d]
rounded-2xl
overflow-hidden
cursor-pointer
border
border-yellow-500
"
>

<img
src={item.thumbnail_url}
className="
w-full
h-44
object-cover
"
/>

<div className="p-3">

<div className="
text-xs
text-yellow-400
font-bold
">
🔥 Auction
</div>

<h3 className="
font-bold
text-lg
line-clamp-1
mt-1
">
{item.title}
</h3>

<div className="
mt-3
text-white
text-sm
">

Current Bid

<div className="
font-bold
text-cyan-400
">

{
item.current_bid
?

Number(item.current_bid).toFixed(2)

:

"No bids yet"

}

</div>

</div>

<div
className="
mt-3
bg-yellow-500
rounded-lg
text-black
text-center
font-bold
py-2
"
>

View Auction →

</div>

</div>

</div>

))}

</>

)}

      </div>
	  
	  )}

{marketplaceTab === "offers" && (

<>

<div
className="
flex
gap-2
px-4
pb-4
overflow-x-auto
"
>

<button
onClick={() => setOrderTab("all")}
className={`
px-4
py-2
rounded-xl
font-bold
${
orderTab === "all"
? "bg-yellow-400 text-black"
: "bg-slate-900 text-white"
}
`}
>
All
</button>

<button
onClick={() => setOrderTab("purchases")}
className={`
px-4
py-2
rounded-xl
font-bold
${
orderTab === "purchases"
? "bg-yellow-400 text-black"
: "bg-slate-900 text-white"
}
`}
>
Purchases
</button>

<button
onClick={() => setOrderTab("offers")}
className={`
px-4
py-2
rounded-xl
font-bold
${
orderTab === "offers"
? "bg-yellow-400 text-black"
: "bg-slate-900 text-white"
}
`}
>
Offers
</button>

<button
onClick={() => setOrderTab("auctions")}
className={`
px-4
py-2
rounded-xl
font-bold
${
orderTab === "auctions"
? "bg-yellow-400 text-black"
: "bg-slate-900 text-white"
}
`}
>
Auctions
</button>

</div>

<div className="space-y-3 px-4">

{orderTab === "offers" &&
myOffers.length === 0 && (

<div
className="
rounded-2xl
bg-[#02153d]
p-6
text-center
text-slate-400
"
>

No Offers

</div>

)}

{(orderTab === "all" || orderTab === "offers") && (

myOffers.map((offer:any)=>(

<div
key={offer.id}
className="
bg-[#02153d]
rounded-2xl
overflow-hidden
"
>

<img
src={offer.thumbnail_url}
alt=""
className="
w-full
h-44
object-cover
"
/>

<div className="p-4">

<div className="font-bold text-lg">
{offer.title}
</div>

<div className="text-cyan-400 text-sm mt-2">
Seller: @{offer.seller_username}
</div>

<div className="text-yellow-400 font-bold mt-2">
Offer:
{Number(
offer.offer_price
).toFixed(2)}
{" "}
USDT
</div>

<div
className={`
mt-2
font-bold
flex
items-center
gap-2
${
offer.status === "accepted"
? "text-yellow-400"
: offer.status === "completed"
? "text-green-400"
: offer.status === "expired"
? "text-red-400"
: offer.status === "pending"
? "text-cyan-400"
: "text-gray-400"
}
`}
>

{offer.status === "accepted" && "🟡 Awaiting Payment"}

{offer.status === "completed" && "🟢 Completed"}

{offer.status === "expired" && "🔴 Expired"}

{offer.status === "pending" && "🔵 Pending"}

{offer.status === "rejected" && "⚫ Rejected"}


{offer.status === "accepted" && (

<button
disabled={payingOffer}
onClick={() => {
 proceedPayment(offer);

}}

className={`
w-full
mt-4
py-3
rounded-xl
font-bold
${
payingOffer
?
"bg-gray-500 text-gray-300 cursor-not-allowed"
:
"bg-yellow-400 text-black"
}
`}

>

{payingOffer
?
"Processing..."
:
"Proceed Payment"
}

</button>

)}


</div>

</div>

</div>

))

)}

{orderTab === "auctions" &&
myAuctionOrders.length === 0 && (

<div
className="
rounded-2xl
bg-[#02153d]
p-6
text-center
text-slate-400
"
>

No Auctions

</div>

)}

{(orderTab === "all" || orderTab === "auctions") && (

myAuctionOrders.map((auction:any)=>(

<div
key={auction.id}
className="
bg-[#02153d]
rounded-2xl
overflow-hidden
mt-3
"
>

<img
src={auction.thumbnail_url}
alt=""
className="
w-full
h-44
object-cover
"
/>

<div className="p-4">

<div className="font-bold text-lg">
{auction.title}
</div>

<div className="text-cyan-400 text-sm mt-2">
Seller: @{auction.seller_username}
</div>

<div className="text-yellow-400 font-bold mt-2">
Current Bid:
{" "}
{Number(auction.current_bid).toFixed(2)}
{" "}
USDT
</div>

<div
className={`
mt-2
font-bold
${
auction.status === "reserved"
? "text-yellow-400"
: auction.status === "completed"
? "text-green-400"
: auction.status === "expired"
? "text-red-400"
: "text-cyan-400"
}
`}
>

{auction.status === "reserved" && "🟡 Awaiting Payment"}

{auction.status === "completed" && "🟢 Completed"}

{auction.status === "expired" && "🔴 Expired"}

</div>

{auction.status === "reserved"
&&
auction.winner_id === user.id && (

<button
disabled={payingOffer}
onClick={() => {

    proceedAuctionPayment(auction);

}}
className={`
w-full
mt-4
py-3
rounded-xl
font-bold
${
payingOffer
?
"bg-gray-500 text-gray-300 cursor-not-allowed"
:
"bg-yellow-400 text-black"
}
`}
>

{payingOffer
?
"Processing..."
:
"Proceed Payment"
}

</button>

)}

</div>

</div>

))

)}


{orderTab === "purchases" &&
myPurchases.length === 0 && (

<div
className="
rounded-2xl
bg-[#02153d]
p-6
text-center
text-slate-400
"
>

No Purchases

</div>

)}

{(orderTab === "all" || orderTab === "purchases") && (

myPurchases.map((purchase:any)=>(

<div
key={purchase.id}
className="
bg-[#02153d]
rounded-2xl
overflow-hidden
"
>

<img
src={purchase.thumbnail_url}
alt=""
className="
w-full
h-44
object-cover
"
/>

<div className="p-4">

<div className="font-bold text-lg">
{purchase.title}
</div>

<div
className="
mt-2
text-green-400
font-bold
"
>

🟢 Purchased

</div>

</div>

</div>

))

)}

{orderTab === "all" &&
myOffers.length===0 &&
myAuctionOrders.length===0 &&
myPurchases.length===0 && (

<div
className="
rounded-2xl
bg-[#02153d]
p-6
text-center
text-slate-400
"
>

No Orders

</div>

)}

</div>

</>

)}

      {/* Modal */}

      {selected && (

        <div
          className="
            fixed
            inset-0
            bg-black/90
            z-50
            overflow-y-auto
            p-4
          "
        >

          <div
            className="
				max-w-md
				mx-auto
				mt-6
				bg-[#02153d]
				rounded-3xl
				overflow-hidden
			"
          >
		  
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
    onClick={() => setSelected(null)}
    className="
      text-white
      text-xl
    "
  >
    ✕
  </button>

</div>

            <img
              src={
                selected.thumbnail_url
              }
              alt=""
              className="
                w-full
                h-60
                object-cover
                rounded-2xl
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
          {selected.title}
        </div>

      </div>

      <div>

        <div className="text-sm text-gray-400">
          Price
        </div>

        <div className="font-bold text-yellow-400">
          💰 {Number(selected.price_usdt).toFixed(2)} USDT
        </div>

      </div>

    </div>

  </div>

  <div className="mb-3">

    <div className="text-sm text-gray-400">
      Description
    </div>

    <div>
      {selected.description}
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
      {selected.nft_address}
    </div>

  </div>


</div>

           

{selected.seller_id !== user?.id && (
<>
 <button
             disabled={buyingNFT}
             onClick={() => {
				buyNFT(selected);
				}}
              className={`
				w-full
				mt-5
				py-3
				rounded-xl
				font-bold
			${
			buyingNFT
			?
			"bg-gray-500 text-gray-300 cursor-not-allowed"
				:
				"bg-yellow-400 text-black"
				}
				`}

            >
             {buyingNFT
?
"Processing..."
:
"Buy NFT"
}
            </button>
			
			<button
    onClick={() => {
        setShowOfferModal(true);
    }}
    className="
        w-full
        mt-3
        bg-cyan-500
        text-white
        py-3
        rounded-xl
        font-bold
    "
>
    Make Offer
</button>
</>
)}

           

          </div>

        </div>

      )}
	  
{/* Auction Modal */}

{selectedAuction && (

<div
  className="
    fixed
    inset-0
    bg-black/90
    z-50
    overflow-y-auto
    p-4
  "
>

  <div
     className="
      w-full
      max-w-md
      mx-auto
      mt-6
      mb-6
      bg-[#02153d]
      rounded-3xl
      overflow-hidden
  "
  >

    <div
      className="
        flex
        justify-between
        items-center
        p-4
      "
    >

      <h2 className="font-bold">
        Auction Details
      </h2>

      <button
        onClick={() => setSelectedAuction(null)}
        className="text-xl"
      >
        ✕
      </button>

    </div>

    <img
      src={selectedAuction.thumbnail_url}
      alt=""
      className="
        w-full
        h-60
        object-cover
      "
    />

    <div className="p-4">

      <div className="grid grid-cols-2 gap-4">

        <div>

          <div className="text-sm text-gray-400">
            NFT
          </div>

          <div className="font-bold">
            {selectedAuction.title}
          </div>

        </div>

        <div>

          <div className="text-sm text-gray-400">
            Creator
          </div>

          <div className="text-cyan-400">
            @{selectedAuction.username}
          </div>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">

        <div>

          <div className="text-sm text-gray-400">
            Starting
          </div>

          <div className="font-bold text-yellow-400">

            {auctionDetail
              ? Number(
                  auctionDetail.auction.starting_price
                ).toFixed(2)
              : "--"}

            {" "}USDT

          </div>

        </div>

        <div>

          <div className="text-sm text-gray-400">
            Current Bid
          </div>

          <div className="font-bold text-cyan-400">

           {auctionDetail
  ? (
      auctionDetail.auction.current_bid
        ? Number(
            auctionDetail.auction.current_bid
          ).toFixed(2)
        : "No bids yet"
    )
  : "--"}

          </div>

        </div>

      </div>
	  
	  <div className="mt-5">

  <div className="text-sm text-gray-400">
     {
      auctionDetail?.auction?.status === "active"
        ? "Ends In"
        : "Status"
    }
  </div>

  <div className="font-bold text-white">
      {
      auctionDetail?.auction?.status === "active"
        ? (timeLeft || "--")
        : "🏁 Auction Ended"
    }
  </div>

</div>

<div className="mt-6">

  <div className="text-sm text-gray-400">
     {
      auctionDetail?.auction?.status === "active"
        ? "Highest Bidder"
        : "Winner"
    }
  </div>

  <div className="font-bold text-cyan-400 mt-1">

     {
  auctionDetail?.bids?.length > 0
    ? (
        auctionDetail.bids[0].bidder_id === user?.id
          ? "👑 You"
          : `@${auctionDetail.bids[0].username}`
      )
    : "No bids yet"
}

  </div>

</div>

{auctionDetail?.auction?.status === "active" &&
 auctionDetail?.auction?.seller_id !== user?.id && (

<div className="mt-6">

 <button
  onClick={() => setShowBidModal(true)}
  className="
    w-full
    bg-yellow-400
    text-black
    py-3
    rounded-xl
    font-bold
  "
>

  Place Bid

 </button>

</div>

)}

    </div>

  </div>

</div>

)}
	  
	  
	  {showOfferModal && (

<div className=" fixed inset-0 bg-black/80 z-50 flex items-center justify-center">

<div className=" bg-[#02153d] rounded-2xl p-6 w-[90%] max-w-sm ">

<h2 className="text-xl font-bold mb-4">
Make Offer
</h2>

<input

type="number"

value={offerPrice}

onChange={(e)=>
setOfferPrice(e.target.value)
}

placeholder="Offer Price (USDT)"

className="
w-full
p-3
rounded-xl
bg-slate-800
mb-4
"
/>

<button
disabled={submittingOffer}
onClick={()=>
makeOffer(selected)
}

className={`
w-full
py-3
rounded-xl
font-bold
${
submittingOffer
?
"bg-gray-500 text-gray-300 cursor-not-allowed"
:
"bg-yellow-400 text-black"
}
`}

>

{submittingOffer
?
"Submitting..."
:
"Submit Offer"
}

</button>

<button

onClick={()=>
setShowOfferModal(false)
}

className="
w-full
mt-3
bg-slate-700
py-3
rounded-xl
"

>

Cancel

</button>

</div>

</div>

)}

{/* Bid Modal */}

{showBidModal && (

<div className=" fixed inset-0 bg-black/80 z-50 flex items-center justify-center">

<div className=" bg-[#02153d] rounded-2xl p-6 w-[90%] max-w-sm ">

<h2 className="text-xl font-bold mb-4">
Place Bid
</h2>

<input

type="number"

value={bidPrice}

onChange={(e)=>
setBidPrice(e.target.value)
}

placeholder="Bid Price (USDT)"

className="
w-full
p-3
rounded-xl
bg-slate-800
mb-4
"

/>

<button
onClick={placeBid}
className="
w-full
py-3
rounded-xl
font-bold
bg-yellow-400
text-black
"

>

Submit Bid

</button>

<button

onClick={()=>
setShowBidModal(false)
}

className="
w-full
mt-3
bg-slate-700
py-3
rounded-xl
"

>

Cancel

</button>

</div>

</div>

)}

    </div>
  );
}