import { useCallback, useRef } from "react";

const mimeType = MediaRecorder.isTypeSupported("video/mp4; codecs=h264")
  ? "video/mp4; codecs=h264"
  : "video/webm; codecs=vp8";

const preSnapshot = 1000;
const postSnapshot = 1000;

export function useMediaRecorder(stream: MediaStream | null) {
  // const [capturing, setCapturing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStart = useRef<number | null>(null);
  const snapShotStart = useRef<number | null>(null);

  const startCapturing = useCallback(() => {
    if (!stream) return;
    // setCapturing(true);

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType,
    });

    mediaRecorderRef.current.addEventListener("start", () => {
      recordingStart.current = Date.now();
    });

    mediaRecorderRef.current.addEventListener("dataavailable", ({ data }) => {
      saveClip(data);
    });

    stream.addEventListener("removetrack", () => {
      console.log(`🔴`);
    });

    mediaRecorderRef.current.start();
  }, [stream]);

  const stopCapturing = async () => {
    if (!mediaRecorderRef.current) return;
    if (snapShotStart.current !== null) return;
    snapShotStart.current = Date.now();

    await new Promise((resolve) => setTimeout(resolve, postSnapshot));

    mediaRecorderRef.current.requestData();
    // setCapturing(false);
  };

  const saveClip = async (data: Blob) => {
    if (!mediaRecorderRef.current) return;

    const url = URL.createObjectURL(data);
    const recordingDuration = Date.now() - (recordingStart.current ?? 0);
    const snapshotTime = Date.now() - (snapShotStart.current ?? 0);

    const startTime = recordingDuration - snapshotTime - preSnapshot;
    const endTime = recordingDuration - snapshotTime + postSnapshot;

    snapShotStart.current = null;
    appendVideoToBody(url, startTime, endTime);

    startCapturing(); // reset and start a new recording
  };

  return { startCapturing, stopCapturing };
}

// const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
// function downloadVideo(url: string) {
//   const a = document.createElement('a');
//   a.style.display = 'none';
//   a.href = url;
//   a.download = 'react-webcam-stream-capture.' + ext;
//   document.body.appendChild(a);
//   a.click();
// }

function appendVideoToBody(url: string, startTime: number, endTime: number) {
  const video = document.createElement("video");
  video.src = url;
  video.autoplay = true;
  video.playbackRate = 10;
  video.muted = true;

  video.style.position = "fixed";
  video.style.top = "0";
  video.style.maxWidth = "300px";
  video.style.opacity = "0";

  document.body.appendChild(video);

  video.addEventListener("loadedmetadata", () => {
    video.currentTime = startTime / 1000;
    video.playbackRate = 1;
    video.play();
  });

  // stop at end
  video.addEventListener("timeupdate", () => {
    if (video.currentTime < startTime / 1000) {
      video.currentTime = startTime / 1000;
    }
    if (video.currentTime >= endTime / 1000 - 0.1) {
      video.currentTime = startTime / 1000;
    }
    if (
      video.currentTime >= startTime / 1000 &&
      video.currentTime < endTime / 1000
    ) {
      video.style.opacity = "1";
    }
  });

  video.addEventListener("ended", () => {
    video.play();
  });

  video.addEventListener("click", () => {
    video.play();
  });

  video.addEventListener("dblclick", () => {
    video.remove();
  });
}
