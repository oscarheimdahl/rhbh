import { useRef } from 'react';

import video from '../assets/bh4.mov';
export const PrerecordedVideo = (props: {
  onLoad: (video: HTMLVideoElement) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <video
      onLoadedData={() => {
        const video = videoRef.current;
        if (!video) return;
        console.log('STARTING VIDEO');
        props.onLoad(video);
      }}
      controls
      autoPlay
      playsInline
      muted
      loop
      ref={videoRef}
    >
      <source src={video} type='video/mp4' />
    </video>
  );
};
