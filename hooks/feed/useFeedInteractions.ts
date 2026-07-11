import { useCallback } from "react";

type Props = {
  API_BASE: string;

  user_id: string;

  likedMap: Record<string, boolean>;

  followingMap: Record<string, boolean>;

  bookmarkMap: Record<string, boolean>;

  setLikedMap: React.Dispatch<
    React.SetStateAction<
      Record<string, boolean>
    >
  >;

  setLikesMap: React.Dispatch<
    React.SetStateAction<
      Record<string, number>
    >
  >;

  setFollowingMap: React.Dispatch<
    React.SetStateAction<
      Record<string, boolean>
    >
  >;

  setBookmarkMap: React.Dispatch<
    React.SetStateAction<
      Record<string, boolean>
    >
  >;
};

export function useFeedInteractions({
  API_BASE,
  user_id,
  likedMap,
  followingMap,
  bookmarkMap,
  setLikedMap,
  setLikesMap,
  setFollowingMap,
  setBookmarkMap,
}: Props) {

  const handleGift =
  useCallback(

    async (
      video_id: string,
      gift_id: string
    ) => {

      const res = await fetch(
        `${API_BASE}/api/send-gift`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            sender_id: user_id,

            video_id,

            gift_id,

            type: "paid",

          }),

        }
      );

      const data =
        await res.json();

      if (data.success) {
        alert("Gift sent 💸");
      } else {
        alert(data.error);
      }

    },

    [
      API_BASE,
      user_id,
    ]

  );

  const handleFollow =
  useCallback(

    async (
      creator_id: string,
      video_id: string
    ) => {

      const current =
        followingMap[
          creator_id
        ] === true;

      try {

        const res = await fetch(
          `${API_BASE}/api/follow`,
          {
            method:
              current
                ? "DELETE"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              follower_id:
                user_id,

              following_id:
                creator_id,

              video_id,

            }),

          }
        );

        const data =
          await res.json();

        if (data.success) {

          setFollowingMap(
            prev => ({
              ...prev,
              [creator_id]:
                !prev[
                  creator_id
                ],
            })
          );

        }

      } catch (err) {

        console.error(
          "Follow error",
          err
        );

      }

    },

    [
      API_BASE,
      user_id,
      followingMap,
      setFollowingMap,
    ]

  );

  const handleLike =
  useCallback(

    async (
      video: any
    ) => {

      const videoId =
        video.id;

      const isLiked =
        likedMap[
          videoId
        ] === true;

      try {

        if (!isLiked) {

          const res =
            await fetch(
              `${API_BASE}/api/like`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({

                  user_id,

                  video_id:
                    videoId,

                }),

              }
            );

          const data =
            await res.json();

          if (data.success) {

            setLikedMap(
              prev => ({
                ...prev,
                [videoId]:
                  true,
              })
            );

            setLikesMap(
              prev => ({
                ...prev,

                [videoId]:
                  (
                    prev[
                      videoId
                    ] ?? 0
                  ) + 1,

              })
            );

          }

        } else {

          const res =
            await fetch(
              `${API_BASE}/api/like`,
              {
                method: "DELETE",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({

                  user_id,

                  video_id:
                    videoId,

                }),

              }
            );

          const data =
            await res.json();

          if (data.success) {

            setLikedMap(
              prev => ({
                ...prev,
                [videoId]:
                  false,
              })
            );

            setLikesMap(
              prev => ({
                ...prev,

                [videoId]:
                  Math.max(
                    (
                      prev[
                        videoId
                      ] ?? 0
                    ) - 1,
                    0
                  ),

              })
            );

          }

        }

      } catch (err) {

        console.error(
          "Like error:",
          err
        );

      }

    },

    [
      API_BASE,
      user_id,

      likedMap,

      setLikedMap,

      setLikesMap,
    ]

  );

  const handleBookmark =
  useCallback(

    async (
      videoId: string
    ) => {

      const isSaved =
        bookmarkMap[
          videoId
        ];

      try {

        const res =
          await fetch(
            `${API_BASE}/api/bookmark`,
            {
              method:
                !isSaved
                  ? "POST"
                  : "DELETE",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                user_id,

                video_id:
                  videoId,

              }),

            }
          );

        const data =
          await res.json();

        if (data.success) {

          setBookmarkMap(
            prev => ({
              ...prev,
              [videoId]:
                !isSaved,
            })
          );

        } else if (
          res.status === 409
        ) {

          setBookmarkMap(
            prev => ({
              ...prev,
              [videoId]:
                true,
            })
          );

        }

      } catch (err) {

        console.error(
          "Bookmark error:",
          err
        );

      }

    },

    [
      API_BASE,
      user_id,

      bookmarkMap,

      setBookmarkMap,
    ]

  );

  return {

    handleGift,

    handleFollow,

    handleLike,

    handleBookmark,

  };

}