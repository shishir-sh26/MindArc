"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StepDetector_1 = require("./StepDetector");
function runTests() {
    console.log('=== RUNNING STEP DETECTOR DSP & STATE MACHINE TESTS ===');
    let testFailures = 0;
    // Helper assert function
    const assertEquals = (actual, expected, testName) => {
        if (actual === expected) {
            console.log(`[PASS] ${testName}`);
        }
        else {
            console.error(`[FAIL] ${testName}: Expected ${expected}, got ${actual}`);
            testFailures++;
        }
    };
    // Test Case 1: Rhythmic Step Sequence Verification
    (() => {
        console.log('\n--- Test 1: Rhythmic Walking Sequence (50Hz) ---');
        let totalDetectedSteps = 0;
        const detector = new StepDetector_1.StepDetector((count) => {
            totalDetectedSteps += count;
        });
        // 50Hz sampling: sample every 20ms
        // Simulated walking at 1.5Hz frequency (667ms per step, ~33 samples)
        const samplingInterval = 20; // ms
        const stepFrequency = 1.5; // Hz
        let currentTime = 1000; // start at 1s timestamp
        // We simulate 8 steps.
        // Each step is represented by a sine wave peak that goes above and below G.
        // Standard gravity = 1G (approx 9.81 m/s2). Step amplitude = 0.5G (approx 4.9 m/s2).
        // Total steps to simulate = 8
        const stepDurationMs = 667;
        const samplesPerStep = Math.round(stepDurationMs / samplingInterval);
        // Warm up the detector first to stabilize the filter and valley history
        for (let i = 0; i < 50; i++) {
            detector.processSample(0, 0, 1.0, currentTime);
            currentTime += samplingInterval;
        }
        for (let step = 0; step < 8; step++) {
            for (let sample = 0; sample < samplesPerStep; sample++) {
                const tSeconds = currentTime / 1000;
                // Construct vertical acceleration wave: G + A * sin(2 * pi * f * t)
                const verticalAcc = 1.0 + 0.6 * Math.sin(2 * Math.PI * stepFrequency * tSeconds);
                // Feed sample (simulating pure vertical axis fluctuation)
                detector.processSample(0, 0, verticalAcc, currentTime);
                currentTime += samplingInterval;
            }
            // Check step detection mid-sequence (lock target is now 4)
            if (step === 2) {
                // After 3 simulated steps, we should have 0 committed steps (SEARCHING state buffers them)
                assertEquals(detector.getState(), 'SEARCHING', 'Should remain in SEARCHING state after 3 steps');
                assertEquals(totalDetectedSteps, 0, 'Should have 0 steps committed to the UI after 3 steps');
                assertEquals(detector.getBufferLength(), 3, 'Should have 3 steps buffered internally');
            }
            if (step === 3) {
                // After 4 steps, we transition to LOCKED and flush the buffer of 4 steps instantly
                assertEquals(detector.getState(), 'LOCKED', 'Should transition to LOCKED state on 4th consecutive step');
                assertEquals(totalDetectedSteps, 4, 'Should flush and commit all 4 steps on the 4th step');
                assertEquals(detector.getBufferLength(), 0, 'Buffer should be empty after locking');
            }
            if (step === 7) {
                // Steps 5, 6, 7 and 8 should increment step counter 1 by 1 in real-time
                assertEquals(totalDetectedSteps, 8, 'Should commit subsequent steps 1-by-1 in LOCKED state');
            }
        }
    })();
    // Test Case 2: Inactivity Reset Verification
    (() => {
        console.log('\n--- Test 2: Inactivity Timeout Reset (>1800ms) ---');
        let totalDetectedSteps = 0;
        const detector = new StepDetector_1.StepDetector((count) => {
            totalDetectedSteps += count;
        });
        const samplingInterval = 20; // ms
        const stepFrequency = 1.5; // Hz
        let currentTime = 1000;
        const stepDurationMs = 667;
        const samplesPerStep = Math.round(stepDurationMs / samplingInterval);
        // Warm up the detector first to stabilize the filter and valley history
        for (let i = 0; i < 50; i++) {
            detector.processSample(0, 0, 1.0, currentTime);
            currentTime += samplingInterval;
        }
        // 1. Walk 4 steps to achieve LOCK
        for (let step = 0; step < 4; step++) {
            for (let sample = 0; sample < samplesPerStep; sample++) {
                const tSeconds = currentTime / 1000;
                const verticalAcc = 1.0 + 0.6 * Math.sin(2 * Math.PI * stepFrequency * tSeconds);
                detector.processSample(0, 0, verticalAcc, currentTime);
                currentTime += samplingInterval;
            }
        }
        assertEquals(detector.getState(), 'LOCKED', 'Should reach LOCKED state');
        assertEquals(totalDetectedSteps, 4, 'Should commit 4 steps');
        // 2. Simulate 2200ms pause (inactivity > 1800ms)
        currentTime += 2200;
        // Send a minor sample to trigger check of inactivity delta
        detector.processSample(0, 0, 1.0, currentTime);
        assertEquals(detector.getState(), 'SEARCHING', 'Should drop back to SEARCHING state after inactivity');
        assertEquals(detector.getBufferLength(), 0, 'Step buffer should be cleared on timeout reset');
        // 3. Take 1.5 steps: it should be buffered (0 steps committed)
        for (let sample = 0; sample < Math.round(samplesPerStep * 1.5); sample++) {
            const tSeconds = currentTime / 1000;
            const verticalAcc = 1.0 + 0.6 * Math.sin(2 * Math.PI * stepFrequency * tSeconds);
            detector.processSample(0, 0, verticalAcc, currentTime);
            currentTime += samplingInterval;
        }
        assertEquals(totalDetectedSteps, 4, 'Should not commit the first post-pause step immediately');
        assertEquals(detector.getBufferLength(), 1, 'Should buffer the first step in SEARCHING state');
    })();
    // Test Case 3: Noise Filtering Verification (Hand shakes / Tremors)
    (() => {
        console.log('\n--- Test 3: Noise & Tremor Rejection ---');
        let totalDetectedSteps = 0;
        const detector = new StepDetector_1.StepDetector((count) => {
            totalDetectedSteps += count;
        });
        let currentTime = 1000;
        const samplingInterval = 20;
        // Simulate high-frequency low-amplitude tremor (hand shake)
        // Frequency = 12Hz, Amplitude = 0.02G (variance ~0.2 m/s2, below the 0.4 m/s2 threshold)
        const tremorFrequency = 12.0;
        const tremorDurationMs = 2000;
        const tremorSamples = tremorDurationMs / samplingInterval;
        for (let i = 0; i < tremorSamples; i++) {
            const tSeconds = currentTime / 1000;
            const verticalAcc = 1.0 + 0.02 * Math.sin(2 * Math.PI * tremorFrequency * tSeconds);
            detector.processSample(0, 0, verticalAcc, currentTime);
            currentTime += samplingInterval;
        }
        assertEquals(totalDetectedSteps, 0, 'High frequency low-amplitude noise must be completely rejected');
        assertEquals(detector.getBufferLength(), 0, 'No steps should be buffered for noise');
    })();
    // Test Case 4: Erratic walking changing to sprinting with hand-shake anomalies
    (() => {
        console.log('\n--- Test 4: Erratic Walking to Sprinting with Tremor Anomalies ---');
        let totalDetectedSteps = 0;
        const detector = new StepDetector_1.StepDetector((count) => {
            totalDetectedSteps += count;
        });
        const samplingInterval = 20; // 50Hz
        let currentTime = 1000;
        // 1. Simulate 3 steps of erratic walking (1.0Hz frequency, 600ms per step) with high-frequency noise
        const walkingFrequency = 1.0;
        const walkingDurationMs = 1800; // 3 steps
        const walkingSamples = walkingDurationMs / samplingInterval;
        for (let i = 0; i < walkingSamples; i++) {
            const tSeconds = currentTime / 1000;
            const verticalAcc = 1.0 + 0.5 * Math.sin(2 * Math.PI * walkingFrequency * tSeconds)
                + 0.05 * Math.sin(2 * Math.PI * 10 * tSeconds);
            detector.processSample(0, 0, verticalAcc, currentTime);
            currentTime += samplingInterval;
        }
        // Check state: should be SEARCHING, and should have buffered some steps
        assertEquals(detector.getState(), 'SEARCHING', 'Should remain in SEARCHING state during erratic walk');
        console.log(`Buffered steps after erratic walk: ${detector.getBufferLength()}`);
        // 2. Simulate a 2.5-second inactivity pause
        currentTime += 2500;
        detector.processSample(0, 0, 1.0, currentTime); // Trigger timeout evaluation
        assertEquals(detector.getState(), 'SEARCHING', 'Should reset to SEARCHING state on inactivity');
        assertEquals(detector.getBufferLength(), 0, 'Step buffer should be cleared on timeout');
        // 3. Simulate 8 steps of sprinting (2.5Hz frequency, 400ms per step)
        const sprintingFrequency = 2.5;
        const stepDurationMs = 400;
        const samplesPerStep = Math.round(stepDurationMs / samplingInterval);
        for (let step = 0; step < 8; step++) {
            for (let sample = 0; sample < samplesPerStep; sample++) {
                const tSeconds = currentTime / 1000;
                const verticalAcc = 1.0 + 0.8 * Math.sin(2 * Math.PI * sprintingFrequency * tSeconds);
                detector.processSample(0, 0, verticalAcc, currentTime);
                currentTime += samplingInterval;
            }
            // Check states and step counts (lock target is now 4)
            if (step === 3) { // 4th sprinting step
                assertEquals(detector.getState(), 'LOCKED', 'Should LOCK on 4th sprint step');
                assertEquals(totalDetectedSteps, 4, 'Should commit 4 steps upon locking');
            }
            if (step === 7) { // 8th sprinting step
                assertEquals(totalDetectedSteps, 8, 'Should commit all 8 sprinting steps');
            }
        }
    })();
    console.log('\n=== TEST RUN SUMMARY ===');
    if (testFailures === 0) {
        console.log('ALL TESTS PASSED SUCCESSFULLY! 🎉');
        process.exit(0);
    }
    else {
        console.error(`SOME TESTS FAILED: ${testFailures} failures.`);
        process.exit(1);
    }
}
// Execute tests
runTests();
