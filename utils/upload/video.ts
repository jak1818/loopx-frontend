export async function getVideoDuration(
  file: File
): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);

      resolve(video.duration);
    };

    video.src = URL.createObjectURL(file);
  });
}

export async function mixVideoWithAudio(
  videoFile: File,
  musicUrl: string
): Promise<Blob> {
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

  const audioBuffer =
    await audioCtx.decodeAudioData(buf);

  const source =
    audioCtx.createBufferSource();

  source.buffer = audioBuffer;

  source.loop = true;

  const dest =
    audioCtx.createMediaStreamDestination();

  source.connect(dest);

  const canvasStream =
    canvas.captureStream(30);

  const combinedStream =
    new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

  const recorder = new MediaRecorder(
    combinedStream,
    {
      mimeType: "video/webm",
    }
  );

  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) =>
    chunks.push(e.data);

  video.play();

  source.start(0);

  recorder.start();

  const draw = () => {
    if (video.ended || video.paused) {
      recorder.stop();

      return;
    }

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    requestAnimationFrame(draw);
  };

  draw();

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, {
        type: "video/webm",
      });

      resolve(blob);
    };

    video.onended = () =>
      recorder.stop();
  });
}

export async function stitchVideos(
  segmentUrls: string[]
): Promise<Blob> {
  const videos: HTMLVideoElement[] = [];

  for (const url of segmentUrls) {
    const video =
      document.createElement("video");

    video.src = url;

    video.muted = true;

    video.preload = "auto";

    await new Promise<void>(
      (resolve, reject) => {
        video.onloadedmetadata = () =>
          resolve();

        video.onerror = reject;
      }
    );

    videos.push(video);
  }

  const width = 1080;

  const height = 1920;

  const canvas =
    document.createElement("canvas");

  canvas.width = width;

  canvas.height = height;

  const ctx = canvas.getContext("2d")!;

  const stream =
    canvas.captureStream(30);

  const recorder = new MediaRecorder(
    stream,
    {
      mimeType:
        "video/webm; codecs=vp9",
    }
  );

  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) =>
    chunks.push(e.data);

  let currentVideoIndex = 0;

  let currentVideo = videos[0];

  currentVideo.play().catch(() => {});

  recorder.start();

  const draw = () => {
    if (
      currentVideoIndex >= videos.length
    ) {
      recorder.stop();

      return;
    }

    if (
      currentVideo.ended ||
      currentVideo.paused
    ) {
      currentVideoIndex++;

      if (
        currentVideoIndex < videos.length
      ) {
        currentVideo =
          videos[currentVideoIndex];

        currentVideo.currentTime = 0;

        currentVideo
          .play()
          .catch(() => {});

        requestAnimationFrame(draw);

        return;
      } else {
        recorder.stop();

        return;
      }
    }

    ctx.drawImage(
      currentVideo,
      0,
      0,
      width,
      height
    );

    requestAnimationFrame(draw);
  };

  draw();

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, {
        type: "video/webm",
      });

      resolve(blob);
    };
  });
}