import { forwardRef, useImperativeHandle, type Ref } from "react";

import { Camera, Circle, PersonStanding, SwitchCamera } from "lucide-react";

import { cn } from "../utils/utils";
import { HEIGHT, WIDTH } from "../utils/videoDimensions";
import type { ClipData } from "./Clip";
import { useMediaRecorder } from "./hooks/useMediaRecorder";
import { useWebCam } from "./hooks/useWebCam";

export type WebCamHandle = {
  startCapturing: () => void;
  stopCapturing: () => void;
};

type WebCamProps = {
  onLoad: (video: HTMLVideoElement) => void;
  toggleDrawPoseEnabled: () => void;
  onClipReady: (clipProps: ClipData) => void;
};

const WebCamInner = (props: WebCamProps, ref: Ref<WebCamHandle>) => {
  const { startWebcam, isActive, videoRef, stream, toggleFacingMode } =
    useWebCam(props.onLoad);
  const { startCapturing, stopCapturing } = useMediaRecorder(
    stream,
    props.onClipReady,
  );

  useImperativeHandle(ref, () => ({
    startCapturing,
    stopCapturing,
  }));

  return (
    <>
      <div className={cn("relative mx-4", !isActive && "hidden")}>
        <video
          width={WIDTH}
          height={HEIGHT}
          className={cn("rounded-md shadow-md")}
          ref={videoRef}
          muted
          playsInline
        />
        <div className="absolute top-0 left-0 m-2 animate-pulse">
          <RedCircle />
        </div>
        <div className="absolute top-0 right-0 m-2 flex flex-col gap-2">
          <button
            disabled
            className="rounded-md bg-neutral-600 p-1 text-white opacity-50"
            onClick={toggleFacingMode}
          >
            <SwitchCamera />
          </button>
          <button
            className="rounded-md bg-neutral-600 p-1 text-white"
            onClick={props.toggleDrawPoseEnabled}
          >
            <PersonStanding />
          </button>
        </div>
      </div>
      {!isActive && (
        <button
          className="group flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-700 px-4 py-2 text-white shadow-md hover:shadow-none"
          onClick={startWebcam}
        >
          <span className="text-xl">Start </span>
          <Camera />
        </button>
      )}
    </>
  );
};

export const RedCircle = () => {
  return (
    <Circle
      className={cn(
        "fill-red-700 stroke-red-600 transition-colors group-hover:fill-red-800 group-hover:stroke-red-500",
      )}
    />
  );
};

export const WebCam = forwardRef<WebCamHandle, WebCamProps>(WebCamInner);
