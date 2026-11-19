/* KORIKO QUIZ — game logic (ยกเครื่องพิกเซล + คัตซีนเชฟชักดาบจาก 4-minigame) */
(function () {
  const D = window.QUIZ, A = window.ART;
  const $ = s => document.querySelector(s);
  const ORDER = ["ME", "YOU", "MORE", "TOGETHER"];

  // ---------- fit: แนวนอน = 1280x720 · มือถือแนวตั้ง = กว้าง 480 สูงตามจอ ----------
  function fit() {
    const f = $("#frame"), port = innerHeight > innerWidth;
    document.body.classList.toggle("port", port);
    const W = port ? 480 : 1280, H = port ? Math.max(800, Math.round(480 * innerHeight / innerWidth)) : 720;
    const s = Math.min(innerWidth / W, innerHeight / H);
    f.style.width = W + "px"; f.style.height = H + "px";
    f.style.transform = `translate(-50%,-50%) scale(${s})`; f.style.transformOrigin = "center center";
  }
  addEventListener("resize", fit); fit();

  // ---------- sound (WebAudio synth) ----------
  let AC = null, muted = false;
  const ac = () => (AC ||= new (window.AudioContext || window.webkitAudioContext)());
  function tone(freq, dur, type = "square", vol = 0.06, when = 0, slideTo) {
    if (muted) return; const c = ac(), t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol = 0.12, when = 0, f0 = 800, f1 = 4000, q = 1) {
    if (muted) return; const c = ac(), t = c.currentTime + when;
    const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b;
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp).connect(g).connect(c.destination); s.start(t);
  }
  const SFX = {
    click: () => tone(660, 0.06, "square", 0.05),
    plop: n => { tone(300 + n * 60, 0.06, "square", 0.06); tone(450 + n * 60, 0.08, "square", 0.05, 0.05); },
    close: () => { tone(220, 0.1, "square", 0.07); tone(330, 0.1, "square", 0.06, 0.1); tone(660, 0.18, "square", 0.06, 0.2); },
    drone: () => tone(70, 0.9, "sawtooth", 0.05),
    ting: () => { tone(2093, 0.4, "sine", 0.08); tone(3136, 0.3, "sine", 0.04, 0.05); },
    shing: () => { noise(0.6, 0.12, 0, 2000, 9000, 4); tone(1800, 0.6, "sine", 0.05, 0, 3600); },
    slash: () => { noise(0.25, 0.25, 0, 600, 5000, 1); noise(0.25, 0.2, 0.32, 600, 5000, 1); },
    sprinkle: () => { for (let i = 0; i < 8; i++) tone(2400 + Math.random() * 1600, 0.04, "sine", 0.03, 0.6 + i * 0.05); },
    boom: () => { tone(160, 0.8, "sine", 0.3, 0, 30); noise(0.9, 0.3, 0, 400, 80, 0.7); },
    fanfare: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.5 : 0.14, "square", 0.06, i * 0.11))
  };
  document.querySelectorAll(".mute").forEach(b => b.onclick = () => {
    muted = !muted; document.querySelectorAll(".mute").forEach(x => x.textContent = muted ? "×" : "♪");
  });

  // ---------- pixel sandwich: ชั้นไส้ = สีโหมดตามคำตอบ ----------
  const NORI = { base: "#2f5230", light: "#4a7a45", dark: "#1c331d", fleck: "#5f8f55" };
  function stack(layers, closed, W = 60) {
    const H = 48, p = new A.Pix(W, H);
    const sheet = y0 => {
      p.poly([[3, y0 + 3], [W - 6, y0], [W - 2, y0 + 3], [7, y0 + 6]], NORI.light);
      p.rect(2, y0 + 3, W - 4, 3, NORI.base);
      p.poly([[3, y0 + 3], [W - 6, y0], [W - 2, y0 + 3]], NORI.base);
      p.rect(2, y0 + 6, W - 4, 1, NORI.dark);
      for (let i = 0; i < W * 0.6; i++) { const x = 4 + (i * 37) % (W - 8), y = y0 + 1 + (i * 13) % 5; if (p.get(x, y)) p.px(x, y, i % 3 ? NORI.fleck : NORI.light); }
    };
    sheet(H - 8);
    layers.forEach((k, i) => {
      const c = D.R[k], y = H - 6 - (i + 1) * 4;
      p.rect(3, y, W - 6, 4, c.color); p.rect(3, y, W - 6, 1, c.light); p.rect(3, y + 3, W - 6, 1, c.dark);
      for (let x = 5 + (i * 3) % 5; x < W - 6; x += 6) { p.px(x, y + 1, c.light); p.px(x + 1, y + 2, c.dark); }
    });
    if (closed) sheet(H - 6 - layers.length * 4 - 7);
    return p.outlined();
  }

  // ---------- stage (192x108) ----------
  const cv = $("#cv"), ctx = cv.getContext("2d");
  const BG = A.kitchen().canvas();
  let fx = [], bounce = 0, tick = 0, sandKey = "", sandCv = null, closed = false, stageOn = false;
  function burst(color) {
    bounce = 6;
    for (let i = 0; i < 14; i++) fx.push({ x: 96 + (Math.random() - .5) * 60, y: 45 + (Math.random() - .5) * 20, vx: (Math.random() - .5) * 1.6, vy: -Math.random() * 1.5, life: 10 + Math.random() * 8, c: ["#ffffff", "#F7C04A", "#fff3c4"][i % 3], k: "spark" });
    if (color) for (let i = 0; i < 24; i++) fx.push({ x: 70 + Math.random() * 52, y: 8 + Math.random() * 14, vx: 0, vy: 0.6 + Math.random() * .6, life: 24 + Math.random() * 10, c: color, k: "dust" });
  }
  function stageLoop() {
    if (!stageOn) return;
    tick++;
    ctx.clearRect(0, 0, 192, 108); ctx.drawImage(BG, 0, 0);
    const blink = (tick % 90) < 3;
    const nc = A.character("ninja", blink ? "closed" : (closed ? "grin" : (ans.length >= 6 ? "happy" : "ok"))).canvas();
    ctx.drawImage(nc, 142, 47 + ((tick >> 4) % 2));
    ctx.drawImage(BG, 0, 70, 192, 38, 0, 70, 192, 38);
    ctx.drawImage(BG, 52, 66, 88, 8, 52, 66, 88, 8);
    const key = ans.join(",") + closed;
    if (key !== sandKey) { sandKey = key; sandCv = stack(ans, closed).canvas(); }
    const by = bounce > 0 ? [0, 1, 0, -1, -3, -2][bounce - 1] || 0 : 0; if (bounce > 0 && tick % 2 === 0) bounce--;
    ctx.drawImage(sandCv, 96 - sandCv.width / 2, 69 - sandCv.height + by);
    fx = fx.filter(f => f.life-- > 0);
    fx.forEach(f => { f.x += f.vx; f.y += f.vy; ctx.fillStyle = f.c; ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1); if (f.k === "spark" && f.life > 8) ctx.fillRect(Math.round(f.x) - 1, Math.round(f.y), 3, 1); });
    setTimeout(() => requestAnimationFrame(stageLoop), 1000 / 24);
  }
  function moveStage(to) { $("#" + to).appendChild($("#stage")); if (!stageOn) { stageOn = true; stageLoop(); } }

  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("on", s.id === id));
    if (id === "title" || id === "quiz") moveStage(id); else stageOn = false;
    if (id !== "result") iconOn = false;
  }

  // ---------- quiz ----------
  let i = 0, ans = [];
  const shuffle = a => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  $("#hook").textContent = D.hook;
  $("#modes").innerHTML = ORDER.map(k => `<div>${k}<span style="font:13px Mitr">${D.R[k].name.replace("โหมด", "")}</span></div>`).join("");
  $("#dots").innerHTML = D.Q.map(() => "<i></i>").join("");
  $("#legend").innerHTML = "<span>สีไส้แต่ละชั้นมีความหมาย… เชฟจะเฉลยตอนจบ</span>";

  function start() { i = 0; ans = []; closed = false; show("quiz"); ask(); }
  function ask() {
    const q = D.Q[i];
    $("#qno").textContent = `Q${i + 1} / ${D.Q.length}`;
    $("#qtext").textContent = q.q;
    $("#say").textContent = D.say[i] || "";
    $("#opts").innerHTML = shuffle(ORDER).map(k => `<button class="opt" data-k="${k}">${q.a[k]}</button>`).join("");
    $("#opts").querySelectorAll(".opt").forEach(b => b.onclick = () => pick(b.dataset.k));
    $("#back").style.visibility = i > 0 ? "visible" : "hidden";
    [...$("#dots").children].forEach((d, j) => d.style.background = j < ans.length ? D.R[ans[j]].color : "");
  }
  function pick(k) {
    if (closed) return;
    ans.push(k); SFX.plop(ans.length); burst(D.R[k].color); i++;
    [...$("#dots").children].forEach((d, j) => d.style.background = j < ans.length ? D.R[ans[j]].color : "");
    if (i < D.Q.length) ask();
    else {
      closed = true; $("#opts").innerHTML = ""; $("#qtext").textContent = "ประกบ!";
      $("#say").textContent = "ครบ 8 ชั้น ประกบสาหร่ายแผ่นบน… แล้วเชฟขอโชว์หน่อย!";
      $("#back").style.visibility = "hidden";
      setTimeout(() => { SFX.close(); burst(null); }, 150);
      setTimeout(craft, 1300);
    }
  }
  $("#back").onclick = () => { if (i > 0 && !closed) { SFX.click(); ans.pop(); i--; ask(); } };
  $("#go").onclick = () => { SFX.click(); try { ac().resume(); } catch (e) {} start(); };
  $("#again").onclick = () => { SFX.click(); start(); };

  // ---------- score ----------
  function score() {
    const s = { ME: 0, YOU: 0, MORE: 0, TOGETHER: 0 }; ans.forEach(k => s[k]++);
    const max = Math.max(...Object.values(s)), top = ORDER.filter(k => s[k] === max);
    let win = top[0];
    if (top.length > 1) win = top.includes(ans[7]) ? ans[7] : top.includes(ans[0]) ? ans[0] : top[0];
    // % ที่รวมได้ 100 พอดี
    const raw = ORDER.map(k => s[k] / ans.length * 100), fl = raw.map(Math.floor);
    let rem = 100 - fl.reduce((a, b) => a + b, 0);
    raw.map((v, j) => [v - fl[j], j]).sort((a, b) => b[0] - a[0]).forEach(([, j]) => { if (rem > 0) { fl[j]++; rem--; } });
    const pct = {}; ORDER.forEach((k, j) => pct[k] = fl[j]);
    const second = ORDER.filter(k => k !== win && s[k] > 0).sort((a, b) => s[b] - s[a])[0] || null;
    return { s, win, pct, second };
  }

  // ---------- CUTSCENE (160x90 · ย่อเหลือ ~4.6 วิ) ----------
  const cc = $("#cc"), cx = cc.getContext("2d");
  let cutT0 = 0, cutOn = false, cues = {}, cutSand = null;
  const DUR = 4.6;
  function craft() {
    cutSand = stack(ans, true);
    show("cut"); $("#cut").classList.remove("bars");
    setTimeout(() => $("#cut").classList.add("bars"), 30);
    cutT0 = performance.now(); cutOn = true; cues = {};
    cutLoop();
  }
  const cue = (n, fn) => { if (!cues[n]) { cues[n] = 1; fn(); } };
  function cutLoop() {
    if (!cutOn) return;
    const t = (performance.now() - cutT0) / 1000;
    const p = new A.Pix(160, 90);
    if (t < 0.9) { cue("a", SFX.drone); shotFace(p, t / 0.9, false); }
    else if (t < 1.5) { cue("b", SFX.ting); shotFace(p, (t - 0.9) / 0.6, true); }
    else if (t < 2.6) { cue("c", SFX.shing); shotKatana(p, (t - 1.5) / 1.1); }
    else if (t < 3.9) { cue("d", () => { SFX.slash(); SFX.sprinkle(); }); shotSlash(p, (t - 2.6) / 1.3); }
    else if (t < 4.5) { cue("e", SFX.boom); shotFlash(p, (t - 3.9) / 0.6); }
    else p.rect(0, 0, 160, 90, "#000000");
    cx.clearRect(0, 0, 160, 90); cx.drawImage(p.canvas(), 0, 0);
    const sh = (t > 0.9 && t < 1.1) || (t > 3.9 && t < 4.3) || (t > 2.95 && t < 3.08) || (t > 3.2 && t < 3.32);
    $("#shake").style.transform = sh ? `translate(${(Math.random() - .5) * 24}px,${(Math.random() - .5) * 16}px)` : "";
    if (t >= DUR) { endCut(); return; }
    requestAnimationFrame(cutLoop);
  }
  function endCut() { cutOn = false; $("#shake").style.transform = ""; $("#cut").classList.remove("bars"); showResult(); }
  $("#skip").onclick = () => { if (cutOn) endCut(); };

  function vignette(p, base, rings) {
    p.rect(0, 0, 160, 90, base);
    rings.forEach((c, i) => { const r = 90 - i * 16; for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) { const dx = (x - 80) / 1.6, dy = y - 8; const d = Math.sqrt(dx * dx + dy * dy); if (d < r && ((x + y) % 2 === 0 || d < r - 4)) p.px(x, y, c); } });
  }
  function shotFace(p, k, open) {
    vignette(p, "#0d0f12", ["#16191e", "#1d2127", "#252a31"]);
    if (open) { for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; p.line(80 + Math.cos(a) * 60, 50 + Math.sin(a) * 60, 80 + Math.cos(a) * 95, 50 + Math.sin(a) * 95, "#3a3f47"); } }
    const zoom = open ? 0 : Math.round(k * 2), cy = 52 - zoom;
    p.poly([[30, 90], [44, 74], [116, 74], [130, 90]], "#3f7d3c");
    p.poly([[64, 74], [80, 90], [96, 74], [90, 74], [80, 84], [70, 74]], "#f4f1ea");
    p.poly([[30, 90], [44, 74], [52, 74], [40, 90]], "#2d5e2b");
    for (let i = 0; i < 9; i++) { const x = 112 + i * 3, y = 74 - i * 5; p.rect(x, y, 6, 6, i % 2 ? "#1e2124" : "#f2c037"); }
    p.rect(108, 76, 8, 3, "#c99a2e");
    p.ellipse(80, cy, 30, 27, "#f3c9a0"); p.ellipse(92, cy + 4, 16, 20, "#e8b78e"); p.ellipse(80, cy, 26, 24, "#f3c9a0");
    const spikes = [[44, 44], [40, 26], [52, 34], [54, 14], [66, 28], [72, 6], [82, 26], [92, 8], [98, 28], [110, 16], [110, 34], [122, 28], [116, 44]];
    p.poly([[48, cy - 6], ...spikes.map(([x, y]) => [x, y - zoom]), [112, cy - 6], [100, cy - 14], [60, cy - 14]], "#22252a");
    [[58, 22], [76, 16], [94, 18]].forEach(([x, y]) => p.line(x, y - zoom, x + 8, y + 10 - zoom, "#3b4048"));
    p.rect(50, cy - 16, 60, 8, "#f4f1ea"); p.rect(50, cy - 9, 60, 1, "#dcd6c8");
    p.poly([[110, cy - 15], [134, cy - 22 + Math.round(Math.sin(k * 9) * 2)], [138, cy - 16], [110, cy - 9]], "#f4f1ea");
    p.poly([[110, cy - 11], [130, cy - 6 + Math.round(Math.cos(k * 9) * 2)], [128, cy - 2], [110, cy - 8]], "#dcd6c8");
    p.ellipse(80, cy - 12, 6, 5, "#f2a23a"); p.ellipse(80, cy - 12, 4, 3, "#e0443a"); p.rect(79, cy - 14, 2, 4, "#fff6e0");
    if (!open) { p.line(62, cy + 2, 70, cy + 4, "#2a2e33"); p.line(90, cy + 4, 98, cy + 2, "#2a2e33"); p.line(62, cy + 3, 70, cy + 5, "#2a2e33"); p.line(90, cy + 5, 98, cy + 3, "#2a2e33"); }
    else {
      p.line(60, cy - 4, 71, cy - 1, "#22252a"); p.line(89, cy - 1, 100, cy - 4, "#22252a"); p.line(60, cy - 3, 71, cy, "#22252a"); p.line(89, cy, 100, cy - 3, "#22252a");
      p.ellipse(66, cy + 4, 5, 4, "#ffffff"); p.ellipse(94, cy + 4, 5, 4, "#ffffff");
      p.ellipse(67, cy + 4, 2.5, 3, "#2a2e33"); p.ellipse(93, cy + 4, 2.5, 3, "#2a2e33");
      p.px(66, cy + 3, "#ffffff"); p.px(92, cy + 3, "#ffffff");
      if (k > 0.15 && k < 0.7) { const g = Math.round((k - 0.15) * 12); p.rect(98 - g, cy + 1, 2 * g + 1, 1, "#ffffff"); p.rect(98, cy + 1 - g, 1, 2 * g + 1, "#ffffff"); }
    }
    p.ellipse(60, cy + 11, 4, 2, "#e89a86"); p.ellipse(100, cy + 11, 4, 2, "#e89a86");
    if (!open) p.line(74, cy + 16, 86, cy + 15, "#a85b4c");
    else { p.poly([[70, cy + 13], [90, cy + 13], [86, cy + 20], [74, cy + 20]], "#8e2f2a"); p.rect(72, cy + 13, 16, 2, "#ffffff"); p.rect(76, cy + 18, 8, 2, "#f08a8a"); }
    if (!open) for (let y = 0; y < 20; y++) for (let x = 60 - y; x < 100 + y; x++) if ((x + y) % 3 === 0 && !p.get(x, y)) p.px(x, y, "#2d323a");
  }
  function shotKatana(p, k) {
    p.rect(0, 0, 160, 90, "#13241A");
    for (let y = 0; y < 90; y += 2) p.rect(0, y, 160, 1, y % 8 === 0 ? "#183020" : "#13241A");
    const draw = Math.min(1, k * 1.4), hx = 70 - Math.round(draw * 56), y = 44;
    p.rect(74, y - 4, 82, 9, "#1e2124"); p.rect(74, y - 4, 82, 1, "#3b4048"); p.rect(74, y + 4, 82, 1, "#0d0f12");
    for (let x = 84; x < 154; x += 14) { p.px(x, y - 1, "#c99a2e"); p.px(x + 1, y, "#f2c037"); p.px(x - 1, y, "#c99a2e"); p.px(x, y + 1, "#c99a2e"); }
    p.rect(72, y - 5, 3, 11, "#c99a2e");
    const bx0 = hx + 30, bx1 = 72;
    if (bx1 > bx0) { p.rect(bx0, y - 2, bx1 - bx0, 4, "#dfe6ea"); p.rect(bx0, y - 2, bx1 - bx0, 1, "#ffffff"); p.rect(bx0, y + 1, bx1 - bx0, 1, "#9aa6ad"); for (let x = bx0; x < bx1; x += 3) p.px(x, y, "#c7d1d6"); }
    p.ellipse(hx + 28, y, 3, 9, "#c99a2e"); p.ellipse(hx + 28, y, 2, 7, "#f2c037");
    for (let i = 0; i < 6; i++) { p.rect(hx + i * 4, y - 4, 4, 9, i % 2 ? "#1e2124" : "#f2c037"); p.px(hx + i * 4 + 1, y - 1, i % 2 ? "#f2c037" : "#1e2124"); p.px(hx + i * 4 + 2, y + 1, i % 2 ? "#f2c037" : "#1e2124"); }
    p.rect(hx - 2, y - 4, 2, 9, "#c99a2e");
    if (k > 0.72) { const gx = bx0 + Math.round((k - 0.72) / 0.28 * (bx1 - bx0)); p.rect(gx - 4, y - 2, 8, 3, "#ffffff"); p.rect(gx, y - 8, 1, 16, "#ffffff"); p.rect(gx - 6, y, 13, 1, "#ffffff"); }
    p.ellipse(hx + 10, y + 5, 8, 5, "#f3c9a0"); p.ellipse(hx + 10, y + 5, 6, 3, "#e8b78e");
    if (k > 0.4) { const a = Math.min(1, (k - 0.4) * 3); p.rect(8, 76, Math.round(144 * a), 1, "#F7C04A"); }
  }
  const leftHalf = (x, y) => x + y * 0.5 < 42;
  function shotSlash(p, k) {
    p.rect(0, 0, 160, 90, "#b5321f");
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2 + k; p.line(80 + Math.cos(a) * 20, 45 + Math.sin(a) * 20, 80 + Math.cos(a) * 120, 45 + Math.sin(a) * 120, i % 2 ? "#E0443A" : "#d23c2b"); }
    p.ellipse(80, 45, 30, 26, "#f2a23a"); p.ellipse(80, 45, 22, 18, "#F7C04A");
    const sand = cutSand, split = k > 0.35 ? Math.min(6, Math.round((k - 0.35) * 30)) : 0;
    const ox = 80 - Math.round(sand.w / 2), oy = 45 - Math.round(sand.h / 2) + Math.round(Math.sin(k * 6) * 2);
    for (let y = 0; y < sand.h; y++) for (let x = 0; x < sand.w; x++) {
      const c = sand.get(x, y); if (!c) continue; const L = leftHalf(x, y);
      p.px(ox + x + (L ? -split : split), oy + y + (L ? split / 2 : -split / 2), c);
    }
    if (k > 0.2 && k < 0.6) { const s = (k - 0.2) / 0.4, Ln = Math.round(s * 140); for (let i = 0; i < Ln; i++) p.rect(150 - i, Math.round(6 + i * 0.55), 2, 2, "#ffffff"); }
    const cols = ans.map(a => D.R[a].color);
    for (let i = 0; i < 70; i++) { const x = (i * 37) % 160, y = ((i * 23) + k * 140) % 90; if (k > 0.45) p.rect(x, Math.round(y), 1, 2, cols[i % cols.length]); }
  }
  function shotFlash(p, k) {
    const cols = ["#ffffff", "#fff3c4", "#F7C04A", "#F2A23A", "#E0443A", "#7a1f16"];
    p.rect(0, 0, 160, 90, k < 0.15 ? "#ffffff" : "#1a0705");
    const R0 = 10 + k * 150;
    for (let i = cols.length - 1; i >= 0; i--) { const r = R0 * (1 - i * 0.13); if (r > 0) p.ellipse(80, 45, r * 1.3, r, cols[i]); }
    for (let i = 0; i < 40; i++) { const a = i * 2.4, r = R0 * 0.8 + (i % 5) * 6; p.rect(Math.round(80 + Math.cos(a) * r * 1.3), Math.round(45 + Math.sin(a) * r), 2, 2, i % 2 ? "#fff3c4" : "#F7C04A"); }
  }

  // ---------- mode icons (24x24 animated) ----------
  let iconOn = false;
  function icon(kind, c, t) {
    const p = new A.Pix(24, 24), K = "#1d1d1b";
    if (kind === "battery") {
      p.rect(3, 7, 17, 11, K); p.rect(4, 8, 15, 9, "#ffffff"); p.rect(20, 10, 2, 5, K);
      const lv = Math.floor(t / 8) % 6;
      for (let b = 0; b < Math.min(lv, 4); b++) p.rect(5 + b * 3.5, 9, 3, 7, c.color);
      if (lv >= 4) { p.poly([[12, 8], [8, 13], [11, 13], [10, 17], [15, 11], [12, 11]], "#ffffff"); p.line(12, 8, 10, 12, K); }
    } else if (kind === "pin") {
      p.rect(2, 6, 18, 11, K); p.rect(3, 7, 16, 9, "#ffffff"); p.poly([[5, 16], [9, 16], [5, 20]], K);
      const d = Math.floor(t / 6) % 4; for (let j = 0; j < 3; j++) p.rect(6 + j * 4, j < d ? 10 : 11, 2, 2, j < d ? c.dark : "#cfc6b0");
      const by = (Math.floor(t / 10) % 2); p.ellipse(19, 5 - by, 3.5, 3.5, "#E0443A"); p.rect(18, 7 - by, 2, 4, K); p.px(18, 4 - by, "#ffffff");
    } else if (kind === "up") {
      [[3, 15, 5], [9, 11, 9], [15, 7, 13]].forEach(([x, y, h], j) => { p.rect(x, y, 5, h + 1, K); p.rect(x + 1, y + 1, 3, h - 1, j === 2 ? c.color : c.light); });
      const ay = (Math.floor(t / 6) % 3); p.poly([[17.5, 0 + ay], [14, 4 + ay], [21, 4 + ay]], c.dark); p.rect(17, 4 + ay, 1, 2, c.dark);
      p.rect(2, 21, 20, 1, K);
    } else if (kind === "house") {
      p.poly([[12, 2], [1, 11], [23, 11]], K); p.poly([[12, 4], [4, 10], [20, 10]], "#E0443A");
      p.rect(4, 11, 16, 11, K); p.rect(5, 11, 14, 10, "#fff6e0");
      p.rect(10, 15, 4, 6, K); p.rect(6, 13, 3, 3, (Math.floor(t / 12) % 2) ? "#F7C04A" : "#cfc6b0"); p.rect(15, 13, 3, 3, (Math.floor(t / 12) % 2) ? "#cfc6b0" : "#F7C04A");
      if (Math.floor(t / 8) % 2) { p.ellipse(20, 4, 3, 3, c.color); p.px(20, 3, "#ffffff"); p.px(20, 5, "#ffffff"); }
    }
    return p;
  }
  function iconLoop(kind, c) {
    if (!iconOn) return; tick++;
    const cvI = $("#ricon"), x = cvI.getContext("2d");
    x.clearRect(0, 0, 24, 24); x.drawImage(icon(kind, c, tick).canvas(), 0, 0);
    setTimeout(() => requestAnimationFrame(() => iconLoop(kind, c)), 1000 / 24);
  }

  // ---------- RESULT ----------
  function showResult() {
    const { win, pct, second } = score(), r = D.R[win];
    show("result"); SFX.fanfare();
    const card = $("#rcard"); card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
    document.querySelectorAll("#result .rcard,#result .rside").forEach(el => el.style.setProperty("--c", r.color));
    $("#rsay").innerHTML = `ช่วงนี้คุณอยู่ใน <b>${r.name}</b>!` + (second ? ` · มีส่วนผสมของ${D.R[second].name}อยู่ด้วยนะ` : "");
    $("#rname").textContent = win + " ERA";
    $("#rera").textContent = r.name;
    $("#rdesc").textContent = r.desc;
    $("#rpunch").textContent = r.punch;
    $("#rmix").innerHTML = ORDER.slice().sort((a, b) => pct[b] - pct[a]).map(k =>
      `<div class="mix ${k === win ? "win" : ""}" style="--c:${D.R[k].color}"><span>${D.R[k].name}</span><div class="t"><i style="width:${pct[k]}%"></i></div><span class="n">${pct[k]}%</span></div>`).join("");
    // ซองพิกเซล (1 ซอง = ตั้งตรง · 2 ซอง = เอียงชนกัน)
    const two = r.packs.length > 1, sc = two ? 2.05 : 3;
    $("#rpacks").innerHTML = r.packs.map(([k, lab], j) => {
      const pos = two ? `left:${j ? 73 : 27}%;--r:${j ? 8 : -8}deg;--d:${j * 0.15}s;top:${j ? 47 : 53}%` : "";
      return `<div class="pk" style="${pos}"><div class="in"><canvas data-k="${k}"></canvas><em>${lab}</em></div></div>`;
    }).join("") + [[8, 14], [88, 30], [14, 78], [80, 86]].map(([x, y], j) => `<i class="spk" style="left:${x}%;top:${y}%;animation-delay:${j * .25}s"></i>`).join("");
    $("#rpacks").querySelectorAll("canvas").forEach(c => { const pc = window.PACKS.draw(c.dataset.k).canvas(); c.width = pc.width; c.height = pc.height; c.style.width = pc.width * sc + "px"; c.style.height = pc.height * sc + "px"; c.getContext("2d").drawImage(pc, 0, 0); });
    $("#rprod").textContent = r.product; $("#rwhy").textContent = r.why;
    $("#rtag").textContent = "👉 " + r.tag;
    $("#rsolo").textContent = "ลด " + D.coupon.solo; $("#rpair").textContent = D.coupon.pair;
    // half sandwich = ครึ่งที่เชฟเพิ่งฟัน
    const s = stack(ans, true), h = new A.Pix(s.w, s.h);
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const c = s.get(x, y); if (c && leftHalf(x, y)) h.px(x, y, c); }
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (!h.get(x, y) && leftHalf(x - 1, y) && h.get(x - 1, y)) h.px(x, y, "#E0443A");
    const hc = $("#rhalf"), hcv = h.canvas(); hc.width = hcv.width; hc.height = hcv.height; hc.getContext("2d").drawImage(hcv, 0, 0);
    // แซนวิชเต็มที่ถูกฟันแยกสองครึ่ง
    const W2 = s.w + 8, sp = new A.Pix(W2, s.h + 4);
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const c = s.get(x, y); if (!c) continue; const L = leftHalf(x, y); sp.px(x + (L ? 0 : 8), y + (L ? 4 : 0), c); }
    const rs = $("#rsand"), spc = sp.canvas(); rs.width = spc.width; rs.height = spc.height; rs.getContext("2d").drawImage(spc, 0, 0);
    iconOn = true; iconLoop(r.icon, r);
  }

  // ---------- ทางลัดสำหรับตรวจ: index.html?r=YOU (ข้ามไปหน้าผล) · &cut=1 (ดูคัตซีนด้วย) ----------
  const qp = new URLSearchParams(location.search), jump = qp.get("r");
  if (jump && D.R[jump]) {
    const o = ORDER.filter(k => k !== jump);
    ans = [jump, o[0], jump, o[1], jump, o[0], o[2], jump]; i = 8; closed = true;
    if (qp.get("cut")) craft(); else showResult();
  } else show("title");
})();
