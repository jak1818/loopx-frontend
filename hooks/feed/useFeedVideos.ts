import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const PAGE_SIZE = 10;
const MAX_VIDEO_CACHE = 50;

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
console.count("🔥 fetchFirstFeed()");
      if (!user_id) return;

      renderedIdsRef.current = [];

      setVideos([]);

      try {

        const res = await fetch(
          `${API_BASE}${endpoint}?user_id=${user_id}&limit=${PAGE_SIZE}`
        );

        const data =
          await res.json();
		  
		  console.log("🔥 Feed Response:", data);

        const fetchedVideos =
          Array.isArray(data?.data)
            ? data.data
            : [];

        setVideos(injectFeedCards(fetchedVideos));

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
console.count("🔥 fetchFirstFeed Effect");
    fetchFirstFeed();

  }, [fetchFirstFeed]);

  const fetchMoreFeed =
    useCallback(async () => {

  console.log("🔥 fetchMoreFeed() called");
  
      if (
        !user_id ||
        loadingMore
      ) {
        return;
      }

      setLoadingMore(true);

      const excludeStr =
        renderedIdsRef.current
          .join(",");
console.log("🔥 excludeStr:", excludeStr);
      try {

        const res = await fetch(
          `${API_BASE}${endpoint}?user_id=${user_id}&limit=${PAGE_SIZE}&exclude_ids=${excludeStr}`
        );

        const data =
          await res.json();

        const newVideos =
		  (Array.isArray(data?.data)
			? data.data
			: [])
		.filter(
			v =>
			!renderedIdsRef.current.includes(
				v.id
			)
		);

console.log(
  "🔥 newVideos:",
  newVideos.length
);

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

         setVideos(prev => {
const merged = [...prev, ...mixedFeed];

const MAX_FEED_ITEMS = (PAGE_SIZE + 2) * 5;
const REMOVE_ITEMS = PAGE_SIZE + 2;

   if (merged.length > MAX_FEED_ITEMS) {

    merged.splice(0, REMOVE_ITEMS);

}

    return merged;
});


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
		  
		  if (renderedIdsRef.current.length > MAX_VIDEO_CACHE) {

    renderedIdsRef.current.splice(
        0,
        PAGE_SIZE
    );

}

        } else {

          renderedIdsRef.current = [];

		  setVideos([]);

		  fetchFirstFeed();

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
      loadingMore,
    ]);

  return {

    videos,
	
    setVideos,

    loadingMore,

    fetchMoreFeed,
	
	fetchFirstFeed,

  };

}