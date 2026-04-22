window.Bode = (function() {
  const freqs = [];
  for (let e = -1; e <= 3; e += 0.05) {
    freqs.push(Math.pow(10, e));
  }

  let chartInstance = null;

  function init(canvasEl) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const data0dB = freqs.map(() => 0);

    chartInstance = new Chart(canvasEl, {
      type: 'line',
      data: {
        labels: freqs.map(w => w.toFixed(2)),
        datasets: [
          {
            label: '|L(jω)| dB',
            data: [],
            borderColor: '#7eb8ff',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3,
            fill: false
          },
          {
            label: '0 dB',
            data: data0dB,
            borderColor: '#fa5050',
            borderDash: [4, 4],
            borderWidth: 1,
            pointRadius: 0,
            fill: false
          },
          {
            label: 'ω_gc marker',
            data: [],
            borderColor: '#50fa7b',
            pointRadius: 5,
            showLine: false
          },
          {
            label: 'w1 marker',
            data: [],
            borderColor: '#50fa7b66',
            borderWidth: 1,
            borderDash: [2, 4],
            showLine: true,
            pointRadius: 0
          },
          {
            label: 'w2 marker',
            data: [],
            borderColor: '#50fa7b',
            pointRadius: 5,
            showLine: false
          }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'logarithmic',
            title: { display: true, text: 'ω (rad/s)', color: '#888' },
            ticks: { color: '#666', font: { size: 8 } },
            grid: { color: '#1a1a3a' }
          },
          y: {
            min: -80,
            max: 80,
            title: { display: true, text: 'dB', color: '#888' },
            ticks: { color: '#666' },
            grid: { color: '#1a1a3a' }
          }
        },
        plugins: {
          legend: { labels: { color: '#888', font: { size: 8 }, boxWidth: 12 } },
          tooltip: { enabled: false }
        }
      }
    });

    this.chart = chartInstance;
  }

  function update(GS) {
    if (!chartInstance) return;
    if (!window.Controller || typeof window.Controller.computeBodeMag !== 'function') return;

    const dataMain = freqs.map(w => 20 * Math.log10(Math.max(window.Controller.computeBodeMag(w, GS), 1e-6)));
    const dataWgc = freqs.map(w => Math.abs(Math.log10(w) - Math.log10(GS.Wgc)) < 0.07 ? 60 : null);

    const w1 = GS.Wgc * Math.pow(10, -GS.DD / 2);
    const w2 = GS.Wgc * Math.pow(10, GS.DD / 2);

    const dataW1 = freqs.map(w => Math.abs(Math.log10(w) - Math.log10(w1)) < 0.06 ? 60 : null);
    const dataW2 = freqs.map(w => Math.abs(Math.log10(w) - Math.log10(w2)) < 0.06 ? 60 : null);

    chartInstance.data.datasets[0].data = dataMain;
    chartInstance.data.datasets[2].data = dataWgc;
    chartInstance.data.datasets[3].data = dataW1;
    chartInstance.data.datasets[4].data = dataW2;

    chartInstance.update('none');
  }

  return {
    init: init,
    update: update
  };
})();
