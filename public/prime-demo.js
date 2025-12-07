// prime-demo.js
// Visual-only demos. No real SentariX logic – just simulated jitter vs perfect cadence.

/* -------------------------------------------------------
   DEMO 1 — Jitter vs Prime chart
------------------------------------------------------- */
(function () {
  const canvas = document.getElementById("prime-demo-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const N = 260;                  // samples on screen
  const BASE_DT = 7812;           // µs
  const RAW_JITTER = 5500;        // +/- jitter range

  const rawSeries = new Array(N).fill(BASE_DT);
  const sxSeries  = new Array(N).fill(BASE_DT);

  let running = false;

  const startBtn = document.getElementById("prime-demo-start");
  const stopBtn  = document.getElementById("prime-demo-stop");

  startBtn?.addEventListener("click", () => {
    if (!running) {
      running = true;
      tick();
    }
  });

  stopBtn?.addEventListener("click", () => {
    running = false;
  });

  function pushSample() {
    const jitter = (Math.random() - 0.5) * 2 * RAW_JITTER;
    const rawDt  = BASE_DT + jitter;
    const sxDt   = BASE_DT;

    rawSeries.push(rawDt);
    sxSeries.push(sxDt);

    rawSeries.shift();
    sxSeries.shift();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // background
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

    const minY = BASE_DT - RAW_JITTER;
    const maxY = BASE_DT + RAW_JITTER;

    const yFor = (v) => {
      const t = (v - minY) / (maxY - minY);
      return (1 - t) * (h - 50) + 20;
    };

    // base line (Prime cadence)
    ctx.strokeStyle = "#444";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const baseY = yFor(BASE_DT);
    ctx.moveTo(40, baseY);
    ctx.lineTo(w - 10, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // RAW line
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

    // Prime line
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
    ctx.fillText("RAW", w - 70, 40);

    ctx.fillStyle = "#44aaff";
    ctx.fillText("SentariX Prime™", w - 155, h - 10);
  }

  function tick() {
    if (!running) return;
    pushSample();
    draw();
    requestAnimationFrame(tick);
  }

  // initial render
  draw();
})();

/* -------------------------------------------------------
   DEMO 2 — Your timing vs Prime (interactive taps)
------------------------------------------------------- */
(function () {
  const canvas = document.getElementById("prime-input-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const taps = [];         // raw tap timestamps (ms from start)
  const MAX_TAPS = 40;

  const BASE_DT = 7812;    // µs, just for the Prime lane spacing

  let capturing = false;
  let startTime = 0;

  const startBtn = document.getElementById("prime-input-start");
  const resetBtn = document.getElementById("prime-input-reset");

  startBtn?.addEventListener("click", () => {
    taps.length = 0;
    startTime = performance.now();
    capturing = true;
    draw();
  });

  resetBtn?.addEventListener("click", () => {
    capturing = false;
    taps.length = 0;
    draw();
  });

  function registerTap() {
    if (!capturing) return;
    const now = performance.now();
    const t = now - startTime;
    if (taps.length === 0 || t > taps[taps.length - 1]) {
      taps.push(t);
      if (taps.length > MAX_TAPS) taps.shift();
      draw();
    }
  }

  // spacebar
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      registerTap();
    }
  });

  // mouse / touch
  window.addEventListener("pointerdown", () => {
    registerTap();
  });

  function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // background
    ctx.fillStyle = "#050509";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#bbbbbb";
    ctx.font = "12px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Each dot is one of your taps mapped over time.", 40, 24);

    // lanes
    const laneRawY = h * 0.35;
    const laneSxY  = h * 0.7;

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, laneRawY);
    ctx.lineTo(w - 30, laneRawY);
    ctx.moveTo(40, laneSxY);
    ctx.lineTo(w - 30, laneSxY);
    ctx.stroke();

    ctx.fillStyle = "#ff6666";
    ctx.fillText("RAW – your actual timing", 44, laneRawY - 10);

    ctx.fillStyle = "#44aaff";
    ctx.fillText("SentariX Prime™ – even cadence", 44, laneSxY - 10);

    if (taps.length === 0) {
      ctx.fillStyle = "#777";
      ctx.fillText("Tap Start, then press Space or click to send events.", 44, h - 16);
      return;
    }

    const first = taps[0];
    const last  = taps[taps.length - 1] || first;
    const span  = Math.max(last - first, 1);

    // RAW dots: based on your uneven timing
    ctx.fillStyle = "#ff4444";
    for (let i = 0; i < taps.length; i++) {
      const t = taps[i] - first;
      const x = 40 + (t / span) * (w - 80);
      ctx.beginPath();
      ctx.arc(x, laneRawY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // PRIME dots: same count, perfectly even spacing
    ctx.fillStyle = "#44aaff";
    const count = taps.length;
    for (let i = 0; i < count; i++) {
      const x = 40 + (i / Math.max(count - 1, 1)) * (w - 80);
      ctx.beginPath();
      ctx.arc(x, laneSxY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // initial render (empty state)
  draw();
})();
