window.UI = (function() {
  let prevTotalScore = null;
  let flashTimeout = null;

  function _colorSlider(slider, GS) {
    if (slider.id === 'dd') {
      if (GS.DD < 0.5) {
        slider.style.accentColor = 'red';
      } else if (GS.DD < 0.8) {
        slider.style.accentColor = 'orange';
      } else {
        slider.style.accentColor = 'blue';
      }
    } else if (slider.id === 'wgc') {
      if (GS.Wgc > 12 && GS.DD < 0.8) {
        slider.style.accentColor = 'red';
      } else {
        slider.style.accentColor = 'blue';
      }
    } else {
      slider.style.accentColor = 'blue';
    }
  }

  function init() {
    const sliders = [
      { id: 'klow', key: 'Klow', valId: 'klow-val', format: val => parseFloat(val).toFixed(1) },
      { id: 'wgc', key: 'Wgc', valId: 'wgc-val', format: val => parseFloat(val).toFixed(1) + ' r/s' },
      { id: 'dd', key: 'DD', valId: 'dd-val', format: val => parseFloat(val).toFixed(1) + ' dec' },
      { id: 'hf', key: 'HF', valId: 'hf-val', format: val => parseFloat(val).toFixed(1) }
    ];

    sliders.forEach(config => {
      const slider = document.getElementById(config.id);
      const valDisp = document.getElementById(config.valId);

      if (slider && valDisp) {
        slider.addEventListener('input', (e) => {
          if (window.GS) {
            window.GS[config.key] = parseFloat(e.target.value);
            valDisp.textContent = config.format(e.target.value);
            _colorSlider(slider, window.GS);
          }
        });

        // Initial setup
        if (window.GS) {
          _colorSlider(slider, window.GS);
        }
      }
    });
  }

  function update(GS) {
    if (!GS) return;

    // Update Score Elements
    const elements = {
      'speed-val': GS.speedScore !== undefined ? GS.speedScore.toFixed(0) : null,
      'accuracy-val': GS.accuracyScore !== undefined ? GS.accuracyScore.toFixed(0) : null,
      'smooth-val': GS.smoothScore !== undefined ? GS.smoothScore.toFixed(0) : null,
      'total-val': GS.totalScore !== undefined ? GS.totalScore : null,
      'hint-text': GS.currentHint !== undefined ? GS.currentHint : null
    };

    for (const [id, value] of Object.entries(elements)) {
      if (value !== null) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = value; // innerHTML for hint-text to support <b>
      }
    }

    const totalValEl = document.getElementById('total-val');

    // Score colour pulse
    let isFlashing = false;
    if (prevTotalScore !== null && GS.totalScore !== undefined) {
      const diff = GS.totalScore - prevTotalScore;
      if (Math.abs(diff) > 3) {
        if (totalValEl) {
          isFlashing = true;
          const pulseColor = diff > 0 ? '#50fa7b' : '#ff4444';
          totalValEl.style.color = pulseColor;
          totalValEl.style.textShadow = `0 0 10px ${pulseColor}`;

          if (flashTimeout) clearTimeout(flashTimeout);
          flashTimeout = setTimeout(() => {
            flashTimeout = null;
            if (totalValEl && window.GS) {
              totalValEl.style.color = window.GS.totalScore > 70 ? '#50fa7b' : (window.GS.totalScore >= 40 ? '#ffb347' : '#ff4444');
              totalValEl.style.textShadow = 'none';
            }
          }, 300);
        }
      }
    }

    // Color #total-val if not flashing
    if (totalValEl && GS.totalScore !== undefined && !flashTimeout && !isFlashing) {
      if (GS.totalScore > 70) {
        totalValEl.style.color = '#50fa7b'; // green
      } else if (GS.totalScore >= 40) {
        totalValEl.style.color = '#ffb347'; // orange
      } else {
        totalValEl.style.color = '#ff4444'; // red
      }
    }
    prevTotalScore = GS.totalScore !== undefined ? GS.totalScore : prevTotalScore;

    // Update PM Display
    const pmDisplay = document.getElementById('pm-display');
    if (pmDisplay && GS.PM !== undefined) {
      pmDisplay.textContent = 'PM: ' + GS.PM.toFixed(0) + '°';
      if (GS.PM < 30) {
        pmDisplay.style.color = 'red';
      } else if (GS.PM > 50) {
        pmDisplay.style.color = 'green';
      } else {
        pmDisplay.style.color = ''; // default
      }
    }

    // Update Body class for oscillating
    if (GS.oscillating) {
      document.body.classList.add('oscillating');
    } else {
      document.body.classList.remove('oscillating');
    }

    // Update sliders if changed externally
    const sliders = [
      { id: 'klow', key: 'Klow', valId: 'klow-val', format: val => parseFloat(val).toFixed(1) },
      { id: 'wgc', key: 'Wgc', valId: 'wgc-val', format: val => parseFloat(val).toFixed(1) + ' r/s' },
      { id: 'dd', key: 'DD', valId: 'dd-val', format: val => parseFloat(val).toFixed(1) + ' dec' },
      { id: 'hf', key: 'HF', valId: 'hf-val', format: val => parseFloat(val).toFixed(1) }
    ];

    sliders.forEach(config => {
      const slider = document.getElementById(config.id);
      const valDisp = document.getElementById(config.valId);

      if (slider && valDisp && GS[config.key] !== undefined) {
        // Ensure to string since slider value is string
        if (parseFloat(slider.value) !== GS[config.key]) {
          slider.value = GS[config.key];
          valDisp.textContent = config.format(GS[config.key]);
          _colorSlider(slider, GS);
        }
      }
    });
  }

  return {
    init,
    update,
    _colorSlider // Expose for testing/external use if needed based on requirement
  };
})();
