"use client";

import { usePathname } from "next/navigation";
import AppShell from "./AppShell";

export default function ConditionalAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}