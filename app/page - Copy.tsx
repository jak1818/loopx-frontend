"use client";

import { useEffect, useRef, useState, Suspense  } from "react";
import { useLanguage } from "@/store/useLanguage";
import { t } from "@/utils/t";
import { Bookmark } from "lucide-react";
import { useRouter, useSearchParams  } from "next/navigation";
import CommentSheet from "./components/CommentSheet";
import BottomNav from "@/components/BottomNav";
import { useAppData } from "@/providers/AppDataProvider";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "";
  
function FeedPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const {
  telegramUser,
  webUser,
  authReady
} = useAppData();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>({});
  const watchedRef = useRef<Record<string, boolean>>({});
  const { lang, setLang } = useLanguage();
  const [activeTab, setActiveTab] = useState("for_you");
  const router = useRouter();
  const searchParams = useSearchParams();
  const startVideoId = searchParams.get("start");
  const containerRef = useRef<HTMLDivElement>(null);
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
  
  

  const user_id =
  telegramUser?.id ||
  webUser?.id;
  
  const toggleSound = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.muted = !video.muted;
    }
  };
  

  useEffect(() => {
  videoRefs.current = videoRefs.current.slice(0, videos.length);
}, [videos]);

  // 1️⃣ 拉 feed
useEffect(() => {
	if (!user_id) return;
	console.log("📡 Feed requesting for user_id:", user_id); 
  fetch(`${API_BASE}/api/feed?user_id=${user_id}`)
    .then((res) => res.json())
    .then((data) => {
      const fetchedVideos = Array.isArray(data?.data) ? data.data : [];
      setVideos(() => fetchedVideos);

      // 🔥 初始化 likedMap（关键）
      const likedInit: Record<string, boolean> = {};
      const likesInit: Record<string, number> = {};
      const followInit: Record<string, boolean> = {};
	  const bookmarkInit: Record<string, boolean> = {};

      fetchedVideos.forEach((v: any) => {
        likedInit[v.id] = !!v.liked;
        likesInit[v.id] = v.likes ?? 0;
        followInit[v.creator_id] = !!v.is_following;
		bookmarkInit[v.id] = !!v.bookmarked;
      });

      setLikedMap(likedInit);
      setLikesMap(likesInit);
      setFollowingMap(followInit);
	  setBookmarkMap(bookmarkInit);
    })
    .catch((err) => {
      console.error("Feed fetch error:", err);
    });
}, [user_id]);

useEffect(() => {
  if (videos.length > 0 && startVideoId && containerRef.current) {
    const index = videos.findIndex(v => v.id === startVideoId);
    if (index !== -1) {
      const target = containerRef.current.children[index] as HTMLElement;
      target?.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }
}, [videos, startVideoId]);

  // 2️⃣ 自动播放逻辑
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observerRef.current!.observe(video);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [videos]);
  
  if (!authReady) return null;
  if (!user_id) return null;

  // 3️⃣ watch API
  async function handleWatch(video_id: string, watch_seconds: number, duration: number) {
    await fetch(`${API_BASE}/api/watch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, video_id, watch_seconds, duration }),
    });
  }

  // 4️⃣ gift API
  async function handleGift(video_id: string, gift_id: string) {
    const res = await fetch(`${API_BASE}/api/send-gift`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: user_id,
        video_id,
        gift_id: gift_id,
        type: "paid",
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Gift sent 💸");
    } else {
      alert(data.error);
    }
  }
  
const handleFollow = async (creator_id: string, video_id: string) => {
	console.log("CLICK FOLLOW", creator_id);
  const current = followingMap[creator_id] === true;

  try {
    const res = await fetch(`${API_BASE}/api/follow`, {
      method: current ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        follower_id: user_id,
        following_id: creator_id,
		video_id: video_id,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setFollowingMap((prev) => ({
        ...prev,
        [creator_id]: !prev[creator_id],
      }));
    }
  } catch (err) {
    console.error("Follow error", err);
  }
};
  
  const handleLike = async (video: any) => {
  const videoId = video.id;
  const isLiked = likedMap[videoId] === true;

  try {
    if (!isLiked) {
      const res = await fetch(`${API_BASE}/api/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          video_id: videoId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setLikedMap((prev) => ({ ...prev, [videoId]: true }));
        setLikesMap((prev) => ({
          ...prev,
          [videoId]: (prev[videoId] ?? 0) + 1,
        }));
      }
    } else {

      const res = await fetch(`${API_BASE}/api/like`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          video_id: videoId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setLikedMap((prev) => ({ ...prev, [videoId]: false }));
        setLikesMap((prev) => ({
          ...prev,
          [videoId]: Math.max((prev[videoId] ?? 0) - 1, 0),
        }));
      }
    }
  } catch (err) {
    console.error("Like error:", err);
  }
};

