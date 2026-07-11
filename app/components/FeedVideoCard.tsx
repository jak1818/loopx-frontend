"use client";

import FeedActions from "@/app/components/FeedActions";
import VideoControls from "@/app/components/VideoControls";
import React, {useState} from "react";
import GiftSheet from "@/app/components/GiftSheet";

type Props = {
  feedItem: any;

  index: number;

  isTelegram: boolean;

  isMuted: boolean;

  showControlsMap: Record<number, boolean>;

  setShowControlsMap: React.Dispatch<
    React.SetStateAction<
      Record<number, boolean>
    >
  >;

  videoRefs: React.MutableRefObject<
    (HTMLVideoElement | null)[]
  >;

  controlsTimersRef: React.MutableRefObject<
    Record<number, NodeJS.Timeout>
  >;

  likedMap: Record<string, boolean>;

  likesMap: Record<string, number>;

  followingMap: Record<string, boolean>;

  bookmarkMap: Record<string, boolean>;

  commentVideoId: string | null;

  handleFollow: (
    creator_id: string,
    video_id: string
  ) => void;

  handleLike: (
    video: any
  ) => void;
  
    handleGift: (
    feedItem: any
  ) => void;

  handleBookmark: (
    videoId: string
  ) => void;

  setCommentVideoId: (
    id: string
  ) => void;

  setShareVideo: (
    video: any
  ) => void;

  setShareVideoIndex: (
    index: number
  ) => void;

  setShowShareSheet: (
    show: boolean
  ) => void;
  
  manuallyPausedRef: React.MutableRefObject<
  Record<string, boolean>
>;

  onToggleMute: () => void;

  onTimeUpdate: (
    e: React.SyntheticEvent<
      HTMLVideoElement
    >
  ) => void;
};

function FeedVideoCard({
  feedItem,
  index,
  isTelegram,
  isMuted,
  showControlsMap,
  setShowControlsMap,
  videoRefs,
  controlsTimersRef,
  likedMap,
  likesMap,
  followingMap,
  bookmarkMap,
  commentVideoId,
  handleFollow,
  handleLike,
  handleBookmark,
  setCommentVideoId,
  setShareVideo,
  setShareVideoIndex,
  setShowShareSheet,
  manuallyPausedRef,
  onToggleMute,
  onTimeUpdate,
}: Props) {
	
		const [
  showGiftSheet,
  setShowGiftSheet
] = useState(false);

  return (
    <div
      data-video-index={index}
      className={`
        h-[100dvh]
        w-full
        snap-start
        snap-always
        relative
        bg-black
        overflow-hidden
        ${isTelegram ? "pt-0" : "pt-0"}
      `}
      onClick={() => {

        const vid =
          videoRefs.current[index];
		  


        if (vid) {

         if (vid.paused) {

  delete manuallyPausedRef.current[
    feedItem.id
  ];

  vid.play().catch(() => {});

} else {

  manuallyPausedRef.current[
    feedItem.id
  ] = true;

  vid.pause();

}

        }

        setShowControlsMap(prev => {

          const newVisible =
            !prev[index];

          if (
            controlsTimersRef.current[
              index
            ]
          ) {

            clearTimeout(
              controlsTimersRef.current[
                index
              ]
            );

            delete controlsTimersRef.current[
              index
            ];

          }

          if (newVisible) {

            controlsTimersRef.current[
              index
            ] = setTimeout(() => {

              setShowControlsMap(
                prevMap => ({
                  ...prevMap,
                  [index]: false,
                })
              );

              delete controlsTimersRef.current[
                index
              ];

            }, 3000);

          }

          return {
            ...prev,
            [index]: newVisible,
          };

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
        onTimeUpdate={onTimeUpdate}
      />

      {showControlsMap[index] && (

        <VideoControls
          video={
            videoRefs.current[index]
          }
          muted={isMuted}
          onToggleMute={onToggleMute}
        />

      )}

      <div className="absolute bottom-20 left-4 text-white z-10 text-sm">
        @{feedItem.username || "creator"}
      </div>

      <FeedActions
        feedItem={feedItem}
        index={index}

        likedMap={likedMap}
        likesMap={likesMap}
        followingMap={followingMap}
        bookmarkMap={bookmarkMap}

        commentVideoId={
          commentVideoId
        }

        videoRefs={videoRefs}

        controlsTimersRef={
          controlsTimersRef
        }

        setShowControlsMap={
          setShowControlsMap
        }

        handleFollow={
          handleFollow
        }

        handleLike={
          handleLike
        }

  handleGift={() => {

  console.log(
    "Open Gift Sheet",
    feedItem.id
  );

  setShowGiftSheet(true);

}}

        handleBookmark={
          handleBookmark
        }

        setCommentVideoId={
          setCommentVideoId
        }

        setShareVideo={
          setShareVideo
        }

        setShareVideoIndex={
          setShareVideoIndex
        }

        setShowShareSheet={
          setShowShareSheet
        }
      />
	  
	  <GiftSheet
  show={showGiftSheet}
  onClose={() =>
    setShowGiftSheet(false)
  }
  feedItem={feedItem}
/>

    </div>
  );
}

export default FeedVideoCard;