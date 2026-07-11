"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AppDataContext = createContext<any>(null);

export const AppDataProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const USER_ID = "11111111-1111-1111-1111-111111111111";

useEffect(() => {
  const fetchData = async () => {
    try {
      const dashboardRes = await fetch(`http://localhost:5000/api/creator/dashboard?user_id=${USER_ID}`);
      const dashboardData = await dashboardRes.json();
      if (dashboardData.success) setDashboard(dashboardData.data);
    } catch (e) { console.error("dashboard fetch error", e); }

    try {
      const userRes = await fetch(`http://localhost:5000/api/user/profile?user_id=${USER_ID}`);
      const userData = await userRes.json();
      if (userData.success) setUser(userData.data);
    } catch (e) { console.error("user fetch error", e); }

    try {
      const balanceRes = await fetch(`http://localhost:5000/api/user/balance?user_id=${USER_ID}`);
      const balanceData = await balanceRes.json();
      if (balanceData.success) setBalance(balanceData.data);
    } catch (e) { console.error("balance fetch error", e); }
  };
  fetchData();
}, []);

  return (
    <AppDataContext.Provider value={{ user, balance, dashboard }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);