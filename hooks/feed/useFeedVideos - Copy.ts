import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const PAGE_SIZE = 10;

type Props = {
  API_BASE: string;

  endpoint: string;

  user_id: string;
};

export function useFeedVideos({
  API_BASE,
  endpoint,
  user_id,
}: Props) {

  const [videos, setVideos] =
    useState<any[]>([]);

  const [hasMore, setHasMore] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const renderedIdsRef =
    useRef<string[]>([]);

  const injectFeedCards = (
    feed: any[]
  ) => {

    const mixedFeed = [...feed];

    if (mixedFeed.length >= 5) {

      mixedFeed.splice(5, 0, {
        id: `reward-${Date.now()}-${Math.random()}`,
        type: "reward_card",
      });

      mixedFeed.splice(8, 0, {
        id: `sponsored-${Date.now()}-${Math.random()}`,
        type: "sponsored",

        title:
          "Install XYZ VPN",

        description:
          "Fastest VPN in Asia",

        cta: "Download",

        image_url:
          "https://placehold.co/400x400/png",
      });

    }

    return mixedFeed;

  };

  const fetchFirstFeed =
    useCallback(async () => {

      if (!user_id) return;

      setHasMore(true);

      renderedIdsRef.current = [];

      setVideos([]);

      try {

        const res = await fetch(
          `${API_BASE}${endpoint}?user_id=${user_id}&limit=${PAGE_SIZE}`
        );

        const data =
          await res.json();

        const fetchedVideos =
          Array.isArray(data?.data)
            ? data.data
            : [];

        const mixedFeed =
          injectFeedCards(
            fetchedVideos
          );

        setVideos(mixedFeed);

        setHasMore(
          data.hasMore ?? false
        );

        fetchedVideos.forEach(v => {

          if (
            !renderedIdsRef.current.includes(
              v.id
            )
          ) {

            renderedIdsRef.current.push(
              v.id
            );

          }

        });

      } catch (err) {

        console.error(
          "Feed fetch error:",
          err
        );

      }

    }, [
      API_BASE,
      endpoint,
      user_id,
    ]);

  useEffect(() => {

    fetchFirstFeed();

  }, [fetchFirstFeed]);

  const fetchMoreFeed =
    useCallback(async () => {

      if (
        !user_id ||
        !hasMore ||
        loadingMore
      ) {
        return;
      }

      setLoadingMore(true);

      const excludeStr =
        renderedIdsRef.current
          .join(",");

      try {

        const res = await fetch(
          `${API_BASE}${endpoint}?user_id=${user_id}&limit=${PAGE_SIZE}&exclude_ids=${excludeStr}`
        );

        const data =
          await res.json();

        const newVideos =
          Array.isArray(data?.data)
            ? data.data
            : [];

        if (
          newVideos.length > 0
        ) {

          const mixedFeed =
            [...newVideos];

          mixedFeed.splice(2, 0, {
            id: `reward-${Date.now()}-${Math.random()}`,
            type: "reward_card",
          });

          mixedFeed.splice(5, 0, {
            id: `sponsored-${Date.now()}-${Math.random()}`,
            type: "sponsored",

            title:
              "Install XYZ VPN",

            description:
              "Fastest VPN in Asia",

            cta: "Download",

            image_url:
              "https://placehold.co/400x400/png",
          });

          setVideos(prev => [
            ...prev,
            ...mixedFeed,
          ]);

          setHasMore(
            data.hasMore ?? false
          );

          newVideos.forEach(v => {

            if (
              !renderedIdsRef.current.includes(
                v.id
              )
            ) {

              renderedIdsRef.current.push(
                v.id
              );

            }

          });

        } else {

          renderedIdsRef.current = [];

		  fetchMoreFeed();

          return;

        }

      } catch (err) {

        console.error(
          "Load more error:",
          err
        );

      } finally {

        setLoadingMore(false);

      }

    }, [
      API_BASE,
      endpoint,
      user_id,
      hasMore,
      loadingMore,
    ]);

  return {

    videos,
    setVideos,

    hasMore,

    loadingMore,

    fetchMoreFeed,

  };

}