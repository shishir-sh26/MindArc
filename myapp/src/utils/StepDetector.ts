export interface AccelSample {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export class StepDetector {
  // Config parameters
  private readonly alpha = 0.15; // Low-pass filter smoothing coefficient (EMA alpha)
  private readonly minVariance = 0.4; // Min peak-to-peak variance in m/s^2 (filters hand tremors/shake)
  private readonly minInterval = 200; // Min interval between steps (sprinting max cadence: 5 steps/sec)
  private readonly maxInterval = 2000; // Max interval between steps (slow walk min cadence: 0.5 steps/sec)
  private readonly lockCount = 6; // Number of consecutive steps to validate cadence rhythm
  private readonly hysteresis = 0.15; // Zero-crossing hysteresis boundary deadband (m/s^2)

  // Low pass filter state
  private smoothedMagnitude = 1.0;
  private hasInitializedFilter = false;

  // Rolling time window of samples (1000ms duration)
  private rollingWindow: { magnitude: number; timestamp: number }[] = [];
  
  // Previous smoothed magnitude for zero-crossing check
  private prevSmoothed = 1.0;

  // Dynamic Threshold average tracking
  private smoothedThreshold = 0.0;
  private hasInitializedThreshold = false;
  private isAboveThreshold = false;

  // State Machine parameters
  private state: 'SEARCHING' | 'LOCKED' = 'SEARCHING';
  private stepBuffer: number[] = []; // Timestamps of buffered steps before LOCK is established
  private lastStepTimestamp = 0;

  // Callback executed when valid steps are committed
  private onStepDetected: (stepsCount: number) => void;

  constructor(onStepDetected: (stepsCount: number) => void) {
    this.onStepDetected = onStepDetected;
  }

  /**
   * Resets the detector state machine and filter.
   */
  public reset() {
    this.state = 'SEARCHING';
    this.stepBuffer = [];
    this.rollingWindow = [];
    this.hasInitializedFilter = false;
    this.smoothedMagnitude = 1.0;
    this.prevSmoothed = 1.0;
    this.lastStepTimestamp = 0;
    this.smoothedThreshold = 0.0;
    this.hasInitializedThreshold = false;
    this.isAboveThreshold = false;
  }

  /**
   * Returns the current state of the rhythm state machine.
   */
  public getState(): 'SEARCHING' | 'LOCKED' {
    return this.state;
  }

  /**
   * Returns the number of currently buffered steps.
   */
  public getBufferLength(): number {
    return this.stepBuffer.length;
  }

  /**
   * Processes a new raw 3-axis accelerometer sample.
   * Acceleration is assumed to be in Gs or m/s^2.
   * If the input is in Gs, we multiply by 9.81 to convert to standard SI units (m/s^2) for peak-to-peak variance checks.
   * Let's determine the magnitude units: expo-sensors Accelerometer returns values in Gs (where 1G ~ 9.81 m/s^2).
   */
  public processSample(x: number, y: number, z: number, timestamp: number): boolean {
    // 1. Convert Gs to m/s^2 and calculate Euclidean vector norm magnitude
    const xMs2 = x * 9.80665;
    const yMs2 = y * 9.80665;
    const zMs2 = z * 9.80665;
    const magnitude = Math.sqrt(xMs2 * xMs2 + yMs2 * yMs2 + zMs2 * zMs2);

    // Cadence check: check if the inactivity timeout (2000ms) has been exceeded.
    // Run this first so that state is reset immediately on a post-pause sample.
    if (this.lastStepTimestamp > 0 && timestamp - this.lastStepTimestamp > this.maxInterval) {
      this.state = 'SEARCHING';
      this.stepBuffer = [];
      this.lastStepTimestamp = 0;
      this.isAboveThreshold = false;
    }

    // 2. Exponential Moving Average low pass filter
    if (!this.hasInitializedFilter) {
      this.smoothedMagnitude = magnitude;
      this.hasInitializedFilter = true;
      this.prevSmoothed = magnitude;
      return false;
    }

    const currentSmoothed = this.alpha * magnitude + (1 - this.alpha) * this.smoothedMagnitude;
    this.smoothedMagnitude = currentSmoothed;

    // 3. Update 1000ms rolling window
    this.rollingWindow.push({ magnitude: currentSmoothed, timestamp });
    while (this.rollingWindow.length > 0 && timestamp - this.rollingWindow[0].timestamp > 1000) {
      this.rollingWindow.shift();
    }

    if (this.rollingWindow.length < 5) {
      this.prevSmoothed = currentSmoothed;
      return false;
    }

    // 4. Compute dynamic threshold and variance (Max - Min)
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const sample of this.rollingWindow) {
      if (sample.magnitude < minVal) minVal = sample.magnitude;
      if (sample.magnitude > maxVal) maxVal = sample.magnitude;
    }

    const instantThreshold = (minVal + maxVal) / 2;
    const variance = maxVal - minVal;

    // Macro-rolling threshold smoothing
    if (!this.hasInitializedThreshold) {
      this.smoothedThreshold = instantThreshold;
      this.hasInitializedThreshold = true;
    } else {
      const thresholdAlpha = 0.05;
      this.smoothedThreshold = thresholdAlpha * instantThreshold + (1 - thresholdAlpha) * this.smoothedThreshold;
    }

    const threshold = this.smoothedThreshold;
    let stepsCommitted = false;

    // 5. Zero-crossing detection with hysteresis on negative slope
    if (currentSmoothed > threshold + this.hysteresis) {
      this.isAboveThreshold = true;
    } else if (this.isAboveThreshold && currentSmoothed < threshold - this.hysteresis) {
      this.isAboveThreshold = false;

      // Check variance threshold to filter out hand jitters/fidgets
      if (variance >= this.minVariance) {
        const timeDelta = this.lastStepTimestamp === 0 ? 1000 : (timestamp - this.lastStepTimestamp);

        // Verify that the step falls within valid human cadence interval limits (200ms to 2000ms)
        if (timeDelta >= this.minInterval && timeDelta <= this.maxInterval) {
          this.lastStepTimestamp = timestamp;

          if (this.state === 'SEARCHING') {
            this.stepBuffer.push(timestamp);

            if (this.stepBuffer.length >= this.lockCount) {
              // Transition to LOCKED state & flush buffer
              this.state = 'LOCKED';
              const countToCommit = this.stepBuffer.length;
              this.stepBuffer = [];
              this.onStepDetected(countToCommit);
              stepsCommitted = true;
            }
          } else {
            // Already LOCKED: commit step immediately (real-time step counter update)
            this.onStepDetected(1);
            stepsCommitted = true;
          }
        } else {
          // Cadence rhythm broken: reset search and establish new starting timestamp
          this.state = 'SEARCHING';
          this.stepBuffer = [];
          this.lastStepTimestamp = timestamp;
          this.stepBuffer.push(timestamp);
        }
      }
    }

    this.prevSmoothed = currentSmoothed;
    return stepsCommitted;
  }
}
