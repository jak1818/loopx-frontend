"use client";

type Props = {
  pulling: boolean;
  refreshing: boolean;
};

export default function RefreshHeader({
  pulling,
  refreshing,
}: Props) {
  return (
    <div
      className={`
        w-full
        overflow-hidden
        transition-all
        duration-200
        ease-out
        ${
          pulling || refreshing
            ? "h-16"
            : "h-0"
        }
      `}
    >
      <div className="h-16 flex flex-col items-center justify-center bg-black">
        <div
          className={`
            text-white text-xl
            ${
              refreshing
                ? "animate-spin"
                : ""
            }
          `}
        >
          ⟳
        </div>

        <div className="mt-1 text-xs text-gray-300">
          {refreshing
            ? "Refreshing..."
            : "Pull to refresh"}
        </div>
      </div>
    </div>
  );
}