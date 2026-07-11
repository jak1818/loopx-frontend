
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AppDataContext = createContext<any>(null);

export function AppDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<any>(null);

  const [balance, setBalance] =
    useState<any>(null);

  const [dashboard, setDashboard] =
    useState<any>(null);
	
  const [analytics, setAnalytics] =
    useState<any>(null);

  const [webUser, setWebUser] =
    useState<any>(null);

  const [telegramUser, setTelegramUser] =
    useState<any>(null);
  
  const activeUser =
    telegramUser || webUser;

  const [authReady, setAuthReady] =
    useState(false);

  const [isTelegram, setIsTelegram] =
    useState(false);

  const BACKEND =
    process.env.NEXT_PUBLIC_BACKEND_URL || "";
	
const refreshAppData = async () => {

  if (!activeUser?.id) return;

  try {
    const dashboardRes =
      await fetch(
        `${BACKEND}/api/creator/dashboard?user_id=${activeUser.id}`
      );

    const dashboardData =
      await dashboardRes.json();

    if (dashboardData.success) {
      setDashboard(
        dashboardData.data
      );
    }
  } catch (e) {
    console.error(
      "dashboard fetch error",
      e
    );
  }

  try {

    const analyticsRes =
      await fetch(
        `${BACKEND}/api/creator/analytics?user_id=${activeUser.id}`
      );

    const analyticsData =
      await analyticsRes.json();

    if (
      analyticsData.success
    ) {

      setAnalytics(
        analyticsData.data
      );

    }

  } catch (e) {

    console.error(
      "analytics fetch error",
      e
    );

  }

  try {
    const userRes =
      await fetch(
        `${BACKEND}/api/user/profile?user_id=${activeUser.id}`
      );

    const userData =
      await userRes.json();

    if (userData.success) {
      setUser(userData.data);
    }
  } catch (e) {
    console.error(
      "user fetch error",
      e
    );
  }

  try {
    const balanceRes =
      await fetch(
        `${BACKEND}/api/user/balance?user_id=${activeUser.id}`
      );

    const balanceData =
      await balanceRes.json();

    if (
      balanceData.success
    ) {
      setBalance(
        balanceData.data
      );
    }
  } catch (e) {
    console.error(
      "balance fetch error",
      e
    );
  }

};

  // ✅ Telegram SDK + Telegram Login
  useEffect(() => {
    const checkTelegram = () => {
      const tg =
        (window as any)?.Telegram?.WebApp;


      // ❌ 没 Telegram
      if (!tg) {
        setAuthReady(true);
        return;
      }

      tg.ready();

      const initData = tg.initData;

      // ❌ 没 initData
     if (!initData) {

  setTelegramUser(null);
  setIsTelegram(false);

  setAuthReady(true);

  return;
}

      setIsTelegram(true);

      fetch(
        `${BACKEND}/api/auth/telegram`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            initData,
          }),
        }
      )
        .then((res) => res.json())
        .then((data) => {


          if (
            data.success &&
            data.user
          ) {
            setTelegramUser(data.user);
          }

          setAuthReady(true);
        })
        .catch((err) => {
          alert(
            "TG AUTH ERROR: " +
              err.message
          );

          setAuthReady(true);
        });
    };

    // ✅ Telegram SDK 已存在
    if (
      (window as any)?.Telegram?.WebApp
    ) {
      checkTelegram();
      return;
    }

    // ✅ 动态加载 Telegram SDK
    const script =
      document.createElement("script");

    script.src =
      "https://telegram.org/js/telegram-web-app.js";

    script.async = true;

    script.onload = () => {
      console.log(
        "✅ Telegram SDK loaded"
      );

      checkTelegram();
    };

    script.onerror = () => {
      console.error(
        "❌ Telegram SDK failed"
      );

      alert(
        "Telegram SDK failed to load"
      );

      setAuthReady(true);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [BACKEND]);

  // ✅ Web 登录恢复（非 Telegram）
  useEffect(() => {
    if (isTelegram) {
      return;
    }

    try {
      const stored =
        localStorage.getItem("user");

      if (stored) {
        const parsed = JSON.parse(stored);

setWebUser(
  parsed?.user ||
  parsed?.data ||
  parsed
);
      }
    } catch {}
	
	setAuthReady(true);
	
  }, [isTelegram]);
  
  useEffect(() => {
  const handler = () => {
    try {
      const stored =
        localStorage.getItem("user");

    if (stored) {
  const parsed = JSON.parse(stored);

  setWebUser(
    parsed?.user ||
    parsed?.data ||
    parsed
  );
} else {
  setWebUser(null);
}
    } catch {}
  };

  window.addEventListener(
    "auth-change",
    handler
  );

  return () => {
    window.removeEventListener(
      "auth-change",
      handler
    );
  };
}, []);

  // ✅ 获取用户数据
useEffect(() => {

    refreshAppData();

}, [
    activeUser,
	BACKEND
]);

  return (
    <AppDataContext.Provider
      value={{
        user,
        balance,
        dashboard,
		analytics,
		
		refreshAppData,

        webUser,
        setWebUser,

        telegramUser,
		setTelegramUser,
		
        authReady,
        isTelegram,

        BACKEND,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(
    AppDataContext
  );
}

