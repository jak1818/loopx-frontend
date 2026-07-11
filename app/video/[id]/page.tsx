"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppData } from "@/providers/AppDataProvider";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface Caption {
  text: string;
  start: number;
  end: number;
}

export default function VideoFullscreenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { telegramUser, webUser } = useAppData();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [video, setVideo] = useState<any>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [currentText, setCurrentText] = useState("");

  // 1️⃣ 获取视频信息
useEffect(() => {
  fetch(`${API_BASE}/api/video/${id}`)
    .then((res) => {
      console.log("VIDEO RES:", res);
      return res.json();
    })
    .then((data) => {
      console.log("VIDEO DATA:", data);

      if (data.success) {
        setVideo(data.data);
      }
    })
    .catch((err) => {
      console.error("VIDEO FETCH ERROR:", err);
    });
}, [id]);

  // 2️⃣ 获取字幕
  useEffect(() => {
    fetch(`${API_BASE}/api/captions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.captions.length > 0) {
          setCaptions(data.captions);
        }
      });
  }, [id]);

  // 3️⃣ 播放时根据时间更新字幕
  useEffect(() => {
    const video = videoRef.current;
    if (!video || captions.length === 0) return;

    const updateCaption = () => {
      const time = video.currentTime;
      const active = captions.find((c) => time >= c.start && time <= c.end);
      setCurrentText(active ? active.text : "");
      requestAnimationFrame(updateCaption);
    };

    updateCaption();
    return () => {};
  }, [captions]);

  if (!video) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen bg-black relative">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-4 z-20 text-white text-xl bg-black/50 px-3 py-1 rounded-full"
      >
        ←
      </button>

      {/* 视频播放器 */}
      <video
        ref={videoRef}
        src={video.video_url}
        className="w-full h-full object-contain"
        controls
        autoPlay
        playsInline
      />
	  
	  <button
  onClick={async () => {
    await fetch(`${API_BASE}/api/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: webUser?.id || telegramUser?.id,
        video_id: video.id,
      }),
    });

    alert("liked");
  }}
  className="absolute right-6 bottom-24 z-20 bg-red-500 text-white px-4 py-2 rounded-full"
>
  ❤️ Like
</button>

      {/* 字幕层 */}
      {currentText && (
        <div className="absolute bottom-20 left-4 right-4 z-10 text-center">
          <span className="text-white text-lg font-semibold bg-black/50 px-4 py-2 rounded-xl">
            {currentText}
          </span>
        </div>
      )}
    </div>
  );
}