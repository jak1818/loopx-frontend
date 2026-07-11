"use client";

import React from "react";

type Props = {
  ad: any;
  user_id: string;
  API_BASE: string;
};

function SponsoredCard({
  ad,
  user_id,
  API_BASE,
}: Props) {

  return (
    <div
      className="
        h-[100dvh]
		w-full
        snap-start
        snap-always
        flex
        items-center
        justify-center
        bg-black
        text-white
        px-6
      "
    >

      <div className="text-center max-w-md">

        <div className="text-sm text-gray-400 mb-3 uppercase tracking-widest">
          Sponsored
        </div>

        <img
          src={
            ad.image_url ||
            "https://placehold.co/400x400/png"
          }
          alt="sponsored"
          className="
            w-64
            h-64
            object-cover
            rounded-3xl
            mx-auto
            mb-6
          "
        />

        <div className="text-3xl font-bold mb-3">
          {ad.title || "Install XYZ App"}
        </div>

        <div className="text-gray-400 mb-8">
          {
            ad.description ||
            "Best AI app of 2026"
          }
        </div>

        <button
          onClick={async () => {
           alert("DOWNLOAD CLICKED");
            try {

              const showAd =
                (window as any)
                  .show_10915445;
				  
				  alert(
  `SHOWAD EXISTS: ${!!showAd}`
);

              if (
                typeof window ===
                  "undefined" ||
                !showAd
              ) {

                alert("Ad not ready");

                return;

              }

              const eventId =
                crypto.randomUUID();
				
				alert(
  `EVENT ID: ${eventId}`
);
				

alert("CALLING INIT API");
              // ✅ insert pending impression
             const initRes = await fetch(
  `${API_BASE}/api/monetag/init`,
  {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json",
    },

    body: JSON.stringify({
      user_id,
      event_id: eventId,
      ad_type: "sponsored",
    }),
  }
);

console.log(
  "INIT STATUS",
  initRes.status
);



              // ✅ trigger in-app interstitial
              await showAd({

                type: "inApp",

                inAppSettings: {
                  frequency: 2,
                  capping: 0.1,
                  interval: 30,
                  timeout: 5,
                  everyPage: false,
                },
              });
			  
setTimeout(async () => {

  await fetch(
    `${API_BASE}/api/monetag/qualify`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        event_id: eventId,
        duration: 15,
      }),
    }
  );

}, 15000);

            } catch (err) {

              console.error(
                "Sponsored ad error",
                err
              );
			  
			   alert(
    `ERROR: ${String(err)}`
  );

            }

          }}
          className="
            bg-yellow-500
            text-black
            px-8
            py-4
            rounded-full
            font-bold
          "
        >
          {ad.cta || "Download"}
        </button>

      </div>

    </div>
  );
}

export default React.memo(
  SponsoredCard
);