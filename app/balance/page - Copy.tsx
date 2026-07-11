"use client";

import { useAppData } from "@/providers/AppDataProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { Address } from "@ton/core";




export default function BalancePage() {
  const {user,balance,refreshAppData,telegramUser,webUser,} = useAppData();
  const router = useRouter();

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [pinError, setPinError] = useState("");
  const [withdrawStep, setWithdrawStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [tonConnectUI] = useTonConnectUI();
  const isSessionConnected = !!tonConnectUI.wallet;
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const [displayBalance, setDisplayBalance] = useState(0);
  const [hasPin, setHasPin] = useState(true);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showChangePinModal,setShowChangePinModal] = useState(false);
  const [changePinStep,setChangePinStep] = useState("verify");
  const [currentPin,setCurrentPin] = useState("");
  const [newPinValue,setNewPinValue] = useState("");
  const [confirmPinValue,setConfirmPinValue] = useState("");
  const [showForgotPinModal,setShowForgotPinModal] = useState(false);
  const [forgotPinStep,setForgotPinStep] = useState("verify-wallet");
  const [forgotPinValue,setForgotPinValue] = useState("");
  const [forgotPinConfirm,setForgotPinConfirm] = useState("");
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [verifyPinError, setVerifyPinError] = useState("");
  const [showVerifyPinModal,setShowVerifyPinModal] = useState(false);
  const [verifyPin,setVerifyPin] = useState("");
  const [verifyAction,setVerifyAction] = useState(null);
  
  let friendlyWallet = "";

try {

  if (
    user?.wallet_address &&
    user.wallet_address.includes(":")
  ) {

    friendlyWallet =
      Address
        .parseRaw(
          user.wallet_address
        )
        .toString();

  }

} catch (err) {
  console.log(
    "wallet parse failed",
    err
  );
}
  
const checkPin = async () => {
  const res = await fetch(
    `${API_BASE}/api/user/profile?user_id=${user.id}`
  );

  const data = await res.json();

  if (!data.data?.withdraw_pin_hash) {
    setHasPin(false);
  }
};

  // 💰 balance animation
  useEffect(() => {
     if (
    balance?.usdt_balance == null
  ) return;


    let start = 0;
    const end = Number(balance.usdt_balance);
    const duration = 800;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setDisplayBalance(end);
        clearInterval(timer);
      } else {
        setDisplayBalance(parseFloat(start.toFixed(2)));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [balance]);
  
useEffect(() => {
  if (!user?.id) return;
  checkPin();
}, [user]);

  // 📜 transactions preview
  useEffect(() => {
    if (!user?.id) return;

    fetch(`${API_BASE}/api/user/transactions/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTx(data.data.slice(0, 3));
        }
      })
      .finally(() => setLoadingTx(false));
  }, [user]);
  
  // 📺 ad settlement
useEffect(() => {

  if (!user?.id) return;

  fetch(
    `${API_BASE}/api/creator/analytics?user_id=${user.id}`
  )
    .then((res) => res.json())
    .then((data) => {

      if (data.success) {
        setAnalytics(data.data);
		console.log(data.data);
      }

    });

}, [user]);

  if (!user) return null;
  
const handleSetPin = async () => {
  await fetch(`${API_BASE}/api/wallet/set-pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.id,
      pin,
    }),
  });

  setHasPin(true);
};


  const handleWithdraw = async () => {
	  
	  setPinError("");
	  
   // 🔥 加在这里（第一行下面）
  if (pin.length !== 6) {
     setPinError("Please enter a 6-digit PIN");
    return;
  }

  if (!amount) {
    setWithdrawError("Please enter an amount");
    return;
  }


    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user.id,
          amount: Number(amount),
          pin
        })
      });

      const data = await res.json();

      if (data.success) {
		await refreshAppData(user);
        setShowWithdraw(false);
        setAmount("");
        setPin("");
        setShowWithdrawSuccess(true);
      } else {
        setPinError(
    data.error || "Withdrawal failed"
  );
      }

    } catch (err) {
      console.error(err);
      setPinError(
    "Network error. Please try again."
  );
    } finally {
      setLoading(false);
    }
  };
  
