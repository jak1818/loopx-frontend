"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  const currentUserId = "11111111-1111-1111-1111-111111111111"; // 临时硬编码
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  // 加载已有数据
  useEffect(() => {
    fetch(`${API_BASE}/api/user/profile-full/${currentUserId}?viewer_id=${currentUserId}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setAvatar(res.user.avatar_url || "");
          setName(res.user.name || "");
          setUsername(res.user.username || "");
          setBio(res.user.bio || "");
          try {
            const parsedLinks = JSON.parse(res.user.links || "[]");
            setLinks(Array.isArray(parsedLinks) ? parsedLinks : []);
          } catch { setLinks([]); }
        }
      });
  }, []);

  // 公用的文件上传处理
  const handleFileUpload = (capture?: boolean) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (capture) {
      input.capture = "environment"; // 移动端调用相机
    }
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("avatar", file);
      try {
        const res = await fetch("${API_BASE}/api/upload/avatar", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          setAvatar(data.url);
          setShowPhotoMenu(false);
        } else {
          alert("Upload failed");
        }
      } catch (err) {
        console.error(err);
      }
    };
    input.click();
  };

  // 查看头像
  const handleViewPhoto = () => {
    if (avatar) window.open(avatar, "_blank");
    setShowPhotoMenu(false);
  };

  // 链接管理
  const addLink = () => {
    const link = prompt("Enter URL (e.g. https://facebook.com/yourpage):");
    if (link && link.trim()) {
      setLinks([...links, link.trim()]);
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // 保存
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("${API_BASE}/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          name,
          username,
          bio,
          avatar_url: avatar || null,
          links: links.length ? links : null
        })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/profile/' + currentUserId);
      } else {
        alert("Save failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white max-w-[430px] mx-auto px-4 py-6 relative">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <h1 className="text-lg font-bold">Edit Profile</h1>
      </div>

      {/* 头像区域 */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={avatar || "https://i.pravatar.cc/150"}
          className="w-24 h-24 rounded-full border-2 border-gray-500 object-cover"
        />
        <button
          onClick={() => setShowPhotoMenu(true)}
          className="mt-3 text-sm text-blue-400"
        >
          Change photo
        </button>
      </div>

      {/* 底部菜单 - Change photo */}
      {showPhotoMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setShowPhotoMenu(false)}
        >
          <div
            className="bg-gray-900 w-full max-w-[430px] rounded-t-xl p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleFileUpload(true)}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded text-sm"
            >
              Take photo
            </button>
            <button
              onClick={() => handleFileUpload(false)}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded text-sm"
            >
              Upload photo
            </button>
            {avatar && (
              <button
                onClick={handleViewPhoto}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded text-sm"
              >
                View photo
              </button>
            )}
            <button
              onClick={() => setShowPhotoMenu(false)}
              className="w-full text-center py-2 text-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="mb-4">
        <label className="text-sm text-gray-400">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add name"
          className="w-full bg-gray-800 mt-1 px-3 py-2 rounded text-white outline-none"
        />
      </div>

      {/* Username */}
      <div className="mb-4">
        <label className="text-sm text-gray-400">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="@username"
          className="w-full bg-gray-800 mt-1 px-3 py-2 rounded text-white outline-none"
        />
      </div>

      {/* Bio */}
      <div className="mb-4">
        <label className="text-sm text-gray-400">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write a short bio..."
          rows={3}
          className="w-full bg-gray-800 mt-1 px-3 py-2 rounded text-white outline-none resize-none"
        />
      </div>

      {/* Links */}
      <div className="mb-6">
        <label className="text-sm text-gray-400">Links</label>
        {links.map((link, idx) => (
          <div key={idx} className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={link}
              onChange={(e) => {
                const newLinks = [...links];
                newLinks[idx] = e.target.value;
                setLinks(newLinks);
              }}
              className="flex-1 bg-gray-800 px-3 py-2 rounded text-white outline-none"
            />
            <button onClick={() => removeLink(idx)} className="text-red-400 text-sm">Remove</button>
          </div>
        ))}
        <button onClick={addLink} className="mt-2 text-sm text-blue-400">+ Add link</button>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-500 py-3 rounded font-bold text-center disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}