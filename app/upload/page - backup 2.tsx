"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/providers/AppDataProvider";

// -------------------- 类型 --------------------
interface CaptionItem {
  text: string;
  start: number;
  end: number;
}

// -------------------- 子组件 --------------------
function DiamondConfirmModal({
  open,
  cost,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  cost: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-[430px] mx-auto rounded-t-2xl p-6 animate-slide-up">
        <h2 className="text-lg font-semibold text-white mb-2">
          ✨ Generate AI Subtitles
        </h2>
        <p className="text-gray-300 text-sm mb-4">
          This will cost{" "}
          <span className="text-yellow-400 font-bold">{cost} 💎</span>.
          <br />
          You can edit or remove them later.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-bold"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessCard({
  captions,
  onEdit,
  onClose,
}: {
  captions: CaptionItem[];
  onEdit: () => void;
  onClose: () => void;
}) {
  const preview = captions.slice(0, 3);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-[430px] mx-auto rounded-t-2xl p-6 animate-slide-up">
        <h2 className="text-lg font-semibold text-white mb-2">
          🎉 Captions Generated!
        </h2>
        <div className="bg-black/50 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto text-sm text-gray-200 space-y-1">
          {preview.map((line, i) => (
            <p key={i}>
              <span className="text-gray-500">{line.start.toFixed(1)}s </span>
              {line.text}
            </p>
          ))}
          {captions.length > 3 && (
            <p className="text-gray-500 italic">
              ... and {captions.length - 3} more lines
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-white"
          >
            Done
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-3 rounded-xl bg-yellow-400/20 text-yellow-400 font-semibold border border-yellow-400/30"
          >
            ✏️ Edit Captions
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- 主页面 --------------------
export default function UploadPage() {
  const { user } = useAppData();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 模式
  const [mode, setMode] = useState<"upload" | "record">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 表单
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("entertainment");

  // 上传状态
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 录制状态
  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [flashOn, setFlashOn] = useState(false);

  // 倒计时状态
  const [countdown, setCountdown] = useState<number | null>(null); // 当前倒计时数字，null 表示不在倒计时
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState(3); // 默认 3s

  // 字幕相关
  const [showDiamondModal, setShowDiamondModal] = useState(false);
  const [pendingVideoId, setPendingVideoId] = useState<number | null>(null);
  const [pendingCost, setPendingCost] = useState(0);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);
  const [captionMessage, setCaptionMessage] = useState("");
  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionItem[] | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // ---------- 工具函数 ----------
  const getVideoDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });

  const calcDiamondCost = (durationSec: number): number => {
    if (durationSec <= 0) return 0;
    const minutes = Math.ceil(durationSec / 60);
    if (minutes <= 1) return 5;
    const cost = 5 + (minutes - 1) * 2;
    return cost > 30 ? 30 : cost;
  };

  // ---------- 摄像头控制 ----------
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(
    async (enableFlash = flashOn) => {
      stopCamera();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1080 },
            height: { ideal: 1920 },
          },
          audio: true,
        });
        streamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.muted = true;
          await videoPreviewRef.current.play();
        }
        setCameraReady(true);
        // 尝试打开/关闭闪光灯
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && "torch" in videoTrack.getCapabilities()) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ torch: enableFlash } as any],
            });
            setFlashOn(enableFlash);
          } catch {
            // 不支持或权限问题，忽略
          }
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Cannot access camera/microphone. Please check permissions.");
      }
    },
    [stopCamera, flashOn]
  );

  // 切换闪光灯
  const toggleFlash = async () => {
    const newState = !flashOn;
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack && "torch" in videoTrack.getCapabilities()) {
      try {
        await videoTrack.applyConstraints({
          advanced: [{ torch: newState } as any],
        });
        setFlashOn(newState);
      } catch {
        alert("Flash not supported on this device");
      }
    } else {
      alert("Flash not available");
    }
  };

  // ---------- 倒计时 & 录制 ----------
  const startCountdown = () => {
    if (cameraReady && !recording && countdown === null) {
      setCountdown(countdownDuration);
    }
  };

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      // 倒计时结束，开始录制
      setCountdown(null);
      beginRecording();
    }
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown]);

  const beginRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      // 转为 File 并回传表单
      const file = new File([blob], `recorded_${Date.now()}.webm`, {
        type: "video/webm",
      });
      setSelectedFile(file);
      setRecording(false);
      setRecordTime(0);
      stopCamera();
      setMode("upload"); // 自动切换到上传表单
    };
    recorder.start();
    setRecording(true);
    setRecordTime(0);
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  };

  // 录制计时器
  useEffect(() => {
    if (recording) {
      recordTimerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [recording]);

  // 模式切换时处理摄像头
  useEffect(() => {
    if (mode === "record") {
      startCamera(flashOn);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [mode]);

  // ---------- 文件选择 ----------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // ---------- 上传逻辑 ----------
  const requestCaptions = async (videoId: number) => {
    setGeneratingCaptions(true);
    setCaptionMessage("Generating captions...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/captions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_id: videoId }),
        }
      );
      const data = await res.json();
      if (data.success && data.captions) {
        setGeneratedCaptions(data.captions);
        setShowSuccessCard(true);
      } else {
        alert("Caption generation failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error while generating captions.");
    } finally {
      setGeneratingCaptions(false);
      setCaptionMessage("");
    }
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

    try {
      const duration = await getVideoDuration(selectedFile);
      if (!duration || duration <= 0) {
        alert("Cannot read video duration, please try a different file.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append("user_id", user.id);
      formData.append("duration", String(duration));
      if (caption) formData.append("caption", caption);
      if (tags) formData.append("tags", tags);
      if (category) formData.append("category", category);

      const xhr = new XMLHttpRequest();

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
            const videoId = res.video_id;
            const diamondCost = calcDiamondCost(duration);

            if (diamondCost > 0) {
              setPendingVideoId(videoId);
              setPendingCost(diamondCost);
              setShowDiamondModal(true);
            } else {
              router.push(`/profile/${user.id}`);
            }
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

      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/api/upload`);
      xhr.send(formData);
    } catch (err) {
      console.error(err);
      alert("Upload error");
      setUploading(false);
    }
  };

  // 弹窗回调
  const handleDiamondConfirm = () => {
    setShowDiamondModal(false);
    if (pendingVideoId) {
      requestCaptions(pendingVideoId);
    }
  };

  const handleDiamondCancel = () => {
    setShowDiamondModal(false);
    if (user?.id) router.push(`/profile/${user.id}`);
  };

  const handleEditCaptions = () => {
    alert("Caption editor coming soon!");
    setShowSuccessCard(false);
    if (user?.id) router.push(`/profile/${user.id}`);
  };

  const handleSuccessClose = () => {
    setShowSuccessCard(false);
    if (user?.id) router.push(`/profile/${user.id}`);
  };

  const categories = [
    "entertainment",
    "music",
    "gaming",
    "education",
    "sports",
    "vlog",
  ];

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-black text-white max-w-[430px] mx-auto p-4 relative">
      {/* 顶部 */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-lg">
          ←
        </button>
        <h1 className="text-xl font-bold">Create</h1>
        <div className="w-6" />
      </div>

      {/* 模式切换 */}
      <div className="flex bg-gray-900 rounded-xl p-1 mb-4">
        <button
          onClick={() => setMode("upload")}
          className={`flex-1 py-2 text-center rounded-lg text-sm font-medium transition ${
            mode === "upload" ? "bg-yellow-400 text-black" : "text-gray-400"
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setMode("record")}
          className={`flex-1 py-2 text-center rounded-lg text-sm font-medium transition ${
            mode === "record" ? "bg-yellow-400 text-black" : "text-gray-400"
          }`}
        >
          Record
        </button>
      </div>

      {mode === "record" && (
        <div className="flex flex-col items-center">
          {/* 预览 & 倒计时 */}
          <div className="relative w-full aspect-[9/16] bg-black rounded-xl overflow-hidden mb-4">
            <video
              ref={videoPreviewRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {recording && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                {recordTime}s
              </div>
            )}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-6xl font-bold text-yellow-400 animate-ping">
                  {countdown === 0 ? "Go!" : countdown}
                </span>
              </div>
            )}
          </div>

          {/* 倒计时设置 & 闪光灯 */}
          {!recording && countdown === null && (
            <div className="w-full flex items-center justify-between px-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-gray-400">
                  <input
                    type="checkbox"
                    checked={countdownEnabled}
                    onChange={(e) => setCountdownEnabled(e.target.checked)}
                    className="accent-yellow-400"
                  />
                  Countdown
                </label>
                {countdownEnabled && (
                  <select
                    value={countdownDuration}
                    onChange={(e) => setCountdownDuration(Number(e.target.value))}
                    className="bg-gray-800 text-white text-xs rounded px-2 py-1 outline-none"
                  >
                    <option value={3}>3s</option>
                    <option value={10}>10s</option>
                  </select>
                )}
              </div>
              <button
                onClick={toggleFlash}
                className={`px-3 py-1 rounded-full text-xs ${
                  flashOn
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                {flashOn ? "💡 On" : "💡 Off"}
              </button>
            </div>
          )}

          {/* 拍摄按钮 / 倒计时开始 */}
          {!recording && countdown === null && (
            <button
              onClick={countdownEnabled ? startCountdown : beginRecording}
              disabled={!cameraReady}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-white" />
            </button>
          )}

          {recording && (
            <button
              onClick={handleStopRecording}
              className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border-2 border-red-500"
            >
              <div className="w-6 h-6 bg-red-500 rounded-sm" />
            </button>
          )}

          <p className="text-gray-500 text-xs mt-4">Max 60 seconds</p>
        </div>
      )}

      {mode === "upload" && (
        <>
          {/* 文件选择 */}
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

          {/* 表单 */}
          <input
            type="text"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-gray-900 rounded-xl p-3 mb-3 text-sm outline-none"
            maxLength={150}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-gray-900 rounded-xl p-3 mb-3 text-sm outline-none"
          />
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

          {uploading && (
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {!uploading && selectedFile && (
            <div className="mb-3 text-xs text-gray-400 flex items-center gap-2">
              <span>✨</span> AI auto-captions available after upload
              <span className="text-yellow-400 font-medium">(from 5 💎)</span>
            </div>
          )}

          {generatingCaptions && (
            <div className="text-center text-yellow-400 mb-4 animate-pulse">
              {captionMessage}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || generatingCaptions}
            className={`w-full py-3 rounded-xl font-bold text-lg ${
              uploading || !selectedFile || generatingCaptions
                ? "bg-gray-700 text-gray-500"
                : "bg-yellow-400 text-black"
            }`}
          >
            {uploading
              ? `Uploading... ${progress}%`
              : generatingCaptions
              ? "Generating Captions..."
              : "Post"}
          </button>
        </>
      )}

      {/* 全局弹窗 */}
      <DiamondConfirmModal
        open={showDiamondModal}
        cost={pendingCost}
        onConfirm={handleDiamondConfirm}
        onCancel={handleDiamondCancel}
      />
      {generatedCaptions && showSuccessCard && (
        <SuccessCard
          captions={generatedCaptions}
          onEdit={handleEditCaptions}
          onClose={handleSuccessClose}
        />
      )}
    </div>
  );
}