const handleConnectWallet = async () => {
	
if (!hasPin) {
  setShowPinModal(true);
  return;
}
  try {

    let wallet = tonConnectUI.wallet;

    if (!wallet) {
      wallet =
        await tonConnectUI.connectWallet();
    }

    const address = wallet.account.address;

    const res = await fetch(
      `${API_BASE}/api/wallet/connect`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          wallet_address: address,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
	  
      await refreshAppData(telegramUser || webUser);
    }

  } catch (err) {
    alert(JSON.stringify(err));
  }
};

const handleDisconnectWallet =
  async () => {

    try {

      await tonConnectUI.disconnect();
	  
	  setShowWalletMenu(false);

      await fetch(
        `${API_BASE}/api/wallet/disconnect`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        }
      );

      alert(
        "Wallet disconnected"
      );

      await refreshAppData(telegramUser || webUser);

    } catch (err) {

      console.error(err);

      alert(
        "Disconnect failed"
      );

    }

};


const handleReconnectWallet =
  async () => {

    try {

      await tonConnectUI.connectWallet();
	  
	  setShowWalletMenu(false);

    } catch (err) {

      console.error(err);

    }

};

const handleChangeWallet =
  async () => {

setVerifyAction("change-wallet");
setVerifyPin("");
setVerifyPinError("");
setShowVerifyPinModal(true);

    const verifyRes =
      await fetch(
        `${API_BASE}/api/wallet/verify-pin`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            pin: verifyPin,
          }),
        }
      );

    const verifyData =
      await verifyRes.json();

    if (!verifyData.success) {

      alert("❌ Invalid PIN");
	  
      return;

    }

const oldWallet =
  user.wallet_address;

try {

  await tonConnectUI.disconnect();

  const wallet =
    await tonConnectUI.connectWallet();

  const newWallet =
    wallet.account.address;

  if (
    newWallet === oldWallet
  ) {

    alert(
      "Please connect a different wallet"
    );

    return;

  }

const updateRes =
  await fetch(
    `${API_BASE}/api/wallet/change-wallet`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        wallet_address:
          newWallet,
      }),
    }
  );

const updateData =
  await updateRes.json();

if (!updateData.success) {

  alert(
    "Update wallet failed"
  );

  return;

}

alert(
  "Wallet changed successfully ✅"
);

setShowWalletMenu(false);

await refreshAppData(
  telegramUser || webUser
);

} catch (err) {

  console.error(err);

  alert(
    "Wallet connection cancelled"
  );

}
};

const handleChangePin =
  async () => {

    const currentPin =
      prompt(
        "Current PIN"
      );

    if (!currentPin) return;

    const verifyRes =
      await fetch(
        `${API_BASE}/api/wallet/verify-pin`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            pin: currentPin,
          }),
        }
      );

    const verifyData =
      await verifyRes.json();

    if (!verifyData.success) {

     alert("❌ Invalid PIN");

      return;

    }

 const newPin =
  prompt(
    "Enter new 6-digit PIN"
  );

if (!newPin) return;

if (!/^\d{6}$/.test(newPin)) {

  alert(
    "PIN must be 6 digits"
  );

  return;

}

const confirmPin =
  prompt(
    "Confirm new PIN"
  );

if (
  newPin !== confirmPin
) {

  alert(
    "PIN does not match"
  );

  return;

}

const changeRes =
  await fetch(
    `${API_BASE}/api/wallet/change-pin`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        new_pin: newPin,
      }),
    }
  );

const changeData =
  await changeRes.json();

if (!changeData.success) {

  alert(
    changeData.error ||
    "Change PIN failed"
  );

  return;

}

alert(
  "PIN changed successfully ✅"
);

