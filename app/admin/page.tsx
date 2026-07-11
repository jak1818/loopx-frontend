"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface DashboardStats {
  // Overview
  total_users: number;
  new_users_today: number;
  total_videos: number;
  total_nfts: number;
  total_listings: number;
  pending_withdrawals: number;

  // Revenue
  platform_revenue: number;
  marketplace_revenue: number;
  creator_revenue: number;
  gift_revenue: number;
  diamond_revenue: number;

  // Marketplace
  marketplace_volume: number;
  fixed_price_sales: number;
  offer_sales: number;
  auction_sales: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/dashboard/stats`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
        console.log(data.stats);

      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (!stats) {
    return (
      <div className="text-white">
        Loading Dashboard...
      </div>
    );
  }

  const cards = [

{
title:"Total Users",
value:stats.total_users,
unit:"",
icon:"👥"
},

{
title:"New Users Today",
value:stats.new_users_today,
unit:"",
icon:"🆕"
},

{
title:"Total NFTs",
value:stats.total_nfts,
unit:"",
icon:"🖼️"
},

{
title:"Pending Withdrawals",
value:stats.pending_withdrawals,
unit:"",
icon:"💸"
},

{
title:"Platform Revenue",
value:stats.platform_revenue.toFixed(2),
unit:"USDT",
icon:"💰"
},

{
title:"Creator Revenue",
value:stats.creator_revenue.toFixed(2),
unit:"USDT",
icon:"🎨"
},

{
title:"Marketplace Revenue",
value:stats.marketplace_revenue.toFixed(2),
unit:"USDT",
icon:"🏪"
},

{
title:"Gift Revenue",
value:stats.gift_revenue.toFixed(2),
unit:"USDT",
icon:"🎁"
},

{
title:"Marketplace Volume",
value:stats.marketplace_volume.toFixed(2),
unit:"USDT",
icon:"📈"
},

{
title:"Fixed Price Sales",
value:stats.fixed_price_sales,
unit:"",
icon:"🏷️"
},

{
title:"Offer Sales",
value:stats.offer_sales,
unit:"",
icon:"🤝"
},

{
title:"Auction Sales",
value:stats.auction_sales,
unit:"",
icon:"🔨"
},

{
    title: "Diamond Revenue",
    value: stats.diamond_revenue.toFixed(2),
    unit: "USDT",
    icon: "💎"
}

];

  return (
    <div>

      <div className="grid grid-cols-4 gap-6">

        {cards.map((card) => (

          <div
            key={card.title}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6"
          >

            <div className="text-gray-400 text-sm">
              {card.title}
            </div>

            <div className="text-4xl font-bold mt-4">
              {card.value}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}