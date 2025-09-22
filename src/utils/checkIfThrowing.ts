import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { LandmarkTracker } from './landmarkTracker';
import { LANDMARKS } from './landmarks';

const trackers = {
  nose: new LandmarkTracker(LANDMARKS.NOSE),
  rightWrist: new LandmarkTracker(LANDMARKS.RIGHT_WRIST),
  leftWrist: new LandmarkTracker(LANDMARKS.LEFT_WRIST),

  rightElbow: new LandmarkTracker(LANDMARKS.RIGHT_ELBOW),
  leftElbow: new LandmarkTracker(LANDMARKS.LEFT_ELBOW),

  rightShoulder: new LandmarkTracker(LANDMARKS.RIGHT_SHOULDER),
  leftShoulder: new LandmarkTracker(LANDMARKS.LEFT_SHOULDER),

  rightHip: new LandmarkTracker(LANDMARKS.RIGHT_HIP),
  leftHip: new LandmarkTracker(LANDMARKS.LEFT_HIP),

  rightAnkle: new LandmarkTracker(LANDMARKS.RIGHT_ANKLE),
  leftAnkle: new LandmarkTracker(LANDMARKS.LEFT_ANKLE),
} as const;

export function checkIfThrowing(poseLandmarks: NormalizedLandmark[]) {
  Object.values(trackers).forEach((tracker) => {
    tracker.update(poseLandmarks[tracker.landMarkId]);
  });

  return {
    ...isReachback(trackers),
  };
}

function isReachback(t: typeof trackers) {
  const rightWristX = t.rightWrist.avg.x;
  const rightElbowX = t.rightElbow.avg.x;
  const rightShoulderX = t.rightShoulder.avg.x;

  const leftWristX = t.leftWrist.avg.x;
  const leftShoulderX = t.leftShoulder.avg.x;

  const rightWristLeftOfLeftWrist = rightWristX > leftWristX;
  const rightWristLeftOfRightElbox = rightWristX > rightElbowX;
  const rightElbowLeftOfRightShoulder = rightElbowX > rightShoulderX;
  const rightWristLeftOfLeftShoulder = rightWristX > leftShoulderX;
  const rightShoulderRightOfLeftShoulder = rightShoulderX < leftShoulderX;

  const rightAnkleIsMostRightOfAllLandmarks = Object.values(t).every(
    (tracker) => t.rightAnkle.avg.x <= tracker.avg.x
  );

  const reachback =
    rightWristLeftOfLeftWrist &&
    rightWristLeftOfRightElbox &&
    rightElbowLeftOfRightShoulder &&
    rightWristLeftOfLeftShoulder &&
    rightShoulderRightOfLeftShoulder &&
    rightAnkleIsMostRightOfAllLandmarks;

  return {
    wristRightOfBody: rightWristLeftOfLeftShoulder,
    reachback,
    rightAnkleX: t.rightAnkle.avg.x,
    rightWristX: rightWristX,
    rightAnkleIsMostRightOfAllLandmarks,
  };
}
