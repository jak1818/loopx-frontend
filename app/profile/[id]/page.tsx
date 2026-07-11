"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Grid, Bookmark, Heart } from "lucide-react";
import { useAppData } from "@/providers/AppDataProvider";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function ProfilePage({ params }: any) {
  const { id } = params;
  const router = useRouter();
  const { telegramUser, webUser } = useAppData();
  const currentUserId = telegramUser?.id || webUser?.id;
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState("videos");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const isMe = id === currentUserId;

  // 内联编辑
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempBio, setTempBio] = useState("");

useEffect(() => {

  console.log("✅ Profile mounted");

  return () => {
    console.log("❌ Profile unmounted");
  };

}, []);

  useEffect(() => {
    fetch(`${BACKEND}/api/user/profile-full/${id}?viewer_id=${currentUserId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
          setIsFollowing(res.is_following);
          setFollowersCount(res.followers);
          setTempName(res.user.name || "");
          setTempBio(res.user.bio || "");
        }
      });
  }, [id]);

  const handleFollowToggle = async () => {
    if (loadingFollow) return;
    setLoadingFollow(true);
    try {
      const res = await fetch(`${BACKEND}/api/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower_id: currentUserId,
          following_id: id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsFollowing(!isFollowing);
        setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFollow(false);
    }
  };

  const saveName = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/user/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          name: tempName,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) => ({
          ...prev,
          user: { ...prev.user, name: tempName },
        }));
        setEditingName(false);
      } else {
        alert("Save failed: " + (json.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveBio = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/user/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          bio: tempBio,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) => ({
          ...prev,
          user: { ...prev.user, bio: tempBio },
        }));
        setEditingBio(false);
      } else {
        alert("Save failed: " + (json.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  const { user, followers, following, likes, videos } = data;

  let linksList: string[] = [];
  try {
    linksList = Array.isArray(user.links)
      ? user.links
      : JSON.parse(user.links || "[]");
  } catch (e) {
    linksList = [];
  }

  return (
    <div
  className="
    h-full
    overflow-y-auto
    bg-black
    text-white
    max-w-[430px]
    mx-auto
    pb-24
  "
  style={{
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
>
      <div className="h-10" />

      <div className="flex flex-col items-center pt-2 pb-4">
        <img
          src={user.avatar_url || "https://i.pravatar.cc/150"}
          className="w-20 h-20 rounded-full border border-white"
        />

        <h2 className="mt-2 text-base font-semibold">
          @{user.username || "creator"}
        </h2>

        <div className="flex items-center gap-3 mt-2">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Your name"
                maxLength={30}
                className="bg-gray-800 px-3 py-1 rounded text-white text-sm outline-none w-40"
              />
              <button onClick={saveName} className="text-blue-400 text-sm font-bold">
                Save
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setTempName(user.name || "");
                }}
                className="text-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {user.name ? (
                <p
                  className="text-sm cursor-pointer"
                  onClick={() => isMe && setEditingName(true)}
                >
                  {user.name}
                </p>
              ) : isMe ? (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-blue-400 text-sm"
                >
                  Add name
                </button>
              ) : null}

              {isMe && (
                <button
                  onClick={() => router.push("/profile/edit")}
                  className="bg-gray-700 px-3 py-1 rounded-full text-xs"
                >
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex justify-center gap-12 mt-4 text-center w-full">
          <div>
            <p className="font-bold text-lg">{followersCount}</p>
            <p className="text-gray-400 text-xs">Followers</p>
          </div>
          <div>
            <p className="font-bold text-lg">{following}</p>
            <p className="text-gray-400 text-xs">Following</p>
          </div>
          <div>
            <p className="font-bold text-lg">{likes ?? 0}</p>
            <p className="text-gray-400 text-xs">Likes</p>
          </div>
        </div>

        <div className="mt-3 w-full px-6">
          {editingBio ? (
            <div className="flex flex-col items-center gap-2">
              <textarea
                autoFocus
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                placeholder="I create content about..."
                maxLength={160}
                rows={2}
                className="bg-gray-800 px-3 py-2 rounded text-white text-sm outline-none w-full resize-none"
              />
              <div className="flex gap-3">
                <button onClick={saveBio} className="text-blue-400 text-sm font-bold">
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingBio(false);
                    setTempBio(user.bio || "");
                  }}
                  className="text-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : user.bio ? (
            <p
              className="text-gray-300 text-sm text-center cursor-pointer"
              onClick={() => isMe && setEditingBio(true)}
            >
              {user.bio}
            </p>
          ) : isMe ? (
            <button
              onClick={() => setEditingBio(true)}
              className="text-blue-400 text-sm mx-auto block"
            >
              + Add bio
            </button>
          ) : null}
        </div>

        {linksList.length > 0 && (
          <div className="mt-2 space-y-1 w-full px-6">
            {linksList.map((link, idx) => {
              let hostname = link;
              try { hostname = new URL(link).hostname; } catch (_) {}
              return (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-xs block underline break-all"
                >
                  {hostname}
                </a>
              );
            })}
          </div>
        )}

        {isMe && (
          <>
           <div className="flex gap-2 mt-4">

  <button
    onClick={() => router.push("/balance")}
    className="
      bg-gray-800
      px-4
      py-1.5
      rounded-full
      text-xs
      border
      border-gray-600
    "
  >
    💰 Balance
  </button>

  <button
    onClick={() => router.push("/creator")}
    className="
      bg-gray-800
      px-4
      py-1.5
      rounded-full
      text-xs
      border
      border-gray-600
    "
  >
    🎬 Studio
  </button>

  <button
    onClick={() => router.push("/friends")}
    className="
      bg-gray-800
      px-4
      py-1.5
      rounded-full
      text-xs
      border
      border-gray-600
    "
  >
    👥 Invite
  </button>

</div>
       
          </>
        )}

        {!isMe && (
          <button
            onClick={handleFollowToggle}
            disabled={loadingFollow}
            className={`mt-4 px-6 py-1.5 rounded-full text-sm font-medium transition ${
              isFollowing
                ? "bg-gray-700 text-white border border-gray-500"
                : "bg-red-500 text-white"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      <div className="flex justify-around border-b border-gray-800 mt-2">
        <button
          onClick={() => setTab("videos")}
          className={`pb-3 ${tab === "videos" ? "border-b-2 border-white" : "text-gray-500"}`}
        >
          <Grid size={20} />
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`pb-3 ${tab === "saved" ? "border-b-2 border-white" : "text-gray-500"}`}
        >
          <Bookmark size={20} />
        </button>
        <button
          onClick={() => setTab("liked")}
          className={`pb-3 ${tab === "liked" ? "border-b-2 border-white" : "text-gray-500"}`}
        >
          <Heart size={20} />
        </button>
      </div>

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
				poster={v.thumbnail_url}
				 preload="metadata"
				 muted
                 playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="text-center text-gray-500 mt-10">No saved videos</div>
      )}
      {tab === "liked" && (
        <div className="text-center text-gray-500 mt-10">No liked videos</div>
      )}
    </div>
  );
}