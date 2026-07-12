"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/providers/AppDataProvider";
import WebLogin from "@/components/WebLogin";
import InstallButton from "@/components/InstallButton";
import BottomNav from "@/components/BottomNav";
import { usePathname } from "next/navigation";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isTelegram, authReady } = useAppData();
  
  console.log("isTelegram", isTelegram);
  console.log("authReady", authReady);

  const [hideNav, setHideNav] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const open = () => {
      console.log("HIDE NAV");
      setHideNav(true);
    };

    const close = () => {
      console.log("SHOW NAV");
      setHideNav(false);
    };

    window.addEventListener("comments-open", open);
    window.addEventListener("comments-close", close);
	
	window.addEventListener("gift-open", open);
    window.addEventListener("gift-close", close);

    return () => {
      window.removeEventListener("comments-open", open);
      window.removeEventListener("comments-close", close);
	  
	  window.removeEventListener("gift-open", open);
      window.removeEventListener("gift-close", close);
    };
  }, []);

 if (!authReady) {
  return (
    <div className="h-screen bg-black text-white flex items-center justify-center">
      Loading...
    </div>
  );
}

const hideBottomNavRoutes = [
  "/creator",
  "/creator/assets",
  "/creator/assets/create",
  "/balance",
  "/buy-diamonds",
  "/creator/analytics",
  "/creator/revenue",
  "/creator/videos",
  "/upload", 
];

const shouldHideBottomNav =
  hideBottomNavRoutes.includes(pathname);
  
    const mainClass = isTelegram
  ? (
      shouldHideBottomNav
        ? "h-[100dvh] overflow-hidden"
        : "h-[100dvh] overflow-hidden"
    )
  : (
      shouldHideBottomNav
        ? "min-h-screen"
        : "min-h-screen pb-24"
    );
  
  
  return (
    <>
      {!isTelegram && <WebLogin />}

<main className={mainClass}>
  {children}
</main>

  {!hideNav && !shouldHideBottomNav && (
  <BottomNav />
)}

      <InstallButton /> 
    </>
  );
}