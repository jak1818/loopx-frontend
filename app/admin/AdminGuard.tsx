"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/me`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!data.success) {
        router.replace("/admin/login");
        return;
      }

      setLoading(false);
    } catch {
      router.replace("/admin/login");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}