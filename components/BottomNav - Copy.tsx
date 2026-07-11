"use client";
import { useRouter, usePathname } from "next/navigation";
import { Home, ShoppingBag, Plus, MessageCircle, User } from "lucide-react";
import { useAppData } from "@/providers/AppDataProvider";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, telegramUser } = useAppData();

const tabs = [
  { label: "Home", path: "/", Icon: Home },
  { label: "Shop", path: "/nft-store", Icon: ShoppingBag },
  { label: "", path: "/upload", Icon: Plus, center: true },
  { label: "Inbox", path: "/inbox", Icon: MessageCircle },
  { label: "Profile", path: telegramUser?.id ? `/profile/${telegramUser.id}` : user?.id ? `/profile/${user.id}` : "#", Icon: User },
];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex justify-around items-end pb-2 pt-1 bg-black">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        const Icon = tab.Icon;

        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className={`flex flex-col items-center justify-end gap-0.5 px-3 ${
              tab.center ? "-mt-5" : ""
            }`}
          >
            {tab.center ? (
              <div className="bg-yellow-400 text-black p-3 rounded-full shadow-xl border-4 border-black">
                <Icon size={26} strokeWidth={2.5} />
              </div>
            ) : (
              <Icon
                size={28}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={isActive ? "text-white" : "text-gray-400"}
              />
            )}
            {tab.label && (
              <span
                className={`text-[10px] ${
                  isActive ? "text-white font-medium" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}