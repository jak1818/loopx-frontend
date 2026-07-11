"use client";

interface Props {
  open: boolean;
  amount: number;
  onClose: () => void;
}

export default function RewardSuccessModal({
  open,
  amount,
  onClose,
}: Props) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">

      <div className="bg-[#18181b] rounded-3xl w-[320px] p-6 text-center">

        <div className="text-5xl mb-4">
          🎉
        </div>

        <h2 className="text-xl font-bold text-white">
          Reward Claimed
        </h2>

        <p className="text-yellow-400 text-2xl font-bold mt-4">
          +{amount} LoopX Coins
        </p>

        <p className="text-gray-400 text-sm mt-3">
          Thanks for supporting LoopX!
        </p>

        <button
          onClick={onClose}
          className="
            mt-6
            w-full
            py-3
            rounded-xl
            bg-pink-500
            text-white
            font-semibold
          "
        >
          Awesome
        </button>

      </div>

    </div>
  );
}