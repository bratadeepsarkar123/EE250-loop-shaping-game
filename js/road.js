window.Road = {
  speedBoostTimer: 0,
  draw: function(canvas, GS) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 1. Background
    ctx.fillStyle = '#111122';
    ctx.fillRect(0, 0, width, height);

    // Update roadOffset
    const roadOffsetPeriod = 1000000;
    const speed = (GS.horizontalSpeed !== undefined && GS.horizontalSpeed !== null) ? GS.horizontalSpeed : 3;
    const nextRoadOffset = (GS.roadOffset || 0) + speed;
    GS.roadOffset = ((nextRoadOffset % roadOffsetPeriod) + roadOffsetPeriod) % roadOffsetPeriod;

    // 2. Road
    const roadH = height * 0.55;
    const roadTop = height / 2 - roadH / 2;
    const roadBot = height / 2 + roadH / 2;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, roadTop, width, roadH);

    // Road edges
    ctx.strokeStyle = '#2a2a6a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, roadTop);
    ctx.lineTo(width, roadTop);
    ctx.moveTo(0, roadBot);
    ctx.lineTo(width, roadBot);
    ctx.stroke();

    // Lane markings (3 lanes = 2 dividers)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 40]);
    ctx.lineDashOffset = -(GS.roadOffset % 60);

    const lane1Y = roadTop + roadH / 3;
    const lane2Y = roadTop + 2 * roadH / 3;

    ctx.beginPath();
    ctx.moveTo(0, lane1Y);
    ctx.lineTo(width, lane1Y);
    ctx.moveTo(0, lane2Y);
    ctx.lineTo(width, lane2Y);
    ctx.stroke();

    // Reset dash
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // 3. Target lane (reference R(t))
    const targetY = height / 2 + (GS.targetY || 0);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([18, 10]);
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Checkpoints
    const carScreenX = width * 0.22;

    if (GS.checkpoints) {
      GS.checkpoints.forEach(cp => {
        const cpScreenX = cp.x - GS.roadOffset;
        if (cpScreenX >= -20 && cpScreenX <= width + 20) {
          // Draw checkpoint
          ctx.strokeStyle = '#50fa7b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cpScreenX, roadTop);
          ctx.lineTo(cpScreenX, roadBot);
          ctx.stroke();

          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('🏁', cpScreenX, roadTop);

          // Collect logic
          if (Math.abs(carScreenX - cpScreenX) < 30 && !cp.collected) {
            cp.collected = true;
            GS.speedBoostActive = true;
            window.Road.speedBoostTimer = 120;
            GS.speedScore = (GS.speedScore || 0) + 5;
          }
        }
      });
    }

    // 6. Obstacles on road
    if (GS.obstacles) {
      GS.obstacles.forEach(ob => {
        const obScreenX = ob.x - GS.roadOffset;
        if (obScreenX >= -50 && obScreenX <= width + 50) {
          const obY = height / 2 - 30;
          let color = '#ffffff';
          if (ob.type === 'wind') color = '#88aaff';
          else if (ob.type === 'slope') color = '#ffaa44';
          else if (ob.type === 'noise') color = '#ff88cc';
          else if (ob.type === 'pothole') color = '#ff4444';
          else if (ob.type === 'crosswind') color = '#aaffcc';

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(obScreenX, obY, 15, 0, Math.PI * 2);
          ctx.fill();

          if (ob.label) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Assuming first character of label is emoji if any
            const emoji = Array.from(ob.label)[0];
            ctx.fillText(emoji, obScreenX, obY);
          }
        }
      });
    }

    // 4. Car
    let carY = height / 2 + (GS.carY || 0);
    // Clamp visually
    if (carY < roadTop + 10) carY = roadTop + 10;
    if (carY > roadBot - 10) carY = roadBot - 10;

    ctx.shadowBlur = 12;
    const bodyColor = GS.oscillating ? '#ff4444' : '#4488ff';
    ctx.fillStyle = bodyColor;
    ctx.shadowColor = bodyColor;

    // Draw body
    ctx.fillRect(carScreenX - 20, carY - 10, 40, 20);

    // Draw wheels
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(carScreenX - 10, carY - 10, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(carScreenX + 10, carY - 10, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(carScreenX - 10, carY + 10, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(carScreenX + 10, carY + 10, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 7. Error trace (mini-plot)
    const chartW = 160;
    const chartH = 40;
    const chartX = 8;
    const chartY = height - 52;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle = '#2a2a5a';
    ctx.lineWidth = 1;
    ctx.strokeRect(chartX, chartY, chartW, chartH);

    ctx.strokeStyle = 'red';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(chartX, chartY + chartH / 2);
    ctx.lineTo(chartX + chartW, chartY + chartH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const errorTraceWindow = (GS.errorTrace || []).slice(-120);
    if (errorTraceWindow.length > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const stepX = chartW / Math.max(1, errorTraceWindow.length - 1);

      errorTraceWindow.forEach((err, index) => {
        const x = chartX + index * stepX;
        // scale: ±40px maps to ±chartH/2
        const y = chartY + chartH / 2 - (err / 40) * (chartH / 2);

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    ctx.fillStyle = '#888';
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('e(t)', chartX + 2, chartY + 2);

    // 8. PM warning overlay
    if (GS.oscillating) {
      const alpha = 0.6 + 0.4 * Math.sin((GS.t || 0) * 8);
      ctx.strokeStyle = `rgba(255,50,50,${alpha})`;
      ctx.lineWidth = 4;
      const inset = ctx.lineWidth / 2;
      ctx.strokeRect(inset, inset, width - ctx.lineWidth, height - ctx.lineWidth);

      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('⚠ PM LOW — raise dd', width / 2, 10);
    }

    // 9. Speed boost flash
    if (GS.speedBoostActive && window.Road.speedBoostTimer > 0) {
      window.Road.speedBoostTimer--;

      let opacity = 1.0;
      if (window.Road.speedBoostTimer <= 60) {
        opacity = window.Road.speedBoostTimer / 60;
      }

      ctx.fillStyle = `rgba(80,250,123,${opacity})`;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏁 SPEED BOOST!', width / 2, height / 2);

      if (window.Road.speedBoostTimer === 0) {
        GS.speedBoostActive = false;
      }
    }
  }
};
