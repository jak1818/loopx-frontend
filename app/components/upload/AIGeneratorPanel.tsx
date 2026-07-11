"use client";

import { memo } from "react";

interface AIGeneratorPanelProps {
  sourceMode: string | null;

  aiPrompt: string;
  setAiPrompt: (v: string) => void;

  aiPlan: "basic" | "pro" | "master";
  setAiPlan: (
    v: "basic" | "pro" | "master"
  ) => void;

  aiDuration: number;
  setAiDuration: (v: number) => void;

  aiGenerating: boolean;

  aiStatusMsg: string;

  aiImageFile: File | null;

  aiImagePreviewUrl: string;

  setAiImageFile: (
    v: File | null
  ) => void;

  setAiImagePreviewUrl: (
    v: string
  ) => void;

  aiImageInputRef: React.RefObject<HTMLInputElement | null>;

  handleAIImageSelected: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  optimizing: boolean;

  handleOptimizePrompt: () => void;

  showOptimized: boolean;

  optimizedPrompt: string;

  setOptimizedPrompt: (
    v: string
  ) => void;

  handleAIGenerateWithPrompt: () => void;
}

function AIGeneratorPanel({
  sourceMode,

  aiPrompt,
  setAiPrompt,

  aiPlan,
  setAiPlan,

  aiDuration,
  setAiDuration,

  aiGenerating,

  aiStatusMsg,

  aiImageFile,

  aiImagePreviewUrl,

  setAiImageFile,

  setAiImagePreviewUrl,

  aiImageInputRef,

  handleAIImageSelected,

  optimizing,

  handleOptimizePrompt,

  showOptimized,

  optimizedPrompt,

  setOptimizedPrompt,

  handleAIGenerateWithPrompt,
}: AIGeneratorPanelProps) {
  if (sourceMode !== "ai") return null;

  return (
    <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-3">
      
      {/* Prompt */}
      <textarea
        value={aiPrompt}
        onChange={(e) =>
          setAiPrompt(e.target.value)
        }
        placeholder="Describe the video you want to generate... (English or 中文)"
        className="w-full bg-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-500 outline-none resize-none h-20"
        maxLength={500}
      />

      {/* Image Upload */}
      <div className="flex items-center gap-2">
        
        <button
          onClick={() =>
            aiImageInputRef.current?.click()
          }
          className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 hover:bg-gray-700 transition"
        >
          🖼️{" "}
          {aiImageFile
            ? "Change Image"
            : "Add Image (optional)"}
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
          
          <img
            src={aiImagePreviewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <input
        ref={aiImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAIImageSelected}
      />

      {/* Plans */}
      <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
        
        <span>Package:</span>

        <button
          onClick={() => {
            setAiPlan("basic");

            if (aiDuration > 10)
              setAiDuration(10);
          }}
          className={`px-2 py-1 rounded ${
            aiPlan === "basic"
              ? "bg-yellow-400 text-black"
              : "bg-gray-800"
          }`}
        >
          🥉 Basic
        </button>

        <button
          onClick={() =>
            setAiPlan("pro")
          }
          className={`px-2 py-1 rounded ${
            aiPlan === "pro"
              ? "bg-yellow-400 text-black"
              : "bg-gray-800"
          }`}
        >
          🥈 Pro
        </button>

        <button
          onClick={() => {
            setAiPlan("master");

            if (
              ![
                6, 10, 14, 18,
                24, 30, 40, 60,
              ].includes(aiDuration)
            ) {
              setAiDuration(6);
            }
          }}
          className={`px-2 py-1 rounded ${
            aiPlan === "master"
              ? "bg-yellow-400 text-black"
              : "bg-gray-800"
          }`}
        >
          🥇 Master
        </button>
      </div>

      {/* Plan Description */}
      <div className="text-[10px] text-gray-500 bg-gray-800/50 rounded px-2 py-1">
        
        {aiPlan === "basic" &&
          "🎬 Video Basic (720p) · 🔊 AI-generated native voiceover · a quick start guide"}

        {aiPlan === "pro" &&
          "🎬 Video (1080p) · 🔊 AI native dubbing/lip sync · High-speed film production"}

        {aiPlan === "master" &&
          "🎬 Video Fast (1080p) · 🔊 Native audio (ambient sound + voice)· movie grade"}
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
        
        <span>Duration:</span>

        {(aiPlan === "master"
          ? [6, 10, 14, 18, 24, 30, 40, 60]
          : [5, 10, 15, 30, 60]
        ).map((s) => (
          <button
            key={s}
            onClick={() =>
              setAiDuration(s)
            }
            className={`px-2 py-1 rounded ${
              aiDuration === s
                ? "bg-yellow-400 text-black"
                : "bg-gray-800"
            }`}
          >
            {s}s
          </button>
        ))}

        <span className="ml-auto font-bold text-yellow-400">
          💎{" "}
          {(() => {
            const costs: Record<
              string,
              Record<number, number>
            > = {
              basic: {
                5: 25,
                10: 50,
                15: 75,
                30: 150,
                60: 300,
              },

              pro: {
                5: 50,
                10: 100,
                15: 150,
                30: 300,
                60: 600,
              },

              master: {
                6: 120,
                10: 200,
                14: 280,
                18: 360,
                24: 480,
                30: 600,
                40: 800,
                60: 1200,
              },
            };

            return (
              costs[aiPlan]?.[
                aiDuration
              ] ?? 0
            );
          })()}
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        
        <button
          onClick={handleOptimizePrompt}
          disabled={
            optimizing ||
            !aiPrompt.trim()
          }
          className="w-full py-2 rounded-lg text-sm font-bold bg-blue-600 text-white disabled:opacity-50"
        >
          {optimizing
            ? "Optimizing..."
            : "✨ AI Storyboard (Free)"}
        </button>

        {showOptimized && (
          <div className="space-y-2">
            
            <textarea
              value={optimizedPrompt}
              onChange={(e) =>
                setOptimizedPrompt(
                  e.target.value
                )
              }
              className="w-full bg-gray-800 rounded-lg p-2 text-xs text-white outline-none resize-none h-16"
              maxLength={400}
              placeholder="优化后的提示词..."
            />

            <button
              onClick={
                handleAIGenerateWithPrompt
              }
              disabled={
                aiGenerating ||
                !optimizedPrompt.trim()
              }
              className={`w-full py-2 rounded-lg text-sm font-bold ${
                aiGenerating ||
                !optimizedPrompt.trim()
                  ? "bg-gray-700 text-gray-500"
                  : "bg-yellow-400 text-black"
              }`}
            >
              {aiGenerating
                ? aiStatusMsg ||
                  "Generating..."
                : "Generate Video"}
            </button>
          </div>
        )}
      </div>

      {aiStatusMsg &&
        !aiGenerating && (
          <p className="text-green-400 text-xs text-center">
            {aiStatusMsg}
          </p>
        )}
    </div>
  );
}

export default memo(AIGeneratorPanel);