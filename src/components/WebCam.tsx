import { forwardRef, useImperativeHandle, type Ref } from "react";

import { Camera, PersonStanding, SwitchCamera } from "lucide-react";

import { HEIGHT, WIDTH } from "../App";
import { cn } from "../utils/utils";
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
  const {
    startWebcam,
    stopWebcam,
    isActive,
    videoRef,
    stream,
    toggleFacingMode,
  } = useWebCam(props.onLoad);
  const { startCapturing, stopCapturing } = useMediaRecorder(
    stream,
    props.onClipReady,
  );

  useImperativeHandle(ref, () => ({
    startCapturing,
    stopCapturing,
  }));

  const toggleWebcam = () => {
    if (isActive) stopWebcam();
    else startWebcam();
  };

  return (
    <>
      <div className={cn("relative", !isActive && "hidden")}>
        <video
          width={WIDTH}
          height={HEIGHT}
          style={{ width: WIDTH + "px", height: HEIGHT + "px" }}
          className={cn("mx-auto rounded-md shadow-md")}
          ref={videoRef}
          muted
          playsInline
        />
        <div className="absolute top-0 right-0 m-2 flex flex-col gap-2">
          <button
            disabled
            className="rounded-md bg-indigo-600 p-1 text-white opacity-50"
            onClick={toggleFacingMode}
          >
            <SwitchCamera />
          </button>
          <button
            className="rounded-md bg-indigo-600 p-1 text-white"
            onClick={props.toggleDrawPoseEnabled}
          >
            <PersonStanding />
          </button>
        </div>
      </div>
      {!isActive && (
        <button
          onClick={toggleWebcam}
          className="group mx-auto grid items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-white shadow-sm active:translate-y-0.5 [&>*]:[grid-area:1/1]"
        >
          <Camera
            className="mx-auto text-indigo-900 transition-colors delay-1000 duration-500 group-hover:text-white group-hover:delay-0 group-hover:duration-150"
            size={36}
          />
          <span className="transition-opacity delay-1000 duration-500 group-hover:opacity-0 group-hover:delay-0 group-hover:duration-150">
            Start Camera
          </span>
        </button>
      )}
    </>
  );
};

export const WebCam = forwardRef<WebCamHandle, WebCamProps>(WebCamInner);
