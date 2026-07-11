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

interface DraftData {
  mode: "upload" | "record";
  caption: string;
  tags: string;
  category: string;
}

const DRAFT_KEY = "loopx_upload_draft";

function getDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as DraftData;
  } catch {}
  return null;
}

function saveDraft(data: DraftData) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {}
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

// -------------------- 子组件 --------------------
function DraftConfirmModal({
  open, onResume, onDiscard,
}: { open: boolean; onResume: () => void; onDiscard: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-[430px] mx-auto rounded-t-2xl p-6 animate-slide-up">
        <h2 className="text-lg font-semibold text-white mb-2">📝 Resume Draft?</h2>
        <p className="text-gray-300 text-sm mb-4">You have an unsaved draft. Continue where you left off?</p>
        <div className="flex gap-3">
          <button onClick={onDiscard} className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-medium">Discard</button>
          <button onClick={onResume} className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-bold">Resume</button>
        </div>
      </div>
    </div>
  );
}

// 🆕 发布确认弹窗
function ReviewModal({
  open,
  videoUrl,
  caption,
  tags,
  category,
  captionsEnabled,
  captions,
  captionsCost,
  generatingCaptions,
  onCaptionChange,
  onTagChange,
  onCategoryChange,
  onToggleCaptions,
  onGenerateCaptions,
  onEditCaption,
  onRegenerateAll,
  onConfirm,
  onClose,
}: {
  open: boolean;
  videoUrl: string;
  caption: string;
  tags: string;
  category: string;
  captionsEnabled: boolean;
  captions: CaptionItem[] | null;
  captionsCost: number;
  generatingCaptions: boolean;
  onCaptionChange: (v: string) => void;
  onTagChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onToggleCaptions: () => void;
  onGenerateCaptions: () => void;
  onEditCaption: (index: number, newText: string) => void;
  onRegenerateAll: () => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");


  if (!open) return null;

  const categories = ["entertainment","music","gaming","education","sports","vlog"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-[430px] mx-auto rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onClose} className="text-gray-400">← Back</button>
          <h2 className="text-lg font-semibold text-white">Review & Publish</h2>
          <div className="w-10" />
        </div>

        {/* 视频预览 */}
        <div className="bg-black rounded-xl overflow-hidden mb-4 aspect-[9/16]">
          <video src={videoUrl} className="w-full h-full object-cover" controls />
        </div>
		

        {/* 标题 */}
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={e => onCaptionChange(e.target.value)}
          className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-sm text-white outline-none"
          maxLength={150}
        />

        {/* 标签 */}
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={e => onTagChange(e.target.value)}
          className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-sm text-white outline-none"
        />

        {/* 分类 */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1 rounded-full text-xs ${
                  category === cat ? "bg-yellow-400 text-black" : "bg-gray-700 text-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 字幕开关 */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white font-medium">✨ AI Subtitles</p>
              <p className="text-xs text-gray-400">{captionsCost} 💎</p>
            </div>
            <button
              onClick={onToggleCaptions}
              className={`w-12 h-6 rounded-full transition ${
                captionsEnabled ? "bg-yellow-400" : "bg-gray-600"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition ml-0.5 ${captionsEnabled ? "translate-x-6" : ""}`} />
            </button>
          </div>
		  
		            {captionsEnabled && !captions && !generatingCaptions && (
            <button onClick={onGenerateCaptions} className="mt-3 w-full py-2 bg-yellow-400 text-black rounded-lg text-sm font-bold">
              🎙️ Generate Subtitles (5 💎)
            </button>
          )}

          {captionsEnabled && generatingCaptions && (
            <div className="mt-3 text-center text-yellow-400 animate-pulse text-sm">Generating subtitles...</div>
          )}

          {captionsEnabled && captions && !generatingCaptions && (
            <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
              {captions.map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 w-10 shrink-0">{line.start.toFixed(1)}s</span>
                  {editingIndex === i ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="flex-1 bg-gray-700 rounded px-2 py-1 text-white text-xs outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => { onEditCaption(i, editText); setEditingIndex(null); }}
                        className="text-yellow-400 text-xs font-medium"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-gray-200">{line.text}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingIndex(i); setEditText(line.text); }}
                          className="text-gray-500 text-xs"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={onRegenerateAll} className="w-full text-center text-yellow-400 text-xs py-2 border border-dashed border-yellow-400/30 rounded-lg">
                🔄 Regenerate All (5 💎)
              </button>
            </div>
          )}
        </div>

               {/* 下载按钮 */}
        <button
          onClick={() => {
            const a = document.createElement("a");
            a.href = videoUrl;
            a.download = `loopx_video_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
          className="w-full py-3 rounded-xl bg-gray-700 text-white font-bold text-lg mb-3"
        >
          💾 Download
        </button>

        {/* 确认发布 */}
        <button
          onClick={onConfirm}
          className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold text-lg"
        >
          Confirm & Publish
        </button>
      </div>
    </div>
  );
}

// 🆕 模板库定义（可随时扩展）
const TEMPLATE_CATEGORIES: Record<string, {
  label: string;
  icon: string;
  styles: { id: string; label: string; icon: string }[];
}> = {
  memory: {
    label: "Memory",
    icon: "📸",
    styles: [
      { id: "classic", label: "Classic", icon: "🖼" },
      { id: "polaroid", label: "Polaroid", icon: "📷" },
      { id: "film-burn", label: "Film Burn", icon: "🎞" },
    ],
  },
  beatsnap: {
    label: "Beat Snap",
    icon: "⚡",
    styles: [
      { id: "hardcut", label: "Hard Cut", icon: "✂️" },
      { id: "glitch", label: "Glitch", icon: "📺" },
      { id: "neon", label: "Neon", icon: "💡" },
    ],
  },
  festival: {
    label: "Festival",
    icon: "✨",
    styles: [
      { id: "confetti", label: "Confetti", icon: "🎊" },
      { id: "fireworks", label: "Fireworks", icon: "🎆" },
      { id: "disco-ball", label: "Disco Ball", icon: "🪩" },
    ],
  },
};

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

  const [mode, setMode] = useState<"upload" | "record">("upload");
  // 🆕 来源切换
  const [sourceMode, setSourceMode] = useState<null | "ai" | "template">(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 🆕 AI 生成后返回的 R2 URL（跳过二次上传）
  const [aiVideoUrl, setAiVideoUrl] = useState<string | null>(null);

  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("entertainment");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState(3);

  // 🆕 发布确认弹窗
  const [showReview, setShowReview] = useState(false);

  // 🆕 ReviewModal 字幕相关
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [captionsData, setCaptionsData] = useState<CaptionItem[] | null>(null);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [generatingCaptionsReview, setGeneratingCaptionsReview] = useState(false);

  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null);

  // 🆕 AI 生成状态
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiPlan, setAiPlan] = useState<"basic" | "pro" | "master">("basic");
  const [aiDuration, setAiDuration] = useState(10);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState("");
  
  // 🆕 模板相关
const [templateMode, setTemplateMode] = useState<string | null>(null); // 'memory' | 'beatsnap' | 'festival'
const [templatePhotos, setTemplatePhotos] = useState<File[]>([]);
const [templateSynthesizing, setTemplateSynthesizing] = useState(false);
const templatePhotoInputRef = useRef<HTMLInputElement>(null);
const [templateStyle, setTemplateStyle] = useState<string | null>(null); // 具体样式名
const [reviewBGM, setReviewBGM] = useState<string>("");
const [mixingMusic, setMixingMusic] = useState(false);
const previewAudioRef = useRef<HTMLAudioElement | null>(null);

const [optimizedPrompt, setOptimizedPrompt] = useState("");
const [showOptimized, setShowOptimized] = useState(false);
const [optimizing, setOptimizing] = useState(false);
const [aiImageFile, setAiImageFile] = useState<File | null>(null);
const [aiImagePreviewUrl, setAiImagePreviewUrl] = useState<string>("");
const [aiImageUploading, setAiImageUploading] = useState(false);
const aiImageInputRef = useRef<HTMLInputElement>(null);

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

  // 🆕 计算字幕费用
  const getCaptionsCost = (): number => {
    if (!selectedFile) return 5;
    // 简单估算：视频时长未知时默认 5，已知则按 calcDiamondCost
    return 5;
  };

  // ---------- 草稿（不变） ----------
  useEffect(() => {
    if (!draftLoaded) return;
    const timer = setTimeout(() => saveDraft({ mode, caption, tags, category }), 2000);
    return () => clearTimeout(timer);
  }, [mode, caption, tags, category, draftLoaded]);

  useEffect(() => {
    const draft = getDraft();
    if (draft) { setPendingDraft(draft); setShowDraftModal(true); }
    else setDraftLoaded(true);
  }, []);

  const handleResumeDraft = () => {
    if (!pendingDraft) return;
    const { mode: dMode, caption: dCap, tags: dTags, category: dCat } = pendingDraft;
    setMode(dMode); setCaption(dCap); setTags(dTags); setCategory(dCat);
    setSelectedFile(null); setShowDraftModal(false); setDraftLoaded(true);
  };

  const handleDiscardDraft = () => { clearDraft(); setShowDraftModal(false); setDraftLoaded(true); };

  // ---------- 摄像头（不变） ----------
  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async (enableFlash = flashOn) => {
    stopCamera();
    try {
      const constraints = {
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      };
      let stream: MediaStream;
      try { stream = await navigator.mediaDevices.getUserMedia(constraints); }
      catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } },
          audio: true,
        });
      }
      streamRef.current = stream;
      if (videoPreviewRef.current) { videoPreviewRef.current.srcObject = stream; videoPreviewRef.current.muted = true; await videoPreviewRef.current.play(); }
      setCameraReady(true);
      const vt = stream.getVideoTracks()[0];
      if (vt && "torch" in vt.getCapabilities()) {
        try { await vt.applyConstraints({ advanced: [{ torch: enableFlash } as any] }); setFlashOn(enableFlash); } catch {}
      }
    } catch { alert("Cannot access camera/microphone."); }
  }, [stopCamera, flashOn]);

  const toggleFlash = async () => {
    const ns = !flashOn;
    const vt = streamRef.current?.getVideoTracks()[0];
    if (vt && "torch" in vt.getCapabilities()) {
      try { await vt.applyConstraints({ advanced: [{ torch: ns } as any] }); setFlashOn(ns); } catch { alert("Flash not supported"); }
    } else alert("Flash not available");
  };

  // ---------- 录制（不变） ----------
  const startCountdown = () => { if (cameraReady && !recording && countdown === null) setCountdown(countdownDuration); };

  useEffect(() => {
    if (countdown !== null && countdown > 0) countdownTimerRef.current = setTimeout(() => setCountdown(p => p !== null ? p - 1 : null), 1000);
    else if (countdown === 0) { setCountdown(null); beginRecording(); }
    return () => { if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current); };
  }, [countdown]);

  const beginRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mediaRecorderRef.current = rec;
    rec.ondataavailable = e => { if (e.data?.size) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setSelectedFile(new File([blob], `recorded_${Date.now()}.webm`, { type: "video/webm" }));
      setAiVideoUrl(null);
      setRecording(false); setRecordTime(0); stopCamera(); setMode("upload");
    };
    rec.start(); setRecording(true); setRecordTime(0);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  };

  useEffect(() => {
    if (recording) recordTimerRef.current = setInterval(() => setRecordTime(p => p + 1), 1000);
    else { if (recordTimerRef.current) clearInterval(recordTimerRef.current); }
    return () => { if (recordTimerRef.current) clearInterval(recordTimerRef.current); };
  }, [recording]);

  useEffect(() => {
    if (mode === "record") startCamera(flashOn); else stopCamera();
    return () => { stopCamera(); if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current); if (recordTimerRef.current) clearInterval(recordTimerRef.current); };
  }, [mode]);
  

  // ---------- 文件选择 ----------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setAiVideoUrl(null);
  };
  
  // 🆕 选择图片
const handleAIImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;
  if (!file) return;
  setAiImageFile(file);
  setAiImagePreviewUrl(URL.createObjectURL(file));
};

// 🆕 上传图片到 R2 临时目录，返回 URL
const uploadImageToR2 = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("user_id", user?.id || "temp");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-image`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Image upload failed");
  return data.url;
};
  
const handleOptimizePrompt = async () => {
  if (!aiPrompt.trim() || aiPrompt.trim().length < 3) { alert("Prompt too short"); return; }
  setOptimizing(true);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/optimize-prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: aiPrompt, duration: aiDuration, user_id: user?.id }),
    });
    const data = await res.json();
    if (data.success) {
      // 将分镜 JSON 转换为可读文本展示
      const storyboard = data.optimized_prompt;
     let displayText = `🎬 ${storyboard.title || 'Generated Video'}\n`;
displayText += `⏱ Total: ${storyboard.total_duration || '?'}s\n\n`;
if (storyboard.shots && storyboard.shots.length > 0) {
  storyboard.shots.forEach((shot: any) => {
    displayText += `📷 Shot ${shot.index} (${shot.duration}s):\n${shot.prompt}\n\n`;
  });
} else {
  displayText += storyboard.shots?.[0]?.prompt || data.optimized_prompt;
}
setOptimizedPrompt(displayText);
      setShowOptimized(true);
    } else {
      alert("Optimization failed: " + (data.error || "Unknown"));
    }
  } catch (err) { console.error(err); alert("Network error"); }
  finally { setOptimizing(false); }
};

// 使用优化后的 prompt 生成视频
const handleAIGenerateWithPrompt = async () => {
  if (!optimizedPrompt.trim() || optimizedPrompt.trim().length < 3) {
    alert("Prompt too short");
    return;
  }
  // 提取第一帧的提示词作为生成主Prompt
  let cleanPrompt = optimizedPrompt;
  // 如果文本包含 'Shot 1'，提取第一个分镜的提示词
  const match = optimizedPrompt.match(/Shot 1.*?:\s*(.*)/s);
  if (match) {
    cleanPrompt = match[1].trim();
  }
  await handleAIGenerate(cleanPrompt);
};

 // 🆕 AI 视频生成（接受可选参数，优先使用传入的 prompt）
const handleAIGenerate = async (promptOverride?: string) => {
  const promptToUse = promptOverride || aiPrompt;
  if (!promptToUse.trim() || promptToUse.trim().length < 3) { alert("Prompt must be at least 3 characters"); return; }
  if (!user?.id) { alert("User not loaded"); return; }
  setAiGenerating(true);
  setAiStatusMsg(aiImageFile ? "Uploading image..." : "Generating video...");
  try {
    // 🆕 如果有图片，先上传到 R2
    let imageUrl = "";
    if (aiImageFile) {
      setAiImageUploading(true);
      imageUrl = await uploadImageToR2(aiImageFile);
      setAiImageUploading(false);
      setAiStatusMsg("Generating video...");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptToUse,
        plan: aiPlan,
        duration: aiDuration,
        user_id: user.id,
        image_url: imageUrl || undefined,  // 🆕 有图片就传
      }),
    });
    const data = await res.json();
    if (data.success) {
      // 处理 segments 数组
      const segments: string[] = data.segments || [];
      if (segments.length === 0) throw new Error("No video segments returned");
      
      let videoBlob: Blob;
      if (segments.length === 1) {
        // 直接下载单个片段
        const resp = await fetch(segments[0]);
        videoBlob = await resp.blob();
      } else {
        // 多个片段需要拼接
        setAiStatusMsg("Stitching segments...");
        videoBlob = await stitchVideos(segments);
      }
      
      const file = new File([videoBlob], `ai_video_${Date.now()}.mp4`, { type: "video/mp4" });
      setSelectedFile(file);
      setAiVideoUrl(null);
      setSourceMode(null);
      setAiStatusMsg("");
      alert("Video generated! Click Next to review and publish.");
    } else {
      alert("AI generation failed: " + (data.error || "Unknown"));
    }
  } catch (err) { console.error(err); alert("Network error"); }
  finally { setAiGenerating(false); setAiStatusMsg(""); }
};
  
  // 🆕 模板：点击卡片 → 打开模板模式并弹出图片选择器
