export interface AccelSample {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export class StepDetector {
  // Config parameters — tuned for real-world gentle walking
  private readonly alpha = 0.12; // Lower = less smoothing = preserves more signal amplitude
  private readonly minVariance = 0.15; // Min peak-to-valley range in m/s² (was 0.4, too aggressive)
  private readonly minInterval = 200; // Min interval between steps (sprinting max cadence: 5 steps/sec)
  private readonly maxInterval = 2500; // Max interval between steps — generous for slow walkers
  private readonly lockCount = 2; // Steps needed before committing — reduced from 4 for snappy response

  // Low pass filter state
  private smoothedMagnitude = 9.81;
  private hasInitializedFilter = false;
  private prevSmoothed = 9.81;

  // Peak/Valley History Arrays
  // Pre-seeded closer together so the initial threshold is easier to cross
  private peakHistory: number[] = [10.2, 10.2, 10.2, 10.2];
  private valleyHistory: number[] = [9.4, 9.4, 9.4, 9.4];

  // Dynamic tracking variables
  private isAboveThreshold = false;
  private isSlopePositive = true;
  private currentExtremeVal = 9.81;

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
    this.hasInitializedFilter = false;
    this.smoothedMagnitude = 9.81;
    this.prevSmoothed = 9.81;
    this.lastStepTimestamp = 0;
    this.peakHistory = [10.2, 10.2, 10.2, 10.2];
    this.valleyHistory = [9.4, 9.4, 9.4, 9.4];
    this.isAboveThreshold = false;
    this.isSlopePositive = true;
    this.currentExtremeVal = 9.81;
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
   * Acceleration is assumed to be in Gs (Expo Accelerometer standard).
   */
  public processSample(x: number, y: number, z: number, timestamp: number): boolean {
    // 1. Convert Gs to m/s² and calculate Euclidean vector norm magnitude
    const xMs2 = x * 9.80665;
    const yMs2 = y * 9.80665;
    const zMs2 = z * 9.80665;
    const magnitude = Math.sqrt(xMs2 * xMs2 + yMs2 * yMs2 + zMs2 * zMs2);

    // Cadence check: check if the inactivity timeout has been exceeded
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
      this.currentExtremeVal = magnitude;
      return false;
    }

    const currentSmoothed = this.alpha * magnitude + (1 - this.alpha) * this.smoothedMagnitude;
    this.smoothedMagnitude = currentSmoothed;

    // 3. Compute dynamic threshold as midpoint of historical peak/valley averages
    const avgPeak = this.peakHistory.reduce((a, b) => a + b, 0) / this.peakHistory.length;
    const avgValley = this.valleyHistory.reduce((a, b) => a + b, 0) / this.valleyHistory.length;
    const threshold = (avgPeak + avgValley) / 2;

    // Calculate adaptive dynamic hysteresis — use /5 instead of /3 for easier crossing
    const variance = avgPeak - avgValley;
    const hysteresis = Math.max(0.04, variance / 5);

    // Track peaks and valleys continuously
    const slope = currentSmoothed - this.prevSmoothed;
    if (slope > 0) {
      if (!this.isSlopePositive) {
        // Local valley detected (slope changed from negative to positive)
        const valleyCandidate = this.currentExtremeVal;
        if (valleyCandidate < threshold && valleyCandidate > 4.0) {
          this.valleyHistory.push(valleyCandidate);
          if (this.valleyHistory.length > 4) this.valleyHistory.shift();
        }
        this.isSlopePositive = true;
        this.currentExtremeVal = currentSmoothed;
      } else {
        if (currentSmoothed > this.currentExtremeVal) {
          this.currentExtremeVal = currentSmoothed;
        }
      }
    } else if (slope < 0) {
      if (this.isSlopePositive) {
        // Local peak detected (slope changed from positive to negative)
        const peakCandidate = this.currentExtremeVal;
        if (peakCandidate > threshold && peakCandidate < 22.0) {
          this.peakHistory.push(peakCandidate);
          if (this.peakHistory.length > 4) this.peakHistory.shift();
        }
        this.isSlopePositive = false;
        this.currentExtremeVal = currentSmoothed;
      } else {
        if (currentSmoothed < this.currentExtremeVal) {
          this.currentExtremeVal = currentSmoothed;
        }
      }
    }

    let stepsCommitted = false;

    // 4. Zero-crossing detection with hysteresis on negative slope
    if (currentSmoothed > threshold + hysteresis) {
      this.isAboveThreshold = true;
    } else if (this.isAboveThreshold && currentSmoothed < threshold - hysteresis) {
      this.isAboveThreshold = false;

      // Filter hand shakes / tremors by checking signal amplitude variance
      if (variance >= this.minVariance) {
        const timeDelta = this.lastStepTimestamp === 0 ? 1000 : (timestamp - this.lastStepTimestamp);

        // Verify time delta is within valid walking/sprinting cadence intervals
        if (timeDelta >= this.minInterval && timeDelta <= this.maxInterval) {
          this.lastStepTimestamp = timestamp;

          if (this.state === 'SEARCHING') {
            this.stepBuffer.push(timestamp);

            if (this.stepBuffer.length >= this.lockCount) {
              // Transition to LOCKED state & flush all buffered steps instantly
              this.state = 'LOCKED';
              const countToCommit = this.stepBuffer.length;
              this.stepBuffer = [];
              this.onStepDetected(countToCommit);
              stepsCommitted = true;
            }
          } else {
            // LOCKED state: commit stride immediately for instant UI response
            this.onStepDetected(1);
            stepsCommitted = true;
          }
        } else if (timeDelta > this.maxInterval) {
          // Cadence broken: drop lock and restart step search
          this.state = 'SEARCHING';
          this.stepBuffer = [];
          this.lastStepTimestamp = timestamp;
          this.stepBuffer.push(timestamp);
        } else {
          // Too fast (timeDelta < minInterval): ignore this crossing
        }
      }
    }

    this.prevSmoothed = currentSmoothed;
    return stepsCommitted;
  }
}

