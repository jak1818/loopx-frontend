import {
  useEffect,
} from "react";

type Props = {
  videos: any[];

  videoRefs: React.MutableRefObject<
    (HTMLVideoElement | null)[]
  >;

  observerRef: React.MutableRefObject<
    IntersectionObserver | null
  >;

  watchedRef: React.MutableRefObject<
    Record<string, boolean>
  >;

  watchTimersRef: React.MutableRefObject<
    Record<string, NodeJS.Timeout>
  >;

  handleWatch: (
    video_id: string,
    watch_seconds: number,
    duration: number
  ) => void;


  setActiveVideoId: (
    id: string | null
  ) => void;
  
  manuallyPausedRef: React.MutableRefObject<
  Record<string, boolean>
>;
};

export function useVideoObserver({
  videos,
  videoRefs,
  observerRef,
  watchedRef,
  watchTimersRef,
  handleWatch,
  setActiveVideoId,
  manuallyPausedRef,
}: Props) {

  useEffect(() => {

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current =
      new IntersectionObserver(
        entries => {

          entries.forEach(
            entry => {

              const video =
                entry.target as HTMLVideoElement;

              const videoId =
                video.dataset.id!;
				
              if (
                entry.isIntersecting
              ) {
				  
			    setActiveVideoId(videoId);
				
if (
  video.paused &&
  !manuallyPausedRef.current[
    videoId
  ]
) {

  video
    .play()
    .catch(() => {});

}
                if (
                  !watchedRef.current[
                    videoId
                  ]
                ) {

                  if (
                    watchTimersRef.current[
                      videoId
                    ]
                  ) {

                    clearTimeout(
                      watchTimersRef.current[
                        videoId
                      ]
                    );

                  }

                  watchTimersRef.current[
                    videoId
                  ] = setTimeout(() => {

                    handleWatch(
                      videoId,

                      Math.min(
                        5,
                        video.duration
                      ),

                      video.duration
                    );

                    watchedRef.current[
                      videoId
                    ] = true;

                    delete watchTimersRef.current[
                      videoId
                    ];

                  }, 5000);

                }

              } else {

                video.pause();
				
				setActiveVideoId(null);

                if (
                  watchTimersRef.current[
                    videoId
                  ]
                ) {

                  clearTimeout(
                    watchTimersRef.current[
                      videoId
                    ]
                  );

                  delete watchTimersRef.current[
                    videoId
                  ];

                }

              }

            }
          );

        },
        {
          threshold: 0.75,
        }
      );

    videoRefs.current.forEach(
      video => {

        if (video) {

          observerRef.current!
            .observe(video);

        }

      }
    );

    return () => {

      observerRef.current
        ?.disconnect();

    };

  }, [
    videos,
    videoRefs,
    observerRef,
    watchedRef,
    watchTimersRef,
    handleWatch,
	setActiveVideoId,
	manuallyPausedRef,
  ]);

}