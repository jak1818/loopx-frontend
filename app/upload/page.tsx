"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/providers/AppDataProvider";
import ReviewModal from "@/app/components/upload/ReviewModal";
import { CaptionItem } from "@/app/types/upload";
import DraftConfirmModal from "@/app/components/upload/DraftConfirmModal";
import MusicPicker from "@/app/components/upload/MusicPicker";
import TemplatePanel from "@/app/components/upload/TemplatePanel";
import AIGeneratorPanel from "@/app/components/upload/AIGeneratorPanel";
import {getVideoDuration, mixVideoWithAudio,} from "@/utils/upload/video";
import {drawImageCover, synthesizeMemoryTemplate,} from "@/utils/upload/template";
import { useCameraRecorder } from "@/hooks/upload/useCameraRecorder";
import { useAIGenerator } from "@/app/hooks/upload/useAIGenerator";
import UploadingModal from "@/app/components/upload/UploadingModal";

// -------------------- 类型 --------------------


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
  const {
    user,
    telegramUser,
    webUser,
    authReady
} = useAppData();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  
  // 🆕 模板相关
const [templateMode, setTemplateMode] = useState<string | null>(null); // 'memory' | 'beatsnap' | 'festival'
const [templatePhotos, setTemplatePhotos] = useState<File[]>([]);
const [templateSynthesizing, setTemplateSynthesizing] = useState(false);
const templatePhotoInputRef = useRef<HTMLInputElement>(null);
const [templateStyle, setTemplateStyle] = useState<string | null>(null); // 具体样式名
const [reviewBGM, setReviewBGM] = useState<string>("");
const [mixingMusic, setMixingMusic] = useState(false);
const [previewVideoUrl, setPreviewVideoUrl] = useState("");
const {videoPreviewRef, cameraReady, recording, recordTime, flashOn, countdown, countdownEnabled, setCountdownEnabled, countdownDuration, setCountdownDuration, startCamera, stopCamera, toggleFlash, startCountdown, beginRecording,handleStopRecording,} = useCameraRecorder({onRecorded: (file) => {setSelectedFile(file);setAiVideoUrl(null);setUploadedVideoId(null);setMode("upload");},});
const previewAudioRef = useRef<HTMLAudioElement | null>(null);
const {aiPrompt,setAiPrompt,aiPlan,setAiPlan,aiDuration,setAiDuration,aiGenerating,aiStatusMsg,optimizedPrompt,setOptimizedPrompt,showOptimized,optimizing,aiImageFile,setAiImageFile,aiImagePreviewUrl,setAiImagePreviewUrl,aiImageInputRef,handleAIImageSelected,handleOptimizePrompt,handleAIGenerate,handleAIGenerateWithPrompt,} = useAIGenerator({
  userId: user?.id,

  apiUrl:
    process.env
      .NEXT_PUBLIC_API_URL || "",

onGenerated: (
  file,
  videoUrl
) => {

  setSelectedFile(file);

  setAiVideoUrl(
    videoUrl || null
  );

  setSourceMode(null);
}
});


  // ---------- 工具函数 ----------
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


useEffect(() => {
  if (mode === "record") {
    startCamera(flashOn);
  } else {
    stopCamera();
  }

  return () => {
    stopCamera();
  };
}, [mode, flashOn]);
  
  useEffect(() => {
  if (!selectedFile) {
    setPreviewVideoUrl("");
    return;
  }

  const url = URL.createObjectURL(selectedFile);

  setPreviewVideoUrl(url);

  return () => {
    URL.revokeObjectURL(url);
  };
}, [selectedFile]);
  

  // ---------- 文件选择 ----------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setAiVideoUrl(null);
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

const handleTemplateSynthesize = async () => {
  if (previewAudioRef.current) {
    previewAudioRef.current.pause();
    previewAudioRef.current.src = "";
    previewAudioRef.current = null;
  }

  setTemplateSynthesizing(true);

  try {

    if (templateMode === "memory") {

      const blob =
        await synthesizeMemoryTemplate({
          templatePhotos,
          templateStyle,
          reviewBGM,
          outputName: `template_memory_${Date.now()}.webm`,
        });

      const file = new File(
        [blob],
        `template_memory_${Date.now()}.webm`,
        {
          type: "video/webm",
        }
      );

      setSelectedFile(file);

      setAiVideoUrl(null);

      setTemplatePhotos([]);
    }

    else if (templateMode === "beatsnap") {
      await synthesizeBeatSnapTemplate();
    }

    else if (templateMode === "festival") {
      await synthesizeFestivalTemplate();
    }

    else {
      alert("Template not implemented yet");
    }

  } finally {
    setTemplateSynthesizing(false);
  }
};



