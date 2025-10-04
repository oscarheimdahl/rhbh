import { useEffect, useRef, useState } from "react";

import { HEIGHT, WIDTH } from "../../utils/videoDimensions";

export function useWebCam(onLoad: (video: HTMLVideoElement) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startWebcam = async () => {
    if (!videoRef.current || stream) return;

    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: WIDTH },
          height: { ideal: HEIGHT },
          aspectRatio: HEIGHT / WIDTH,
          facingMode,
        },
        audio: false,
      });
      setStream(s);
      videoRef.current.srcObject = s;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.log);
        onLoad(videoRef.current!);
      };
      setIsActive(true);
    } catch (err) {
      console.error("Failed to start webcam:", err);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      setIsActive(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFacingMode = () => {
    stopWebcam();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(startWebcam);
    throw new Error("Not implemented yet");
  };

  return {
    startWebcam,
    stopWebcam,
    isActive,
    videoRef,
    stream,
    toggleFacingMode,
  };
}