const handleTemplateCardClick = (category: string) => {
  setTemplateMode(category);
  setTemplateStyle(null); // 还没选样式
  setTemplatePhotos([]);
  setSelectedFile(null);
};

// 🆕 模板：处理照片选择
const handleTemplatePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (files.length < 3) {
    alert("Please select at least 3 photos for this template.");
    setTemplateMode(null);
	setTemplateStyle(null);
    setSelectedFile(null);
    return;
  }
  setTemplatePhotos(files.slice(0, 9)); // 最多 9 张
};

const handleTemplateSynthesize = () => {
	if (previewAudioRef.current) {
  previewAudioRef.current.pause();
  previewAudioRef.current.src = "";
  previewAudioRef.current = null;
}
  // 然后根据模板类型调用对应合成函数
  if (templateMode === "memory") {
    synthesizeMemoryTemplate();
  } else if (templateMode === "beatsnap") {
    synthesizeBeatSnapTemplate();
  } else if (templateMode === "festival") {
    synthesizeFestivalTemplate();
  } else {
    alert("Template not implemented yet");
  }
};

const synthesizeMemoryTemplate = async () => {
  if (!templatePhotos.length) return;
  setTemplateSynthesizing(true);

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d")!;

  // 加载图片
  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  const images = await Promise.all(templatePhotos.map(loadImage));
  
    // 混入 BGM（仅进录制流，不出声）
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  let combinedStream: MediaStream = stream;

  if (reviewBGM) {
    try {
      const res = await fetch(reviewBGM);
      const buf = await res.arrayBuffer();
      audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(buf);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;
      audioDest = audioCtx.createMediaStreamDestination();
      source.connect(audioDest);
      // 不连 destination，合成时扬声器不响
      source.start(0);
      combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);
    } catch (e) {
      console.warn("BGM 混入失败，使用静音视频", e);
    }
  }

  const recorder = new MediaRecorder(combinedStream, { mimeType: "video/webm; codecs=vp9" });

  const chunks: Blob[] = [];
  recorder.ondataavailable = e => chunks.push(e.data);

  recorder.start();

  const frameRate = 30;
  const durationPerPhoto = 2.5;
  const transitionDuration = 0.8;
  const totalDuration = images.length * durationPerPhoto + transitionDuration;
  let currentTime = 0.0;

  const draw = () => {
    if (currentTime >= totalDuration) {
      recorder.stop();
      setTemplateSynthesizing(false);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const idx = Math.floor(currentTime / durationPerPhoto);
    const progressInPhoto = (currentTime % durationPerPhoto) / durationPerPhoto;
    const nextIdx = Math.min(idx + 1, images.length - 1);

    if (images[idx]) {
      ctx.globalAlpha = 1;
      if (progressInPhoto > 0.7) {
        ctx.globalAlpha = 1 - (progressInPhoto - 0.7) / 0.3;
      }
      drawImageCover(ctx, images[idx], 0, 0, canvas.width, canvas.height);
    }

    if (images[nextIdx] && progressInPhoto > 0.7) {
      ctx.globalAlpha = (progressInPhoto - 0.7) / 0.3;
      drawImageCover(ctx, images[nextIdx], 0, 0, canvas.width, canvas.height);
    }
    ctx.globalAlpha = 1;

    if (templateStyle === "classic") {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 48px serif";
      ctx.textAlign = "center";
      ctx.fillText("Memory", canvas.width / 2, 150);
    } else if (templateStyle === "polaroid") {
      ctx.strokeStyle = "rgba(255,204,0,0.8)";
      ctx.lineWidth = 12;
      ctx.strokeRect(80, 150, canvas.width - 160, canvas.height - 300);
      ctx.fillStyle = "rgba(255,240,180,0.9)";
      ctx.font = "italic 40px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText("Summer '25", canvas.width / 2, canvas.height - 100);
    } else if (templateStyle === "film-burn") {
      const flicker = Math.sin(currentTime * 20) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(255, 60, 0, ${0.15 + flicker * 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,200,100,0.9)";
      ctx.font = "bold 52px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Memory", canvas.width / 2, 200);
    }

    currentTime += 1 / frameRate;
    requestAnimationFrame(draw);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const file = new File([blob], `template_memory_${Date.now()}.webm`, { type: "video/webm" });
    setSelectedFile(file);
    setAiVideoUrl(null);
    setTemplatePhotos([]);
  };

  draw();
};

