"use client";

import { Bookmark, Share2, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  feedItem: any;

  index: number;

  likedMap: Record<string, boolean>;

  likesMap: Record<string, number>;

  followingMap: Record<string, boolean>;

  bookmarkMap: Record<string, boolean>;

  commentVideoId: string | null;

  videoRefs: React.MutableRefObject<
    (HTMLVideoElement | null)[]
  >;

  controlsTimersRef: React.MutableRefObject<
    Record<number, NodeJS.Timeout>
  >;

  setShowControlsMap: React.Dispatch<
    React.SetStateAction<
      Record<number, boolean>
    >
  >;

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
};

function FeedActions({
  feedItem,
  index,
  likedMap,
  likesMap,
  followingMap,
  bookmarkMap,
  commentVideoId,
  videoRefs,
  controlsTimersRef,
  setShowControlsMap,
  handleFollow,
  handleLike,
  handleGift,
  handleBookmark,
  setCommentVideoId,
  setShareVideo,
  setShareVideoIndex,
  setShowShareSheet,
}: Props) {

  const router = useRouter();

  const isFollowing =
    followingMap[
      feedItem.creator_id
    ] === true;

  if (commentVideoId) {
    return null;
  }

  return (
    <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-10">

      {/* Avatar + Follow */}
      <div className="flex flex-col items-center">

        <img
          onClick={(e) => {

            e.stopPropagation();

            router.push(
              `/profile/${feedItem.creator_id}`
            );

          }}
          src={
            feedItem.avatar_url ||
            "/default-avatar.png"
          }
          alt="avatar"
          className="w-14 h-14 rounded-full cursor-pointer"
        />

        <button
          onClick={(e) => {

            e.stopPropagation();

            handleFollow(
              feedItem.creator_id,
              feedItem.id
            );

          }}
          className={`mt-2 w-6 h-6 flex items-center justify-center rounded-full text-xs border ${
            isFollowing
              ? "bg-gray-400 text-white border-gray-400"
              : "bg-red-500 text-white border-red-500"
          }`}
        >
          {isFollowing ? "✓" : "+"}
        </button>

      </div>

      {/* Like */}
      <div
        onClick={(e) => {

          e.stopPropagation();

          handleLike(feedItem);

        }}
        className="flex flex-col items-center text-white cursor-pointer"
      >

        <span className="text-2xl">
          {likedMap[feedItem.id]
            ? "❤️"
            : "🤍"}
        </span>

        <span className="text-sm">
          {Number(
            likesMap[feedItem.id] || 0
          )}
        </span>

      </div>

      {/* Comment */}
      <div
        onClick={(e) => {

          e.stopPropagation();

          videoRefs.current[index]?.pause();

          if (
            controlsTimersRef.current[index]
          ) {

            clearTimeout(
              controlsTimersRef.current[index]
            );

            delete controlsTimersRef.current[
              index
            ];

          }

          setShowControlsMap(prev => ({
            ...prev,
            [index]: false,
          }));

          window.dispatchEvent(
            new Event("comments-open")
          );

          setCommentVideoId(
            feedItem.id
          );

        }}
        className="flex flex-col items-center text-white cursor-pointer"
      >

        <span className="text-2xl">
          💬
        </span>

        <span className="text-xs">
          {feedItem.comments ?? 0}
        </span>

      </div>

     {/* Gift */}
<div
  onClick={(e) => {

    e.stopPropagation();

    handleGift(feedItem);

  }}
  className="flex flex-col items-center text-white cursor-pointer"
>

  <Gift
    className="
      w-8
      h-8
      text-white-400
      hover:scale-110
      transition
    "
  />

</div>

      {/* Bookmark */}
      <div
        onClick={(e) => {

          e.stopPropagation();

          handleBookmark(
            feedItem.id
          );

        }}
        className="flex flex-col items-center text-white cursor-pointer p-2"
      >

        <span className="text-xl">

          <Bookmark
            className={`w-6 h-6 ${
              bookmarkMap[feedItem.id]
                ? "fill-white"
                : "stroke-white"
            }`}
          />

        </span>

      </div>

      {/* Share */}
      <div
        onClick={(e) => {

          e.stopPropagation();

          videoRefs.current[index]?.pause();

          if (
            controlsTimersRef.current[index]
          ) {

            clearTimeout(
              controlsTimersRef.current[index]
            );

            delete controlsTimersRef.current[
              index
            ];

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
  );
}

export default React.memo(
  FeedActions
);