window.Events = (function() {
    let crosswindTimer = 0;
    let boostTimer = 0;

    return {
        trigger: function(type, GS) {
            switch (type) {
                case 'wind':
                    GS.disturbance += 60;
                    GS.currentHint = '💨 Wind Gust! Slow drift — raise K_low to push back.';
                    break;
                case 'slope':
                    GS.slopeActive = true;
                    GS.slopeMag = 18;
                    GS.currentHint = '⛰️ Slope! Lane drifting away permanently — raise K_low high (needs Kv).';
                    break;
                case 'noise':
                    GS.noiseAmp = 22;
                    GS.currentHint = '📡 Sensor Glitch! Car jittering — raise α_hf to filter noise.';
                    break;
                case 'pothole':
                    GS.disturbance += 110 * (Math.random() > 0.5 ? 1 : -1);
                    GS.currentHint = '🕳️ Pothole! Sharp impulse — raise ω_gc for fast response. Watch PM!';
                    break;
                case 'crosswind':
                    GS.crosswindActive = true;
                    GS.crosswindFreq = 0.8 + Math.random() * 1.2;
                    GS.crosswindAmp = 18;
                    crosswindTimer = 0; // reset duration timer
                    GS.currentHint = '🌀 Crosswind! Sinusoidal disturbance — tests S(jω). Balance ω_gc vs dd.';
                    break;
                case 'stability':
                    if (typeof GS.DD !== 'number') break;
                    if (GS._preEventDD === undefined) {
                        GS._preEventDD = GS.DD;
                    }
                    GS.DD = 0.3; // force low PM
                    GS._stabilityTimer = 0; // reset recovery timer
                    GS.currentHint = '⚡ Stability Check! PM dropped — raise dd before car oscillates!';
                    break;
                case 'speedzone':
                    if (!GS.checkpoints) GS.checkpoints = [];
                    const baseX = typeof GS.distanceTravelled === 'number' ? GS.distanceTravelled : 0;
                    GS.checkpoints.push({ x: baseX + 400, collected: false });
                    GS.currentHint = '🏁 Speed Zone ahead! Raise ω_gc for bandwidth boost — but watch PM!';
                    break;
            }
        },

        tick: function(GS) {
            // 1. Increment event timer
            GS.eventTimer = (GS.eventTimer || 0) + 1;

            // Initialize nextEventIn if it doesn't exist
            if (GS.nextEventIn === undefined) {
                GS.nextEventIn = 150 + Math.floor(Math.random() * 120);
            }

            // 2. Trigger random event
            if (GS.eventTimer >= GS.nextEventIn) {
                GS.eventTimer = 0;
                GS.nextEventIn = 150 + Math.floor(Math.random() * 120);

                const eventTypes = ['wind', 'slope', 'noise', 'pothole', 'crosswind', 'speedzone', 'stability'];

                // Keep picking until we get a valid one
                let type;
                do {
                    type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                } while (
                    (type === 'slope' && GS.slopeActive) ||
                    (type === 'stability' && GS._preEventDD !== undefined)
                );

                this.trigger(type, GS);
            }

            // 3. Crosswind auto-cancel
            if (GS.crosswindActive) {
                crosswindTimer++;
                if (crosswindTimer > 150) {
                    GS.crosswindActive = false;
                    GS.crosswindAmp = 0;
                    crosswindTimer = 0;
                }
            }

            // 4. Stability event auto-recovery
            if (GS._preEventDD !== undefined) {
                GS._stabilityTimer++;
                if (GS._stabilityTimer > 200) {
                    GS.DD = GS._preEventDD;
                    GS._preEventDD = undefined;
                    GS._stabilityTimer = 0;
                }
            }

            // 5. SpeedBoost auto-cancel
            if (GS.speedBoostActive) {
                boostTimer++;
                if (boostTimer >= 120) {
                    GS.speedBoostActive = false;
                    boostTimer = 0;
                }
            } else {
                boostTimer = 0;
            }
        }
    };
})();
