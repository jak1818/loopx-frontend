"use client";

import { useAppData } from "@/providers/AppDataProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { Address, beginCell } from "@ton/core";

const PACKAGES = [
  { code: 3001, diamond: 100, price: "1 USDT", bonus: null },
  { code: 3002, diamond: 500, price: "5 USDT", bonus: null },
  { code: 3003, diamond: 1000, price: "10 USDT", bonus: null },
  { code: 3004, diamond: 5050, price: "50 USDT", bonus: "🎁 +1%" },
  { code: 3005, diamond: 10100, price: "100 USDT", bonus: "🎁 +1%" },
  { code: 3006, diamond: 20300, price: "200 USDT", bonus: "🎁 +1.5%" },
];

// ==================== 工具函数 ====================

/** 将 userId 转换为 64-bit userHash（取前16位hex） */
function userIdToHash(userId: string): bigint {
  return BigInt("0x" + userId.replace(/-/g, "").substring(0, 16));
}

/** 构建 TON 支付 payload（OP_TON_PAY） */
function buildTonPayload(orderId: string, productCode: number, userId: string): string {
  const hash = userIdToHash(userId);
  return beginCell()
    .storeUint(0x544f4e50, 32) // "TONP"
    .storeUint(BigInt(orderId), 64)
    .storeUint(productCode, 32)
    .storeUint(hash, 64)
    .endCell()
    .toBoc()
    .toString("base64");
}

/** 构建 USDT Jetton Transfer 完整 payload（包含 forward_payload 为 OP_USDT_PAY） */
function buildJettonTransferPayload(
  orderId: string,
  productCode: number,
  userId: string,
  amountNano: string,
  proxyJettonWallet: string,
  userMainWallet: string
): string {
  const hash = userIdToHash(userId);

  // forward_payload (OP_USDT_PAY)
  const forwardPayload = beginCell()
    .storeUint(0x55534454, 32) // "USDT"
    .storeUint(BigInt(orderId), 64)
    .storeUint(productCode, 32)
    .storeUint(hash, 64)
    .endCell();

  // 完整 Jetton Transfer 消息体
  return beginCell()
    .storeUint(0x0f8a7ea5, 32)                     // op: jetton_transfer
    .storeUint(0, 64)                               // query_id
    .storeCoins(BigInt(amountNano))                 // jetton amount
    .storeAddress(Address.parse(proxyJettonWallet)) // destination (proxy's jetton wallet)
    .storeAddress(Address.parse(userMainWallet))    // response_destination
	.storeBit(0)
	.storeCoins(BigInt("10000000"))
	.storeBit(1)
	.storeRef(forwardPayload)
    .endCell()
    .toBoc()
    .toString("base64");
}

// ==================== 页面组件 ====================

