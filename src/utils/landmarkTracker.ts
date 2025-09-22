import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

type Point = { x: number; y: number };

export class LandmarkTracker {
  private buffer: NormalizedLandmark[] = [];
  private prevAvg: Point | null = null;
  private maxFrames: number; // window size
  private dx: number = 0;

  public landMarkId: number;
  public speed: number = 0;
  public avg: Point = { x: 0, y: 0 };

  constructor(landMarkId: number, maxFrames = 10) {
    this.maxFrames = maxFrames;
    this.landMarkId = landMarkId;
  }

  update(newPoint: NormalizedLandmark) {
    this.buffer.push(newPoint);
    if (this.buffer.length > this.maxFrames) {
      this.buffer.shift();
    }

    const sum = this.buffer.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    this.avg = {
      x: sum.x / this.buffer.length,
      y: sum.y / this.buffer.length,
      // z: this.avg.z / this.buffer.length,
    };

    this.speed = 0;
    this.dx = 0;
    if (this.prevAvg) {
      this.dx = this.avg.x - this.prevAvg.x;
      const dy = this.avg.y - this.prevAvg.y;
      const distance = Math.sqrt(this.dx * this.dx + dy * dy);
      // Only care for relative speed, so no need to divide by time difference
      this.speed = distance;
    }

    this.prevAvg = this.avg;
  }
}
