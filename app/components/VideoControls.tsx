"use client";

import {
  useEffect,
  useState,
} from "react";

type Props = {
  video: HTMLVideoElement | null;

  muted: boolean;

  onToggleMute: () => void;
};

export default function VideoControls({
  video,
  muted,
  onToggleMute,
}: Props) {

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(
      video?.duration || 0
    );

  const [isPlaying, setIsPlaying] =
    useState(false);

  useEffect(() => {

    if (!video) return;

    if (video.readyState >= 1) {
      setDuration(
        video.duration || 0
      );
    }

    const onTimeUpdate = () =>
      setCurrentTime(
        video.currentTime
      );

    const onLoadedMetadata = () =>
      setDuration(
        video.duration
      );

    const onPlay = () =>
      setIsPlaying(true);

    const onPause = () =>
      setIsPlaying(false);

    video.addEventListener(
      "timeupdate",
      onTimeUpdate
    );

    video.addEventListener(
      "loadedmetadata",
      onLoadedMetadata
    );

    video.addEventListener(
      "play",
      onPlay
    );

    video.addEventListener(
      "pause",
      onPause
    );

    return () => {

      video.removeEventListener(
        "timeupdate",
        onTimeUpdate
      );

      video.removeEventListener(
        "loadedmetadata",
        onLoadedMetadata
      );

      video.removeEventListener(
        "play",
        onPlay
      );

      video.removeEventListener(
        "pause",
        onPause
      );

    };

  }, [video]);

  const togglePlay = () => {

    if (!video) return;

    video.paused
      ? video.play().catch(() => {})
      : video.pause();

  };

  const handleSeek = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (!video) return;

    const time =
      Number(e.target.value);

    video.currentTime = time;

    setCurrentTime(time);

  };

  const formatTime = (
    t: number
  ) => {

    if (isNaN(t)) {
      return "0:00";
    }

    const min =
      Math.floor(t / 60);

    const sec = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");

    return `${min}:${sec}`;

  };

  return (
    <div className="absolute bottom-10 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">

      <div className="relative w-full h-2">

        <div className="absolute inset-0 bg-white/20 rounded-full h-1 top-1/2 -translate-y-1/2" />

        <div
          className="absolute left-0 bg-white rounded-full h-2.5 top-1/2 -translate-y-1/2"
          style={{
            width: `${
              duration
                ? (currentTime / duration) * 100
                : 0
            }%`,
          }}
        />

        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full opacity-0 cursor-pointer appearance-none bg-transparent"
          style={{
            WebkitAppearance:
              "none",
          }}
        />

      </div>

      <div className="flex items-center gap-4 mt-2 text-white text-sm">

        <button
          onClick={togglePlay}
          className="text-xl p-2"
        >
          {isPlaying
            ? "⏸️"
            : "▶️"}
        </button>

        <button
          onClick={onToggleMute}
          className="text-xl p-2"
        >
          {muted
            ? "🔇"
            : "🔊"}
        </button>

        <span>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

      </div>

    </div>
  );
}