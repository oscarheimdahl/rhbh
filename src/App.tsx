import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { useRef, useState } from 'react';
import { PrerecordedVideo } from './components/PrerecordedVideo.tsx';
import { WebCam } from './components/WebCam.tsx';
import { checkIfThrowing } from './utils/checkIfThrowing.ts';
import { drawPose } from './utils/pose.ts';

const vision = await FilesetResolver.forVisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
);

const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
    delegate: 'GPU',
  },
  runningMode: 'VIDEO',
  numPoses: 1,
});

type SpeedData = ReturnType<typeof checkIfThrowing>;

const processVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  cb: (speed: SpeedData) => void
) => {
  const ctx = canvas.getContext('2d')!;
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
      const frameTime = video.currentTime;
      const data = checkIfThrowing(poseLandmarks);
      cb(data);
      if (data.reachback) console.log(frameTime);
    }

    animationId = requestAnimationFrame(processFrame);
  };

  processFrame();

  return () => cancelAnimationFrame(animationId);
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopRef = useRef<() => void>(() => {});
  const [src, setSrc] = useState<'webcam' | 'video' | undefined>(undefined);
  const [data, setData] = useState<SpeedData | null>(null);

  const handleVideoLoad = async (video: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    stopRef.current?.();

    stopRef.current = await processVideo(video, canvas, (num) => setData(num));
    // video.style.width = width + 'px';
    // video.style.height = height + 'px';
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    canvas.style.width = videoWidth + 'px';
    canvas.style.height = videoHeight + 'px';
    canvas.width = videoWidth;
    canvas.height = videoHeight;
  };

  return (
    <div className='h-full flex flex-col justify-center'>
      <div className='grid [&>*]:[grid-area:1/1] justify-center items-center'>
        {src === 'video' && <PrerecordedVideo onLoad={handleVideoLoad} />}
        {src === 'webcam' && <WebCam onLoad={handleVideoLoad} />}
        <canvas className='pointer-events-none' ref={canvasRef} />
      </div>
      {data && (
        <div className='mx-auto'>
          <div>Reachback: {data.reachback ? '🟢' : '🔴'}</div>
        </div>
      )}
      <div className='flex gap-4 mx-auto mt-4'>
        <button
          className='border rounded-md p-1 w-32'
          onClick={() => setSrc('webcam')}
        >
          Use Webcam
        </button>
        <button
          className='border rounded-md p-1 w-32'
          onClick={() => setSrc('video')}
        >
          Use Video
        </button>
      </div>
    </div>
  );
}

export default App;
