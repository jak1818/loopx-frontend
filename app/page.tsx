"use client";

import {
  useEffect,
  useRef,
  useState,
  Suspense,
  useCallback,
  useMemo,
  React 
} from "react";
import { useLanguage } from "@/store/useLanguage";
import { t } from "@/utils/t";
import { useRouter, useSearchParams } from "next/navigation";
import CommentSheet from "./components/CommentSheet";
import { useAppData } from "@/providers/AppDataProvider";
import RewardCard from "@/app/components/RewardCard";
import SponsoredCard from "@/app/components/SponsoredCard";
import ShareSheet from "@/app/components/ShareSheet";
import ReportSheet from "@/app/components/ReportSheet";
import FeedVideoCard from "@/app/components/FeedVideoCard";
import {handleMidrollTimeUpdate,} from "@/hooks/feed/useMidrollAds";
import {useFeedVideos,} from "@/hooks/feed/useFeedVideos";
import {useVideoObserver,} from "@/hooks/feed/useVideoObserver";
import {useFeedInteractions,} from "@/hooks/feed/useFeedInteractions";
import {useWatchTracking,} from "@/hooks/feed/useWatchTracking";
import RewardSuccessModal from "@/app/components/RewardSuccessModal";
import RefreshHeader from "@/app/components/RefreshHeader";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const PREFETCH_BEFORE_END = 2;


// ─── FeedPage 主组件 ───
function FeedPage() {
	console.count("FeedPage Render");
	  useEffect(() => {

    const tg = window.Telegram?.WebApp;

    if (!tg) return;

    tg.ready();
    tg.expand();

    if (tg.isVersionAtLeast("7.7")) {
      tg.disableVerticalSwipes();
      console.log("✅ disableVerticalSwipes enabled");
    } else {
      console.log("❌ Telegram version < 7.7");
    }

  }, []);
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fetchingMoreRef = useRef(false);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const { telegramUser, webUser, user, authReady, isTelegram} = useAppData();
  
  console.log({
  telegramUser,
  webUser,
  authReady,
});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>({});
  const watchedRef = useRef<Record<string, boolean>>({});
  const rewardTriggerRef = useRef(0);
  //const rewardTriggerRef = useRef( Math.floor(Math.random() * 5) + 8);
  const watchTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const { lang, setLang } = useLanguage();
  const [activeTab, setActiveTab] = useState("for_you");
  const router = useRouter();
  const searchParams = useSearchParams();
  const startVideoId = searchParams.get("start");
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareVideo, setShareVideo] = useState<any>(null);
  const [shareVideoIndex, setShareVideoIndex] = useState<number | null>(null);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullOffset, setPullOffset] = useState(0);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [loadingRewardId, setLoadingRewardId] = useState<string | null>(null);
  const [showRewardSuccess, setShowRewardSuccess] = useState(false);
  const midrollTriggeredRef = useRef<Record<string, boolean>>({});
  const lastMidrollAtRef = useRef(0);
  const [reportVideo, setReportVideo] = useState<any>(null);
  const [activeVideoId, setActiveVideoId,] = useState<string | null>(null);
  const manuallyPausedRef = useRef<Record<string, boolean>>({});


  // 静音状态（按索引存储）
  const [isMuted, setIsMuted] = useState(true);
  const handleToggleMute =
  useCallback(() => {

    setIsMuted(prev => {

      const newMuted = !prev;

      videoRefs.current.forEach(v => {

        if (v) {
          v.muted = newMuted;
        }

      });

      return newMuted;

    });

  }, []);

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

useEffect(() => {

  console.log("✅ Feed mounted");

  return () => {
    console.log("❌ Feed unmounted");
  };

}, []);

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


const {videos, setVideos, loadingMore, fetchMoreFeed, fetchFirstFeed,} = useFeedVideos({API_BASE, endpoint, user_id,});
 
 console.log("videos =", videos);
useEffect(() => {

  videoRefs.current =
    videoRefs.current.slice(
      0,
      videos.length
    );

}, [videos]);

useEffect(() => {

  const likedInit:
    Record<string, boolean> = {};

  const likesInit:
    Record<string, number> = {};

  const followInit:
    Record<string, boolean> = {};

  const bookmarkInit:
    Record<string, boolean> = {};

  for (const v of videos) {

    if (v.type) continue;

    likedInit[v.id] =
      !!v.liked;

    likesInit[v.id] =
      v.likes ?? 0;

    followInit[v.creator_id] =
      !!v.is_following;

    bookmarkInit[v.id] =
      !!v.bookmarked;

  }

  setLikedMap(prev => ({
    ...prev,
    ...likedInit,
  }));

  setLikesMap(prev => ({
    ...prev,
    ...likesInit,
  }));

  setFollowingMap(prev => ({
    ...prev,
    ...followInit,
  }));

  setBookmarkMap(prev => ({
    ...prev,
    ...bookmarkInit,
  }));

}, [videos]);


useVideoObserver({videos, videoRefs, observerRef, watchedRef, watchTimersRef, handleWatch,setActiveVideoId, manuallyPausedRef,});

const {isTabVisible,watchSeconds,} = useWatchTracking({activeVideoId,});

