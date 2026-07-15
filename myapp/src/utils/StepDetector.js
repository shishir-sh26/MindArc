"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepDetector = void 0;
class StepDetector {
    constructor(onStepDetected) {
        // Config parameters
        this.alpha = 0.20; // Increased from 0.15 to 0.20 to reduce structural phase lag
        this.minVariance = 0.4; // Min peak-to-peak variance in m/s^2 (filters hand tremors/shake)
        this.minInterval = 200; // Min interval between steps (sprinting max cadence: 5 steps/sec)
        this.maxInterval = 1800; // Reduced from 2000ms to 1800ms for faster inactivity reset
        this.lockCount = 4; // Lowered lock count from 6 to 4 for snappy UI updates
        // Low pass filter state
        this.smoothedMagnitude = 1.0;
        this.hasInitializedFilter = false;
        this.prevSmoothed = 1.0;
        // Peak/Valley History Arrays (Pre-seeded with baseline walking values to avoid NaNs)
        // Standard gravity is 9.80665 m/s2. Baseline peaks ~11.0, baseline valleys ~8.5
        this.peakHistory = [11.0, 11.0, 11.0, 11.0];
        this.valleyHistory = [8.5, 8.5, 8.5, 8.5];
        // Dynamic tracking variables
        this.isAboveThreshold = false;
        this.isSlopePositive = true;
        this.currentExtremeVal = 9.8; // Tracks current search value for valley/peak extremes
        // State Machine parameters
        this.state = 'SEARCHING';
        this.stepBuffer = []; // Timestamps of buffered steps before LOCK is established
        this.lastStepTimestamp = 0;
        this.onStepDetected = onStepDetected;
    }
    /**
     * Resets the detector state machine and filter.
     */
    reset() {
        this.state = 'SEARCHING';
        this.stepBuffer = [];
        this.hasInitializedFilter = false;
        this.smoothedMagnitude = 1.0;
        this.prevSmoothed = 1.0;
        this.lastStepTimestamp = 0;
        this.peakHistory = [11.0, 11.0, 11.0, 11.0];
        this.valleyHistory = [8.5, 8.5, 8.5, 8.5];
        this.isAboveThreshold = false;
        this.isSlopePositive = true;
        this.currentExtremeVal = 9.8;
    }
    /**
     * Returns the current state of the rhythm state machine.
     */
    getState() {
        return this.state;
    }
    /**
     * Returns the number of currently buffered steps.
     */
    getBufferLength() {
        return this.stepBuffer.length;
    }
    /**
     * Processes a new raw 3-axis accelerometer sample.
     * Acceleration is assumed to be in Gs.
     */
    processSample(x, y, z, timestamp) {
        // 1. Convert Gs to m/s^2 and calculate Euclidean vector norm magnitude
        const xMs2 = x * 9.80665;
        const yMs2 = y * 9.80665;
        const zMs2 = z * 9.80665;
        const magnitude = Math.sqrt(xMs2 * xMs2 + yMs2 * yMs2 + zMs2 * zMs2);
        // Cadence check: check if the inactivity timeout (1800ms) has been exceeded.
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
        // Calculate adaptive dynamic hysteresis limit based on movement intensity
        const hysteresis = Math.max(0.12, (avgPeak - avgValley) / 3);
        // Track peaks and valleys continuously
        const slope = currentSmoothed - this.prevSmoothed;
        if (slope > 0) {
            if (!this.isSlopePositive) {
                // Local valley detected (slope changed from negative to positive)
                const valleyCandidate = this.currentExtremeVal;
                // Verify it's a realistic valley (below threshold) and add to valleyHistory
                if (valleyCandidate < threshold && valleyCandidate > 4.0) {
                    this.valleyHistory.push(valleyCandidate);
                    if (this.valleyHistory.length > 4)
                        this.valleyHistory.shift();
                }
                this.isSlopePositive = true;
                this.currentExtremeVal = currentSmoothed;
            }
            else {
                if (currentSmoothed > this.currentExtremeVal) {
                    this.currentExtremeVal = currentSmoothed;
                }
            }
        }
        else if (slope < 0) {
            if (this.isSlopePositive) {
                // Local peak detected (slope changed from positive to negative)
                const peakCandidate = this.currentExtremeVal;
                // Verify it's a realistic peak (above threshold) and add to peakHistory
                if (peakCandidate > threshold && peakCandidate < 22.0) {
                    this.peakHistory.push(peakCandidate);
                    if (this.peakHistory.length > 4)
                        this.peakHistory.shift();
                }
                this.isSlopePositive = false;
                this.currentExtremeVal = currentSmoothed;
            }
            else {
                if (currentSmoothed < this.currentExtremeVal) {
                    this.currentExtremeVal = currentSmoothed;
                }
            }
        }
        let stepsCommitted = false;
        // 4. Zero-crossing detection with hysteresis on negative slope
        if (currentSmoothed > threshold + hysteresis) {
            this.isAboveThreshold = true;
        }
        else if (this.isAboveThreshold && currentSmoothed < threshold - hysteresis) {
            this.isAboveThreshold = false;
            // Filter hand shakes / tremors by checking signal amplitude variance
            const variance = avgPeak - avgValley;
            if (variance >= this.minVariance) {
                const timeDelta = this.lastStepTimestamp === 0 ? 1000 : (timestamp - this.lastStepTimestamp);
                // Verify time delta is within valid walking/sprinting cadence intervals
                if (timeDelta >= this.minInterval && timeDelta <= this.maxInterval) {
                    this.lastStepTimestamp = timestamp;
                    if (this.state === 'SEARCHING') {
                        this.stepBuffer.push(timestamp);
                        if (this.stepBuffer.length >= this.lockCount) {
                            // Transition to LOCKED state & flush all 4 buffer steps instantly
                            this.state = 'LOCKED';
                            const countToCommit = this.stepBuffer.length;
                            this.stepBuffer = [];
                            this.onStepDetected(countToCommit);
                            stepsCommitted = true;
                        }
                    }
                    else {
                        // LOCKED state: commit stride immediately for instant UI response
                        this.onStepDetected(1);
                        stepsCommitted = true;
                    }
                }
                else {
                    // Cadence broken: drop lock and restart step search
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
exports.StepDetector = StepDetector;
