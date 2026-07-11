"use client";

import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(
      (choiceResult: any) => {
        console.log(
          "User choice:",
          choiceResult.outcome
        );

        setDeferredPrompt(null);
      }
    );
  };

  if (!deferredPrompt) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
      <button
        onClick={handleInstall}
        style={{
          background: "#ff0050",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: 20,
          fontWeight: "bold",
          fontSize: 16,
          boxShadow:
            "0 4px 12px rgba(255,0,80,0.4)",
        }}
      >
        📲 Install App
      </button>
    </div>
  );
}