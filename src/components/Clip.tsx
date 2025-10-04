import { useState, type SyntheticEvent } from "react";

import { Loader, X } from "lucide-react";

import { cn } from "../utils/utils";

export type ClipData = {
  url: string;
  startTime: number;
  endTime: number;
};

type ClipProps = ClipData & {
  onClose: () => void;
};

export const Clip = (props: ClipProps) => {
  const [loading, setLoading] = useState(true);
  const startTime = props.startTime / 1000;
  const endTime = props.endTime / 1000;

  const handleLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    video.currentTime = startTime;
    video.play();
    video.playbackRate = 15;
    setLoading(true);
  };

  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;

    if (video.currentTime < startTime) {
      video.currentTime = startTime;
    }
    if (video.currentTime >= endTime - 0.1) {
      video.currentTime = startTime;
    }
    if (video.currentTime >= startTime && video.currentTime < endTime) {
      video.playbackRate = 1;
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) props.onClose();
        }}
        className="fixed inset-0 bg-black opacity-50"
      ></div>
      {loading && (
        <Loader
          style={{ animationDuration: "2s" }}
          className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 animate-spin text-white duration-1000"
        />
      )}
      <div className="absolute top-1/2 left-1/2 size-fit -translate-x-1/2 -translate-y-1/2">
        <video
          playsInline
          autoPlay
          muted
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={(e) => e.currentTarget.play()}
          src={props.url}
          className={cn(
            "max-h-[calc(100dvh-2rem)] w-dvh max-w-[calc(100dvw-2rem)] rounded-md",
            loading && "opacity-0",
          )}
        />
        <button className="absolute top-0 right-0 m-2" onClick={props.onClose}>
          <X />
        </button>
      </div>
    </>
  );
};
