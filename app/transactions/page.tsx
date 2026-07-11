"use client";

import { useAppData } from "@/providers/AppDataProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
const { user } = useAppData();
const router = useRouter();

const [tx, setTx] = useState([]);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [filter, setFilter] = useState("all");
const [initialLoaded, setInitialLoaded] = useState(false);
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const fetchTx = async (pageNum = 1) => {
  if (!hasMore || loading) return;

  setLoading(true);

  const res = await fetch(
    `${API_BASE}/api/user/transactions/${user.id}?page=${pageNum}`
  );
  const data = await res.json();

if (data.success) {
  if (data.data.length === 0) {
    setHasMore(false);
  } else {
    if (pageNum === 1) {
      setTx(data.data); // 🔥 第一页直接覆盖
    } else {
      setTx((prev) => [...prev, ...data.data]); // 🔥 后面才 append
    }
  }
}

  setLoading(false);
};

useEffect(() => {
  if (!user?.id) return;

  setTx([]);
  setPage(1);
  setHasMore(true);

  fetchTx(1);
}, [user]);

useEffect(() => {
  let ticking = false;

  const handleScroll = () => {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      const scrollBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100;

      if (scrollBottom && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTx(nextPage);
      }

      ticking = false;
    });
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [page, loading, hasMore]);

// 🔥 filter logic
const spendingTypes = [
  "gift_paid",
  "ai_image_generation",
  "ai_video_generation",
  "nft_mint"
];

const earningTypes = [
  "gift_income",
  "nft_recycle"
];

const refundTypes = [
  "nft_refund"
];
console.log("ALL TX", tx);
const filteredTx = tx.filter((t: any) => {
  if (filter === "all") return true;

  if (filter === "withdraw")
    return t.type === "withdraw";

  if (filter === "earnings")
    return earningTypes.includes(t.type);

  if (filter === "refunds")
    return refundTypes.includes(t.type);

  if (filter === "spending")
    return spendingTypes.includes(t.type);

  return true;
});

console.log(
  "FILTER:",
  filter,
  "RESULT:",
  filteredTx.map((x:any) => x.type)
);

// 🔥 group by date
const groupByDate = (transactions: any[]) => {
const groups: any = {};
transactions.forEach((t) => {
const date = new Date(t.created_at).toDateString();
if (!groups[date]) groups[date] = [];
groups[date].push(t);
});
return groups;
};

const grouped = groupByDate(filteredTx);

const getLabel = (t: any) => {
  if (t.type === "gift_income") return "Gift Received";

  if (t.type === "gift_paid") return "Gift Sent";

  if (t.type === "withdraw") return "USDT Withdrawal";

  if (t.type === "diamond_purchase") return "Diamond Purchase";

  if (t.type === "ai_image_generation")
    return "AI Image Generation";

  if (t.type === "ai_video_generation")
    return "AI Video Generation";

  if (t.type === "nft_mint")
    return "NFT Mint";

  if (t.type === "nft_refund")
    return "NFT Mint Refund";

  if (t.type === "nft_recycle")
    return "NFT Recycle";

};

const diamondTypes = [
  "gift_paid",
  "ai_image_generation",
  "ai_video_generation",
  "nft_mint",
  "nft_refund",
  "diamond_purchase"
];

const usdtTypes = [
  "withdraw",
  "gift_income",
  "diamond_purchase",
  "nft_recycle"
];

const negativeTypes = [
  "withdraw",
  "gift_paid",
  "ai_image_generation",
  "ai_video_generation",
  "nft_mint"
];

const getColor = (t: any) => {
  if (negativeTypes.includes(t.type)) {
    return "text-red-400";
  }

  return "text-green-400";
};

return ( 
<div
  className="
    h-full
    overflow-y-auto
    max-w-md
    mx-auto
    p-4
    bg-black
    text-white
    pb-32
  "
  style={{
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
>
  <div className="w-full max-w-md p-4 text-white">

  {/* 🔙 Back Button */}
  <button
    onClick={() => router.back()}
    className="mb-4 text-gray-400"
  >
    ← Back
  </button>

  {/* Title */}
  <h1 className="text-xl mb-4">Transactions</h1>

  {/* 🔥 Filter Tabs */}
  <div className="flex gap-2 mb-4">
    {["all", "earnings", "refunds", "withdraw", "spending"].map((f) => (
      <button
        key={f}
        onClick={() => setFilter(f)}
        className={`px-3 py-1 rounded-full text-sm ${
          filter === f
            ? "bg-yellow-400 text-black"
            : "bg-gray-800 text-gray-400"
        }`}
      >
        {f}
      </button>
    ))}
  </div>

  {Object.keys(grouped).length === 0 && (
    <p className="text-gray-500">No transactions yet</p>
  )}

  {/* 🔥 Transactions List */}
  {Object.entries(grouped).map(([date, items]: any) => (
    <div key={date} className="mb-6">

      <p className="text-gray-400 mb-2 text-sm">
        {date}
      </p>

 {items.map((t: any) => {
	 
	 console.log(
  "TX ROW",
  t.type,
  t.amount
);

  const isNegative = negativeTypes.includes(t.type);

  return (
    <div
      key={t.id}
      onClick={() => router.push(`/transactions/${t.id}`)}
      className="bg-gray-900 p-4 rounded-xl mb-2 flex justify-between items-center cursor-pointer active:scale-95 transition"
    >

          {/* Left */}
          <div className="flex items-center gap-2">

            <span className="text-lg">
              {t.type === "withdraw" && "💸"}
              {t.type === "gift_income" && "💰"}
              {t.type === "gift_paid" && "🎁"}
              {t.type === "diamond_purchase" && "💎"}
            </span>

            <div>
              <p className="font-medium">
                {getLabel(t)}
              </p>

              <p className="text-gray-400 text-xs">
                {new Date(t.created_at).toLocaleTimeString()}
              </p>
            </div>

          </div>

          {/* Right */}
          <div className="text-right">

<p className={`font-bold ${getColor(t)}`}>

  {diamondTypes.includes(t.type)
    ? `${isNegative ? "-" : "+"} 💎${Math.abs(Number(t.amount))}`

    : `${isNegative ? "-" : "+"} $${Math.abs(Number(t.amount))}`
  }

</p>

           <p
  className={`text-xs ${
    t.status === "completed"
      ? "text-green-400"
      : t.status === "rejected"
      ? "text-red-400"
      : "text-yellow-400"
  }`}
>
  {t.status === "pending" && "🟡 Pending"}
  {t.status === "completed" && "✅ Completed"}
  {t.status === "rejected" && "❌ Rejected"}
</p>

          </div>

        </div>
		 );
      })}

    </div>
  ))}
  
{loading && (
  <div className="space-y-3 mt-4">
    
    {[1,2,3].map((i) => (
      <div
        key={i}
        className="bg-gray-800 p-4 rounded-xl animate-pulse flex justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-700 rounded-full"></div>

          <div>
            <div className="w-24 h-3 bg-gray-700 rounded mb-2"></div>
            <div className="w-16 h-3 bg-gray-700 rounded"></div>
          </div>
        </div>

        <div className="w-12 h-4 bg-gray-700 rounded"></div>
      </div>
    ))}

  </div>
)}

{!hasMore && (
  <p className="text-center text-gray-500 mt-4">
    No more transactions
  </p>
)}

</div>
</div>
);
}
