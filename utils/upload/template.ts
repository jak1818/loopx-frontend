export const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  const iw = img.width;
  const ih = img.height;

  const scale = Math.max(w / iw, h / ih);

  const sw = iw * scale;
  const sh = ih * scale;

  const sx = (w - sw) / 2;
  const sy = (h - sh) / 2;

  ctx.drawImage(
    img,
    0,
    0,
    iw,
    ih,
    sx,
    sy,
    sw,
    sh
  );
};

interface TemplateSynthesizeOptions {
  templatePhotos: File[];

  templateStyle: string | null;

  reviewBGM?: string;

  outputName: string;
}

const loadImages = async (
  files: File[]
): Promise<HTMLImageElement[]> => {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<HTMLImageElement>(
          (resolve, reject) => {
            const img = new Image();

            img.onload = () =>
              resolve(img);

            img.onerror = reject;

            img.src =
              URL.createObjectURL(file);
          }
        )
    )
  );
};

const buildAudioStream = async (
  reviewBGM?: string
) => {
  if (!reviewBGM) return null;

  try {
    const res = await fetch(reviewBGM);

    const buf = await res.arrayBuffer();

    const audioCtx =
      new AudioContext();

    const audioBuffer =
      await audioCtx.decodeAudioData(
        buf
      );

    const source =
      audioCtx.createBufferSource();

    source.buffer = audioBuffer;

    source.loop = true;

    const audioDest =
      audioCtx.createMediaStreamDestination();

    source.connect(audioDest);

    source.start(0);

    return {
      audioCtx,
      audioDest,
    };
  } catch (e) {
    console.warn(
      "BGM build failed",
      e
    );

    return null;
  }
};

export const synthesizeMemoryTemplate =
  async ({
    templatePhotos,
    templateStyle,
    reviewBGM,
    outputName,
  }: TemplateSynthesizeOptions): Promise<Blob> => {
    const canvas =
      document.createElement("canvas");

    canvas.width = 1080;

    canvas.height = 1920;

    const ctx =
      canvas.getContext("2d")!;

    const stream =
      canvas.captureStream(30);

    const images =
      await loadImages(
        templatePhotos
      );

    let combinedStream: MediaStream =
      stream;

    const audio =
      await buildAudioStream(
        reviewBGM
      );

    if (audio) {
      combinedStream =
        new MediaStream([
          ...stream.getVideoTracks(),
          ...audio.audioDest.stream.getAudioTracks(),
        ]);
    }

    const recorder =
      new MediaRecorder(
        combinedStream,
        {
          mimeType:
            "video/webm; codecs=vp9",
        }
      );

    const chunks: Blob[] = [];

    recorder.ondataavailable = (
      e
    ) => chunks.push(e.data);

    recorder.start();

    const frameRate = 30;

    const durationPerPhoto = 2.5;

    const totalDuration =
      images.length *
      durationPerPhoto;

    let currentTime = 0;

    const draw = () => {
      if (
        currentTime >=
        totalDuration
      ) {
        recorder.stop();

        return;
      }

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.fillStyle = "#000";

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const idx = Math.floor(
        currentTime /
          durationPerPhoto
      );

      const progress =
        (currentTime %
          durationPerPhoto) /
        durationPerPhoto;

      const nextIdx = Math.min(
        idx + 1,
        images.length - 1
      );

      if (images[idx]) {
        ctx.globalAlpha =
          progress > 0.7
            ? 1 -
              (progress - 0.7) /
                0.3
            : 1;

        drawImageCover(
          ctx,
          images[idx],
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      if (
        images[nextIdx] &&
        progress > 0.7
      ) {
        ctx.globalAlpha =
          (progress - 0.7) /
          0.3;

        drawImageCover(
          ctx,
          images[nextIdx],
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      ctx.globalAlpha = 1;

      if (
        templateStyle ===
        "classic"
      ) {
        ctx.fillStyle =
          "rgba(255,255,255,0.9)";

        ctx.font =
          "bold 48px serif";

        ctx.textAlign =
          "center";

        ctx.fillText(
          "Memory",
          canvas.width / 2,
          150
        );
      }

      currentTime +=
        1 / frameRate;

      requestAnimationFrame(
        draw
      );
    };

    draw();

    return new Promise(
      (resolve) => {
        recorder.onstop = () => {
          resolve(
            new Blob(chunks, {
              type: "video/webm",
            })
          );
        };
      }
    );
  };