window.Controller = {
  computeBodeMag: function(w, GS) {
    let w1 = GS.Wgc * Math.pow(10, -GS.DD / 2);
    let w2 = GS.Wgc * Math.pow(10, GS.DD / 2);
    let mag;
    if (w < w1) {
      mag = GS.Klow / w;
    } else if (w <= w2) {
      mag = GS.Wgc / w;
    } else {
      mag = (GS.Wgc / w2) * Math.pow(w2 / w, GS.HF);
    }
    return mag * (GS.Klow / GS.Wgc);
  },

  computePM: function(GS) {
    return Math.min(90, 45 * GS.DD);
  },

  step: function(GS, canvasHeight) {
    // Compute PM at the very start of step
    GS.PM = window.Controller.computePM(GS);

    // 1. Add noise to measured error: measuredError = (GS.targetY - GS.carY) + GS.noiseAmp*(Math.random()-0.5)*2
    let measuredError = (GS.targetY - GS.carY) + GS.noiseAmp * (Math.random() - 0.5) * 2;

    // 2. True error: GS.error = GS.targetY - GS.carY
    GS.error = GS.targetY - GS.carY;

    // 3. Moving target: if GS.slopeActive, increment GS.targetY by GS.slopeMag*GS.dt; if |GS.targetY| > canvasHeight*0.28 stop slope
    if (GS.slopeActive) {
      GS.targetY += GS.slopeMag * GS.dt;
      if (Math.abs(GS.targetY) > canvasHeight * 0.28) {
        GS.slopeActive = false;
      }
    }

    // 4. Crosswind: if GS.crosswindActive, add GS.crosswindAmp * sin(GS.crosswindFreq * GS.t) to GS.disturbance each step
    if (GS.crosswindActive) {
      GS.disturbance += GS.crosswindAmp * Math.sin(GS.crosswindFreq * GS.t);
    }

    // 5. Integrator: GS.integral += measuredError * GS.dt, clamped to [-40, 40]
    GS.integral += measuredError * GS.dt;
    if (GS.integral > 40) GS.integral = 40;
    if (GS.integral < -40) GS.integral = -40;

    // 6. Controller gains derived from sliders:
    let Kp = GS.Wgc * GS.DD * 0.8;
    let Ki = GS.Klow * 0.15;
    let Kd = GS.DD * 0.3;
    let noiseFilter = 1.0 / (GS.HF + 0.5);

    // 7. u = (Kp*measuredError + Ki*GS.integral + Kd*measuredError*GS.Wgc*0.1) * noiseFilter
    let u = (Kp * measuredError + Ki * GS.integral + Kd * measuredError * GS.Wgc * 0.1) * noiseFilter;

    // 8. Oscillation injection: if GS.PM < 25, add sin(GS.t*0.3)*15 to u
    if (GS.PM < 25) {
      u += Math.sin(GS.t * 0.3) * 15;
    }

    // 9. Car physics: GS.carVel += (u - GS.carVel*1.5 + GS.disturbance*0.08)*GS.dt*2, clamp to [-120,120]
    GS.carVel += (u - GS.carVel * 1.5 + GS.disturbance * 0.08) * GS.dt * 2;
    if (GS.carVel > 120) GS.carVel = 120;
    if (GS.carVel < -120) GS.carVel = -120;

    // 10. GS.carY += GS.carVel * GS.dt
    GS.carY += GS.carVel * GS.dt;

    // 11. Decay: GS.disturbance *= GS.distDecay (zero if < 0.01), GS.noiseAmp *= 0.97
    GS.disturbance *= GS.distDecay;
    if (Math.abs(GS.disturbance) < 0.01) {
      GS.disturbance = 0;
    }
    GS.noiseAmp *= 0.97;

    // 12. Clamp car: if |GS.carY - GS.targetY| > canvasHeight*0.42, clamp and bounce velocity
    let dy = GS.carY - GS.targetY;
    let maxDy = canvasHeight * 0.42;
    if (Math.abs(dy) > maxDy) {
      if (dy > 0) {
        GS.carY = GS.targetY + maxDy;
      } else {
        GS.carY = GS.targetY - maxDy;
      }
      GS.carVel = -GS.carVel; // bounce velocity
    }

    // 13. Speed mechanic:
    if (GS.Wgc > 5 && GS.PM > 30) {
      GS.horizontalSpeed = 3 + (GS.Wgc - 5) * 0.3;
      if (GS.horizontalSpeed > 8) {
        GS.horizontalSpeed = 8;
      }
    } else if (GS.PM < 20) {
      GS.horizontalSpeed = Math.max(1, GS.horizontalSpeed * 0.95);
    } else {
      GS.horizontalSpeed = 3;
    }

    // 14. GS.distanceTravelled += GS.horizontalSpeed
    GS.distanceTravelled += GS.horizontalSpeed;

    // 15. Update jitter/error buffers (keep last 30/90 samples)
    GS.jitterBuffer.push(GS.carVel);
    if (GS.jitterBuffer.length > 30) {
      GS.jitterBuffer.shift();
    }

    GS.errorBuffer.push(GS.error);
    if (GS.errorBuffer.length > 90) {
      GS.errorBuffer.shift();
    }

    // Also updating trace buffers as they represent history
    if (GS.errorTrace && GS.velTrace) {
      GS.errorTrace.push(GS.error);
      if (GS.errorTrace.length > 120) GS.errorTrace.shift();
      GS.velTrace.push(GS.carVel);
      if (GS.velTrace.length > 120) GS.velTrace.shift();
    }

    // 16. Scoring:
    let absErr = Math.abs(GS.error);

    let meanJitter = GS.jitterBuffer.reduce((a, b) => a + b, 0) / (GS.jitterBuffer.length || 1);
    let jitter = GS.jitterBuffer.reduce((a, b) => a + Math.pow(b - meanJitter, 2), 0) / (GS.jitterBuffer.length || 1);

    let accuracyPenalty = absErr > 5 ? (absErr - 5) * 0.05 : 0;
    let smoothPenalty = jitter > 50 ? (jitter - 50) * 0.003 : 0;

    let clamp = (val, min, max) => Math.max(min, Math.min(max, val));

    GS.accuracyScore = clamp(GS.accuracyScore - accuracyPenalty + 0.03, 0, 100);
    GS.smoothScore = clamp(GS.smoothScore - smoothPenalty + 0.02, 0, 100);

    let speedMultiplier = GS.speedBoostActive ? 1 : 0.5;
    GS.speedScore = clamp(50 + ((GS.horizontalSpeed * speedMultiplier) - 3) * 10, 0, 100);

    GS.oscillating = GS.PM < 25;
    let scoreMult = GS.oscillating ? 0.5 : 1;
    GS.totalScore = Math.round((GS.accuracyScore * 0.4 + GS.smoothScore * 0.3 + GS.speedScore * 0.3) * scoreMult);

    // 17. Update GS.Kv and GS.bandwidth:
    GS.Kv = GS.Klow;
    GS.bandwidth = GS.Wgc;

    // 18. GS.t += GS.dt
    GS.t += GS.dt;
  }
};
