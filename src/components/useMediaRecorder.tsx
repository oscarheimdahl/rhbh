import { useCallback, useRef, useState } from 'react';

const mimeType = MediaRecorder.isTypeSupported('video/mp4; codecs=h264')
  ? 'video/mp4; codecs=h264'
  : 'video/webm; codecs=vp8';

const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';

const preSnapshot = 1000;
const postSnapshot = 1000;

export function useMediaRecorder(stream: MediaStream | null) {
  const [capturing, setCapturing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const recordingStart = useRef<number | null>(null);
  const snapShotStart = useRef<number | null>(null);

  const startCapturing = useCallback(() => {
    if (!stream) return;
    setCapturing(true);

    snapShotStart.current = Date.now();
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType,
    });

    mediaRecorderRef.current.addEventListener('start', () => {
      recordingStart.current = Date.now();
    });

    mediaRecorderRef.current.addEventListener('dataavailable', ({ data }) => {
      saveClip(data);
    });

    mediaRecorderRef.current.start();
  }, [stream]);

  const stopCapturing = async () => {
    if (!mediaRecorderRef.current) return;
    snapShotStart.current = Date.now();

    // Delay
    await new Promise((resolve) => setTimeout(resolve, postSnapshot));

    mediaRecorderRef.current.requestData();
    setCapturing(false);
  };

  const saveClip = async (data: Blob) => {
    if (!mediaRecorderRef.current) return;
    const url = URL.createObjectURL(data);
    const recordingDuration = Date.now() - (recordingStart.current ?? 0);
    const snapshotTime = Date.now() - (snapShotStart.current ?? 0);

    const startTime = recordingDuration - snapshotTime - preSnapshot;
    const endTime = recordingDuration - snapshotTime + postSnapshot;

    downloadVideo(url);
    appendVideoToBody(url, startTime, endTime);
  };

  return { capturing, startCapturing, stopCapturing };
}

function downloadVideo(url: string) {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'react-webcam-stream-capture.' + ext;
  document.body.appendChild(a);
  a.click();
}

function appendVideoToBody(url: string, startTime: number, endTime: number) {
  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  video.autoplay = true;
  document.body.appendChild(video);

  video.addEventListener('loadedmetadata', () => {
    video.currentTime = startTime / 1000;
    video.play();
  });

  // stop at end
  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= endTime / 1000) {
      video.pause();
      video.currentTime = startTime / 1000; // optional: loop back to start
    }
  });
}
