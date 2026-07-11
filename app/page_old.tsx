"use client";

import {
  useEffect,
  useRef,
  useState,
  Suspense,
  useCallback,
  useMemo
} from "react";
import { useLanguage } from "@/store/useLanguage";
import { t } from "@/utils/t";
import { Bookmark, Share2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CommentSheet from "./components/CommentSheet";
import { useAppData } from "@/providers/AppDataProvider";
import RewardCard from "@/app/components/RewardCard";
import SponsoredCard from "@/app/components/SponsoredCard";
import MidrollModal from "@/app/components/MidrollModal";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const PAGE_SIZE = 10;

// ─── 自定义视频控件组件（轻量级 TikTok 风格）───
function VideoControls({
  video,
  muted,
  onToggleMute,
}: {
  video: HTMLVideoElement | null;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
  video?.duration || 0
);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!video) return;
	
	if (video.readyState >= 1) {
  setDuration(video.duration || 0);
}

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [video]);

  const togglePlay = () => {
    if (!video) return;
    video.paused ? video.play().catch(() => {}) : video.pause();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!video) return;
    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (t: number) => {
    if (isNaN(t)) return "0:00";
    const min = Math.floor(t / 60);
    const sec = Math.floor(t % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="absolute bottom-10 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
      <div className="relative w-full h-2">

  {/* 背景轨道 */}
  <div className="absolute inset-0 bg-white/20 rounded-full h-1 top-1/2 -translate-y-1/2" />

  {/* 已播放部分 */}
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

  {/* 真正可拖动 slider（隐藏） */}
  <input
    type="range"
    min={0}
    max={duration || 0}
    value={currentTime}
    onChange={handleSeek}
    className="absolute inset-0 w-full opacity-0 cursor-pointer appearance-none bg-transparent"
	style={{ WebkitAppearance: "none" }}
  />
</div>
    <div className="flex items-center gap-4 mt-2 text-white text-sm">
  
  <button onClick={togglePlay} className="text-xl p-2">
    {isPlaying ? "⏸️" : "▶️"}
  </button>

  <button onClick={onToggleMute} className="text-xl p-2">
    {muted ? "🔇" : "🔊"}
  </button>

  <span>
    {formatTime(currentTime)} / {formatTime(duration)}
  </span>

</div>
       
     
    </div>
  );
}

// ─── FeedPage 主组件 ───
function FeedPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const { telegramUser, webUser, authReady, isTelegram} = useAppData();
  
  console.log({
  telegramUser,
  webUser,
  authReady,
});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>({});
  const watchedRef = useRef<Record<string, boolean>>({});
  const rewardTriggerRef = useRef(2);
  //const rewardTriggerRef = useRef( Math.floor(Math.random() * 5) + 8);
  const watchTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const { lang, setLang } = useLanguage();
  const [activeTab, setActiveTab] = useState("for_you");
  const router = useRouter();
  const searchParams = useSearchParams();
  const startVideoId = searchParams.get("start");
  const containerRef = useRef<HTMLDivElement>(null);
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareVideo, setShareVideo] = useState<any>(null);
  const [shareVideoIndex, setShareVideoIndex] = useState<number | null>(null);

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const renderedIdsRef = useRef<string[]>([]);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [loadingRewardId, setLoadingRewardId] = useState<string | null>(null);
  
  const [showMidroll, setShowMidroll] = useState(false);
  const [midrollVideoId, setMidrollVideoId] = useState<string | null>(null);
  const midrollTriggeredRef = useRef<Record<string, boolean>>({});
  
  const [reportVideo, setReportVideo] = useState<any>(null);
  

  // 静音状态（按索引存储）
  const [isMuted, setIsMuted] = useState(true);

  // 控件显示状态（按索引）
  const [showControlsMap, setShowControlsMap] = useState<Record<number, boolean>>({});

  const controlsTimersRef = useRef<Record<number, NodeJS.Timeout>>({});

  const user_id = telegramUser?.id || webUser?.id;
  console.log("telegramUser", telegramUser);
  console.log("webUser", webUser);
  console.log("user_id", user_id);
  
  const isFollowingTab = activeTab === "following";

