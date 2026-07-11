"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Store, Plus, MessageCircle, User } from "lucide-react";
import { useAppData } from "@/providers/AppDataProvider";
import { getUnreadCount, markNotificationsRead } from "@/lib/api/notifications";

export default function BottomNav() {

	console.log("BOTTOM NAV RENDER");
  const router = useRouter();
  const pathname = usePathname();
  const { webUser, telegramUser } = useAppData();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 当前用户 ID
  const userId = telegramUser?.id || webUser?.id;
  const isLoggedIn = !!userId;
  

  // 定时拉取未读通知数
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = () => {
      getUnreadCount({ userId })
        .then((res) => setUnreadCount(res.count))
        .catch(() => {});
    };

    fetchUnread(); // 立即拉一次
    intervalRef.current = setInterval(fetchUnread, 30000); // 30 秒

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoggedIn, userId]);

  // 进入 Inbox 页面时自动清零（同时调用后端标记全部已读）
  useEffect(() => {
    if (pathname === "/inbox" && unreadCount > 0 && userId) {
      setUnreadCount(0);
      markNotificationsRead({ userId, ids: [] }).catch(() => {});
    }
  }, [pathname, userId, unreadCount]);

  const tabs = [
    { label: "Home", path: "/", Icon: Home },
    { label: "Market", path: "/marketplace", Icon:Store },
    { label: "", path: "/upload", Icon: Plus, center: true },
    { label: "Inbox", path: "/inbox", Icon: MessageCircle, badge: true },
    {
      label: "Profile",
      path: telegramUser?.id
        ? `/profile/${telegramUser.id}`
        : webUser?.id
        ? `/profile/${webUser.id}`
        : "/login",
      Icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex justify-around items-end pb-2 pt-1 bg-black">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        const Icon = tab.Icon;
        const showBadge = tab.badge && unreadCount > 0;

        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className={`relative flex flex-col items-center justify-end gap-0.5 px-3 ${
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

            {/* 通知 Badge */}
            {showBadge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
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