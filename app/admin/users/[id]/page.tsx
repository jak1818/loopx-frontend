"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

interface UserDetail {
  id: string;
  username: string;
  email: string | null;
  wallet_address: string | null;
  avatar_url: string | null;
  created_at: string;

  diamond_balance: number;
  usdt_balance: number;

  total_videos: number;
  total_nfts: number;

  creator_revenue: number;
  seller_revenue: number;
}

interface Transaction {

  id:string;

  type:string;

  amount:number;

  status:string;

  metadata:any;

  created_at:string;

}

export default function UserDetailPage() {

  const { id } = useParams();
  const [transactions,setTransactions]= useState<Transaction[]>([]);

  const [user, setUser] =
    useState<UserDetail | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {

    try {

      const res = await fetch(
        `${API_URL}/api/admin/users/${id}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      }
	  
	  	  const txRes=await fetch(

`${API_URL}/api/admin/users/${id}/transactions`,

{
credentials:"include"
}

);

const txData=await txRes.json();

if(txData.success){

setTransactions(
txData.transactions
);

}

    } catch (err) {
      console.error(err);
    }

  }

  if (!user) {

    return (
      <div className="text-white">
        Loading...
      </div>
    );

  }

  return (

    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        User Detail
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <div className="flex flex-col items-center">

            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">

              {user.username
                ?.charAt(0)
                .toUpperCase()}

            </div>

            <h2 className="mt-4 text-xl font-bold">
              {user.username}
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              {user.email || "-"}
            </p>

          </div>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <div className="text-gray-400">
            Wallet
          </div>

          <div className="mt-3 break-all font-mono text-sm">

            {user.wallet_address || "-"}

          </div>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <div className="text-gray-400">
            Diamond
          </div>

          <div className="mt-4 text-3xl font-bold">

            💎 {Number(
              user.diamond_balance
            ).toLocaleString()}

          </div>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <div className="text-gray-400">
            USDT
          </div>

          <div className="mt-4 text-3xl font-bold">

            ${Number(
              user.usdt_balance
            ).toFixed(2)}

          </div>

        </div>

      </div>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <div className="text-gray-400">
            Videos
          </div>

          <div className="mt-4 text-3xl font-bold">
            {user.total_videos}
          </div>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <div className="text-gray-400">
            NFTs
          </div>

          <div className="mt-4 text-3xl font-bold">
            {user.total_nfts}
          </div>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <div className="text-gray-400">
            Creator Revenue
          </div>

          <div className="mt-4 text-3xl font-bold">

            $
            {Number(
              user.creator_revenue
            ).toFixed(2)}

          </div>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <div className="text-gray-400">
            Seller Revenue
          </div>

          <div className="mt-4 text-3xl font-bold">

            $
            {Number(
              user.seller_revenue
            ).toFixed(2)}

          </div>

        </div>

      </div>
	  
	   {/* Transaction History */}

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mt-8">

        <h2 className="text-xl font-bold mb-6">
          Transaction History
        </h2>

        <table className="w-full">

          <thead>

            <tr className="text-left text-gray-400 border-b border-zinc-800">

              <th className="py-3">Type</th>

              <th>Amount</th>

              <th>Status</th>

              <th>Date</th>

            </tr>

          </thead>

          <tbody>

            {transactions.map((tx) => (

              <tr
                key={tx.id}
                className="border-b border-zinc-800"
              >

                <td className="py-4">

                  {tx.type}

                </td>

                <td>

                  {tx.amount}

                </td>

                <td>

                  {tx.status}

                </td>

                <td>

                  {new Date(
                    tx.created_at
                  ).toLocaleString()}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}