// 🎵 Beat Snap：快节奏闪切 + 缩放抖动
const synthesizeBeatSnapTemplate = async () => {
  if (!templatePhotos.length) return;
  setTemplateSynthesizing(true);

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d")!;

  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  const images = await Promise.all(templatePhotos.map(loadImage));
  
    // 混入 BGM（仅进录制流，不出声）
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  let combinedStream: MediaStream = stream;

  if (reviewBGM) {
    try {
      const res = await fetch(reviewBGM);
      const buf = await res.arrayBuffer();
      audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(buf);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;
      audioDest = audioCtx.createMediaStreamDestination();
      source.connect(audioDest);
      // 不连 destination，合成时扬声器不响
      source.start(0);
      combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);
    } catch (e) {
      console.warn("BGM 混入失败，使用静音视频", e);
    }
  }

  const recorder = new MediaRecorder(combinedStream, { mimeType: "video/webm; codecs=vp9" });

  const chunks: Blob[] = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.start();

  const frameRate = 30;
  const beatInterval = 2.2; // 每张 2.2 秒
  const totalDuration = images.length * beatInterval;
  let currentTime = 0.0;

  const draw = () => {
    if (currentTime >= totalDuration) {
      recorder.stop();
      setTemplateSynthesizing(false);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const idx = Math.floor(currentTime / beatInterval) % images.length;
    const progressInBeat = (currentTime % beatInterval) / beatInterval;

    if (templateStyle === "hardcut") {
      let shake = 0;
      if (progressInBeat < 0.2) shake = Math.sin(progressInBeat * 20) * 15;
      const scale = 1 + (progressInBeat < 0.2 ? progressInBeat * 0.15 : 0.2 * Math.max(0, 1 - progressInBeat));
      if (images[idx]) {
        ctx.save();
        ctx.translate(canvas.width / 2 + shake, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawImageCover(ctx, images[idx], 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 60px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BEAT SNAP", canvas.width / 2, 150);
    }
    else if (templateStyle === "glitch") {
      if (images[idx]) {
        ctx.save();
        ctx.translate(20 * Math.sin(currentTime * 50), 0);
        drawImageCover(ctx, images[idx], 0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.globalAlpha = 0.7;
        drawImageCover(ctx, images[idx], 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "rgba(0,255,255,0.9)";
      ctx.font = "bold 56px monospace";
      ctx.textAlign = "center";
      ctx.fillText("G̷L̷I̷T̷C̷H̷", canvas.width / 2, 150);
    }
    else if (templateStyle === "neon") {
      if (images[idx]) {
        drawImageCover(ctx, images[idx], 0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#39ff14";
        ctx.lineWidth = 8;
        ctx.strokeRect(40, 100, canvas.width - 80, canvas.height - 200);
      }
      ctx.shadowColor = "#39ff14";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#39ff14";
      ctx.font = "bold 56px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NEON BEAT", canvas.width / 2, 150);
      ctx.shadowBlur = 0;
    }

    currentTime += 1 / frameRate;
    requestAnimationFrame(draw);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const file = new File([blob], `template_beatsnap_${Date.now()}.webm`, { type: "video/webm" });
    setSelectedFile(file);
    setAiVideoUrl(null);
    setTemplatePhotos([]);
  };

  draw();
};

// 🎉 Festival：彩色粒子 + 慢速淡入
const synthesizeFestivalTemplate = async () => {
  if (!templatePhotos.length) return;
  setTemplateSynthesizing(true);

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d")!;

  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  const images = await Promise.all(templatePhotos.map(loadImage));
  
    // 混入 BGM（仅进录制流，不出声）
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  let combinedStream: MediaStream = stream;

  if (reviewBGM) {
    try {
      const res = await fetch(reviewBGM);
      const buf = await res.arrayBuffer();
      audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(buf);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;
      audioDest = audioCtx.createMediaStreamDestination();
      source.connect(audioDest);
      // 不连 destination，合成时扬声器不响
      source.start(0);
      combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);
    } catch (e) {
      console.warn("BGM 混入失败，使用静音视频", e);
    }
  }

  const recorder = new MediaRecorder(combinedStream, { mimeType: "video/webm; codecs=vp9" });

  const chunks: Blob[] = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.start();

  const frameRate = 30;
  const durationPerPhoto = 3;
  const totalDuration = images.length * durationPerPhoto;
  let currentTime = 0.0;

  // 粒子（Confetti 用）
  const baseParticles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 8 + 2,
    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
    speedY: Math.random() * 2 + 1,
    speedX: (Math.random() - 0.5) * 2,
  }));

  let fireworksBursts: { x: number; y: number; particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] }[] = [];

  const draw = () => {
    if (currentTime >= totalDuration) {
      recorder.stop();
      setTemplateSynthesizing(false);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a0a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const idx = Math.floor(currentTime / durationPerPhoto);
    if (images[idx]) {
      ctx.globalAlpha = 0.5;
      drawImageCover(ctx, images[idx], 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    if (templateStyle === "confetti") {
      baseParticles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y > canvas.height) p.y = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = "rgba(255,215,0,0.9)";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✨ FESTIVAL ✨", canvas.width / 2, 150);
    }
    else if (templateStyle === "fireworks") {
      if (Math.floor(currentTime * frameRate) % 60 === 0) {
        fireworksBursts.push({
          x: 200 + Math.random() * (canvas.width - 400),
          y: 500 + Math.random() * 400,
          particles: Array.from({ length: 20 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            return {
              x: 0, y: 0,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
            };
          }),
        });
      }
      fireworksBursts.forEach(burst => {
        burst.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
          if (p.life > 0) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(burst.x + p.x, burst.y + p.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });
      ctx.globalAlpha = 1;
      fireworksBursts = fireworksBursts.filter(b => b.particles.some(p => p.life > 0));
      ctx.fillStyle = "rgba(255,215,0,0.9)";
      ctx.font = "bold 56px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🎆 HAPPY NEW YEAR", canvas.width / 2, 150);
    }
    else if (templateStyle === "disco-ball") {
      for (let i = 0; i < 30; i++) {
        const angle = (currentTime * 5 + i * 12) % 360;
        const rad = (angle * Math.PI) / 180;
        const radius = 300 + Math.sin(currentTime * 10 + i) * 100;
        const x = canvas.width / 2 + Math.cos(rad) * radius;
        const y = 600 + Math.sin(rad) * radius;
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(200,150,255,0.9)";
      ctx.font = "bold 56px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🪩 DISCO NIGHT", canvas.width / 2, 150);
    }

    currentTime += 1 / frameRate;
    requestAnimationFrame(draw);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const file = new File([blob], `template_festival_${Date.now()}.webm`, { type: "video/webm" });
    setSelectedFile(file);
    setAiVideoUrl(null);
    setTemplatePhotos([]);
  };

  draw();
};

// 辅助：图片填充绘制（居中 cover）
const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number
) => {
  const iw = img.width, ih = img.height;
  const scale = Math.max(w / iw, h / ih);
  const sw = iw * scale, sh = ih * scale;
  const sx = (w - sw) / 2, sy = (h - sh) / 2;
  ctx.drawImage(img, 0, 0, iw, ih, sx, sy, sw, sh);
};


  // 🆕 Next → 打开发布确认弹窗
  const handleNext = () => {
    if (!selectedFile) { alert("Please select or generate a video first"); return; }
    
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = "";
      previewAudioRef.current = null;
    }

    setShowReview(true);
  };

  // 🆕 ReviewModal 字幕开关
const handleToggleCaptions = () => {
  if (captionsEnabled) {
    // 关闭字幕开关：清空字幕数据和已上传视频 ID
    setCaptionsEnabled(false);
    setCaptionsData(null);
    setUploadedVideoId(null);
  } else {
    setCaptionsEnabled(true);
    setCaptionsData(null); // 之前生成的字幕清掉
  }
};

const handleGenerateCaptions = async () => {
  if (!selectedFile || !user?.id) {
    alert("Missing video or user");
    return;
  }
  setGeneratingCaptionsReview(true);
  try {
	  let uploadFileForCaptions = selectedFile;
let uploadAiUrlForCaptions = aiVideoUrl;

        // 1) 获取视频时长并上传
    const duration = await getVideoDuration(uploadFileForCaptions);
    const fd = new FormData();
    if (uploadAiUrlForCaptions) {
      fd.append("video_url", uploadAiUrlForCaptions);
      fd.append("source", "ai");
    } else {
      fd.append("video", uploadFileForCaptions);
      fd.append("source", sourceMode === "template" ? "template" : mode === "record" ? "record" : "upload");
    }
    fd.append("user_id", user.id);
    fd.append("duration", String(duration));
    fd.append("caption", caption);
    fd.append("tags", tags);
    fd.append("category", category);

    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: "POST",
      body: fd,
    });
    const uploadData = await uploadRes.json();
    if (!uploadData.success) {
      alert("Upload failed: " + (uploadData.error || "Unknown"));
      setGeneratingCaptionsReview(false);
      return;
    }
    const videoId = uploadData.video_id;
    setUploadedVideoId(videoId); // 保存，供 Confirm 使用

    // 2) 生成字幕
    const captionsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/captions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_id: videoId, user_id: user.id }),
    });
    const captionsResult = await captionsRes.json();
    if (captionsResult.success && captionsResult.captions) {
      setCaptionsData(captionsResult.captions);

    } else {
      alert("Caption generation failed: " + (captionsResult.error || "Unknown"));
      setCaptionsEnabled(false);
      setUploadedVideoId(null);
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
    setCaptionsEnabled(false);
    setUploadedVideoId(null);
  } finally {
    setGeneratingCaptionsReview(false);
  }
};

