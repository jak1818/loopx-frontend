"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "./AdminGuard";

const menus = [
  {
    name: "📊 Dashboard",
    href: "/admin",
  },
  {
    name: "👥 Users",
    href: "/admin/users",
  },
  {
    name: "🎬 Content",
    href: "/admin/content",
  },
  {
    name: "🖼 NFT Studio",
    href: "/admin/nft",
  },
  {
    name: "💎 Economy",
    href: "/admin/economy",
  },
  {
    name: "📈 Growth",
    href: "/admin/growth",
  },
  {
    name: "🛡 Security",
    href: "/admin/security",
  },
  {
    name: "💰 Treasury",
    href: "/admin/treasury",
  },
  {
    name: "⚙ Settings",
    href: "/admin/settings",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  if (pathname === "/admin/login") {
  return <>{children}</>;
}

  return (
  <AdminGuard>
    <div className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">

<div className="p-6 border-b border-zinc-800">

  <h1 className="text-3xl font-bold">
    LoopCast
  </h1>

  <p className="text-gray-400 mt-1">
    Admin Panel
  </p>

</div>

        <nav className="flex-1 px-3 space-y-2 mt-4">

          {menus.map((menu) => (

            <Link
              key={menu.href}
              href={menu.href}
              className={`block rounded-lg px-4 py-3 transition ${
                pathname === menu.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-zinc-800"
              }`}
            >
              {menu.name}
            </Link>

          ))}

        </nav>

      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">

       <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8">

  <h1 className="text-xl font-semibold">
    {menus.find(m => m.href === pathname)?.name ?? "LoopCast Admin"}
  </h1>

  <div className="flex items-center gap-5">

    <span className="text-sm text-gray-400">
      LoopCast Admin
    </span>

    <button
      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
    >
      Logout
    </button>

  </div>

</header>

        {/* Content */}
        <main className="flex-1 p-8 bg-zinc-950">
          {children}
        </main>

      </div>

    </div>
	</AdminGuard>
  );
}