export default function BuyDiamondsPage() {
  const { user, balance, refreshAppData } = useAppData();
  const router = useRouter();
  const [tonConnectUI] = useTonConnectUI();
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const [selected, setSelected] = useState<number | null>(null);
  const [payCoin, setPayCoin] = useState<"TON" | "USDT">("USDT");
  const [loading, setLoading] = useState(false);

  // 首次充值奖励横幅（暂时写死，后可接入后端判断）
  const [firstChargeBonus] = useState(true);

  const handleSelect = (code: number) => setSelected(code);

  const handleRecharge = async () => {
    if (!selected) {
      alert("Please select a package");
      return;
    }
    if (!user?.id || !user.wallet_address) {
      alert("Please connect wallet first");
      return;
    }

    setLoading(true);
    try {
      // 1. 创建订单
      const initRes = await fetch(`${API_BASE}/api/usdt/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_code: selected,
          pay_coin: payCoin,
        }),
      });
	  
	
	   
      const initData = await initRes.json();
	  
      if (!initData.success) throw new Error(initData.error || "Init failed");

      const { order_id, amount_nano, proxy_address } = initData;
	  

      // 2. 构造交易
      if (payCoin === "TON") {
        // TON 转账 → 附带 payload
		
        const payload = buildTonPayload(order_id, selected, user.id);
        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              address: proxy_address,
              amount: amount_nano,
              payload,
            },
          ],
        };
        await tonConnectUI.sendTransaction(transaction);
      } else {

        // 计算用户自己的 Jetton 钱包地址（调用后端接口）
        const walletRes = await fetch(`${API_BASE}/api/usdt/calculate-wallet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_address: user.wallet_address }),
        });
        const walletData = await walletRes.json();
        if (!walletData.success) throw new Error("Failed to calculate user jetton wallet");

        const userJettonWallet = walletData.usdt_wallet_address;
		

        // 构建完整的 Jetton Transfer payload
        const body = buildJettonTransferPayload(
          order_id,
          selected,
          user.id,
          amount_nano,
          proxy_address,
          user.wallet_address
        );


        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              address: userJettonWallet,      // 发送到用户自己的 Jetton 钱包
              amount: "50000000",             // 附带 0.05 TON 作为 gas
              payload: body,
            },
          ],
        };

        await tonConnectUI.sendTransaction(transaction);
      }

      // 3. 轮询验证支付
      let verified = false;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const verifyRes = await fetch(`${API_BASE}/api/usdt/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id }),
        });
        const v = await verifyRes.json();
        if (v.success && v.paid) {
          verified = true;
          break;
        }
      }
      if (!verified) throw new Error("Payment not confirmed on-chain");

      // 4. 发货
      const fulfillRes = await fetch(`${API_BASE}/api/usdt/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id }),
      });
      const f = await fulfillRes.json();
      if (!f.success) throw new Error(f.error || "Fulfill failed");

      await refreshAppData(user);

      alert("Diamonds added! 🎉");
      router.back();
    } catch (err: any) {
      alert(
    "NAME: " + err?.name +
    "\n\nMESSAGE: " + err?.message
  );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-black text-white min-h-screen">
	
	 <div className="flex items-center justify-between mb-3">
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-white text-lg"
      >
        ← Back
      </button>
      <h1 className="text-white text-lg font-semibold">Get Diamonds</h1>
      <button
        onClick={() => router.push("/transactions")}
        className="text-gray-400 hover:text-white text-lg"
        title="Coin History"
      >
        📜
      </button>
    </div>
	
      {/* 顶部钻石余额 */}
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm">Your Diamond Balance</p>
        <p className="text-3xl font-bold mt-1">💎 {balance?.diamond_balance ?? 0}</p>
      </div>

      {/* 首次充值奖励 */}
      {firstChargeBonus && (
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-4 mb-5 text-center">
          <p className="text-lg font-bold">🌹 Get Roses x3 on First Charge!</p>
        </div>
      )}

      {/* 套餐选择 */}
      <div className="space-y-3 mb-6">
        <p className="text-sm text-gray-400 mb-2">Select Package</p>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.code}
              onClick={() => handleSelect(pkg.code)}
              className={`relative bg-gray-900 p-4 rounded-xl cursor-pointer border-2 transition
                ${selected === pkg.code ? "border-pink-500" : "border-transparent"}
                hover:bg-gray-800`}
            >
              {pkg.bonus && (
                <span className="absolute top-2 right-2 bg-pink-600 text-xs px-2 py-0.5 rounded-full">
                  {pkg.bonus}
                </span>
              )}
              <p className="text-2xl font-bold">{pkg.diamond.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">{pkg.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 支付方式选择 */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Pay with</p>
        <div className="flex gap-3">
          <button
            onClick={() => setPayCoin("USDT")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              payCoin === "USDT" ? "bg-green-600" : "bg-gray-800"
            }`}
          >
            💵 USDT
          </button>
          <button
            onClick={() => setPayCoin("TON")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              payCoin === "TON" ? "bg-blue-600" : "bg-gray-800"
            }`}
          >
            💎 TON
          </button>
        </div>
      </div>

      {/* Recharge 按钮 */}
      <button
        onClick={handleRecharge}
        disabled={!selected || loading}
        className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 py-3 rounded-xl font-bold text-lg mb-4"
      >
        {loading ? "Processing..." : "Recharge"}
      </button>

      {/* 政策说明 */}
      <p className="text-xs text-gray-500 text-center">
        By continuing, you agree to the{" "}
        <span
          className="underline cursor-pointer"
          onClick={() => alert("Virtual Items Policy")}
        >
          Virtual Items Policy
        </span>
      </p>
    </div>
  );
}