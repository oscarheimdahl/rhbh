import { useRef, useState } from "react";

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

import { Clip, type ClipData } from "./components/Clip.tsx";
import { WebCam, type WebCamHandle } from "./components/WebCam.tsx";
import { checkIfThrowing } from "./utils/checkIfThrowing.ts";
import { drawPose } from "./utils/pose.ts";
import { cn } from "./utils/utils.ts";
import { HEIGHT, WIDTH } from "./utils/videoDimensions.ts";

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

let drawPoseEnabled = false;

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
      if (drawPoseEnabled) drawPose(poseLandmarks, ctx);
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
  const webCamRef = useRef<WebCamHandle>(null);
  const canSnapshotRef = useRef(true);
  const [canvasDim, setCanvasDim] = useState({ width: WIDTH, height: HEIGHT });
  const [drawPoseEnabledState, setDrawPoseEnabledState] =
    useState(drawPoseEnabled);
  const [clip, setClip] = useState<ClipData | null>(null);

  const saveSnapshot = (data: SpeedData) => {
    if (!webCamRef.current) return;
    if (!canSnapshotRef.current) return;

    const shouldSnapshot = import.meta.env.PROD
      ? data.reachback
      : data.rightWristIsMostTopOfAllLandmarks;

    if (shouldSnapshot) {
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

    setCanvasDim({ width: video.videoWidth, height: video.videoHeight });
  };

  const toggleDrawPoseEnabled = () => {
    // Since we draw the pose outside of react we keep two pieces of state,
    // one to toggle the canvas (in react) and one to toggle the drawing (outside react)
    drawPoseEnabled = !drawPoseEnabled;
    setDrawPoseEnabledState(drawPoseEnabled);
  };

  return (
    <>
      <div className="flex h-full flex-col justify-center">
        <div className="grid items-center justify-center [&>*]:[grid-area:1/1]">
          <WebCam
            toggleDrawPoseEnabled={toggleDrawPoseEnabled}
            ref={webCamRef}
            onLoad={handleVideoLoad}
            onClipReady={setClip}
          />

          <canvas
            width={canvasDim.width}
            height={canvasDim.height}
            className={cn(
              "pointer-events-none z-10",
              !drawPoseEnabledState && "hidden",
            )}
            ref={canvasRef}
          />
        </div>
      </div>
      {clip && <Clip {...clip} onClose={() => setClip(null)} />}
    </>
  );
}

export default App;
