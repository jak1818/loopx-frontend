"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AppDataContext = createContext<any>(null);

export const AppDataProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);           // profile 数据
  const [balance, setBalance] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [webUser, setWebUser] = useState<any>(null); // 网页登录用户
  const [telegramUser, setTelegramUser] = useState<any>(null); // 新增：Telegram 自动登录用户

  // 1️⃣ Telegram 自动注册/登录
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as any)?.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();

    const initData = tg.initData;
    if (!initData) return;

    const authKey = '__loopcast_auth';
    if (sessionStorage.getItem(authKey)) return;

    fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const userData = data.user;
          setTelegramUser(userData);                // 更新 Context 状态
          localStorage.setItem('user', JSON.stringify(userData));
          window.dispatchEvent(new Event('auth-change'));
          sessionStorage.setItem(authKey, '1');
        }
      })
      .catch(console.error);
  }, []);

  // 2️⃣ 从 localStorage 恢复网页登录用户
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setWebUser(JSON.parse(stored));
    } catch {}
  }, []);

  // 监听 auth-change
  useEffect(() => {
    const handler = () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setWebUser(parsed);
          // 如果已经是 telegram 用户，也更新 telegramUser
          if (parsed.telegram_id) setTelegramUser(parsed);
        }
      } catch {}
    };
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, []);

  // 3️⃣ 固定测试数据加载（你的原逻辑，保持不变）
  const FIXED_USER_ID = "11111111-1111-1111-1111-111111111111";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await fetch(`http://localhost:5000/api/creator/dashboard?user_id=${FIXED_USER_ID}`);
        const dashboardData = await dashboardRes.json();
        if (dashboardData.success) setDashboard(dashboardData.data);
      } catch (e) { console.error("dashboard fetch error", e); }

      try {
        const userRes = await fetch(`http://localhost:5000/api/user/profile?user_id=${FIXED_USER_ID}`);
        const userData = await userRes.json();
        if (userData.success) setUser(userData.data);
      } catch (e) { console.error("user fetch error", e); }

      try {
        const balanceRes = await fetch(`http://localhost:5000/api/user/balance?user_id=${FIXED_USER_ID}`);
        const balanceData = await balanceRes.json();
        if (balanceData.success) setBalance(balanceData.data);
      } catch (e) { console.error("balance fetch error", e); }
    };
    fetchData();
  }, []);

  return (
    <AppDataContext.Provider value={{
      user,
      balance,
      dashboard,
      webUser,
      setWebUser,
      telegramUser,        // 暴露给所有页面
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);