async function mixVideoWithAudio(videoFile: File, musicUrl: string): Promise<Blob> {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(videoFile);
  video.muted = true;
  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => resolve();
  });

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 1080;
  canvas.height = video.videoHeight || 1920;
  const ctx = canvas.getContext("2d")!;

  const audioCtx = new AudioContext();
  const res = await fetch(musicUrl);
  const buf = await res.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(buf);
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = true;
  const dest = audioCtx.createMediaStreamDestination();
  source.connect(dest);

  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);
  const recorder = new MediaRecorder(combinedStream, { mimeType: "video/webm" });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);

  video.play();
  source.start(0);
  recorder.start();

  const draw = () => {
    if (video.ended || video.paused) {
      recorder.stop();
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(draw);
  };
  draw();

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      resolve(blob);
    };
    video.onended = () => recorder.stop();
  });
}

async function stitchVideos(segmentUrls: string[]): Promise<Blob> {
  // 加载所有视频片段
  const videos: HTMLVideoElement[] = [];
  for (const url of segmentUrls) {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.preload = "auto";
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = reject;
    });
    videos.push(video);
  }

  // 计算总时长和尺寸
  const width = 1080;
  const height = 1920;
  const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);
  
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
  const chunks: Blob[] = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  
  let currentVideoIndex = 0;
  let currentVideo = videos[0];
  currentVideo.play().catch(() => {});
  
  recorder.start();
  