const endpoint = useMemo(
  () =>
    isFollowingTab
      ? "/api/feed/following"
      : "/api/feed",
  [isFollowingTab]
);

  // 组件卸载清理
useEffect(() => {
  return () => {

    Object.values(watchTimersRef.current)
      .forEach(clearTimeout);

    watchTimersRef.current = {};

    Object.values(controlsTimersRef.current)
      .forEach(clearTimeout);

    controlsTimersRef.current = {};

  };
}, []);

  // 同步 videoRefs 长度
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, videos.length);
  }, [videos]);

  // 更新互动映射 + 记录已渲染 ID
  const updateMapsFromVideos = useCallback((newVideos: any[]) => {
    const likedInit: Record<string, boolean> = {};
    const likesInit: Record<string, number> = {};
    const followInit: Record<string, boolean> = {};
    const bookmarkInit: Record<string, boolean> = {};

    for (const v of newVideos) {
      likedInit[v.id] = !!v.liked;
      likesInit[v.id] = v.likes ?? 0;
      followInit[v.creator_id] = !!v.is_following;
      bookmarkInit[v.id] = !!v.bookmarked;
      if (!renderedIdsRef.current.includes(v.id)) {
        renderedIdsRef.current.push(v.id);
      }
    }
    if (renderedIdsRef.current.length > 200) {
      renderedIdsRef.current.splice(0, renderedIdsRef.current.length - 200);
    }

    setLikedMap(prev => ({ ...prev, ...likedInit }));
    setLikesMap(prev => ({ ...prev, ...likesInit }));
    setFollowingMap(prev => ({ ...prev, ...followInit }));
    setBookmarkMap(prev => ({ ...prev, ...bookmarkInit }));
  }, []);

  // 首次加载

