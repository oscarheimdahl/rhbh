import { useRef } from "react";

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

import { WebCam, type WebCamHandle } from "./components/WebCam.tsx";
import { checkIfThrowing } from "./utils/checkIfThrowing.ts";
import { drawPose } from "./utils/pose.ts";

export const WIDTH = Math.min(1200, window.innerWidth - 16 * 2);

const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
);

const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
    delegate: "GPU",
  },
  runningMode: "VIDEO",
  numPoses: 1,
});

type SpeedData = ReturnType<typeof checkIfThrowing>;

const processVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  cb: (speed: SpeedData) => void,
) => {
  const ctx = canvas.getContext("2d")!;
  let animationId: number;
  const processFrame = async () => {
    if (video.readyState < 2) {
      animationId = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();
    const results = poseLandmarker.detectForVideo(video, now);
    const poseLandmarks = results.landmarks?.at(0);

    if (poseLandmarks) {
      drawPose(poseLandmarks, ctx);
      const data = checkIfThrowing(poseLandmarks);
      cb(data);
    }

    animationId = requestAnimationFrame(processFrame);
  };

  processFrame();

  return () => cancelAnimationFrame(animationId);
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopRef = useRef<() => void>(() => {});
  // const [src, setSrc] = useState<'webcam' | 'video' | undefined>('webcam');
  const webCamRef = useRef<WebCamHandle>(null);
  const canSnapshotRef = useRef(true);

  const saveSnapshot = (data: SpeedData) => {
    if (!webCamRef.current) return;
    if (!canSnapshotRef.current) return;

    // if (data.reachback) {
    if (data.rightWristIsMostTopOfAllLandmarks) {
      canSnapshotRef.current = false;
      setTimeout(() => (canSnapshotRef.current = true), 3000);
      webCamRef.current.stopCapturing();
    }
  };

  const handleVideoLoad = async (video: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    stopRef.current?.();
    stopRef.current = await processVideo(video, canvas, saveSnapshot);
    webCamRef.current?.startCapturing();
  };

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="grid items-center justify-center [&>*]:[grid-area:1/1]">
        <WebCam ref={webCamRef} onLoad={handleVideoLoad} />
        <canvas
          style={{ width: WIDTH + "px", height: WIDTH / (4 / 3) + "px" }}
          className="pointer-events-none"
          ref={canvasRef}
        />
      </div>
    </div>
  );
}

export default App;
