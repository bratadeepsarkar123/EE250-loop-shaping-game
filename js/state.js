window.GS = {
  // Car physics
  carY: 0,          // vertical offset from centre lane (pixels)
  carVel: 0,        // vertical velocity
  carX: 0,          // horizontal position (set on resize)
  targetY: 0,       // reference lane position (moves for ramp/sinusoid)
  error: 0,         // true error = targetY - carY
  integral: 0,      // integrator state

  // Controller parameters (set by sliders)
  Klow: 5,          // low-freq gain / Kv
  Wgc: 2,           // crossover frequency rad/s
  DD: 1.0,          // decade distance (phase margin proxy)
  HF: 1.5,          // high-freq roll-off steepness

  // Derived metrics
  PM: 45,           // phase margin estimate = 45 * DD (capped at 90)
  Kv: 5,            // velocity error constant = Klow
  bandwidth: 2,     // approx bandwidth = Wgc

  // Disturbances
  disturbance: 0,
  distDecay: 0.96,
  noiseAmp: 0,
  slopeActive: false,
  slopeMag: 0,
  crosswindActive: false,
  crosswindFreq: 0,
  crosswindAmp: 0,

  // Scoring
  speedScore: 50,
  accuracyScore: 100,
  smoothScore: 100,
  totalScore: 83,
  scoreF: 100,

  // Buffers
  jitterBuffer: [],   // last 30 velocity samples
  errorBuffer: [],    // last 90 error samples
  errorTrace: [],     // last 120 errors for mini-plot
  velTrace: [],       // last 120 velocities for mini-plot

  // Game state
  t: 0,
  dt: 0.033,
  roadOffset: 0,
  checkpoints: [],    // [{x, collected}]
  obstacles: [],      // [{x, type, label}]
  eventTimer: 0,
  nextEventIn: 180,

  // Flags
  oscillating: false,
  speedBoostActive: false,
  currentHint: 'Tune the sliders to shape your loop. Keep the car on the dashed centre line!',

  // Speed mechanic
  horizontalSpeed: 3,   // base road scroll speed
  distanceTravelled: 0, // total horizontal distance
  checkpointSpacing: 600, // pixels between checkpoints
  nextCheckpointAt: 600,
};