setShowWalletMenu(false);

};

  const getLabel = (t: any) => {
    if (t.type === "gift_receive") return "💰 Gift";
    if (t.type === "withdraw") return "💸 Withdraw";
    if (t.type === "topup") return "💎 Top up";
    return t.type;
  };

  const getColor = (t: any) => {
    if (t.type === "gift_receive" || t.type === "topup") return "text-green-400";
    if (t.type === "withdraw") return "text-red-400";
    return "text-white";
  };

  return (
    <div
  className="
    h-full
    overflow-y-auto
    max-w-md
    mx-auto
    p-4
    bg-black
    text-white
    pb-32
  "
  style={{
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
>
	   <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-white text-lg"
      >
        ← Back
      </button>
<div className="text-center mb-6">

  <p className="text-lg font-semibold">Balance</p>

  <p className="text-xs text-gray-400">
    🔒 Secure
  </p>

</div>

      {/* 💰 MAIN BALANCE */}
<div className="bg-gradient-to-r from-green-500 to-green-700-700 text-black p-6 rounded-2xl mb-4 flex justify-between items-center shadow-lg">

  {/* 左边 */}
  <div>
    <p className="text-sm text-white/80">Total USDT</p>
    <h1 className="text-3xl font-bold">
      ${displayBalance}
    </h1>
  </div>

  {/* 右边（关键🔥） */}
  <div className="flex flex-col items-end">

    <button
      onClick={() => {
         // ❌ 没 wallet
 if (!isSessionConnected) {
  alert(
    "⚠ Wallet Not Connected\n\nPlease connect your TON wallet before withdrawing."
  );
  return;
}

  // ❌ 没 PIN
if (!hasPin) {
  setShowPinModal(true);
  return;
}

        setWithdrawStep(1);
		setAmount("");
		setPin("");
		setShowWithdraw(true);
      }}
      className="bg-black text-yellow-400 px-5 py-2 rounded-lg font-semibold"
    >
      Withdraw
    </button>


  </div>

</div>
	  
	  {/* 👛 Wallet */}
<div className="bg-gray-900 p-3 rounded-xl mb-3 flex justify-between items-center">

  <div>
    <p className="text-xs text-gray-400">Wallet</p>
  <p className="text-sm">
  {friendlyWallet
    ? friendlyWallet.slice(0, 12) + "..."
    : "Not connected"}
</p>
  </div>

{!user?.wallet_address ? (

  <button
    onClick={handleConnectWallet}
    className="text-green-400 text-sm"
  >
    Connect
  </button>

) : (

  <div className="relative">

    <button
      onClick={() =>
        setShowWalletMenu(
          !showWalletMenu
        )
      }
      className="text-green-400 text-sm"
    >
      {isSessionConnected
  ? "Connected  ▼"
  : "Disconnected  ▼"}
    </button>

    {showWalletMenu && (

      <div
        className="
          absolute
          right-0
          mt-2
          bg-gray-800
          rounded-lg
          shadow-lg
          z-50
          w-40
        "
      >

        <button
          onClick={() => {

          navigator.clipboard.writeText(
  friendlyWallet ||
  user.wallet_address
);

            alert("Copied");

          }}
          className="
            block
            w-full
            text-left
            px-4
            py-2
          "
        >
          Copy Address
        </button>
		
		<button
		onClick={handleChangeWallet}
  className="
    block
    w-full
    text-left
    px-4
    py-2
    text-white
  "
>
  Change Wallet
</button>

<button
onClick={() => {
  setShowWalletMenu(false);
  setShowChangePinModal(true);
}}
  className="
    block
    w-full
    text-left
    px-4
    py-2
    text-white
  "
>
  Change PIN
</button>

<button
  onClick={() => {

    setShowWalletMenu(false);

    setShowForgotPinModal(true);

  }}
  className="
    block
    w-full
    text-left
    px-4
    py-2
    text-white
  "
>
  Forgot PIN
</button>

        {isSessionConnected ? (
  <button
    onClick={
      handleDisconnectWallet
    }
    className="
      block
      w-full
      text-left
      px-4
      py-2
      text-red-400
    "
  >
    Disconnect
  </button>
) : (
  <button
  onClick={
    handleReconnectWallet
  }
    className="
      block
      w-full
      text-left
      px-4
      py-2
      text-green-400
    "
  >
    Reconnect
  </button>
)}

      </div>

    )}

  </div>

)}
</div>

      {/* 💎 + ⚡ */}
   <div className="grid grid-cols-2 gap-3 mb-4">
<div className="bg-gray-900 p-4 rounded-xl flex justify-between items-center">
  <div>
    <p className="text-gray-400 text-sm">💎 Diamond</p>
    <p className="text-xl font-bold mt-1">
      {balance?.diamond_balance ?? 0}
    </p>
  </div>
  <button
    onClick={() => router.push("/buy-diamonds")}
    className="text-pink-400 text-sm font-semibold flex items-center gap-1"
  >
    Get Diamonds <span className="text-lg">›</span>
  </button>
</div>
  <div className="bg-gray-900 p-4 rounded-xl">
    <p className="text-gray-400 text-sm">⚡ Points</p>
    <p className="text-xl font-bold mt-1">
      {balance?.points ?? 0}
    </p>
  </div>
</div>

{/* 📺 Ad Revenue */}

<div className="bg-gray-900 p-4 rounded-xl mb-4">

  <div className="flex items-center justify-between mb-3">

    <p className="text-sm font-semibold text-white">
      📺 Ad Revenue
    </p>

    <button
      onClick={() =>
        router.push("/creator/analytics")
      }
      className="text-xs text-gray-400"
    >
      View Analytics →
    </button>

  </div>

  <div className="space-y-2 text-sm">

    {/* Pending */}
    <div className="flex justify-between">

      <span className="text-gray-400">
        Pending Revenue
      </span>

      <span className="text-yellow-400">
        $
        {analytics?.ad_settlement?.pending?.toFixed(2) || "0.00"}
      </span>

    </div>

    {/* Released Today */}
    <div className="flex justify-between">

      <span className="text-gray-400">
        Released Today
      </span>

      <span className="text-green-400">
        +
        $
        {analytics?.ad_settlement?.released_today?.toFixed(2) || "0.00"}
      </span>

    </div>

    {/* Next Release */}
    <div className="flex justify-between">

      <span className="text-gray-400">
        Next Release
      </span>

      <span className="text-white">

        {analytics?.ad_settlement
          ?.next_release_date
          ? new Date(
              analytics.ad_settlement
                .next_release_date
            ).toLocaleDateString()
          : "-"}

      </span>

    </div>

  </div>

</div>

      {/* 📜 Transactions */}
      <div className="mb-2">

        <div className="flex justify-between items-center mb-2">
          <p className="text-lg">Transactions</p>

          <button
            onClick={() => router.push("/transactions")}
            className="text-gray-400 text-sm"
          >
            View All →
          </button>
        </div>

      </div>
	  
	  {/* 🧩 Services */}
<div className="mb-2">

  <p className="text-lg mb-4">Services</p>

  <div className="grid grid-cols-2 gap-3">

    {/* 🎁 NFT Rewards */}
    <div
      onClick={() => alert("Coming Soon")}
      className="bg-gray-900 p-4 rounded-xl cursor-pointer hover:bg-gray-800 transition"
    >
      <p className="text-sm text-gray-400">🎁</p>
      <p className="mt-1 font-semibold">NFT Rewards</p>
      <p className="text-xs text-gray-500 mt-1">
        Collect & earn
      </p>
    </div>

    {/* 📊 Monetisation */}
    <div
      onClick={() =>
  router.push("/creator")
}
      className="bg-gray-900 p-4 rounded-xl cursor-pointer hover:bg-gray-800 transition"
    >
      <p className="text-sm text-gray-400">📊</p>
      <p className="mt-1 font-semibold">Monetisation</p>
      <p className="text-xs text-gray-500 mt-1">
        Ads revenue
      </p>
    </div>

  </div>

</div>

{/* ⚙️ Settings */}
<div className="mb-10">



  <div
    onClick={() => alert("Help & Feedback")}
    className="bg-gray-900 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-800 transition"
  >
    <div>
      <p className="font-semibold">Help & Feedback</p>
      <p className="text-xs text-gray-500">
        Support & contact
      </p>
    </div>

    <span className="text-gray-400">›</span>
  </div>

</div>

{showVerifyPinModal && (

<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">

  <div className="bg-gray-900 p-6 rounded-xl w-80">

    <h2 className="text-xl mb-4 text-yellow-400">
      Verify PIN
    </h2>

    <p className="text-sm text-gray-400 mb-4">
      Enter your 6-digit security PIN
    </p>

    <div className="flex justify-center gap-2 mb-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i < verifyPin.length
              ? "bg-yellow-400"
              : "bg-gray-600"
          }`}
        />
      ))}
    </div>

    {verifyPinError && (
      <p className="text-red-400 text-sm text-center mb-4">
        {verifyPinError}
      </p>
    )}
	
		<button
  onClick={async () => {

    const verifyRes =
      await fetch(
        `${API_BASE}/api/wallet/verify-pin`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            pin: verifyPin,
          }),
        }
      );

    const verifyData =
      await verifyRes.json();

    if (!verifyData.success) {

      setVerifyPinError(
        "Invalid PIN"
      );

      return;

    }

   setShowVerifyPinModal(false);

  }}
  className="
    bg-yellow-500
    text-black
    w-full
    py-2
    rounded
    font-bold
    mb-4
  "
>
  Verify
</button>

    {/* Keypad */}
    <div className="grid grid-cols-3 gap-3 mb-4">

      {[1,2,3,4,5,6,7,8,9].map((n) => (
        <button
          key={n}
          onClick={() => {
            if (verifyPin.length < 6) {
              setVerifyPin(
                verifyPin + n
              );
            }
          }}
          className="bg-black border border-gray-700 py-3 rounded text-lg"
        >
          {n}
        </button>
      ))}

      <div />

      <button
        onClick={() => {
          if (verifyPin.length < 6) {
            setVerifyPin(
              verifyPin + "0"
            );
          }
        }}
        className="bg-black border border-gray-700 py-3 rounded text-lg"
      >
        0
      </button>

      <button
        onClick={() =>
          setVerifyPin(
            verifyPin.slice(0, -1)
          )
        }
        className="bg-black border border-gray-700 py-3 rounded text-lg"
      >
        ⌫
      </button>
	  


    </div>
	
	<button
  onClick={() => {
    setShowVerifyPinModal(false);
    setVerifyPin("");
    setVerifyPinError("");
  }}
  className="
    text-gray-400
    w-full
    mt-2
  "
>
  Cancel
</button>

  </div>

</div>

)}

{/* 🔐 Set PIN Modal */}

{showPinModal && (

  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">

    <div className="bg-gray-900 p-6 rounded-xl w-80">

      <h2 className="text-xl mb-4 text-yellow-400">
        Set PIN
      </h2>

      <p className="text-sm text-gray-400 mb-4">
        Create a 6-digit PIN before connecting wallet.
      </p>

      <input
        type="password"
        maxLength={6}
        value={newPin}
        onChange={(e) =>
          setNewPin(
            e.target.value
          )
        }
        placeholder="Enter PIN"
        className="
          w-full
          mb-3
          p-2
          rounded
          bg-black
          border
          border-gray-700
        "
      />

      <input
        type="password"
        maxLength={6}
        value={confirmPin}
        onChange={(e) =>
          setConfirmPin(
            e.target.value
          )
        }
        placeholder="Confirm PIN"
        className="
          w-full
          mb-4
          p-2
          rounded
          bg-black
          border
          border-gray-700
        "
      />

      <button
        onClick={async () => {

          if (
            newPin.length !== 6
          ) {

            alert(
              "PIN must be 6 digits"
            );

            return;
          }

          if (
            newPin !== confirmPin
          ) {

            alert(
              "PIN does not match"
            );

            return;
          }

          const res =
            await fetch(
              `${API_BASE}/api/wallet/set-pin`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  user_id: user.id,
                  pin: newPin,
                }),
              }
            );

          const data =
            await res.json();

          if (!data.success) {

            alert(
              data.error ||
              "Set PIN failed"
            );

            return;
          }

          alert(
            "PIN set successfully ✅"
          );

          setHasPin(true);

          setShowPinModal(false);

          setNewPin("");

          setConfirmPin("");

        }}
        className="
          bg-yellow-500
          text-black
          w-full
          py-2
          rounded
          font-bold
        "
      >
        Save PIN
      </button>

      <button
        onClick={() => {

          setShowPinModal(false);

          setNewPin("");

          setConfirmPin("");

        }}
        className="
          mt-3
          text-gray-400
          w-full
        "
      >
        Cancel
      </button>

    </div>

  </div>

)}

    {/* 💸 Withdraw Modal */}
{showWithdraw && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">

    <div className="bg-gray-900 p-6 rounded-xl w-80">

      <h2 className="text-yellow-400 text-2xl mb-4">
  {withdrawStep === 1
    ? "Withdraw 💸"
    : "Withdraw PIN"}
</h2>
	  
{withdrawStep === 1 && (

<>

  <input
    type="number"
    placeholder="Amount"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    className="
      w-full
      mb-4
      p-3
      rounded-lg
      bg-black
      border
      border-gray-700
    "
  />
  
  {withdrawError && (
  <p className="text-red-400 text-sm mb-3">
    {withdrawError}
  </p>
)}

  <button
    onClick={() => {

      const value = Number(amount);

      if (!value) {
        setWithdrawError("Please enter an amount");
        return;
      }

      if (value < 20) {
        setWithdrawError("Minimum withdrawal is 20 USDT");
        return;
      }

      if (
        value >
        Number(balance?.usdt_balance || 0)
      ) {
        setWithdrawError("Insufficient balance");
        return;
      }
	  
      setWithdrawError("");
      setWithdrawStep(2);

    }}
	className="
    w-full
    bg-yellow-500
    text-black
    font-bold
    py-3
    rounded-lg
    mb-3
  "
  >
    Continue
  </button>

</>

)}

   {withdrawStep === 2 && (
<>

<div className="bg-black rounded-lg p-3 mb-4 border border-gray-800">

    <div className="flex justify-between text-sm mb-2">
    <span className="text-gray-400">
      Amount
    </span>

    <span className="text-green-400 font-bold">
      ${amount}
    </span>
  </div>

  <div className="flex justify-between text-sm">
    <span className="text-gray-400">
      Wallet
    </span>

    <span className="text-white text-xs">
      {friendlyWallet
        ? friendlyWallet.slice(0, 8) + "..."
        : "Not Connected"}
    </span>
  </div>

  </div>
  
 <p className="text-gray-400 text-sm mb-4">
    Enter your 6-digit security PIN
  </p>
   {/* 🔐 PIN DOTS */}
      <div className="flex justify-center gap-2 mb-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < pin.length ? "bg-yellow-400" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
	  
	  {pinError && (
  <p className="text-red-400 text-sm text-center mb-4">
    {pinError}
  </p>
)}

      {/* 🔢 KEYPAD */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <button
            key={n}
            onClick={() => {
              if (pin.length < 6) setPin(pin + n);
            }}
            className="bg-black border border-gray-700 py-3 rounded text-lg"
          >
            {n}
          </button>
        ))}

        <div></div>

        <button
          onClick={() => {
            if (pin.length < 6) setPin(pin + "0");
          }}
          className="bg-black border border-gray-700 py-3 rounded text-lg"
        >
          0
        </button>

        <button
          onClick={() => setPin(pin.slice(0, -1))}
          className="bg-black border border-gray-700 py-3 rounded text-lg"
        >
          ⌫
        </button>
      </div>

</>
)}

      {/* ✅ Confirm */}
    {withdrawStep === 2 && (

<button
  onClick={handleWithdraw}
  className="
    w-full
    bg-yellow-500
    text-black
    font-bold
    py-3
    rounded-lg
    mb-3
  "
>
  Confirm Withdrawal
</button>

)}

      {/* ❌ Cancel */}
      <button
       onClick={() => {
		setShowWithdraw(false);
		setPin("");
		setAmount("");
		setWithdrawStep(1);
		}}
        className="py-3 text-gray-400 w-full"
      >
        Cancel
      </button>

    </div>
  </div>
)}

{showWithdrawSuccess && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

    <div className="bg-[#1A1A1A] rounded-2xl p-6 w-[90%] max-w-sm text-center">

      <div className="text-5xl mb-3">
        ✅
      </div>

      <h2 className="text-xl font-bold text-white mb-2">
        Withdrawal Submitted
      </h2>

      <p className="text-gray-400 text-sm mb-6">
        Your withdrawal request is pending admin approval.
      </p>
	  
	  <button
  onClick={() => {

    setShowWithdrawSuccess(false);

    router.push("/transactions");

  }}
  className="
    w-full
    bg-yellow-500
    text-black
    py-3
    rounded-lg
    font-bold
    mb-3
  "
>
  View Transactions
</button>

     <button
  onClick={() => {
    setShowWithdrawSuccess(false);
  }}
  className="
    w-full
    py-3
    text-gray-400
  "
>
  Close
</button>

    </div>

  </div>
)}

{/* 🔐 Change PIN Modal */}
{showChangePinModal && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">

    <div className="bg-gray-900 p-6 rounded-xl w-80">

 <h2 className="text-xl mb-4 text-yellow-400">
  {changePinStep === "verify"
    ? "Verify PIN"
    : changePinStep === "new"
    ? "New PIN"
    : "Confirm PIN"}
</h2>

<p className="text-sm text-gray-400 mb-4">
  {changePinStep === "verify"
    ? "Enter Current PIN"
    : changePinStep === "new"
    ? "Enter New PIN"
    : "Confirm New PIN"}
</p>

      {/* PIN Dots */}
      <div className="flex justify-center gap-2 mb-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i <
(
  changePinStep === "verify"
    ? currentPin.length
    : changePinStep === "new"
    ? newPinValue.length
    : confirmPinValue.length
)
                ? "bg-yellow-400"
                : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 mb-4">

      {[1,2,3,4,5,6,7,8,9].map((n) => (
  <button
    key={n}
    onClick={() => {

      if (changePinStep === "verify") {

        if (currentPin.length < 6) {
          setCurrentPin(
            currentPin + n
          );
        }

      } else if (
        changePinStep === "new"
      ) {

        if (newPinValue.length < 6) {
          setNewPinValue(
            newPinValue + n
          );
        }

      } else {

        if (
          confirmPinValue.length < 6
        ) {

          setConfirmPinValue(
            confirmPinValue + n
          );

        }

      }

    }}
    className="bg-black border border-gray-700 py-3 rounded text-lg"
  >
    {n}
  </button>
))}

        <div />

     <button
  onClick={() => {

    if (changePinStep === "verify") {

      if (currentPin.length < 6) {
        setCurrentPin(
          currentPin + "0"
        );
      }

    } else if (
      changePinStep === "new"
    ) {

      if (newPinValue.length < 6) {
        setNewPinValue(
          newPinValue + "0"
        );
      }

    } else {

      if (
        confirmPinValue.length < 6
      ) {

        setConfirmPinValue(
          confirmPinValue + "0"
        );

      }

    }

  }}
  className="bg-black border border-gray-700 py-3 rounded text-lg"
>
  0
</button>

        <button
  onClick={() => {

    if (changePinStep === "verify") {

      setCurrentPin(
        currentPin.slice(0, -1)
      );

    } else if (
      changePinStep === "new"
    ) {

      setNewPinValue(
        newPinValue.slice(0, -1)
      );

    } else {

      setConfirmPinValue(
        confirmPinValue.slice(0, -1)
      );

    }

  }}
  className="bg-black border border-gray-700 py-3 rounded text-lg"
>
  ⌫
</button>

      </div>

      <button
onClick={async () => {

if (changePinStep === "verify") {
	
  const verifyRes =
    await fetch(
      `${API_BASE}/api/wallet/verify-pin`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          pin: currentPin,
        }),
      }
    );

  const verifyData =
    await verifyRes.json();

  if (!verifyData.success) {

  alert("❌ Invalid PIN");

    return;

  }

  setChangePinStep("new");

} else if (
    changePinStep === "new"
  ) {

    setChangePinStep("confirm");

  } else {

  if (
    newPinValue !==
    confirmPinValue
  ) {

    alert(
      "PIN does not match"
    );

    return;

  }

  const changeRes =
    await fetch(
      `${API_BASE}/api/wallet/change-pin`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          new_pin: newPinValue,
        }),
      }
    );

  const changeData =
    await changeRes.json();

  if (!changeData.success) {

    alert(
      changeData.error ||
      "Change PIN failed"
    );

    return;

  }

  alert(
    "PIN changed successfully ✅"
  );

  setShowChangePinModal(false);

  setCurrentPin("");
  setNewPinValue("");
  setConfirmPinValue("");

  setChangePinStep("verify");

}

}}
  className="bg-yellow-500 text-black w-full py-2 rounded font-bold"
>
  {changePinStep === "verify"
    ? "Verify"
    : changePinStep === "new"
    ? "Continue"
    : "Save PIN"}
</button>

      <button
        onClick={() => {
          setShowChangePinModal(false);
          setCurrentPin("");
        }}
        className="mt-3 text-gray-400 w-full"
      >
        Cancel
      </button>

    </div>

  </div>
)}

{/* 🔓 Forgot PIN Modal */}
{showForgotPinModal && (

  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">

    <div className="bg-gray-900 p-6 rounded-xl w-80">

     <h2 className="text-xl mb-4 text-yellow-400">
  {forgotPinStep === "verify-wallet"
    ? "Forgot PIN"
    : forgotPinStep === "new-pin"
    ? "New PIN"
    : "Confirm PIN"}
</h2>

  <p className="text-sm text-gray-400 mb-6 text-center">
  {forgotPinStep === "verify-wallet"
    ? "Verify wallet ownership to reset your PIN."
    : forgotPinStep === "new-pin"
    ? "Enter your new PIN."
    : "Confirm your new PIN."}
</p>

{forgotPinStep !== "verify-wallet" && (

  <div className="flex justify-center gap-2 mb-4">

    {[...Array(6)].map((_, i) => (

      <div
        key={i}
        className={`w-3 h-3 rounded-full ${
          i <
          (
            forgotPinStep === "new-pin"
              ? forgotPinValue.length
              : forgotPinConfirm.length
          )
            ? "bg-yellow-400"
            : "bg-gray-600"
        }`}
      />

    ))}

  </div>

)}

{forgotPinStep !== "verify-wallet" && (

  <div className="grid grid-cols-3 gap-3 mb-4">

    {[1,2,3,4,5,6,7,8,9].map((n) => (

      <button
        key={n}
        onClick={() => {

          if (
            forgotPinStep === "new-pin"
          ) {

            if (
              forgotPinValue.length < 6
            ) {

              setForgotPinValue(
                forgotPinValue + n
              );

            }

          } else {

            if (
              forgotPinConfirm.length < 6
            ) {

              setForgotPinConfirm(
                forgotPinConfirm + n
              );

            }

          }

        }}
        className="bg-black border border-gray-700 py-3 rounded text-lg"
      >
        {n}
      </button>

    ))}

    <div />

   <button
  onClick={() => {

    if (
      forgotPinStep === "new-pin"
    ) {

      if (
        forgotPinValue.length < 6
      ) {

        setForgotPinValue(
          forgotPinValue + "0"
        );

      }

    } else {

      if (
        forgotPinConfirm.length < 6
      ) {

        setForgotPinConfirm(
          forgotPinConfirm + "0"
        );

      }

    }

  }}
  className="bg-black border border-gray-700 py-3 rounded text-lg"
>
  0
</button>

   <button
  onClick={() => {

    if (
      forgotPinStep === "new-pin"
    ) {

      setForgotPinValue(
        forgotPinValue.slice(0, -1)
      );

    } else {

      setForgotPinConfirm(
        forgotPinConfirm.slice(0, -1)
      );

    }

  }}
  className="bg-black border border-gray-700 py-3 rounded text-lg"
>
  ⌫
</button>

  </div>

)}


<button
  onClick={async () => {

   if (
  forgotPinStep ===
  "verify-wallet"
) {

  try {

    const result =
      await tonConnectUI.signData({

        type: "text",

        text:
          "LoopCast Forgot PIN Verification"

      });
	  
	  const verifyRes = await fetch(
    `${API_BASE}/api/wallet/verify-wallet-owner`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        wallet_address:
          result.address,
      }),
    }
  );

const verifyData =
  await verifyRes.json();

    console.log(
      "SIGN RESULT",
      result
    );

   alert(
  JSON.stringify(
    result,
    null,
    2
  )
);

 if (!verifyData.success) {

  alert(
    "Wallet verification failed"
  );

  return;

}

alert(
  "Wallet verified ✅"
);

setForgotPinStep(
  "new-pin"
);

  } catch (err) {

    console.error(err);

    alert(
      "Signature Cancelled"
    );

  }

} else if (
      forgotPinStep ===
      "new-pin"
    ) {

      if (
        forgotPinValue.length !== 6
      ) {

        alert(
          "PIN must be 6 digits"
        );

        return;

      }

      setForgotPinStep(
        "confirm-pin"
      );

    } else {

  if (
    forgotPinValue !==
    forgotPinConfirm
  ) {

    alert(
      "PIN does not match"
    );

    return;

  }

const resetRes =
  await fetch(
    `${API_BASE}/api/wallet/reset-pin`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        pin: forgotPinValue,
      }),
    }
  );

const resetData =
  await resetRes.json();

if (!resetData.success) {

  alert(
    resetData.error ||
    "Reset PIN failed"
  );

  return;

}

alert(
  "PIN reset successfully ✅"
);

setShowForgotPinModal(false);

setForgotPinStep(
  "verify-wallet"
);

setForgotPinValue("");

setForgotPinConfirm("");

}

  }}
  className="bg-yellow-500 text-black w-full py-2 rounded font-bold"
>
  {forgotPinStep ===
  "verify-wallet"
    ? "Verify Wallet"
    : forgotPinStep ===
      "new-pin"
    ? "Continue"
    : "Save PIN"}
</button>

      <button
        onClick={() => {

          setShowForgotPinModal(false);

        }}
        className="mt-3 text-gray-400 w-full"
      >
        Cancel
      </button>

    </div>

  </div>

)}

    </div>
  );
}