const {handleGift, handleFollow, handleLike, handleBookmark,} = useFeedInteractions({API_BASE, user_id, likedMap, followingMap, bookmarkMap, setLikedMap, setLikesMap, setFollowingMap, setBookmarkMap,});

  // 加载更多触发器
  useEffect(() => {
    if (!containerRef.current || videos.length === 0 || loadingMore) return;
const triggerIndex =
  Math.max(
    videos.length -
      PREFETCH_BEFORE_END -
      1,
    0
  );

const lastVideo =
  containerRef.current.querySelector(
    `[data-video-index="${triggerIndex}"]`
  );
console.log(
  "Last Element :",
  lastVideo,
  lastVideo === null
);
    if (!lastVideo) return;

   const triggerObserver = new IntersectionObserver(
  entries => {

  if (
  entries[0]?.isIntersecting &&
  !loadingMore &&
  !fetchingMoreRef.current
) {

  fetchingMoreRef.current = true;

  console.log("🔥 Trigger Observer");

  console.log(
    "🔥 Last video visible"
  );

  fetchMoreFeed().finally(() => {

    fetchingMoreRef.current = false;

  });

}

  },
  {
    threshold: 0.5,
  }
);

    triggerObserver.observe(lastVideo);
    return () => triggerObserver.disconnect();
  }, [videos, loadingMore, fetchMoreFeed]);

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
    rewardTriggerRef.current &&
  (user?.reward_ads_remaining ?? 0) > 0
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
  
rewardTriggerRef.current = 1;
  // watchedCount + 2;
  // 🔥 下一次随机 trigger
 // rewardTriggerRef.current =
 //   watchedCount +
 //   Math.floor(
 //     Math.random() * 5
 //   ) +
//    8;

}
  }
  
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
  
    onTouchStart={(e) => {

    if (containerRef.current?.scrollTop !== 0) return;

    startYRef.current = e.touches[0].clientY;
    pullDistanceRef.current = 0;
    pullingRef.current = true;

  }}

  onTouchMove={(e) => {

    if (!pullingRef.current) return;

    pullDistanceRef.current =
      e.touches[0].clientY -
      startYRef.current;

    if (pullDistanceRef.current > 10) {
      setPulling(true);
    }

}}

onTouchEnd={async () => {

    if (!pullingRef.current) return;

    pullingRef.current = false;

    setPulling(false);

    if (pullDistanceRef.current > 80) {

      setRefreshing(true);

      await fetchFirstFeed();

      setRefreshing(false);

    }

}}
  
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

 <RefreshHeader
    pulling={pulling}
    refreshing={refreshing}
  />


		  {videos.map((feedItem, index) => {
			  console.log(
  "Render:",
  feedItem.id,
  feedItem.type
);
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
	  onRewardSuccess={() =>
        setShowRewardSuccess(true)
    }
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

return (
  <FeedVideoCard
    key={feedItem.id}

    feedItem={feedItem}
	index={index}
	isTelegram={isTelegram}
	isMuted={isMuted}
	showControlsMap={showControlsMap}
	setShowControlsMap={setShowControlsMap}
	videoRefs={videoRefs}
	controlsTimersRef={controlsTimersRef}
	likedMap={likedMap}
	likesMap={likesMap}
	followingMap={followingMap}
	bookmarkMap={bookmarkMap}
	commentVideoId={commentVideoId}
	handleFollow={handleFollow}
	handleLike={handleLike}
	handleGift={handleGift}
	handleBookmark={handleBookmark}
	setCommentVideoId={setCommentVideoId}
	setShareVideo={setShareVideo}
	setShareVideoIndex={setShareVideoIndex}
	setShowShareSheet={setShowShareSheet}
	manuallyPausedRef={manuallyPausedRef}
	onToggleMute={handleToggleMute}

 onTimeUpdate={(e) =>
  handleMidrollTimeUpdate({e,feedItem,API_BASE,lastMidrollAtRef,midrollTriggeredRef,isTabVisible,currentUserId: user_id,})
  
}
  />
);

          })}

          {loadingMore && (
            <div className="h-16 flex items-center justify-center bg-black">
              <p className="text-gray-400 text-sm">Loading more...</p>
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
		
		<ShareSheet
  show={showShareSheet}
  video={shareVideo}
  videoIndex={shareVideoIndex}

  onClose={() => {
    closeShareSheet(shareVideoIndex);
  }}

  onReport={() => {

    setReportVideo(shareVideo);

    setShowShareSheet(false);

    setShowReportSheet(true);

  }}
/>


<ReportSheet
  show={showReportSheet}
  reportVideo={reportVideo}
  user_id={user_id}
  shareVideoIndex={shareVideoIndex}

  onClose={() => {

    setShowReportSheet(false);

    setReportVideo(null);

    videoRefs.current[
      shareVideoIndex ?? 0
    ]
      ?.play()
      .catch(() => {});

  }}

  onReported={() => {

    setShowReportSheet(false);

    setReportVideo(null);

    closeShareSheet(shareVideoIndex);

  }}
/>

<RewardSuccessModal
    open={showRewardSuccess}
    amount={500}
    onClose={() =>
        setShowRewardSuccess(false)
    }
/>


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