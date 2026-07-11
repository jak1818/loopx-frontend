"use client";

type Props = {
  show: boolean;
  video: any;
  videoIndex: number | null;

  onClose: () => void;

  onReport: () => void;
};

export default function ShareSheet({
  show,
  video,
  videoIndex,
  onClose,
  onReport,
}: Props) {

  if (!show || !video) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={onClose}
    >

      <div
        className="w-full bg-white rounded-t-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="text-center font-bold text-lg mb-6">
          Share
        </div>

        <div className="grid grid-cols-4 gap-4">

          <button
            onClick={() => {

              navigator.clipboard.writeText(
                `${window.location.origin}/video/${video.id}`
              );

              alert("Link copied");

              onClose();

            }}
            className="flex flex-col items-center"
          >

            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
              📋
            </div>

            <span className="text-sm mt-2">
              Copy
            </span>

          </button>

          <button
            onClick={() => {

              window.open(
                `https://t.me/share/url?url=${encodeURIComponent(
                  `${window.location.origin}/video/${video.id}`
                )}`
              );

              onClose();

            }}
            className="flex flex-col items-center"
          >

            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white">
              ✈️
            </div>

            <span className="text-sm mt-2">
              Telegram
            </span>

          </button>

          <button
            onClick={onReport}
            className="flex flex-col items-center"
          >

            <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white">
              🚨
            </div>

            <span className="text-sm mt-2">
              Report
            </span>

          </button>

        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-gray-200"
        >
          Cancel
        </button>

      </div>

    </div>
  );
}