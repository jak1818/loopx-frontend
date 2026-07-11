"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TransactionDetailPage() {
const { id } = useParams();
const router = useRouter();
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const [tx, setTx] = useState<any>(null);

useEffect(() => {
fetch(`${API_BASE}/api/user/transaction/${id}`)
.then(res => res.json())
.then(async (data) => {
if (!data.success) return;

const txData = data.data;

// 👉 如果是 withdraw，就再拿 withdrawal detail
if (txData.type === "withdraw" && txData.metadata?.withdrawal_id) {
  const res2 = await fetch(
    `${API_BASE}/api/withdraw/${txData.metadata.withdrawal_id}`
  );
  const withdrawData = await res2.json();

  if (withdrawData.success) {
    setTx({
      ...txData,
      withdraw: withdrawData.data,
    });
  } else {
    setTx(txData);
  }
} else {
  setTx(txData);
}
});
}, [id]);

console.log("TX:", tx);
if (!tx) {
return ( <div className="min-h-screen bg-black text-white flex items-center justify-center">
Loading... </div>
);
}

const negativeTypes = [
  "withdraw",
  "gift_paid",
  "ai_image_generation",
  "ai_video_generation",
  "nft_mint",
];

  const diamondTypes = [
  "gift_paid",
  "ai_image_generation",
  "ai_video_generation",
  "nft_mint",
  "nft_refund",
  "diamond_purchase",
];

const isNegative = negativeTypes.includes(tx.type);

	  const getLabel = (type) => {
  if (type === "gift_income") return "Gift Received";
  if (type === "gift_paid") return "Gift Sent";
  if (type === "withdraw") return "Withdrawal";
  if (type === "diamond_purchase") return "Diamond Purchase";
  if (type === "ai_image_generation") return "AI Image Generation";
  if (type === "ai_video_generation") return "AI Video Generation";
  if (type === "nft_mint") return "NFT Mint";
  if (type === "nft_refund") return "NFT Refund";
  if (type === "nft_recycle") return "NFT Recycle";
  
  return type;
};

const status = tx.withdraw?.status || tx.status;
const wallet = tx.withdraw?.wallet_address || tx.metadata?.wallet_address;
return ( 
<div className="min-h-screen bg-black flex justify-center"> 
<div className="w-full max-w-md p-4 text-white">

    {/* Back */}
    <button
      onClick={() => router.back()}
      className="mb-4 text-gray-400"
    >
      ← Back
    </button>

    {/* Amount */}
    <div className="text-center my-6">

<h1
  className={`text-3xl font-bold ${
    isNegative ? "text-red-400" : "text-green-400"
  }`}
>
  {diamondTypes.includes(tx.type)
    ? `${isNegative ? "-" : "+"} 💎${Math.abs(Number(tx.amount))}`
    : `${isNegative ? "-" : "+"} $${Math.abs(Number(tx.amount))}`}
</h1>

      <p className="text-gray-400 mt-2">
  {getLabel(tx.type)}
</p>
    </div>

    {/* Card */}
    <div className="bg-gray-900 p-4 rounded-xl space-y-3">
	
	{(tx.type === "gift_paid" || tx.type === "gift_income") &&
  tx.gift_name && (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">Gift</span>
      <span className="text-pink-400">
        {tx.metadata.gift_name}
      </span>
    </div>
)}

{tx.counterpart_username && tx.type !== "withdraw" && (
  <div
    value={`@${tx.counterpart_username}`}
    className="flex justify-between text-sm cursor-pointer"
  >
    <span className="text-gray-400">
      {tx.type === "gift_paid" ? "Sent To" : "From"}
    </span>

    <span className="text-blue-400">
      @{tx.counterpart_username}
    </span>
  </div>
)}

{(tx.type === "gift_paid" || tx.type === "gift_income") &&
  tx.gift_name && (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">Gift</span>
      <span className="text-pink-400">
        {tx.gift_name}
		  <span className="ml-2 text-xs text-gray-400">
          ({tx.gift_type})
        </span>
      </span>
    </div>
)}

<Row
  label="Status"
  value={
    status === "completed"
      ? "✅ Completed"
      : status === "pending"
      ? "🟡 Pending"
      : status === "rejected"
      ? "❌ Rejected"
      : "❌ Failed"
  }
/>
      <Row label="Time" value={new Date(tx.created_at).toLocaleString()} />
 <div className="flex justify-between text-sm items-center">
  <span className="text-gray-400">Reference ID</span>

  <div className="flex items-center gap-2">
    <span className="text-blue-400">
      {tx.id.slice(0, 6)}...{tx.id.slice(-4)}
    </span>

    <button
      onClick={() => {
        navigator.clipboard.writeText(tx.id);
        alert("Copied");
      }}
      className="text-xs bg-gray-700 px-2 py-1 rounded"
    >
      Copy
    </button>
  </div>
</div>

{tx.tx_id && (
  <div className="flex justify-between text-sm items-center">
    <span className="text-gray-400">Blockchain Tx</span>

    <div className="flex items-center gap-2">
      <span className="text-blue-400">
        {tx.tx_id.slice(0, 6)}...{tx.tx_id.slice(-4)}
      </span>

      <button
        onClick={() => {
          navigator.clipboard.writeText(tx.tx_id);
          alert("Copied");
        }}
        className="text-xs bg-gray-700 px-2 py-1 rounded"
      >
        Copy
      </button>
    </div>
  </div>
)}

{wallet && (
  <div className="flex justify-between text-sm items-center">
    <span className="text-gray-400">Wallet</span>

    <div className="flex items-center gap-2">
      <span className="text-blue-400">
        {wallet.slice(0, 6)}...{wallet.slice(-4)}
      </span>

      <button
        onClick={() => {
          navigator.clipboard.writeText(wallet);
          alert("Copied");
        }}
        className="text-xs bg-gray-700 px-2 py-1 rounded"
      >
        Copy
      </button>
    </div>
  </div>
)}

  </div>
</div>

</div>
);
}

function Row({ label, value }: any) {
return ( <div className="flex justify-between text-sm"> <span className="text-gray-400">{label}</span> <span className="text-right break-all">{value}</span> </div>
);
}