// 🎵 Beat Snap：快节奏闪切 + 缩放抖动
const synthesizeBeatSnapTemplate = async () => {
  if (!templatePhotos.length) return;
  setTemplateSynthesizing(true);

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(30);

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
  const stream = canvas.captureStream(30);

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


const handleMixMusic = async () => {
  if (!reviewBGM || !selectedFile) return;

  setMixingMusic(true);

  try {
    const mixedBlob = await mixVideoWithAudio(
      selectedFile,
      reviewBGM
    );

    const mixedFile = new File(
      [mixedBlob],
      `music_added_${Date.now()}.webm`,
      {
        type: "video/webm",
      }
    );

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
};

  // 🆕 确认发布
  const handleConfirmPublish = async () => {

    if (!user?.id) { alert("User not loaded"); return; }
    
    // 直接使用 selectedFile (如果之前 handleNext 已经混过音，这里就是带音乐的版本)
    let uploadFile = selectedFile!;
    let uploadAiUrl = aiVideoUrl;

    setUploading(true);

	setProgress(0);
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
		  setProgress(100);
          setTimeout(() => {

        setUploading(false);

        router.push(`/profile/${user.id}`);

    }, 500);
	return;
        } else {
		  setUploading(false);
          setProgress(0);
          alert("Update failed: " + (updateData.error || "Unknown"));
		  return;
        }

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
	  xhr.upload.onprogress = (event) => {

    if (!event.lengthComputable)
        return;

    const percent = Math.round(
        event.loaded * 100 /
        event.total
    );

    setProgress(percent);
};
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const r = JSON.parse(xhr.responseText);
          if (r.success) {
            clearDraft();
            setShowReview(false);
			setProgress(100);
              setTimeout(() => {

        setUploading(false);

        router.push(`/profile/${user.id}`);

    }, 500);
          } else {
			setUploading(false);
            setProgress(0);
            alert("Upload failed: " + (r.error || "Unknown"));
          }
        } else {
		  setUploading(false);
          setProgress(0);
          alert("Upload failed: " + xhr.status);
        }
		
      });
      xhr.addEventListener("error", () => { setProgress(0);setUploading(false);alert("Network error");});
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/api/upload`);
      xhr.send(fd);
    } catch {
	  setProgress(0);
	  setUploading(false);
      alert("Upload error");
      
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

  // ---------- UI ----------
  return (
    <div
  className="
    h-full
    overflow-y-auto
    bg-black
    text-white
    max-w-[430px]
    mx-auto
    p-4
    relative
    pb-8
  "
  style={{
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
>
      <div className="flex justify-between items-center mb-6">
        <button
  onClick={() => router.back()}
  className="text-xl font-bold"
>
  ✕
</button>
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

<AIGeneratorPanel
  sourceMode={sourceMode}
  aiPrompt={aiPrompt}
  setAiPrompt={setAiPrompt}
  aiPlan={aiPlan}
  setAiPlan={setAiPlan}
  aiDuration={aiDuration}
  setAiDuration={setAiDuration}
  aiGenerating={aiGenerating}
  aiStatusMsg={aiStatusMsg}
  aiImageFile={aiImageFile}
  aiImagePreviewUrl={aiImagePreviewUrl}
  setAiImageFile={setAiImageFile}
  setAiImagePreviewUrl={setAiImagePreviewUrl}
  aiImageInputRef={aiImageInputRef}
  handleAIImageSelected={handleAIImageSelected}
  optimizing={optimizing}
  handleOptimizePrompt={handleOptimizePrompt}
  showOptimized={showOptimized}
  optimizedPrompt={optimizedPrompt}
  setOptimizedPrompt={setOptimizedPrompt}
  handleAIGenerateWithPrompt={handleAIGenerateWithPrompt}
/>

<TemplatePanel
  sourceMode={sourceMode}
  templateMode={templateMode}
  setTemplateMode={setTemplateMode}
  templateStyle={templateStyle}
  setTemplateStyle={setTemplateStyle}
  templatePhotos={templatePhotos}
  templateSynthesizing={templateSynthesizing}
  selectedFile={selectedFile}
  handleTemplateCardClick={handleTemplateCardClick}
  handleTemplateSynthesize={handleTemplateSynthesize}
  templatePhotoInputRef={templatePhotoInputRef}
  TEMPLATE_CATEGORIES={TEMPLATE_CATEGORIES}
/>
		  
<MusicPicker
  reviewBGM={reviewBGM}
  setReviewBGM={setReviewBGM}
  selectedFile={selectedFile}
  sourceMode={sourceMode}
  mixingMusic={mixingMusic}
  onMixMusic={handleMixMusic}
  previewAudioRef={previewAudioRef}
/>


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
	  
	  <UploadingModal
    open={uploading}
    progress={progress}
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