const draw = () => {
  if (currentVideoIndex >= videos.length) {
    recorder.stop();
    return;
  }

  if (currentVideo.ended || currentVideo.paused) {
    currentVideoIndex++;
    if (currentVideoIndex < videos.length) {
      currentVideo = videos[currentVideoIndex];
      currentVideo.currentTime = 0;
      currentVideo.play().catch(() => {});
      // 不要 stop，继续绘制下一帧
      requestAnimationFrame(draw);
      return;
    } else {
      // 所有片段结束
      recorder.stop();
      return;
    }
  }

  ctx.drawImage(currentVideo, 0, 0, width, height);
  requestAnimationFrame(draw);
};
  draw();
  
  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      resolve(blob);
    };
  });
}

  // 🆕 确认发布
  const handleConfirmPublish = async () => {
    if (!user?.id) { alert("User not loaded"); return; }
    
    // 直接使用 selectedFile (如果之前 handleNext 已经混过音，这里就是带音乐的版本)
    let uploadFile = selectedFile!;
    let uploadAiUrl = aiVideoUrl;

    setUploading(true);
    try {
      // 如果视频已通过字幕生成上传，且没有因为混音而失效，可直接更新元数据
      if (uploadedVideoId) {
        const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_id: uploadedVideoId,
            user_id: user.id,
            caption,
            tags,
            category,
            captions: captionsEnabled && captionsData ? JSON.stringify(captionsData) : null,
          }),
        });
        const updateData = await updateRes.json();
        if (updateData.success) {
          clearDraft();
          setShowReview(false);
          router.push(`/profile/${user.id}`);
        } else {
          alert("Update failed: " + (updateData.error || "Unknown"));
        }
        setUploading(false);
        return;
      }

      // 完整上传流程
      const duration = await getVideoDuration(uploadFile);
      const fd = new FormData();
      if (uploadAiUrl) {
        fd.append("video_url", uploadAiUrl);
        fd.append("source", "ai");
      } else {
        fd.append("video", uploadFile);
        fd.append("source", sourceMode === "template" ? "template" : mode === "record" ? "record" : "upload");
      }
      fd.append("user_id", user.id);
      fd.append("duration", String(duration));
      fd.append("caption", caption);
      fd.append("tags", tags);
      fd.append("category", category);
      if (captionsEnabled && captionsData) {
        fd.append("captions", JSON.stringify(captionsData));
      }

      const xhr = new XMLHttpRequest();
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const r = JSON.parse(xhr.responseText);
          if (r.success) {
            clearDraft();
            setUploading(false);
            setShowReview(false);
            router.push(`/profile/${user.id}`);
          } else {
            alert("Upload failed: " + (r.error || "Unknown"));
          }
        } else {
          alert("Upload failed: " + xhr.status);
        }
        setUploading(false);
      });
      xhr.addEventListener("error", () => { alert("Network error"); setUploading(false); });
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/api/upload`);
      xhr.send(fd);
    } catch {
      alert("Upload error");
      setUploading(false);
    }
  };

  // 🆕 字幕编辑
  const handleEditCaption = (index: number, newText: string) => {
    if (!captionsData) return;
    const updated = [...captionsData];
    updated[index] = { ...updated[index], text: newText };
    setCaptionsData(updated);
  };

  const handleRegenerateAll = () => {
    alert(`Regenerate all (5 💎) — API integration pending`);
  };

  const categories = ["entertainment","music","gaming","education","sports","vlog"];

  // 🆕 预览视频 URL
  const previewVideoUrl = selectedFile ? URL.createObjectURL(selectedFile) : "";

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-black text-white max-w-[430px] mx-auto p-4 relative">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <h1 className="text-xl font-bold">Create</h1>
        <div className="w-6" />
      </div>

      {/* 主 Tab */}
      <div className="flex bg-gray-900 rounded-xl p-1 mb-4">
        <button onClick={() => setMode("upload")} className={`flex-1 py-2 text-center rounded-lg text-sm font-medium ${mode==="upload"?"bg-yellow-400 text-black":"text-gray-400"}`}>Upload</button>
        <button onClick={() => setMode("record")} className={`flex-1 py-2 text-center rounded-lg text-sm font-medium ${mode==="record"?"bg-yellow-400 text-black":"text-gray-400"}`}>Record</button>
      </div>

      {/* ========== RECORD ========== */}
      {mode === "record" && (
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-[9/16] bg-black rounded-xl overflow-hidden mb-4">
            <video ref={videoPreviewRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            {recording && <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs"><span className="w-2 h-2 bg-white rounded-full animate-pulse inline-block mr-1" />{recordTime}s</div>}
            {countdown !== null && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-6xl font-bold text-yellow-400 animate-ping">{countdown===0?"Go!":countdown}</span></div>}
          </div>
          {!recording && countdown===null && (
            <div className="w-full flex items-center justify-between px-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-gray-400"><input type="checkbox" checked={countdownEnabled} onChange={e=>setCountdownEnabled(e.target.checked)} className="accent-yellow-400"/>Countdown</label>
                {countdownEnabled && <select value={countdownDuration} onChange={e=>setCountdownDuration(+e.target.value)} className="bg-gray-800 text-white text-xs rounded px-2 py-1"><option value={3}>3s</option><option value={10}>10s</option></select>}
              </div>
              <button onClick={toggleFlash} className={`px-3 py-1 rounded-full text-xs ${flashOn?"bg-yellow-400 text-black":"bg-gray-800 text-gray-300"}`}>{flashOn?"💡 On":"💡 Off"}</button>
            </div>
          )}
          {!recording && countdown===null && <button onClick={countdownEnabled?startCountdown:beginRecording} disabled={!cameraReady} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-white"/></button>}
          {recording && <button onClick={handleStopRecording} className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border-2 border-red-500"><div className="w-6 h-6 bg-red-500 rounded-sm"/></button>}
          <p className="text-gray-500 text-xs mt-4">Max 60 seconds</p>
        </div>
      )}

      {/* ========== UPLOAD ========== */}
      {mode === "upload" && (
        <>
          {/* 🆕 来源切换 */}
          <div className="flex bg-gray-900 rounded-xl p-1 mb-4">
            {(["upload","ai","template"] as const).map(s => (
              <button
                key={s}
                onClick={() => {
                  if (s === "upload") setSourceMode(null);
                  else setSourceMode(s);
                }}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-medium transition ${
                  (s === "upload" && sourceMode === null) || (s === sourceMode)
                    ? "bg-yellow-400 text-black"
                    : "text-gray-400"
                }`}
              >
                {s === "upload" ? "📹 Upload" : s === "ai" ? "🎬 AI Video" : "⚡ Template"}
              </button>
            ))}
          </div>

          {/* 🆕 面板 */}
          {sourceMode === null && (
            <div
              className="bg-gray-900 rounded-xl p-6 mb-4 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <video src={previewVideoUrl} className="w-full h-48 object-cover rounded" controls muted />
              ) : (
                <>
                  <div className="text-4xl mb-2">+</div>
                  <p className="text-gray-400 text-sm">Select video to upload</p>
                  <p className="text-gray-600 text-xs mt-1">MP4 or MOV</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
            </div>
          )}