useEffect(() => {
  if (!user_id) return;

  console.log("📡 Feed first load for user_id:", user_id);

  setHasMore(true);
  renderedIdsRef.current = [];
  setVideos([]);
  
  watchedRef.current = {};
  
 // containerRef.current?.scrollTo({
 // top: 0,
//  behavior: "auto"
//});

  fetch(
    `${API_BASE}${endpoint}?user_id=${user_id}&limit=${PAGE_SIZE}`
  )
    .then(res => res.json())
    .then(data => {
      const fetchedVideos = Array.isArray(data?.data)
        ? data.data
        : [];

      const mixedFeed = [...fetchedVideos];

if (mixedFeed.length >= 5) {

  mixedFeed.splice(5, 0, {
    id: `reward-${Date.now()}-${Math.random()}`,
    type: "reward_card",
  });
  
  mixedFeed.splice(8, 0, {
  id: `sponsored-${Date.now()}-${Math.random()}`,
  type: "sponsored",
  title: "Install XYZ VPN",
  description: "Fastest VPN in Asia",
  cta: "Download",
  image_url:
    "https://placehold.co/400x400/png",
});

}

setVideos(mixedFeed);

      setHasMore(data.hasMore ?? false);

      updateMapsFromVideos(fetchedVideos);
    })
    .catch(err => console.error("Feed fetch error:", err));

}, [user_id, activeTab, updateMapsFromVideos]);


  // 加载更多（只用 exclude_ids）
  const fetchMoreFeed = useCallback(async () => {
    if (!user_id || !hasMore || loadingMore) return;
    setLoadingMore(true);

    const excludeStr =
  renderedIdsRef.current
    .slice(-10)
    .join(",");
    try {
      const res = await fetch(
        `${API_BASE}${endpoint}?user_id=${user_id}&limit=${PAGE_SIZE}&exclude_ids=${excludeStr}`
      );
      const data = await res.json();
      const newVideos = Array.isArray(data?.data) ? data.data : [];
      if (newVideos.length > 0) {
const mixedFeed = [...newVideos];

mixedFeed.splice(2, 0, {
  id: `reward-${Date.now()}-${Math.random()}`,
  type: "reward_card",
});

mixedFeed.splice(5, 0, {
  id: `sponsored-${Date.now()}-${Math.random()}`,
  type: "sponsored",
  title: "Install XYZ VPN",
  description: "Fastest VPN in Asia",
  cta: "Download",
  image_url:
    "https://placehold.co/400x400/png",
});

setVideos(prev => [
  ...prev,
  ...mixedFeed
]);
        setHasMore(data.hasMore ?? false);
        updateMapsFromVideos(newVideos);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [
  user_id,
  hasMore,
  loadingMore,
  activeTab,
  updateMapsFromVideos
]);

  // 自动播放 + watch timer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          const videoId = video.dataset.id!;

          if (entry.isIntersecting) {
            if (video.paused) {
              video.play().catch(() => {});
            }
            if (!watchedRef.current[videoId]) {
              if (watchTimersRef.current[videoId]) {
                clearTimeout(watchTimersRef.current[videoId]);
              }
              watchTimersRef.current[videoId] = setTimeout(() => {
                handleWatch(videoId, Math.min(5, video.duration), video.duration);
                watchedRef.current[videoId] = true;
                delete watchTimersRef.current[videoId];
              }, 5000);
            }
          } else {
            video.pause();
            if (watchTimersRef.current[videoId]) {
              clearTimeout(watchTimersRef.current[videoId]);
              delete watchTimersRef.current[videoId];
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach(video => {
      if (video) observerRef.current!.observe(video);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [videos]);

  // 加载更多触发器
  useEffect(() => {
    if (!containerRef.current || videos.length === 0 || !hasMore || loadingMore) return;
    const lastVideo = containerRef.current.querySelector(
      `[data-video-index="${videos.length - 1}"]`
    );
    if (!lastVideo) return;

    const triggerObserver = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) fetchMoreFeed();
      },
      { threshold: 0.5 }
    );

    triggerObserver.observe(lastVideo);
    return () => triggerObserver.disconnect();
  }, [videos, hasMore, loadingMore, fetchMoreFeed]);

  // 滚动到指定视频
  useEffect(() => {
    if (videos.length > 0 && startVideoId && containerRef.current) {
      const index = videos.findIndex(v => v.id === startVideoId);
      if (index !== -1) {
        const target = containerRef.current.querySelector(
          `[data-video-index="${index}"]`
        ) as HTMLElement;
        target?.scrollIntoView({ behavior: "auto", block: "start" });
      }
    }
  }, [videos, startVideoId]);

if (!authReady) {
  console.log("❌ authReady FALSE");

  return (
    <div className="text-white bg-black h-screen">
      auth loading...
    </div>
  );
}

if (!user_id) {
  console.log("❌ NO USER ID", {
    telegramUser,
    webUser,
  });

  return (
    <div className="text-white bg-black h-screen">
      no user id
    </div>
  );
}

  async function handleWatch(video_id: string, watch_seconds: number, duration: number) {
    await fetch(`${API_BASE}/api/watch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, video_id, watch_seconds, duration }),
    });
	
	// 🔥 当前已刷视频数量
const watchedCount =
  Object.keys(
    watchedRef.current
  ).length;

// 🔥 到达 reward trigger
if (
  watchedCount >=
  rewardTriggerRef.current
) {

  setVideos(prev => {

    // 防止重复 reward card
    const alreadyExists =
      prev.some(
        v =>
          v.type ===
          "reward_card"
      );

    if (alreadyExists) {
      return prev;
    }

    const newFeed = [...prev];

    // 插入 reward card
  newFeed.splice(
  Math.min(
    watchedCount,
    newFeed.length
  ),
  0,
  {
    id: `reward-${Date.now()}-${Math.random()}`,
    type: "reward_card",
  }
);

    return newFeed;

  });
  
rewardTriggerRef.current =
  watchedCount + 2;
  // 🔥 下一次随机 trigger
 // rewardTriggerRef.current =
 //   watchedCount +
 //   Math.floor(
 //     Math.random() * 5
 //   ) +
//    8;

}
  }

  async function handleGift(video_id: string, gift_id: string) {
    const res = await fetch(`${API_BASE}/api/send-gift`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender_id: user_id, video_id, gift_id, type: "paid" }),
    });
    const data = await res.json();
    if (data.success) alert("Gift sent 💸");
    else alert(data.error);
  }

  const handleFollow = async (creator_id: string, video_id: string) => {
    const current = followingMap[creator_id] === true;
    try {
      const res = await fetch(`${API_BASE}/api/follow`, {
        method: current ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower_id: user_id, following_id: creator_id, video_id }),
      });
      const data = await res.json();
      if (data.success) {
        setFollowingMap(prev => ({ ...prev, [creator_id]: !prev[creator_id] }));
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
          body: JSON.stringify({ user_id, video_id: videoId }),
        });
        const data = await res.json();
        if (data.success) {
          setLikedMap(prev => ({ ...prev, [videoId]: true }));
          setLikesMap(prev => ({ ...prev, [videoId]: (prev[videoId] ?? 0) + 1 }));
        }
      } else {
        const res = await fetch(`${API_BASE}/api/like`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, video_id: videoId }),
        });
        const data = await res.json();
        if (data.success) {
          setLikedMap(prev => ({ ...prev, [videoId]: false }));
          setLikesMap(prev => ({
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
        body: JSON.stringify({ user_id, video_id: videoId }),
      });
      const data = await res.json();
      if (data.success) {
        setBookmarkMap(prev => ({ ...prev, [videoId]: !isSaved }));
      } else if (res.status === 409) {
        setBookmarkMap(prev => ({ ...prev, [videoId]: true }));
      }
    } catch (err) {
      console.error("Bookmark error:", err);
    }
  };
  
const closeShareSheet = (
  videoIndex?: number | null
) => {

  setShowShareSheet(false);

  setShareVideo(null);

  setShareVideoIndex(null);

  const targetIndex =
    videoIndex ?? shareVideoIndex;

if (targetIndex !== null && targetIndex !== undefined) {

  videoRefs.current[targetIndex]
    ?.play()
    .catch(() => {});

 if (controlsTimersRef.current[targetIndex]) {
  clearTimeout(controlsTimersRef.current[targetIndex]);
  delete controlsTimersRef.current[targetIndex];
}

setShowControlsMap(prev => ({
  ...prev,
  [targetIndex]: false,
}));

}

};

  return (
    <>
<div className="w-full bg-black relative h-[100dvh] overflow-hidden">

 <div
  className={`fixed left-0 w-full flex justify-center gap-6 text-white z-20 bg-black/50 py-3 ${
    isTelegram ? "top-0" : "top-9"
  }`}
>
          <button
            onClick={() => setActiveTab("for_you")}
            className={`px-2 ${activeTab === "for_you" ? "font-bold border-b-2 border-white" : "opacity-50"}`}
          >
            {t("for_you", lang)}
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`px-2 ${activeTab === "following" ? "font-bold border-b-2 border-white" : "opacity-50"}`}
          >
            {t("following_tab", lang)}
          </button>
        </div>


<div
  ref={containerRef}
  style={{
    overscrollBehavior: "none",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
className={`
  h-[100dvh]
  w-full
  overflow-y-auto
  snap-y
  snap-mandatory
  overscroll-none
  bg-black
`}
>
          {activeTab === "following" &&
 videos.length === 0 &&
 !loadingMore && (

  <div className="min-h-[80vh] flex items-center justify-center text-gray-400">
    {t("follow_creators_empty", lang)}
  </div>

)}


		  {videos.map((feedItem, index) => {
if (feedItem.type === "reward_card") {

  return (
    <RewardCard
	  key={feedItem.id}
      video={feedItem}
      user_id={user_id}
      API_BASE={API_BASE}
      setVideos={setVideos}
      loadingRewardId={loadingRewardId}
      setLoadingRewardId={setLoadingRewardId}
    />
  );

}

if (feedItem.type === "sponsored") {

  return (
    <SponsoredCard
      key={feedItem.id}
      ad={feedItem}
	  user_id={user_id}
      API_BASE={API_BASE}
    />
  );

}
          const isFollowing = followingMap[feedItem.creator_id] === true;
            return (
              <div
                key={feedItem.id}
                data-video-index={index}
                className={`
  h-[100dvh]
  w-full
  snap-start
  snap-always
  relative
  bg-black
  overflow-hidden
  ${isTelegram ? "pt-16" : "pt-20"}
`}
                onClick={() => {
					 const vid = videoRefs.current[index];

  if (vid) {
    if (vid.paused) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }

                  setShowControlsMap(prev => {
                    const newVisible = !prev[index];
                    if (controlsTimersRef.current[index]) {
                       clearTimeout(controlsTimersRef.current[index]);
                       delete controlsTimersRef.current[index];
                    }
                    if (newVisible) {
                      controlsTimersRef.current[index] = setTimeout(() => {
                        setShowControlsMap(prevMap => ({ ...prevMap, [index]: false }));
						delete controlsTimersRef.current[index];
                      }, 3000);
                    }
                    return { ...prev, [index]: newVisible };
                  });
                }}
              >
                <video
                  ref={el => {
  videoRefs.current[index] = el;


}}
                  data-id={feedItem.id}
                  src={feedItem.video_url}
                  className="w-full h-full object-contain"
                  loop
                  muted={isMuted}
                  playsInline
				  preload="metadata"
                />

                {/* 自定义控件 */}
                {showControlsMap[index] && (
                <VideoControls
  video={videoRefs.current[index]}
  muted={isMuted}
onToggleMute={() => {

  const newMuted = !isMuted;

  videoRefs.current.forEach(v => {
    if (v) {
      v.muted = newMuted;
    }
  });

  setIsMuted(newMuted);
}}
/>
                )}

                <div className="absolute bottom-20 left-4 text-white z-10 text-sm">
                  @{feedItem.username || "creator"}
                </div>

                {!commentVideoId && (
  <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-10">
  
                  <div className="flex flex-col items-center">
                    <img
                      onClick={(e) => {

  e.stopPropagation();

  router.push(`/profile/${feedItem.creator_id}`);

}}
                      src={feedItem.avatar_url || "/default-avatar.png"}
                      alt="avatar"
                      className="w-14 h-14 rounded-full cursor-pointer"
                    />
                    <button
                 onClick={(e) => {

  e.stopPropagation();

  handleFollow(feedItem.creator_id, feedItem.id);

}}
                      className={`mt-2 w-6 h-6 flex items-center justify-center rounded-full text-xs border ${
                        isFollowing ? "bg-gray-400 text-white border-gray-400" : "bg-red-500 text-white border-red-500"
                      }`}
                    >
                      {isFollowing ? "✓" : "+"}
                    </button>
                  </div>

                  <div
                    onClick={(e) => {

  e.stopPropagation();

  handleLike(feedItem);

}}
                    className="flex flex-col items-center text-white cursor-pointer"
                  >
                    <span className="text-2xl">{likedMap[feedItem.id] ? "❤️" : "🤍"}</span>
                    <span className="text-sm">{Number(likesMap[feedItem.id] || 0)}</span>
                  </div>

                 <div
onClick={(e) => {

  e.stopPropagation();

  videoRefs.current[index]?.pause();
  
if (controlsTimersRef.current[index]) {

  clearTimeout(
    controlsTimersRef.current[index]
  );

  delete controlsTimersRef.current[index];

}

setShowControlsMap(prev => ({
  ...prev,
  [index]: false,
}));

  window.dispatchEvent(
    new Event("comments-open")
  );

  setCommentVideoId(feedItem.id);

}}
  className="flex flex-col items-center text-white cursor-pointer"
>
                    <span className="text-2xl">💬</span>
                    <span className="text-xs">{feedItem.comments ?? 0}</span>
                  </div>

                  <button
                  onClick={(e) => {

  e.stopPropagation();

  handleGift(
    feedItem.id,
    "48bbf90a-e1c6-4b3c-a083-6908d79795f1"
  );

}}
                    className="bg-pink-500 px-3 py-2 rounded-full text-white text-sm"
                  >
                    🌹
                  </button>

                  <div
                    onClick={(e) => {

  e.stopPropagation();

  handleBookmark(feedItem.id);

}}
                    className="flex flex-col items-center text-white cursor-pointer p-2"
                  >
                    <span className="text-xl">
                      <Bookmark
                        className={`w-6 h-6 ${bookmarkMap[feedItem.id] ? "fill-white" : "stroke-white"}`}
                      />
                    </span>
                  </div>
				  
				  <div
onClick={(e) => {

  e.stopPropagation();

videoRefs.current[index]?.pause();

if (controlsTimersRef.current[index]) {

  clearTimeout(
    controlsTimersRef.current[index]
  );

  delete controlsTimersRef.current[index];

}

setShowControlsMap(prev => ({
  ...prev,
  [index]: false,
}));

  setShareVideo(feedItem);
  setShareVideoIndex(index);
  setShowShareSheet(true);

}}
  className="flex flex-col items-center text-white cursor-pointer p-2"
>
  <Share2 className="w-6 h-6 text-white" />
</div>
                </div>
				)}
              </div>
            );
          })}

          {loadingMore && (
            <div className="h-16 flex items-center justify-center bg-black">
              <p className="text-gray-400 text-sm">Loading more...</p>
            </div>
          )}

          {!hasMore && videos.length > 0 && (
            <div className="h-16 flex items-center justify-center bg-black">
              <p className="text-gray-500 text-sm">— End of feed —</p>
            </div>
          )}
        </div>

{commentVideoId && (
 <CommentSheet
  video_id={commentVideoId}
  user_id={user_id}
  creator_id={
    videos.find(v => v.id === commentVideoId)
      ?.creator_id || ""
  }
  onClose={() => {

  document.body.style.overflow = "";

  window.dispatchEvent(
    new Event("comments-close")
  );

  const currentIndex = videos.findIndex(
    v => v.id === commentVideoId
  );

if (currentIndex !== -1) {

  videoRefs.current[currentIndex]
    ?.play()
    .catch(() => {});

  setShowControlsMap(prev => ({
    ...prev,
    [currentIndex]: false,
  }));

}
  setCommentVideoId(null);

}}
            onCommentCountChange={delta => {
              setVideos(prev =>
                prev.map(v =>
                  v.id === commentVideoId ? { ...v, comments: (v.comments ?? 0) + delta } : v
                )
              );
            }}
          />
        )}
		
		
		{showShareSheet && shareVideo && (
  <div
  className="fixed inset-0 z-50 bg-black/50 flex items-end"
  onClick={() => {closeShareSheet(shareVideoIndex);}}
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
              `${window.location.origin}/video/${shareVideo.id}`
            );
            alert("Link copied");
			closeShareSheet(shareVideoIndex);
          }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
            📋
          </div>
          <span className="text-sm mt-2">Copy</span>
        </button>

        <button
          onClick={() => {
            window.open(
              `https://t.me/share/url?url=${encodeURIComponent(
                `${window.location.origin}/video/${shareVideo.id}`
              )}`
            );
			closeShareSheet(shareVideoIndex);
			
          }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white">
            ✈️
          </div>
          <span className="text-sm mt-2">Telegram</span>
        </button>

       <button
  onClick={() => {

    setReportVideo(shareVideo);
    setShowShareSheet(false);
    setShowReportSheet(true);

  }}
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
  onClick={() => {

    closeShareSheet(
      shareVideoIndex
    );

  }}
  className="w-full mt-6 py-3 rounded-xl bg-gray-200"
>
  Cancel
</button>

    </div>
  </div>
)}





{showReportSheet && reportVideo && (

  <div
    className="fixed inset-0 z-[60] bg-black/60 flex items-end"
   onClick={() => {

  setShowReportSheet(false);

  setReportVideo(null);

  videoRefs.current[
    shareVideoIndex ?? 0
  ]
    ?.play()
    .catch(() => {});

}}
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

            await fetch(`${API_BASE}/api/report`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                reporter_id: user_id,
                target_type: "video",
                target_id: reportVideo.id,
                reason,
              }),
            });

            alert("Reported");

            setShowReportSheet(false);
            setReportVideo(null);

            closeShareSheet(shareVideoIndex);

          }}
          className="block w-full text-left py-4 border-b border-white/10 capitalize"
        >
          {reason}
        </button>

      ))}

     <button
  onClick={() => {

    setShowReportSheet(false);

    setReportVideo(null);

    videoRefs.current[
      shareVideoIndex ?? 0
    ]
      ?.play()
      .catch(() => {});

  }}
  className="w-full mt-6 py-3 rounded-xl bg-white text-black"
>
  Cancel
</button>

    </div>

  </div>

)}
      </div>
    </>
  );
}

export default function FeedPageWrapper() {
  return (
    <Suspense
      fallback={<div className="h-[100dvh] bg-black text-white flex items-center justify-center">Loading...</div>}
    >
      <FeedPage />
    </Suspense>
  );
}