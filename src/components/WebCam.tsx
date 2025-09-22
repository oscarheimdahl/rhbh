import { useRef, useState, useEffect } from 'react';

export const WebCam = (props: {
  onLoad: (video: HTMLVideoElement) => void;
}) => {
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
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        },
        audio: false,
      });
      setStream(s);
      videoRef.current.srcObject = s;
      videoRef.current.onloadeddata = () => {
        videoRef.current?.play().catch(console.log);
        props.onLoad(videoRef.current!);
      };
    } catch (err) {
      console.error('Failed to start webcam:', err);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleWebcam = () => {
    if (isActive) {
      stopWebcam();
      setIsActive(false);
    } else {
      startWebcam();
      setIsActive(true);
    }
  };

  return (
    <div>
      <button onClick={toggleWebcam}>
        {isActive ? 'Stop Camera' : 'Start Camera'}
      </button>
      <video
        ref={videoRef}
        muted
        playsInline
        style={{ width: '100%', height: 'auto', marginTop: 8 }}
      />
    </div>
  );
};
