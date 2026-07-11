"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

interface UseCameraRecorderOptions {
  onRecorded: (file: File) => void;
}

export function useCameraRecorder({
  onRecorded,
}: UseCameraRecorderOptions) {
  const videoPreviewRef =
    useRef<HTMLVideoElement>(null);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const countdownTimerRef =
    useRef<NodeJS.Timeout | null>(null);

  const recordTimerRef =
    useRef<NodeJS.Timeout | null>(null);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const [recordTime, setRecordTime] =
    useState(0);

  const [flashOn, setFlashOn] =
    useState(false);

  const [countdown, setCountdown] =
    useState<number | null>(null);

  const [countdownEnabled, setCountdownEnabled] =
    useState(false);

  const [countdownDuration, setCountdownDuration] =
    useState(3);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((t) => t.stop());

      streamRef.current = null;
    }

    setCameraReady(false);
  }, []);

  const startCamera = useCallback(
    async (enableFlash = flashOn) => {
      stopCamera();

      try {
        const constraints = {
          video: {
            facingMode: {
              ideal: "environment",
            },

            width: {
              ideal: 1080,
            },

            height: {
              ideal: 1920,
            },
          },

          audio: true,
        };

        let stream: MediaStream;

        try {
          stream =
            await navigator.mediaDevices.getUserMedia(
              constraints
            );
        } catch {
          stream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: {
                  facingMode: "user",

                  width: {
                    ideal: 1080,
                  },

                  height: {
                    ideal: 1920,
                  },
                },

                audio: true,
              }
            );
        }

        streamRef.current = stream;

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject =
            stream;

          videoPreviewRef.current.muted =
            true;

          await videoPreviewRef.current.play();
        }

        setCameraReady(true);

        const vt =
          stream.getVideoTracks()[0];

        if (
          vt &&
          "torch" in vt.getCapabilities()
        ) {
          try {
            await vt.applyConstraints({
              advanced: [
                {
                  torch:
                    enableFlash,
                } as any,
              ],
            });

            setFlashOn(enableFlash);
          } catch {}
        }
      } catch {
        alert(
          "Cannot access camera/microphone."
        );
      }
    },
    [stopCamera, flashOn]
  );

  const toggleFlash = async () => {
    const ns = !flashOn;

    const vt =
      streamRef.current?.getVideoTracks()[0];

    if (
      vt &&
      "torch" in vt.getCapabilities()
    ) {
      try {
        await vt.applyConstraints({
          advanced: [
            {
              torch: ns,
            } as any,
          ],
        });

        setFlashOn(ns);
      } catch {
        alert("Flash not supported");
      }
    } else {
      alert("Flash not available");
    }
  };

  const beginRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];

    const rec = new MediaRecorder(
      streamRef.current,
      {
        mimeType: "video/webm",
      }
    );

    mediaRecorderRef.current = rec;

    rec.ondataavailable = (e) => {
      if (e.data?.size) {
        chunksRef.current.push(e.data);
      }
    };

    rec.onstop = () => {
      const blob = new Blob(
        chunksRef.current,
        {
          type: "video/webm",
        }
      );

      const file = new File(
        [blob],
        `recorded_${Date.now()}.webm`,
        {
          type: "video/webm",
        }
      );

      onRecorded(file);

      setRecording(false);

      setRecordTime(0);

      stopCamera();
    };

    rec.start();

    setRecording(true);

    setRecordTime(0);
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current?.state ===
      "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recordTimerRef.current) {
      clearInterval(
        recordTimerRef.current
      );
    }
  };

  const startCountdown = () => {
    if (
      cameraReady &&
      !recording &&
      countdown === null
    ) {
      setCountdown(
        countdownDuration
      );
    }
  };

  useEffect(() => {
    if (
      countdown !== null &&
      countdown > 0
    ) {
      countdownTimerRef.current =
        setTimeout(() => {
          setCountdown((p) =>
            p !== null ? p - 1 : null
          );
        }, 1000);
    }

    else if (countdown === 0) {
      setCountdown(null);

      beginRecording();
    }

    return () => {
      if (
        countdownTimerRef.current
      ) {
        clearTimeout(
          countdownTimerRef.current
        );
      }
    };
  }, [countdown]);

  useEffect(() => {
    if (recording) {
      recordTimerRef.current =
        setInterval(() => {
          setRecordTime(
            (p) => p + 1
          );
        }, 1000);
    }

    else {
      if (
        recordTimerRef.current
      ) {
        clearInterval(
          recordTimerRef.current
        );
      }
    }

    return () => {
      if (
        recordTimerRef.current
      ) {
        clearInterval(
          recordTimerRef.current
        );
      }
    };
  }, [recording]);

  useEffect(() => {
    return () => {
      stopCamera();

      if (
        countdownTimerRef.current
      ) {
        clearTimeout(
          countdownTimerRef.current
        );
      }

      if (
        recordTimerRef.current
      ) {
        clearInterval(
          recordTimerRef.current
        );
      }
    };
  }, []);

  return {
    videoPreviewRef,

    cameraReady,

    recording,

    recordTime,

    flashOn,

    countdown,

    countdownEnabled,
    setCountdownEnabled,

    countdownDuration,
    setCountdownDuration,

    startCamera,

    stopCamera,

    toggleFlash,

    startCountdown,

    beginRecording,

    handleStopRecording,
  };
}