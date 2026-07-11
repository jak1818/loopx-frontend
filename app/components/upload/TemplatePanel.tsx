"use client";

import { memo } from "react";

interface TemplatePanelProps {
  sourceMode: string | null;

  templateMode: string | null;
  setTemplateMode: (v: string | null) => void;

  templateStyle: string | null;
  setTemplateStyle: (v: string | null) => void;

  templatePhotos: File[];

  templateSynthesizing: boolean;

  selectedFile: File | null;

  handleTemplateCardClick: (category: string) => void;

  handleTemplateSynthesize: () => void;

  templatePhotoInputRef: React.RefObject<HTMLInputElement | null>;

  TEMPLATE_CATEGORIES: any;
}

function TemplatePanel({
  sourceMode,

  templateMode,
  setTemplateMode,

  templateStyle,
  setTemplateStyle,

  templatePhotos,

  templateSynthesizing,

  selectedFile,

  handleTemplateCardClick,

  handleTemplateSynthesize,

  templatePhotoInputRef,

  TEMPLATE_CATEGORIES,
}: TemplatePanelProps) {
  if (sourceMode !== "template") return null;

  return (
    <>
      {/* Template Categories */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(["Memory", "Beat Snap", "Festival"] as const).map(
          (name, i) => (
            <button
              key={i}
              onClick={() =>
                handleTemplateCardClick(
                  name.toLowerCase().replace(" ", "")
                )
              }
              className="bg-gray-900 rounded-xl p-4 flex flex-col items-center gap-1 hover:bg-gray-800 transition"
            >
              <span className="text-2xl">
                {["📸", "⚡", "✨"][i]}
              </span>

              <span className="text-[10px] text-gray-500">
                {name}
              </span>
            </button>
          )
        )}
      </div>

      {/* Style Picker */}
      {templateMode && !templateStyle && (
        <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-3">
          
          <h3 className="text-white text-sm">
            {
              TEMPLATE_CATEGORIES[templateMode]?.icon
            }{" "}
            {
              TEMPLATE_CATEGORIES[templateMode]?.label
            }{" "}
            — Choose a Style
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {TEMPLATE_CATEGORIES[
              templateMode
            ]?.styles.map((style: any) => (
              <button
                key={style.id}
                onClick={() => {
                  setTemplateStyle(style.id);

                  setTimeout(() => {
                    templatePhotoInputRef.current?.click();
                  }, 100);
                }}
                className="bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-1 hover:bg-gray-700 transition"
              >
                <span className="text-2xl">
                  {style.icon}
                </span>

                <span className="text-[10px] text-gray-300">
                  {style.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setTemplateMode(null);
            }}
            className="text-gray-500 text-xs underline"
          >
            ← Back to templates
          </button>
        </div>
      )}

      {/* Selected Template */}
      {templateMode && templateStyle && (
        <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-3">
          
          <div className="flex justify-between items-center">
            
            <h3 className="text-white text-sm">
              {
                TEMPLATE_CATEGORIES[templateMode]?.icon
              }{" "}
              {
                TEMPLATE_CATEGORIES[templateMode]?.label
              }{" "}
              — {templateStyle}
            </h3>

            <button
              onClick={() =>
                setTemplateStyle(null)
              }
              className="text-gray-500 text-xs underline"
            >
              Change Style
            </button>
          </div>

          {/* Success */}
          {templatePhotos.length === 0 &&
            selectedFile &&
            !templateSynthesizing && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                
                <p className="text-green-400 text-sm font-medium mb-1">
                  ✅ Video Ready!
                </p>

                <p className="text-gray-300 text-xs">
                  Your template video has been
                  created.
                  <br />

                  <span className="text-yellow-400 font-bold mt-1 inline-block">
                    👇 Click "Next →" to review
                    and publish
                  </span>
                </p>

                <button
                  onClick={() => {
                    setTemplateMode(null);
                    setTemplateStyle(null);
                  }}
                  className="mt-2 text-gray-500 text-xs underline"
                >
                  Close this panel
                </button>
              </div>
            )}

          {/* Photo Preview */}
          {templatePhotos.length === 0 &&
          !selectedFile ? (
            <p className="text-gray-500 text-xs">
              Tap the button below to select
              at least 3 photos
            </p>
          ) : templatePhotos.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto">
              {templatePhotos.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt={`photo ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded"
                />
              ))}
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-3">
            
            <button
              onClick={() =>
                templatePhotoInputRef.current?.click()
              }
              disabled={templateSynthesizing}
              className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium"
            >
              {templatePhotos.length
                ? "Change Photos"
                : "Select Photos"}
            </button>

            <button
              onClick={handleTemplateSynthesize}
              disabled={
                templatePhotos.length < 3 ||
                templateSynthesizing
              }
              className="flex-1 py-2 bg-yellow-400 text-black rounded-lg text-xs font-bold disabled:opacity-50"
            >
              {templateSynthesizing
                ? "Synthesizing..."
                : "Synthesize Video"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(TemplatePanel);