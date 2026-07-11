"use client";

import React, { memo } from "react";

interface MusicPickerProps {
  reviewBGM: string;
  setReviewBGM: (v: string) => void;

  selectedFile: File | null;

  sourceMode: string | null;

  mixingMusic: boolean;

  onMixMusic: () => void;

  previewAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

function MusicPicker({
  reviewBGM,
  setReviewBGM,

  selectedFile,

  sourceMode,

  mixingMusic,

  onMixMusic,

  previewAudioRef,
}: MusicPickerProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-3">
      
      <label className="text-xs text-gray-400 block mb-2">
        🎵 Background Music
      </label>

      <div className="flex gap-2">
        
        <select
          value={reviewBGM}
          onChange={(e) => {
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
            <option value="/music/electronic1.mp3">
              Electronic 1
            </option>

            <option value="/music/electronic2.mp3">
              Electronic 2
            </option>

            <option value="/music/electronic3.mp3">
              Electronic 3
            </option>

            <option value="/music/electronic4.mp3">
              Electronic 4
            </option>

            <option value="/music/electronic5.mp3">
              Electronic 5
            </option>
          </optgroup>

          <optgroup label="🎉 Upbeat">
            <option value="/music/upbeat1.mp3">
              Upbeat 1
            </option>

            <option value="/music/upbeat2.mp3">
              Upbeat 2
            </option>

            <option value="/music/upbeat3.mp3">
              Upbeat 3
            </option>

            <option value="/music/upbeat4.mp3">
              Upbeat 4
            </option>

            <option value="/music/upbeat5.mp3">
              Upbeat 5
            </option>
          </optgroup>
        </select>

        {/* Preview */}
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

      {/* Mix Music */}
      {sourceMode !== "template" &&
        reviewBGM &&
        selectedFile && (
          <>
            <button
              onClick={onMixMusic}
              disabled={mixingMusic}
              className="w-full mt-2 py-2 bg-purple-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              {mixingMusic
                ? "Adding Music..."
                : "🎵 Add Music to Video"}
            </button>

            <p className="text-green-400 text-[10px] text-center mt-1">
              👆 Add music before reviewing
            </p>
          </>
        )}
    </div>
  );
}

export default memo(MusicPicker);