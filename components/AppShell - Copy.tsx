"use client";

import { useAppData } from "@/providers/AppDataProvider";
import WebLogin from "@/components/WebLogin";
import InstallButton from "@/components/InstallButton";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
  isTelegram,
  authReady,
} = useAppData();

alert(
  `AppShell Render\nisTelegram=${isTelegram}\nauthReady=${authReady}`
);


if (!authReady) {
  return null;
}

  return (
    <>
      {/* 非 Telegram 才显示 Web Login */}
      {!isTelegram && (
  <>
    {alert("WEBLOGIN RENDER")}
    <WebLogin />
  </>
)}

      {/* 页面 */}
      {children}

      {/* PWA */}
      <InstallButton />
    </>
  );
}