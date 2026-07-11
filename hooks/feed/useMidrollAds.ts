type Props = {
  e: React.SyntheticEvent<
    HTMLVideoElement
  >;

  feedItem: any;

  API_BASE: string;

  lastMidrollAtRef:
    React.MutableRefObject<number>;

  midrollTriggeredRef:
    React.MutableRefObject<
      Record<string, boolean>
    >;

  isTabVisible: boolean;

  currentUserId: string;
};

export async function handleMidrollTimeUpdate({
  e,
  feedItem,
  API_BASE,
  lastMidrollAtRef,
  midrollTriggeredRef,
  isTabVisible,
  currentUserId,
}: Props) {



  // 🔥 creator monetization OFF
  if (!feedItem.ads_enabled) {

    return;
  }

  // 🔥 tab hidden
  if (!isTabVisible) {
    return;
  }

  const current =
    e.currentTarget.currentTime;
	
  const duration =
    e.currentTarget.duration;


  const now =
    Date.now();
	
	const showMidrollAd = async () => {

  const showAd =
    (window as any).show_10915445;


  if (!showAd) {
    return false;
  }

await showAd({

    type: "inApp",

    inAppSettings: {
      frequency: 1,
      capping: 0.1,
      interval: 30,
      timeout: 0,
      everyPage: true,
    },

  });

  return true;

};

  // 🔥 Global cooldown
  if (
    now - lastMidrollAtRef.current <
    90000
  ) {
    return;
  }

  // ─────────────────────────────
  // < 3 min = 1 ad
  // ─────────────────────────────

  if (
    duration < 180 &&
    current >= 10 &&
    !midrollTriggeredRef.current[
      `${feedItem.id}-1`
    ]
  ) {
	  
	  console.log(
        "[ENTER MIDROLL]",
        feedItem.id,
        current,
        midrollTriggeredRef.current[
            `${feedItem.id}-1`
        ],
        lastMidrollAtRef.current
    );

    try {

const eventId = crypto.randomUUID();

await fetch(
  `${API_BASE}/api/monetag/init`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: currentUserId,
      event_id: eventId,
      ad_type: "creator_midroll",
      creator_id: feedItem.creator_id,
      video_id: feedItem.id,
    }),
  }
);

   midrollTriggeredRef.current[
      `${feedItem.id}-1`
    ] = true;

 lastMidrollAtRef.current =
        now;
		
const shown =
      await showMidrollAd();
	  

    if (!shown) {
		
		 midrollTriggeredRef.current[
        `${feedItem.id}-1`
    ] = false;
      return;
    }

 
		
		setTimeout(async () => {

  await fetch(
    `${API_BASE}/api/monetag/qualify`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        event_id: eventId,
        duration: 15,
      }),
    }
  );

}, 15000);


    } catch (err) {

      console.error(err);

    }

  }

  // ─────────────────────────────
  // > 3 min = 2 ads
  // ─────────────────────────────

  if (duration >= 180) {

    // first ad
    if (
      current >= 15 &&
      !midrollTriggeredRef.current[
        `${feedItem.id}-1`
      ]
    ) {

      try {

        const eventId = crypto.randomUUID();

await fetch(
  `${API_BASE}/api/monetag/init`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: currentUserId,
      event_id: eventId,
      ad_type: "creator_midroll",
      creator_id: feedItem.creator_id,
      video_id: feedItem.id,
    }),
  }
);

    midrollTriggeredRef.current[
      `${feedItem.id}-1`
    ] = true;

      lastMidrollAtRef.current =
        now;
		
const shown =
      await showMidrollAd();

    if (!shown) {
		 midrollTriggeredRef.current[
        `${feedItem.id}-1`
    ] = false;
      return;
    }


	
			setTimeout(async () => {

  await fetch(
    `${API_BASE}/api/monetag/qualify`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        event_id: eventId,
        duration: 15,
      }),
    }
  );

}, 15000);

		


    } catch (err) {

      console.error(err);

    }

  }

    // second ad
    else if (
      current >= 90 &&
      !midrollTriggeredRef.current[
        `${feedItem.id}-2`
      ]
    ) {

      try {
       const eventId = crypto.randomUUID();

await fetch(
  `${API_BASE}/api/monetag/init`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: currentUserId,
      event_id: eventId,
      ad_type: "creator_midroll",
      creator_id: feedItem.creator_id,
      video_id: feedItem.id,
    }),
  }
);

   midrollTriggeredRef.current[
      `${feedItem.id}-2`
    ] = true;

      lastMidrollAtRef.current =
        now;
		
const shown =
      await showMidrollAd();
	  
	  

    if (!shown) {
		 midrollTriggeredRef.current[
        `${feedItem.id}-2`
    ] = false;
      return;
    }
 
		setTimeout(async () => {

  await fetch(
  `${API_BASE}/api/monetag/qualify`,
   {
     method: "POST",

     headers: {
        "Content-Type": "application/json",
     },

      body: JSON.stringify({
       event_id: eventId,
        duration: 15,
      }),
   }
  );

}, 15000);

      } catch (err) {

        console.error(err);

      }

    }

  }

}