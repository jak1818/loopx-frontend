"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";
  
interface Pagination{

page:number;

limit:number;

total:number;

totalPages:number;

}

interface User {
  id: string;
  username: string;
  email: string | null;
  wallet_address: string | null;
  diamond_balance: number;
  usdt_balance: number;
  total_videos: number;
  total_nfts: number;
  created_at: string;
  is_banned: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page,setPage] = useState(1);
  const [pagination,setPagination]= useState<Pagination|null>(null);
  

useEffect(()=>{

loadUsers(search);

},[page]);

  async function loadUsers(keyword = "") {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/users?search=${encodeURIComponent(keyword)}&page=${page}&limit=20`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
		
		setPagination(
			data.pagination
		);
      }
	  
    } catch (err) {
      console.error(err);
    }
  }
  
  async function toggleBan(user: User) {

  const endpoint =
    user.is_banned
      ? "unban"
      : "ban";

  try {

    const res = await fetch(

      `${API_URL}/api/admin/users/${user.id}/${endpoint}`,

      {

        method: "POST",

        credentials: "include"

      }

    );

    const data = await res.json();

    if (data.success) {

      loadUsers(search);

    }

  } catch (err) {

    console.error(err);

  }

}

  return (
    <div>

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Users
          </h1>

          <p className="text-gray-400 mt-2">
            Manage LoopCast users
          </p>

        </div>

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
			setPage(1);
            loadUsers(e.target.value);
          }}
          placeholder="Search username..."
          className="w-72 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-blue-500"
        />

      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800">

        <table className="w-full">

          <thead className="bg-zinc-900">

            <tr className="text-left text-gray-400">

              <th className="px-6 py-4">
                User
              </th>
			  
			  <th className="px-6 py-4">
				Wallet
			  </th>

              <th className="px-6 py-4">
                Diamond
              </th>

              <th className="px-6 py-4">
                USDT
              </th>

              <th className="px-6 py-4">
                Videos
              </th>

              <th className="px-6 py-4">
                NFTs
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Joined
              </th>

              <th className="px-6 py-4">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr
                key={user.id}
                className="border-t border-zinc-800 hover:bg-zinc-900 transition"
              >

                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold">

                      {user.username
                        ? user.username
                            .charAt(0)
                            .toUpperCase()
                        : "U"}

                    </div>

                    <div>

                      <div className="font-semibold">

                        {user.username}

                      </div>

                      <div className="text-xs text-gray-400">

                        @{user.username}

                      </div>

                    </div>

                  </div>
				 

                </td>
				
				<td className="px-6 py-5 text-gray-400 font-mono">

				{user.wallet_address
					? `${user.wallet_address.slice(0,6)}...${user.wallet_address.slice(-4)}`
					: "-"}

				</td>

                <td className="px-6 py-5">

                  💎 {Number(
                    user.diamond_balance
                  ).toLocaleString()}

                </td>

                <td className="px-6 py-5">

                  ${Number(
                    user.usdt_balance
                  ).toFixed(2)}

                </td>

                <td className="px-6 py-5">

                  {user.total_videos}

                </td>

                <td className="px-6 py-5">

                  {user.total_nfts}

                </td>

                <td className="px-6 py-5">

                  <span className="rounded-full bg-green-500/20 text-green-400 px-3 py-1 text-sm">
					Active
					</span>
                

                </td>

                <td className="px-6 py-5 text-gray-400">

                  {new Date(
                    user.created_at
                  ).toLocaleDateString()}

                </td>

                <td className="px-6 py-5">

               <Link
				href={`/admin/users/${user.id}`}
				className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm inline-block mr-3"
				>
				View
				</Link>
				
				 <button
      onClick={() => toggleBan(user)}
      className={`rounded-lg px-4 py-2 text-sm text-white ${
        user.is_banned
          ? "bg-green-600 hover:bg-green-700"
          : "bg-red-600 hover:bg-red-700"
      }`}
    >
      {user.is_banned ? "Unban" : "Ban"}
    </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
		
		<div className="flex items-center justify-between mt-6">

<div className="text-gray-400">

Showing

{" "}

{pagination
? `${(page-1)*20+1} - ${Math.min(page*20,pagination.total)}`
:0}

{" "}of{" "}

{pagination?.total ?? 0}

 users

</div>

<div className="flex items-center gap-3">

<button

disabled={page===1}

onClick={()=>setPage(page-1)}

className="px-4 py-2 rounded-lg bg-zinc-800 disabled:opacity-40"

>

Prev

</button>

<button

disabled={
!pagination ||
page===pagination.totalPages
}

onClick={()=>setPage(page+1)}

className="px-4 py-2 rounded-lg bg-zinc-800 disabled:opacity-40"

>

Next

</button>

</div>

</div>

      </div>

    </div>
  );
}