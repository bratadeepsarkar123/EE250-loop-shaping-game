window.Events = (function() {
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
                    GS.currentHint = '🌀 Crosswind! Sinusoidal disturbance — tests S(jω). Balance ω_gc vs dd.';
                    break;
                case 'stability':
                    if (typeof GS.DD !== 'number') return;
                    if (GS._preEventDD === undefined) {
                        GS._preEventDD = GS.DD;
                    }
                    GS.DD = 0.3;
                    GS._stabilityTimer = 0;
                    GS.currentHint = '⚡ Stability Check! PM dropped — raise dd before car oscillates!';
                    break;
                case 'speedzone':
                    if (!GS.checkpoints) {
                        GS.checkpoints = [];
                    }
                    GS.checkpoints.push({
                        x: (typeof GS.distanceTravelled === 'number' ? GS.distanceTravelled : 0) + 400,
                        collected: false
                    });
                    GS.currentHint = '🏁 Speed Zone ahead! Raise ω_gc for bandwidth boost — but watch PM!';
                    break;
            }
        },

        tick: function(GS) {
            GS.eventTimer = (GS.eventTimer || 0) + 1;

            if (GS.nextEventIn === undefined) {
                GS.nextEventIn = 150 + Math.floor(Math.random() * 120);
            }

            if (GS.eventTimer >= GS.nextEventIn) {
                GS.eventTimer = 0;
                GS.nextEventIn = 150 + Math.floor(Math.random() * 120);

                const types = ['wind', 'slope', 'noise', 'pothole', 'crosswind', 'speedzone', 'stability'];
                let type;
                do {
                    type = types[Math.floor(Math.random() * types.length)];
                } while (
                    (type === 'slope' && GS.slopeActive) ||
                    (type === 'stability' && GS._preEventDD !== undefined)
                );

                this.trigger(type, GS);
            }

            if (GS.crosswindActive) {
                GS._crosswindTimer = (GS._crosswindTimer || 0) + 1;
                if (GS._crosswindTimer > 150) {
                    GS.crosswindActive = false;
                    GS.crosswindAmp = 0;
                    GS._crosswindTimer = 0;
                }
            }

            if (GS._preEventDD !== undefined) {
                GS._stabilityTimer = (GS._stabilityTimer || 0) + 1;
                if (GS._stabilityTimer > 200 && GS.DD === 0.3) {
                    GS.DD = GS._preEventDD;
                    GS._preEventDD = undefined;
                    GS._stabilityTimer = 0;
                }
            }

            if (GS.speedBoostActive) {
                GS._boostTimer = (GS._boostTimer || 0) + 1;
                if (GS._boostTimer >= 120) {
                    GS.speedBoostActive = false;
                    GS._boostTimer = 0;
                }
            } else if (!GS.speedBoostActive) {
                GS._boostTimer = 0;
            }
        }
    };
})();
