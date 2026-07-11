"use client";

import { useState, useRef } from "react";

import {
  stitchVideos,
} from "@/utils/upload/video";

interface UseAIGeneratorOptions {
  userId?: string;

  apiUrl: string;

  onGenerated: (
  file: File,
  videoUrl?: string
) => void;
}

export function useAIGenerator({
  userId,
  apiUrl,
  onGenerated,
}: UseAIGeneratorOptions) {

  const [aiPrompt, setAiPrompt] =
    useState("");

  const [aiPlan, setAiPlan] =
    useState<
      "basic" | "pro" | "master"
    >("basic");

  const [aiDuration, setAiDuration] =
    useState(10);

  const [aiGenerating, setAiGenerating] =
    useState(false);

  const [aiStatusMsg, setAiStatusMsg] =
    useState("");

  const [optimizedPrompt, setOptimizedPrompt] =
    useState("");

  const [showOptimized, setShowOptimized] =
    useState(false);

  const [optimizing, setOptimizing] =
    useState(false);

  const [aiImageFile, setAiImageFile] =
    useState<File | null>(null);

  const [
    aiImagePreviewUrl,
    setAiImagePreviewUrl,
  ] = useState("");

  const [
    aiImageUploading,
    setAiImageUploading,
  ] = useState(false);

  const aiImageInputRef =
    useRef<HTMLInputElement>(null);

  const handleAIImageSelected = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0] || null;

    if (!file) return;

    setAiImageFile(file);

    setAiImagePreviewUrl(
      URL.createObjectURL(file)
    );
  };

  const uploadImageToR2 = async (
    file: File
  ): Promise<string> => {
    const fd = new FormData();

    fd.append("image", file);

    fd.append(
      "user_id",
      userId || "temp"
    );

    const res = await fetch(
      `${apiUrl}/api/upload-image`,
      {
        method: "POST",
        body: fd,
      }
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error(
        data.error ||
          "Image upload failed"
      );
    }

    return data.url;
  };

  const handleOptimizePrompt =
    async () => {

      if (
        !aiPrompt.trim() ||
        aiPrompt.trim().length < 3
      ) {
        alert("Prompt too short");

        return;
      }

      setOptimizing(true);

      try {
        const res = await fetch(
          `${apiUrl}/api/ai/optimize-prompt`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              prompt: aiPrompt,
              duration: aiDuration,
              user_id: userId,
            }),
          }
        );

        const data =
          await res.json();

        if (data.success) {

          const storyboard =
            data.optimized_prompt;

          let displayText =
            `🎬 ${
              storyboard.title ||
              "Generated Video"
            }\n`;

          displayText +=
            `⏱ Total: ${
              storyboard.total_duration ||
              "?"
            }s\n\n`;

          if (
            storyboard.shots &&
            storyboard.shots.length > 0
          ) {
            storyboard.shots.forEach(
              (shot: any) => {
                displayText +=
                  `📷 Shot ${
                    shot.index
                  } (${
                    shot.duration
                  }s):\n${
                    shot.prompt
                  }\n\n`;
              }
            );
          }

          else {
            displayText +=
              storyboard
                .shots?.[0]
                ?.prompt ||
              data.optimized_prompt;
          }

          setOptimizedPrompt(
            displayText
          );

          setShowOptimized(true);
        }

        else {
          alert(
            "Optimization failed: " +
              (data.error ||
                "Unknown")
          );
        }
      }

      catch (err) {
        console.error(err);

        alert("Network error");
      }

      finally {
        setOptimizing(false);
      }
    };

  const handleAIGenerate =
    async (
      promptOverride?: string
    ) => {

      const promptToUse =
        promptOverride || aiPrompt;

      if (
        !promptToUse.trim() ||
        promptToUse.trim()
          .length < 3
      ) {
        alert(
          "Prompt must be at least 3 characters"
        );

        return;
      }

      if (!userId) {
        alert("User not loaded");

        return;
      }

      setAiGenerating(true);

      setAiStatusMsg(
        aiImageFile
          ? "Uploading image..."
          : "Generating video..."
      );

      try {

        let imageUrl = "";

        if (aiImageFile) {

          setAiImageUploading(
            true
          );

          imageUrl =
            await uploadImageToR2(
              aiImageFile
            );

          setAiImageUploading(
            false
          );

          setAiStatusMsg(
            "Generating video..."
          );
        }

        const res = await fetch(
          `${apiUrl}/api/ai/generate-video`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              prompt:
                promptToUse,

              plan: aiPlan,

              duration:
                aiDuration,

              user_id: userId,

              image_url:
                imageUrl ||
                undefined,
            }),
          }
        );

        const data =
          await res.json();

        if (data.success) {

          const segments:
            string[] =
            data.segments || [];

          if (
            segments.length === 0
          ) {
            throw new Error(
              "No video segments returned"
            );
          }

          let videoBlob: Blob;

          if (
            segments.length === 1
          ) {
            const resp =
              await fetch(
                segments[0]
              );

            videoBlob =
              await resp.blob();
          }

          else {

            setAiStatusMsg(
              "Stitching segments..."
            );

            videoBlob =
              await stitchVideos(
                segments
              );
          }

         const file = new File(
  [videoBlob],
  `ai_video_${Date.now()}.mp4`,
  {
    type: "video/mp4",
  }
);

onGenerated(
  file,
  segments[0]
);

          setAiStatusMsg("");

          alert(
            "Video generated successfully!"
          );
        }

        else {
          alert(
            "AI generation failed: " +
              (data.error ||
                "Unknown")
          );
        }
      }

      catch (err) {
        console.error(err);

        alert("Network error");
      }

      finally {
        setAiGenerating(false);

        setAiStatusMsg("");
      }
    };

  const handleAIGenerateWithPrompt =
    async () => {

      if (
        !optimizedPrompt.trim() ||
        optimizedPrompt.trim()
          .length < 3
      ) {
        alert(
          "Prompt too short"
        );

        return;
      }

      let cleanPrompt =
        optimizedPrompt;

      const match =
        optimizedPrompt.match(
          /Shot 1.*?:\s*(.*)/s
        );

      if (match) {
        cleanPrompt =
          match[1].trim();
      }

      await handleAIGenerate(
        cleanPrompt
      );
    };

  return {

    aiPrompt,
    setAiPrompt,

    aiPlan,
    setAiPlan,

    aiDuration,
    setAiDuration,

    aiGenerating,

    aiStatusMsg,

    optimizedPrompt,
    setOptimizedPrompt,

    showOptimized,
    setShowOptimized,

    optimizing,

    aiImageFile,
    setAiImageFile,

    aiImagePreviewUrl,
    setAiImagePreviewUrl,

    aiImageUploading,

    aiImageInputRef,

    handleAIImageSelected,

    uploadImageToR2,

    handleOptimizePrompt,

    handleAIGenerate,

    handleAIGenerateWithPrompt,
  };
}