{sourceMode === "ai" && (
  <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-3">
    <textarea
      value={aiPrompt}
      onChange={e => setAiPrompt(e.target.value)}
      placeholder="Describe the video you want to generate... (English or 中文)"
      className="w-full bg-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-500 outline-none resize-none h-20"
      maxLength={500}
    />
	
	{/* 图片上传（可选）*/}
<div className="flex items-center gap-2">
  <button
    onClick={() => aiImageInputRef.current?.click()}
    className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 hover:bg-gray-700 transition"
  >
    🖼️ {aiImageFile ? "Change Image" : "Add Image (optional)"}
  </button>
  {aiImageFile && (
    <button
      onClick={() => {
        setAiImageFile(null);
        setAiImagePreviewUrl("");
      }}
      className="text-xs text-red-400 hover:text-red-300"
    >
      ✕ Remove
    </button>
  )}
</div>
{aiImagePreviewUrl && (
  <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
    <img src={aiImagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
  </div>
)}
<input
  ref={aiImageInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={handleAIImageSelected}
/>

    {/* 套餐选择 */}
    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
      <span>Package:</span>
	  
	  <button
  onClick={() => {
    setAiPlan("basic");
    setShowOptimized(false);
    setOptimizedPrompt("");
    if (aiDuration > 10) setAiDuration(10); // 可选限制建议，Basic建议10s内
  }}
  className={`px-2 py-1 rounded ${aiPlan === "basic" ? "bg-yellow-400 text-black" : "bg-gray-800"}`}
>
  🥉 Basic
</button>

      <button
        onClick={() => {
    setAiPlan("pro");
    setShowOptimized(false);
    setOptimizedPrompt("");
  }}
        className={`px-2 py-1 rounded ${aiPlan === "pro" ? "bg-yellow-400 text-black" : "bg-gray-800"}`}
      >
        🥈 Pro
      </button>
   <button
  onClick={() => {
    setAiPlan("master");
    setShowOptimized(false);
    setOptimizedPrompt("");
    if (![6,10,14,18,24,30,40,60].includes(aiDuration)) setAiDuration(6);
  }}
  className={`px-2 py-1 rounded ${aiPlan === "master" ? "bg-yellow-400 text-black" : "bg-gray-800"}`}
>
  🥇 Master
</button>
    </div>

    {/* 套餐说明 */}
    <div className="text-[10px] text-gray-500 bg-gray-800/50 rounded px-2 py-1">
	  {aiPlan === "basic" && "🎬 Video Basic (720p) · 🔊 AI-generated native voiceover · a quick start guide"}
      {aiPlan === "pro" && "🎬 Video (1080p) · 🔊 AI native dubbing/lip sync · High-speed film production"}
      {aiPlan === "master" && "🎬 Video Fast (1080p) · 🔊 Native audio (ambient sound + voice)· movie grade"}
    </div>

    {/* 时长选择 */}
    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
      <span>Duration:</span>
      {(aiPlan === 'master' 
    ? [6, 10, 14, 18, 24, 30, 40, 60]  // Master 独有
    : [5, 10, 15, 30, 60]               // Basic / Pro
  ).map(s => (
    <button
      key={s}
      onClick={() => setAiDuration(s)}
      className={`px-2 py-1 rounded ${aiDuration === s ? "bg-yellow-400 text-black" : "bg-gray-800"}`}
    >
      {s}s
    </button>
  ))}
      <span className="ml-auto font-bold text-yellow-400">
        💎 {(() => {
          const costs: Record<string, Record<number, number>> = {
			basic: { 5:25, 10:50, 15:75, 30:150, 60:300 },
            pro: { 5:50, 10:100, 15:150, 30:300, 60:600 },
            master: { 6:120, 10:200, 14:280, 18:360, 24:480, 30:600, 40:800, 60:1200 },
          };
          return costs[aiPlan]?.[aiDuration] ?? 0;
        })()}
      </span>
    </div>

    {/* 优化 + 生成 按钮组 */}
    <div className="space-y-2">
      <button
        onClick={handleOptimizePrompt}
        disabled={optimizing || !aiPrompt.trim()}
        className="w-full py-2 rounded-lg text-sm font-bold bg-blue-600 text-white disabled:opacity-50"
      >
        {optimizing ? "Optimizing..." : "✨ AI Storyboard (Free)"}
      </button>

      {showOptimized && (
        <div className="space-y-2">
          <textarea
            value={optimizedPrompt}
            onChange={e => setOptimizedPrompt(e.target.value)}
            className="w-full bg-gray-800 rounded-lg p-2 text-xs text-white outline-none resize-none h-16"
            maxLength={400}
            placeholder="优化后的提示词..."
          />
          <button
            onClick={handleAIGenerateWithPrompt}
            disabled={aiGenerating || !optimizedPrompt.trim()}
            className={`w-full py-2 rounded-lg text-sm font-bold ${
              aiGenerating || !optimizedPrompt.trim() ? "bg-gray-700 text-gray-500" : "bg-yellow-400 text-black"
            }`}
          >
            {aiGenerating ? (aiStatusMsg || "Generating...") : "Generate Video"}
          </button>
        </div>
      )}
    </div>

    {aiStatusMsg && !aiGenerating && <p className="text-green-400 text-xs text-center">{aiStatusMsg}</p>}
  </div>
)}

  {sourceMode === "template" && (
  <div className="grid grid-cols-3 gap-3 mb-4">
    {(["Memory","Beat Snap","Festival"] as const).map((name, i) => (
      <button
        key={i}
        onClick={() => handleTemplateCardClick(name.toLowerCase().replace(" ", ""))}
        className="bg-gray-900 rounded-xl p-4 flex flex-col items-center gap-1 hover:bg-gray-800 transition"
      >
        <span className="text-2xl">{["📸","⚡","✨"][i]}</span>
        <span className="text-[10px] text-gray-500">{name}</span>
      </button>
    ))}
  </div>
)}
		  
{templateMode && !templateStyle && (
  <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-3">
    <h3 className="text-white text-sm">
      {TEMPLATE_CATEGORIES[templateMode]?.icon} {TEMPLATE_CATEGORIES[templateMode]?.label} — Choose a Style
    </h3>
    <div className="grid grid-cols-3 gap-3">
      {TEMPLATE_CATEGORIES[templateMode]?.styles.map(style => (
        <button
          key={style.id}
          onClick={() => {
            setTemplateStyle(style.id);
            // 每次选样式都重新选照片
            setTemplatePhotos([]);
			
			setTimeout(() => {
    templatePhotoInputRef.current?.click();
  }, 100);
          }}
          className="bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-1 hover:bg-gray-700 transition"
        >
          <span className="text-2xl">{style.icon}</span>
          <span className="text-[10px] text-gray-300">{style.label}</span>
        </button>
      ))}
    </div>
    <button onClick={() => { setTemplateMode(null); setSelectedFile(null); }} className="text-gray-500 text-xs underline">
  ← Back to templates
</button>
  </div>
)}

{templateMode && templateStyle && (
  <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-3">
    <div className="flex justify-between items-center">
      <h3 className="text-white text-sm">
        {TEMPLATE_CATEGORIES[templateMode]?.icon} {TEMPLATE_CATEGORIES[templateMode]?.label} — {templateStyle}
      </h3>
      <button onClick={() => setTemplateStyle(null)} className="text-gray-500 text-xs underline">
        Change Style
      </button>
    </div>

    {/* 成功提示（如果已合成视频） */}
    {templatePhotos.length === 0 && selectedFile && !templateSynthesizing && (
      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
        <p className="text-green-400 text-sm font-medium mb-1">✅ Video Ready!</p>
        <p className="text-gray-300 text-xs">
          Your template video has been created.<br />
          <span className="text-yellow-400 font-bold mt-1 inline-block">
            👇 Click "Next →" to review and publish
          </span>
        </p>
        <button
          onClick={() => { setTemplateMode(null); setTemplateStyle(null); setSelectedFile(null); }}
          className="mt-2 text-gray-500 text-xs underline"
        >
          Close this panel
        </button>
      </div>
    )}

    {/* 如果没有选照片，显示选照片提示（否则显示缩略图） */}
    {templatePhotos.length === 0 && !selectedFile ? (
      <p className="text-gray-500 text-xs">Tap the button below to select at least 3 photos</p>
    ) : templatePhotos.length > 0 ? (
      <div className="flex gap-2 overflow-x-auto">
        {templatePhotos.map((file, idx) => (
          <img
            key={idx}
            src={URL.createObjectURL(file)}
            alt={`photo ${idx+1}`}
            className="w-16 h-16 object-cover rounded"
          />
        ))}
      </div>
    ) : null}

    <div className="flex gap-3">
      <button
        onClick={() => templatePhotoInputRef.current?.click()}
        disabled={templateSynthesizing}
        className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium"
      >
        {templatePhotos.length ? "Change Photos" : "Select Photos"}
      </button>
      <button
        onClick={handleTemplateSynthesize}
        disabled={templatePhotos.length < 3 || templateSynthesizing}
        className="flex-1 py-2 bg-yellow-400 text-black rounded-lg text-xs font-bold disabled:opacity-50"
      >
        {templateSynthesizing ? "Synthesizing..." : "Synthesize Video"}
      </button>
    </div>
  </div>
)}

{/* 🎵 统一音乐选择器（三个入口都显示） */}
  <div className="bg-gray-800 rounded-lg p-3 mb-3">
    <label className="text-xs text-gray-400 block mb-2">🎵 Background Music</label>
    <div className="flex gap-2">
      <select
        value={reviewBGM}
                onChange={e => {
          setReviewBGM(e.target.value);
          if (previewAudioRef.current) {
            previewAudioRef.current.pause();
            previewAudioRef.current.src = "";
            previewAudioRef.current = null;
          }
        }}
        className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
      >
        <option value="">No Music</option>
        <optgroup label="🎹 Piano">
          <option value="/music/piano1.mp3">Piano 1</option>
          <option value="/music/piano2.mp3">Piano 2</option>
          <option value="/music/piano3.mp3">Piano 3</option>
          <option value="/music/piano4.mp3">Piano 4</option>
          <option value="/music/piano5.mp3">Piano 5</option>
        </optgroup>
        <optgroup label="⚡ Electronic">
          <option value="/music/electronic1.mp3">Electronic 1</option>
          <option value="/music/electronic2.mp3">Electronic 2</option>
          <option value="/music/electronic3.mp3">Electronic 3</option>
          <option value="/music/electronic4.mp3">Electronic 4</option>
          <option value="/music/electronic5.mp3">Electronic 5</option>
        </optgroup>
        <optgroup label="🎉 Upbeat">
          <option value="/music/upbeat1.mp3">Upbeat 1</option>
          <option value="/music/upbeat2.mp3">Upbeat 2</option>
          <option value="/music/upbeat3.mp3">Upbeat 3</option>
          <option value="/music/upbeat4.mp3">Upbeat 4</option>
          <option value="/music/upbeat5.mp3">Upbeat 5</option>
        </optgroup>
      </select>
      <button
        onClick={() => {
         if (!reviewBGM) return;
          const current = previewAudioRef.current;
          if (current && current.src.includes(reviewBGM)) {
            if (current.paused) {
              current.play().catch(() => {});
            } else {
              current.pause();
            }
            return;
          }
          if (current) {
            current.pause();
            current.src = "";
          }
          const audio = new Audio(reviewBGM);
          previewAudioRef.current = audio;
          audio.play().catch(() => {});
        }}
        disabled={!reviewBGM}
        className="px-3 py-2 bg-gray-700 text-white text-xs rounded-lg hover:bg-gray-600 disabled:opacity-40"
      >
        ▶️
      </button>
    </div>
	
	      {sourceMode !== "template" && reviewBGM && selectedFile && (
        <>
          <button
            onClick={async () => {
              if (!reviewBGM || !selectedFile) return;
              setMixingMusic(true);
              try {
                const mixedBlob = await mixVideoWithAudio(selectedFile, reviewBGM);
                const mixedFile = new File([mixedBlob], `music_added_${Date.now()}.webm`, { type: "video/webm" });
                setSelectedFile(mixedFile);
                setAiVideoUrl(null);
                setUploadedVideoId(null);
                alert("✅ Music added! Click Next to review.");
              } catch (e) {
                console.warn("混音失败", e);
                alert("Failed to add music. Please try again.");
              } finally {
                setMixingMusic(false);
              }
            }}
            disabled={mixingMusic}
            className="w-full mt-2 py-2 bg-purple-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
          >
            {mixingMusic ? "Adding Music..." : "🎵 Add Music to Video"}
          </button>
          <p className="text-green-400 text-[10px] text-center mt-1">
            👆 Add music before reviewing
          </p>
        </>
      )}
  </div>


          {/* 表单 */}
          <input type="text" placeholder="Write a caption..." value={caption} onChange={e=>setCaption(e.target.value)} className="w-full bg-gray-900 rounded-xl p-3 mb-3 text-sm outline-none" maxLength={150} />
          <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} className="w-full bg-gray-900 rounded-xl p-3 mb-3 text-sm outline-none" />
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={()=>setCategory(cat)} className={`px-3 py-1 rounded-full text-xs ${category===cat?"bg-yellow-400 text-black":"bg-gray-800 text-gray-300"}`}>{cat}</button>
              ))}
            </div>
          </div>

          {uploading && (
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{width:`${Math.min(progress,100)}%`}}/>
            </div>
          )}

          {/* 🆕 Next 按钮替代 Post */}
          <button
            onClick={handleNext}
            disabled={!selectedFile || aiGenerating}
            className={`w-full py-3 rounded-xl font-bold text-lg ${!selectedFile||aiGenerating ? "bg-gray-700 text-gray-500" : "bg-yellow-400 text-black"}`}
          >
            Next →
          </button>
        </>
      )}

      {/* 🆕 发布确认弹窗 */}
      <ReviewModal
        open={showReview}
        videoUrl={previewVideoUrl}
        caption={caption}
        tags={tags}
        category={category}
        captionsEnabled={captionsEnabled}
        captions={captionsData}
        captionsCost={getCaptionsCost()}
        generatingCaptions={generatingCaptionsReview}
        onCaptionChange={setCaption}
        onTagChange={setTags}
        onCategoryChange={setCategory}
        onToggleCaptions={handleToggleCaptions}
		onGenerateCaptions={handleGenerateCaptions}
        onEditCaption={handleEditCaption}
        onRegenerateAll={handleRegenerateAll}
        onConfirm={handleConfirmPublish}
        onClose={() => setShowReview(false)}
      />

      {/* 草稿弹窗 */}
     	 <DraftConfirmModal open={showDraftModal} onResume={handleResumeDraft} onDiscard={handleDiscardDraft} />
   
{/* 隐藏的模板照片选择器 */}
<input
  ref={templatePhotoInputRef}
  type="file"
  accept="image/*"
  multiple
  className="hidden"
  onChange={handleTemplatePhotoSelected}
/>
   </div>
  );
}