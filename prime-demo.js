// prime-demo.js
// Visual-only demo. No real SentariX logic, just simulated jitter vs perfect dt.

(function () {
  const canvas = document.getElementById("prime-demo-canvas");
  if (!canvas) return; // safety if loaded on other pages

  const ctx = canvas.getContext("2d");

  const N = 260; // number of samples shown
  const BASE_DT = 7812; // µs
  const RAW_JITTER = 5500; // +/- jitter

  const rawSeries = new Array(N).fill(BASE_DT);
  const sxSeries = new Array(N).fill(BASE_DT);

  let running = false;

  const startBtn = document.getElementById("prime-demo-start");
  const stopBtn = document.getElementById("prime-demo-stop");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (!running) {
        running = true;
        tick();
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener("click", () => {
      running = false;
    });
  }

  function pushSample() {
    // RAW = base + jitter (unstable cadence)
    const jitter = (Math.random() - 0.5) * 2 * RAW_JITTER;
    const rawDt = BASE_DT + jitter;

    // SentariX = perfectly stable cadence
    const sxDt = BASE_DT;

    rawSeries.push(rawDt);
    sxSeries.push(sxDt);

    rawSeries.shift();
    sxSeries.shift();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // dark background
    ctx.fillStyle = "#050509";
    ctx.fillRect(0, 0, w, h);

    // axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, h - 30);
    ctx.lineTo(w - 10, h - 30);
    ctx.stroke();

    // y-range (microseconds)
    const minY = BASE_DT - RAW_JITTER;
    const maxY = BASE_DT + RAW_JITTER;

    function yFor(v) {
      const t = (v - minY) / (maxY - minY);
      return (1 - t) * (h - 50) + 20;
    }

    // grid line for BASE_DT (SentariX target)
    ctx.strokeStyle = "#444";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const baseY = yFor(BASE_DT);
    ctx.moveTo(40, baseY);
    ctx.lineTo(w - 10, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // RAW line (red, noisy)
    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < rawSeries.length; i++) {
      const x = 40 + (i / (N - 1)) * (w - 60);
      const y = yFor(rawSeries[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // SentariX line (blue, perfectly flat)
    ctx.strokeStyle = "#44aaff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < sxSeries.length; i++) {
      const x = 40 + (i / (N - 1)) * (w - 60);
      const y = yFor(sxSeries[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // labels
    ctx.fillStyle = "#bbbbbb";
    ctx.font = "12px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Event interval (microseconds)", 44, 18);
    ctx.fillText("RAW jitter", 50, 32);
    ctx.fillStyle = "#ff6666";
    ctx.fillText("RAW", w - 80, 28);
    ctx.fillStyle = "#44aaff";
    ctx.fillText("SentariX Prime™", w - 160, h - 10);
  }

  function tick() {
    if (!running) return;
    pushSample();
    draw();
    requestAnimationFrame(tick);
  }

  // initial frame
  draw();
})();
