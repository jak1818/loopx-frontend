"use client";

interface Props {
  open: boolean;
  progress: number;
}

export default function UploadingModal({
  open,
  progress,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">

      <div className="bg-[#18181b] rounded-3xl w-[320px] p-6 text-center">

        <div className="text-5xl mb-4">
          ☁️
        </div>

        <h2 className="text-xl font-bold text-white">
          Uploading Video
        </h2>

        <p className="text-gray-400 text-sm mt-2">
          Please don't close LoopX.
        </p>

        <div className="w-full h-3 bg-gray-700 rounded-full mt-6 overflow-hidden">
          <div
            className="bg-yellow-400 h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="text-yellow-400 mt-3 font-semibold">
          {progress}%
        </p>

      </div>

    </div>
  );
}