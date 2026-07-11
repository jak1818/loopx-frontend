"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Params = {
  activeVideoId?: string | null;
};

export function useWatchTracking({
  activeVideoId,
}: Params) {

  // 当前 tab 是否 visible
  const [isTabVisible, setIsTabVisible] =
    useState(true);

  // 当前 session watch 秒数
  const [watchSeconds, setWatchSeconds] =
    useState(0);

  // heartbeat timer
  const heartbeatRef =
    useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────
  // tab visibility detection
  // ─────────────────────────────

  useEffect(() => {

    const handleVisibility = () => {

      const visible =
        !document.hidden;

      setIsTabVisible(visible);

    };

    handleVisibility();

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

    };

  }, []);

  // ─────────────────────────────
  // watch timer
  // ─────────────────────────────

  useEffect(() => {

    // 没 active video
    if (!activeVideoId) return;

    // tab hidden
    if (!isTabVisible) return;

    heartbeatRef.current =
      setInterval(() => {

        setWatchSeconds(prev => prev + 1);

      }, 1000);

    return () => {

      if (heartbeatRef.current) {

        clearInterval(
          heartbeatRef.current
        );

        heartbeatRef.current = null;

      }

    };

  }, [
    activeVideoId,
    isTabVisible,
  ]);

  return {

    isTabVisible,

    watchSeconds,

  };

}