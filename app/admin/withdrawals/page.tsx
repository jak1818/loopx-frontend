"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminWithdrawalsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  const loadData = async () => {
    try {
      setLoading(true);

      const pendingRes = await fetch(
        `${API_URL}/api/admin/withdraw/pending`
      );
      const pendingData = await pendingRes.json();

      const historyRes = await fetch(
        `${API_URL}/api/admin/withdraw/history`
      );
      const historyData = await historyRes.json();

      setPending(pendingData.withdrawals || []);
      setHistory(historyData.withdrawals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (withdrawalId: string) => {
    const txHash = prompt("Enter TX Hash");

    if (!txHash) return;

    try {
      const res = await fetch(
        `${API_URL}/api/admin/withdraw/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            withdrawal_id: withdrawalId,
            tx_hash: txHash,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Approve failed");
        return;
      }

      alert("Withdrawal Approved");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Approve failed");
    }
  };

  const handleReject = async (withdrawalId: string) => {
    const confirmed = confirm(
      "Reject this withdrawal and refund balance?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_URL}/api/admin/withdraw/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            withdrawal_id: withdrawalId,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Reject failed");
        return;
      }

      alert("Withdrawal Rejected");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Reject failed");
    }
  };

const handlePrepare = async (withdrawalId: string) => {
  const res = await fetch(
    `${API_URL}/api/admin/${withdrawalId}/prepare`,
    {
      method: "POST",
    }
  );

  const data = await res.json();

  if (!data.success) {
    alert(data.error || "Prepare failed");
    return;
  }

  alert(
    `Send ${data.data.amount} ${data.data.asset}\n\nTo:\n${data.data.wallet_address}`
  );
};

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Withdrawal Management
      </h1>

      {loading && (
        <div className="mb-4">
          Loading...
        </div>
      )}

      {/* Pending */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          Pending ({pending.length})
        </h2>

        <div className="space-y-4">
          {pending.map((item) => (
            <div
              key={item.id}
              className="border border-zinc-700 rounded-xl p-4 bg-zinc-900"
            >
              <div>
                <b>Amount:</b> {item.amount} USDT
              </div>

              <div className="mt-2 break-all">
                <b>Wallet:</b> {item.wallet_address}
              </div>

              <div className="mt-2">
                <b>User:</b> {item.user_id}
              </div>

              <div className="mt-2">
                <b>Created:</b>{" "}
                {new Date(item.created_at).toLocaleString()}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handlePrepare(item.id)}
                  className="px-4 py-2 rounded bg-blue-600"
                >
                  Prepare
                </button>

                <button
                  onClick={() => handleApprove(item.id)}
                  className="px-4 py-2 rounded bg-green-600"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(item.id)}
                  className="px-4 py-2 rounded bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          History
        </h2>

        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-zinc-700 rounded-xl p-4 bg-zinc-900"
            >
              <div>
                <b>Amount:</b> {item.amount} USDT
              </div>

              <div className="mt-2">
                <b>Status:</b> {item.status}
              </div>

              <div className="mt-2 break-all">
                <b>Wallet:</b> {item.wallet_address}
              </div>

              {item.tx_hash && (
                <div className="mt-2 break-all">
                  <b>TX:</b> {item.tx_hash}
                </div>
              )}

              <div className="mt-2">
                <b>Created:</b>{" "}
                {new Date(item.created_at).toLocaleString()}
              </div>

              {item.processed_at && (
                <div className="mt-2">
                  <b>Processed:</b>{" "}
                  {new Date(
                    item.processed_at
                  ).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}