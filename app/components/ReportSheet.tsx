"use client";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "";

type Props = {
  show: boolean;

  reportVideo: any;

  user_id: string;

  shareVideoIndex: number | null;

  onClose: () => void;

  onReported: () => void;
};

export default function ReportSheet({
  show,
  reportVideo,
  user_id,
  shareVideoIndex,
  onClose,
  onReported,
}: Props) {

  if (!show || !reportVideo) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-end"
      onClick={onClose}
    >

      <div
        className="w-full bg-zinc-900 rounded-t-3xl p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="text-center font-bold text-lg mb-6">
          Report Video
        </div>

        {[
          "spam",
          "nudity",
          "violence",
          "hate",
          "scam",
          "other",
        ].map((reason) => (

          <button
            key={reason}
            onClick={async () => {

              await fetch(
                `${API_BASE}/api/report`,
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify({
                    reporter_id: user_id,
                    target_type: "video",
                    target_id: reportVideo.id,
                    reason,
                  }),
                }
              );

              alert("Reported");

              onReported();

            }}
            className="block w-full text-left py-4 border-b border-white/10 capitalize"
          >
            {reason}
          </button>

        ))}

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-white text-black"
        >
          Cancel
        </button>

      </div>

    </div>
  );
}