"use client";

import { useState } from "react";
import { CaptionItem } from "@/app/types/upload";

interface ReviewModalProps {
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
}

const categories = [
  "entertainment",
  "music",
  "gaming",
  "education",
  "sports",
  "vlog",
];

export default function ReviewModal({
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
}: ReviewModalProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-[430px] mx-auto rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onClose}
            className="text-gray-400"
          >
            ← Back
          </button>

          <h2 className="text-lg font-semibold text-white">
            Review & Publish
          </h2>

          <div className="w-10" />
        </div>

        {/* Video Preview */}
        <div className="bg-black rounded-xl overflow-hidden mb-4 aspect-[9/16]">
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            controls
          />
        </div>

        {/* Caption */}
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-sm text-white outline-none"
          maxLength={150}
        />

        {/* Tags */}
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => onTagChange(e.target.value)}
          className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-sm text-white outline-none"
        />

        {/* Category */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">
            Category
          </p>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1 rounded-full text-xs ${
                  category === cat
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AI Subtitles */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white font-medium">
                ✨ AI Subtitles
              </p>

              <p className="text-xs text-gray-400">
                {captionsCost} 💎
              </p>
            </div>

            <button
              onClick={onToggleCaptions}
              className={`w-12 h-6 rounded-full transition ${
                captionsEnabled
                  ? "bg-yellow-400"
                  : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition ml-0.5 ${
                  captionsEnabled
                    ? "translate-x-6"
                    : ""
                }`}
              />
            </button>
          </div>

          {/* Generate */}
          {captionsEnabled &&
            !captions &&
            !generatingCaptions && (
              <button
                onClick={onGenerateCaptions}
                className="mt-3 w-full py-2 bg-yellow-400 text-black rounded-lg text-sm font-bold"
              >
                🎙️ Generate Subtitles (5 💎)
              </button>
            )}

          {/* Loading */}
          {captionsEnabled &&
            generatingCaptions && (
              <div className="mt-3 text-center text-yellow-400 animate-pulse text-sm">
                Generating subtitles...
              </div>
            )}

          {/* Captions */}
          {captionsEnabled &&
            captions &&
            !generatingCaptions && (
              <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                
                {captions.map((line, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-gray-500 w-10 shrink-0">
                      {line.start.toFixed(1)}s
                    </span>

                    {editingIndex === i ? (
                      <div className="flex-1 flex gap-2">
                        
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) =>
                            setEditText(e.target.value)
                          }
                          className="flex-1 bg-gray-700 rounded px-2 py-1 text-white text-xs outline-none"
                          autoFocus
                        />

                        <button
                          onClick={() => {
                            onEditCaption(i, editText);
                            setEditingIndex(null);
                          }}
                          className="text-yellow-400 text-xs font-medium"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex justify-between items-center">
                        
                        <span className="text-gray-200">
                          {line.text}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingIndex(i);
                              setEditText(line.text);
                            }}
                            className="text-gray-500 text-xs"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Regenerate */}
                <button
                  onClick={onRegenerateAll}
                  className="w-full text-center text-yellow-400 text-xs py-2 border border-dashed border-yellow-400/30 rounded-lg"
                >
                  🔄 Regenerate All (5 💎)
                </button>
              </div>
            )}
        </div>

        {/* Download */}
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

        {/* Publish */}
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