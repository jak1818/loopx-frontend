"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/providers/AppDataProvider";

export default function UploadPage() {
  const { user } = useAppData();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("entertainment");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a video");
      return;
    }
    if (!user?.id) {
      alert("User not loaded");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("user_id", user.id);
    if (caption) formData.append("caption", caption);
    if (tags) formData.append("tags", tags);
    if (category) formData.append("category", category);

    try {
      const xhr = new XMLHttpRequest();

      // 监听上传进度
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          if (res.success) {
            alert("Upload successful!");
            router.push(`/profile/${user.id}`); // 跳转到个人主页查看新视频
          } else {
            alert("Upload failed: " + (res.error || "Unknown error"));
          }
        } else {
          alert("Upload failed with status: " + xhr.status);
        }
        setUploading(false);
      });

      xhr.addEventListener("error", () => {
        alert("Network error");
        setUploading(false);
      });

      xhr.open("POST", "http://localhost:5000/api/upload");
      xhr.send(formData);
    } catch (err) {
      console.error(err);
      alert("Upload error");
      setUploading(false);
    }
  };

  // 常用分类
  const categories = ["entertainment", "music", "gaming", "education", "sports", "vlog"];

  return (
    <div className="min-h-screen bg-black text-white max-w-[430px] mx-auto p-4">
      {/* 顶部栏 */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <h1 className="text-xl font-bold">Upload Video</h1>
        <div className="w-6" /> {/* 占位保持居中 */}
      </div>

      {/* 文件选择区域 */}
      <div
        className="bg-gray-900 rounded-xl p-6 mb-4 flex flex-col items-center justify-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {selectedFile ? (
          <video
            src={URL.createObjectURL(selectedFile)}
            className="w-full h-48 object-cover rounded"
            controls
            muted
          />
        ) : (
          <>
            <div className="text-4xl mb-2">+</div>
            <p className="text-gray-400 text-sm">Select video to upload</p>
            <p className="text-gray-600 text-xs mt-1">MP4 or MOV</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 标题输入 */}
      <input
        type="text"
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full bg-gray-900 rounded-xl p-3 mb-3 text-sm outline-none"
        maxLength={150}
      />

      {/* 标签输入 */}
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full bg-gray-900 rounded-xl p-3 mb-3 text-sm outline-none"
      />

      {/* 分类选择 */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs ${
                category === cat
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 上传进度条 */}
      {uploading && (
        <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 上传按钮 */}
      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        className={`w-full py-3 rounded-xl font-bold text-lg ${
          uploading || !selectedFile
            ? "bg-gray-700 text-gray-500"
            : "bg-yellow-400 text-black"
        }`}
      >
        {uploading ? `Uploading... ${progress}%` : "Post"}
      </button>
    </div>
  );
}