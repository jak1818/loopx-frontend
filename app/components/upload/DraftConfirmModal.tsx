"use client";

interface DraftConfirmModalProps {
  open: boolean;
  onResume: () => void;
  onDiscard: () => void;
}

export default function DraftConfirmModal({
  open,
  onResume,
  onDiscard,
}: DraftConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-[430px] mx-auto rounded-t-2xl p-6 animate-slide-up">
        
        <h2 className="text-lg font-semibold text-white mb-2">
          📝 Resume Draft?
        </h2>

        <p className="text-gray-300 text-sm mb-4">
          You have an unsaved draft. Continue where you left off?
        </p>

        <div className="flex gap-3">
          
          <button
            onClick={onDiscard}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-medium"
          >
            Discard
          </button>

          <button
            onClick={onResume}
            className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-bold"
          >
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}