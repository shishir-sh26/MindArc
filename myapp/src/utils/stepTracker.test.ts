import { StepDetector } from './StepDetector';

function runTests() {
  console.log('=== RUNNING STEP DETECTOR DSP & STATE MACHINE TESTS ===');
  let testFailures = 0;

  // Helper assert function
  const assertEquals = (actual: any, expected: any, testName: string) => {
    if (actual === expected) {
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}: Expected ${expected}, got ${actual}`);
      testFailures++;
    }
  };

  // Test Case 1: Rhythmic Step Sequence Verification
  (() => {
    console.log('\n--- Test 1: Rhythmic Walking Sequence (50Hz) ---');
    let totalDetectedSteps = 0;
    const detector = new StepDetector((count) => {
      totalDetectedSteps += count;
    });

    // 50Hz sampling: sample every 20ms
    // Simulated walking at 1.5Hz frequency (667ms per step, ~33 samples)
    const samplingInterval = 20; // ms
    const stepFrequency = 1.5; // Hz
    let currentTime = 1000; // start at 1s timestamp

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

      // Check step detection mid-sequence (lock target is now 2)
      if (step === 0) {
        // After 1 simulated step, we should have 0 committed steps (SEARCHING state buffers them)
        assertEquals(detector.getState(), 'SEARCHING', 'Should remain in SEARCHING state after 1 step');
        assertEquals(totalDetectedSteps, 0, 'Should have 0 steps committed to the UI after 1 step');
        assertEquals(detector.getBufferLength(), 1, 'Should have 1 step buffered internally');
      }
      
      if (step === 1) {
        // After 2 steps, we transition to LOCKED and flush the buffer of 2 steps instantly
        assertEquals(detector.getState(), 'LOCKED', 'Should transition to LOCKED state on 2nd consecutive step');
        assertEquals(totalDetectedSteps, 2, 'Should flush and commit all 2 steps on the 2nd step');
        assertEquals(detector.getBufferLength(), 0, 'Buffer should be empty after locking');
      }

      if (step === 7) {
        // Steps 3-8 should increment step counter 1 by 1 in real-time
        assertEquals(totalDetectedSteps, 8, 'Should commit subsequent steps 1-by-1 in LOCKED state');
      }
    }
  })();

  // Test Case 2: Inactivity Reset Verification
  (() => {
    console.log('\n--- Test 2: Inactivity Timeout Reset (>2500ms) ---');
    let totalDetectedSteps = 0;
    const detector = new StepDetector((count) => {
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

    // 1. Walk 2 steps to achieve LOCK
    for (let step = 0; step < 2; step++) {
      for (let sample = 0; sample < samplesPerStep; sample++) {
        const tSeconds = currentTime / 1000;
        const verticalAcc = 1.0 + 0.6 * Math.sin(2 * Math.PI * stepFrequency * tSeconds);
        detector.processSample(0, 0, verticalAcc, currentTime);
        currentTime += samplingInterval;
      }
    }
    assertEquals(detector.getState(), 'LOCKED', 'Should reach LOCKED state');
    assertEquals(totalDetectedSteps, 2, 'Should commit 2 steps');

    // 2. Simulate 3000ms pause (inactivity > 2500ms)
    currentTime += 3000;
    
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
    assertEquals(totalDetectedSteps, 2, 'Should not commit the first post-pause step immediately');
    assertEquals(detector.getBufferLength(), 1, 'Should buffer the first step in SEARCHING state');
  })();

  // Test Case 3: Noise Filtering Verification (Hand shakes / Tremors)
  (() => {
    console.log('\n--- Test 3: Noise & Tremor Rejection ---');
    let totalDetectedSteps = 0;
    const detector = new StepDetector((count) => {
      totalDetectedSteps += count;
    });

    let currentTime = 1000;
    const samplingInterval = 20;

    // Simulate high-frequency low-amplitude tremor (hand shake)
    // Frequency = 12Hz, Amplitude = 0.02G (variance ~0.2 m/s2, below the 0.15 m/s2 threshold after smoothing)
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

  // Test Case 4: Gentle Walking Detection (NEW - validates the sensitivity fix)
  (() => {
    console.log('\n--- Test 4: Gentle Walking Detection (Low Amplitude) ---');
    let totalDetectedSteps = 0;
    const detector = new StepDetector((count) => {
      totalDetectedSteps += count;
    });

    const samplingInterval = 20; // 50Hz
    let currentTime = 1000;
    const stepFrequency = 1.8; // Hz (normal walking cadence)

    // Warm up
    for (let i = 0; i < 50; i++) {
      detector.processSample(0, 0, 1.0, currentTime);
      currentTime += samplingInterval;
    }

    // Simulate 5 steps of gentle walking with only 0.15G amplitude (soft steps)
    const stepDurationMs = Math.round(1000 / stepFrequency);
    const samplesPerStep = Math.round(stepDurationMs / samplingInterval);

    for (let step = 0; step < 5; step++) {
      for (let sample = 0; sample < samplesPerStep; sample++) {
        const tSeconds = currentTime / 1000;
        const verticalAcc = 1.0 + 0.15 * Math.sin(2 * Math.PI * stepFrequency * tSeconds);
        detector.processSample(0, 0, verticalAcc, currentTime);
        currentTime += samplingInterval;
      }
    }

    // With the improved sensitivity, gentle walking should be detected
    console.log(`Gentle walking: detected ${totalDetectedSteps} steps out of 5`);
    const gentleDetected = totalDetectedSteps >= 3; // At least 3 out of 5 gentle steps
    assertEquals(gentleDetected, true, 'Should detect at least 3 out of 5 gentle walking steps');
  })();

  console.log('\n=== TEST RUN SUMMARY ===');
  if (testFailures === 0) {
    console.log('ALL TESTS PASSED SUCCESSFULLY! 🎉');
    process.exit(0);
  } else {
    console.error(`SOME TESTS FAILED: ${testFailures} failures.`);
    process.exit(1);
  }
}

// Execute tests
runTests();