const handleBookmark = async (videoId: string) => {
  const isSaved = bookmarkMap[videoId];

  try {
    const res = await fetch(`${API_BASE}/api/bookmark`, {
      method: !isSaved ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        video_id: videoId,
      }),
    });

    const data = await res.json();
	
	if (data.success) {
  // 正常成功：POST => true, DELETE => false
  setBookmarkMap((prev) => ({
    ...prev,
    [videoId]: !isSaved,
  }));
} else if (res.status === 409) {
  // 重复操作（已经收藏过），直接置为 true
  setBookmarkMap((prev) => ({
    ...prev,
    [videoId]: true,
  }));
}
  } catch (err) {
    console.error("Bookmark error:", err);
  }
};

   return (
    <>
      <div className="h-screen w-full bg-black relative">
        {/* 🔥 TAB BAR */}
        <div className="fixed top-0 left-0 w-full flex justify-center gap-6 text-white z-20 bg-black/50 py-3">
          <button
            onClick={() => setActiveTab("for_you")}
            className={`px-2 ${
              activeTab === "for_you"
                ? "font-bold border-b-2 border-white"
                : "opacity-50"
            }`}
          >
            {t("for_you", lang)}
          </button>

          <button
            onClick={() => setActiveTab("following")}
            className={`px-2 ${
              activeTab === "following"
                ? "font-bold border-b-2 border-white"
                : "opacity-50"
            }`}
          >
            {t("following_tab", lang)}
          </button>
        </div>

        <div className="fixed top-16 right-4 z-50 bg-black/70 p-3 rounded flex gap-2">
          <button onClick={() => setLang("en")} className="text-white">EN</button>
          <button onClick={() => setLang("zh")} className="text-white">中</button>
          <button onClick={() => setLang("ms")} className="text-white">BM</button>
        </div>

        <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory pt-16">
          {videos.map((video, index) => {
            const isFollowing = followingMap[video.creator_id] === true;

            return (
              <div
                key={`${video.id}-${index}`}
                className="h-screen w-full snap-start relative bg-black"
              >
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  data-id={video.id}
                  src={video.video_url}
                  className="w-full h-full object-contain"
                  loop
                  muted
                  playsInline
         onPlay={(e) => {
  const vid = e.currentTarget;
  const videoId = vid.dataset.id!;

  if (watchedRef.current[videoId]) return;

  watchedRef.current[videoId] = true;

  setTimeout(() => {
    handleWatch(
      videoId,
      Math.min(5, vid.duration),
      vid.duration
    );
  }, 5000);
}}
                />

                {/* 👤 Username */}
                <div className="absolute bottom-20 left-4 text-white z-10 text-sm">
                  @{video.username || "creator"}
                </div>

                {/* 👉 右侧控制栏 */}
                <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-10">
                  {/* 👤 Avatar + Follow */}
                  <div className="flex flex-col items-center">
                    <img
                      onClick={() => router.push(`/profile/${video.creator_id}`)}
                      src={video.avatar_url || "/default-avatar.png"}
					  alt="avatar"
                      className="w-14 h-14 rounded-full cursor-pointer"
                    />
                    <button
                      onClick={() => handleFollow(video.creator_id, video.id)}
                      className={`mt-2 w-6 h-6 flex items-center justify-center rounded-full text-xs border ${
                        isFollowing
                          ? "bg-gray-400 text-white border-gray-400"
                          : "bg-red-500 text-white border-red-500"
                      }`}
                    >
                      {isFollowing ? "✓" : "+"}
                    </button>
                  </div>

                  {/* ❤️ Like */}
                  <div
                    onClick={() => handleLike(video)}
                    className="flex flex-col items-center text-white cursor-pointer"
                  >
                    <span className="text-2xl">
                      {likedMap[video.id] ? "❤️" : "🤍"}
                    </span>
                    <span className="text-sm">
                      {Number(likesMap[video.id] || 0)}
                    </span>
                  </div>

                  {/* 💬 Comment */}
                  <div
                    onClick={() => setCommentVideoId(video.id)}
                    className="flex flex-col items-center text-white cursor-pointer"
                  >
                    <span className="text-2xl">💬</span>
                    <span className="text-xs">{video.comments ?? 0}</span>
                  </div>

                  {/* 🔊 Sound */}
                  <button
                    onClick={() => toggleSound(index)}
                    className="text-white text-xl"
                  >
                    🔊
                  </button>

                  {/* 🎁 Gift */}
                  <button
                    onClick={() => handleGift(video.id, "1")}
                    className="bg-pink-500 px-3 py-2 rounded-full text-white text-sm"
                  >
                    🌹
                  </button>

                  {/* 🔖 Bookmark */}
                  <div
                    onClick={() => handleBookmark(video.id)}
                    className="flex flex-col items-center text-white cursor-pointer p-2"
                  >
                    <span className="text-xl">
                      <Bookmark
                        className={`w-6 h-6 ${
                          bookmarkMap[video.id] ? "fill-white" : "stroke-white"
                        }`}
                      />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 评论弹窗 */}
        {commentVideoId && (
          <CommentSheet
            video_id={commentVideoId}
            user_id={user_id}
            onClose={() => setCommentVideoId(null)}
            onCommentCountChange={(delta) => {
              setVideos((prev) =>
                prev.map((v) =>
                  v.id === commentVideoId
                    ? { ...v, comments: (v.comments ?? 0) + delta }
                    : v
                )
              );
            }}
          />
        )}
      </div>

      <BottomNav />
    </>
  );
}

export default function FeedPageWrapper() {
  return (
    <Suspense fallback={<div className="h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <FeedPage />
    </Suspense>
  );
}