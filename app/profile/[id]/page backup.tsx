"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Grid,
  Bookmark,
  Heart,
} from "lucide-react";

export default function ProfilePage({ params }: any) {
  const { id } = params;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState("videos");
  const currentUserId = "22222222-2222-2222-2222-222222222222";
  const isMe = id === currentUserId;

  useEffect(() => {
    fetch(`http://localhost:5000/api/user/profile-full/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res);
      });
  }, [id]);

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  const { user, followers, following, videos } = data;

  return (
    <div className="min-h-screen bg-black text-white max-w-[430px] mx-auto">

      {/* 🔝 Header */}
      <div className="flex flex-col items-center pt-4 pb-2">

        <img
          src={user.avatar_url || "https://i.pravatar.cc/150"}
          className="w-20 h-20 rounded-full border border-white"
        />

        <h2 className="mt-2 text-base font-semibold">
          @{user.username || "creator"}
        </h2>
		
		       {isMe ? (
  <button className="mt-3 bg-gray-700 px-6 py-1.5 rounded-full text-sm">
    Edit Profile
  </button>
) : (
  <button className="mt-3 bg-red-500 px-6 py-1.5 rounded-full text-sm">
    Follow
  </button>
)}
		
        <div className="flex gap-8 mt-2 text-center">
          <div>
            <p className="font-bold">{followers}</p>
            <p className="text-gray-400 text-xs">Followers</p>
          </div>

          <div>
            <p className="font-bold">{following}</p>
            <p className="text-gray-400 text-xs">Following</p>
          </div>
        </div>

		<p className="text-gray-400 text-sm mt-1">
  {user.bio || (isMe ? "Add bio..." : "")}
</p>
      </div>

      {/* 🧭 Tabs */}
      <div className="flex justify-around border-b border-gray-800 mt-3">

        <button
          onClick={() => setTab("videos")}
          className={`pb-3 ${
            tab === "videos"
              ? "border-b-2 border-white"
              : "text-gray-500"
          }`}
        >
          <Grid size={20} />
        </button>

        <button
          onClick={() => setTab("saved")}
          className={`pb-3 ${
            tab === "saved"
              ? "border-b-2 border-white"
              : "text-gray-500"
          }`}
        >
          <Bookmark size={20} />
        </button>

        <button
          onClick={() => setTab("liked")}
          className={`pb-3 ${
            tab === "liked"
              ? "border-b-2 border-white"
              : "text-gray-500"
          }`}
        >
          <Heart size={20} />
        </button>
      </div>

      {/* 🎬 Content */}
      {tab === "videos" && (
        <div className="grid grid-cols-3 gap-[2px]">
          {videos.map((v: any) => (
            <div
              key={v.id}
              className="aspect-[9/16] bg-gray-900 cursor-pointer"
              onClick={() => router.push(`/video/${v.id}`)}
            >
              <video
                src={v.video_url}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="text-center text-gray-500 mt-10">
          No saved videos
        </div>
      )}

      {tab === "liked" && (
        <div className="text-center text-gray-500 mt-10">
          No liked videos
        </div>
      )}
    </div>
  );
}