import { useEffect, useRef, useState } from 'react';
import { useMediaRecorder } from './useMediaRecorder';

export const WebCam = (props: {
  onLoad: (video: HTMLVideoElement) => void;
}) => {
  const { startWebcam, stopWebcam, isActive, videoRef, stream } = useWebCam(
    props.onLoad
  );
  const { capturing, startCapturing, stopCapturing } = useMediaRecorder(stream);

  useEffect(() => {
    if (isActive) startCapturing();
  }, [isActive, startCapturing]);

  const toggleWebcam = () => {
    if (isActive) stopWebcam();
    else startWebcam();
  };

  return (
    <div>
      <video className='max-w-full' ref={videoRef} muted playsInline />
      <button
        className='p-1 rounded-md border active:opacity-50 absolute'
        onClick={toggleWebcam}
      >
        {isActive ? 'Stop Camera' : 'Start Camera'}
      </button>
      <button
        className='p-1 rounded-md border active:opacity-50 absolute translate-x-full'
        onClick={capturing ? stopCapturing : startCapturing}
      >
        {capturing ? 'Stop Capture' : 'Start Capture'}
      </button>
    </div>
  );
};

function useWebCam(onLoad: (video: HTMLVideoElement) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);

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
          width: { ideal: window.innerWidth },
          height: { ideal: (window.innerHeight * 4) / 3 },
          facingMode: 'environment',
        },
        audio: false,
      });
      setStream(s);
      videoRef.current.srcObject = s;
      videoRef.current.onloadeddata = () => {
        videoRef.current?.play().catch(console.log);
        onLoad(videoRef.current!);
      };
      setIsActive(true);
    } catch (err) {
      console.error('Failed to start webcam:', err);
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

  return { startWebcam, stopWebcam, isActive, videoRef, stream };
}
