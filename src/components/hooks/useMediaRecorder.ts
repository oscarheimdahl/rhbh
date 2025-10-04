import { useCallback, useRef } from "react";

import type { ClipData } from "../Clip";

const mimeType = MediaRecorder.isTypeSupported("video/mp4; codecs=h264")
  ? "video/mp4; codecs=h264"
  : "video/webm; codecs=vp8";

const preSnapshot = 3000;
const postSnapshot = 3000;

export function useMediaRecorder(
  stream: MediaStream | null,
  onClipReady: (clipProps: ClipData) => void,
) {
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
    onClipReady({ url, startTime, endTime });
    // appendVideoToBody(url, startTime, endTime);

    startCapturing(); // reset and start a new recording
  };

  return { startCapturing, stopCapturing };
}
