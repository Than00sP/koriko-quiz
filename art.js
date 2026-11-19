/* KORIKO SANDWICH LAB — pixel art (วาดด้วยโค้ดทั้งหมด สไตล์ตัวละคร 1in8b) */
(function () {
  const OUT = "#353a40";

  // ---------- pixel buffer ----------
  class Pix {
    constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
    px(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = c; }
    get(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null; return this.d[y * this.w + x]; }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); }
    ellipse(cx, cy, rx, ry, c) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
          if (dx * dx + dy * dy <= 1) this.px(x, y, c);
        }
    }
    poly(pts, c) {
      let minY = Infinity, maxY = -Infinity;
      pts.forEach(p => { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
      for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        const yy = y + 0.5, xs = [];
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], b = pts[(i + 1) % pts.length];
          if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy))
            xs.push(a[0] + (yy - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
        }
        xs.sort((p, q) => p - q);
        for (let i = 0; i + 1 < xs.length; i += 2)
          for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) this.px(x, y, c);
      }
    }
    line(x0, y0, x1, y1, c) {
      x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let e = dx + dy;
      for (;;) { this.px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    }
    replace(from, to) { for (let i = 0; i < this.d.length; i++) if (this.d[i] === from) this.d[i] = to; }
    blit(o, x, y) { for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) { const c = o.d[j * o.w + i]; if (c) this.px(x + i, y + j, c); } }
    outlined(c = OUT) {
      const r = new Pix(this.w + 2, this.h + 2); r.blit(this, 1, 1);
      for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++)
        if (!r.get(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const v = r.get(x + a, y + b); return v && v !== c; }))
          r.d[y * r.w + x] = c;
      return r;
    }
    canvas() {
      const cv = document.createElement("canvas"); cv.width = this.w; cv.height = this.h;
      const ctx = cv.getContext("2d"), im = ctx.createImageData(this.w, this.h);
      for (let i = 0; i < this.d.length; i++) {
        const c = this.d[i]; if (!c) continue;
        const n = parseInt(c.slice(1), 16);
        im.data[i * 4] = n >> 16; im.data[i * 4 + 1] = (n >> 8) & 255; im.data[i * 4 + 2] = n & 255; im.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(im, 0, 0); return cv;
    }
  }

  // ---------- chibi person (สไตล์ 1in8b: หัวโต ขอบเข้ม สีแบน) ----------
  // o: skin, hair, hairHi, style(long|short|bun|spiky), shirt, shirt2, pants, shoes, glasses, phones, mood, ninja
  function person(o) {
    const p = new Pix(16, 22), X = 1, Y = 3;
    const P = (x, y, c) => p.px(X + x, Y + y, c);
    const skin = o.mood === "spicy" ? "#e0785c" : o.skin;
    const skinSh = o.mood === "spicy" ? "#c85f45" : (o.skinSh || shade(o.skin, -18));
    // head silhouette (hair first)
    for (let y = 0; y <= 9; y++) for (let x = 1; x <= 10; x++) {
      if ((y === 0) && (x < 3 || x > 8)) continue;
      if ((y === 1) && (x < 2 || x > 9)) continue;
      P(x, y, o.hair);
    }
    // face
    for (let y = 3; y <= 9; y++) for (let x = 2; x <= 9; x++) {
      if (y === 9 && (x === 2 || x === 9)) continue;
      P(x, y, skin);
    }
    // bangs + side hair
    P(2, 3, o.hair); P(3, 3, o.hair); P(9, 3, o.hair);
    if (o.style === "long") { for (let y = 3; y <= 12; y++) { P(1, y, o.hair); P(10, y, o.hair); } P(2, 4, o.hair); P(9, 4, o.hair); }
    else if (o.style === "short") { for (let y = 3; y <= 6; y++) { P(1, y, o.hair); P(10, y, o.hair); } }
    else if (o.style === "bun") { for (let y = 3; y <= 7; y++) { P(1, y, o.hair); P(10, y, o.hair); } for (let x = 4; x <= 7; x++) { P(x, -1, o.hair); P(x, -2, o.hair); } P(5, -2, o.hairHi); }
    else if (o.style === "spiky") {
      for (let y = 3; y <= 6; y++) { P(1, y, o.hair); P(10, y, o.hair); }
      [[2, -1], [3, -2], [5, -2], [6, -3], [8, -2], [9, -1], [0, 1], [11, 1], [0, 2]].forEach(([x, y]) => P(x, y, o.hair));
      P(3, -1, o.hair); P(5, -1, o.hair); P(6, -2, o.hair); P(6, -1, o.hair); P(8, -1, o.hair);
    }
    // hair highlight
    if (o.hairHi) { P(4, 1, o.hairHi); P(5, 1, o.hairHi); P(7, 1, o.hairHi); }
    // ninja headband
    if (o.ninja) {
      for (let x = 1; x <= 10; x++) { P(x, 3, "#f4f1ea"); P(x, 2, x % 3 ? "#f4f1ea" : "#dcd6c8"); }
      P(5, 2, "#e0443a"); P(6, 2, "#f2a23a"); P(5, 3, "#f2a23a"); P(6, 3, "#e0443a");
      P(11, 3, "#f4f1ea"); P(12, 4, "#dcd6c8"); P(12, 5, "#f4f1ea");
    }
    // face shading under hair
    P(4, 3, skinSh); P(8, 3, skinSh);
    // eyes / mouth by mood
    const E = "#2a2e33", M = "#a85b4c";
    const mood = o.mood || "ok";
    if (mood === "happy") {
      P(2, 5, E); P(3, 4, E); P(4, 5, E); P(7, 5, E); P(8, 4, E); P(9, 5, E);
      P(4, 7, M); P(5, 8, M); P(6, 8, M); P(7, 7, M); P(5, 7, "#f08a8a"); P(6, 7, "#f08a8a");
    } else if (mood === "grin") {
      P(3, 5, E); P(8, 5, E);
      for (let x = 4; x <= 7; x++) P(x, 7, "#8e2f2a"); P(5, 8, "#f08a8a"); P(6, 8, "#f08a8a"); P(4, 8, "#8e2f2a"); P(7, 8, "#8e2f2a");
      P(4, 6, "#ffffff"); P(5, 6, "#ffffff"); P(6, 6, "#ffffff"); P(7, 6, "#ffffff");
    } else if (mood === "sad") {
      P(3, 5, E); P(8, 5, E); P(2, 4, E); P(9, 4, E);
      P(4, 8, M); P(5, 7, M); P(6, 7, M); P(7, 8, M);
      P(11, 4, "#7cc4f0"); P(11, 5, "#4aa3dc");
    } else if (mood === "spicy") {
      P(2, 5, E); P(3, 5, E); P(8, 5, E); P(9, 5, E);
      P(5, 7, "#5a1d1a"); P(6, 7, "#5a1d1a"); P(5, 8, "#5a1d1a"); P(6, 8, "#5a1d1a");
    } else if (mood === "closed") {
      P(2, 5, E); P(3, 5, E); P(8, 5, E); P(9, 5, E); P(5, 7, M); P(6, 7, M);
    } else { P(3, 5, E); P(8, 5, E); P(5, 7, M); P(6, 7, M); }
    if (mood !== "spicy") { P(2, 6, "#d9776a"); P(9, 6, "#d9776a"); }
    if (o.glasses) { ["#2a2e33"].forEach(g => { P(2, 5, g); P(4, 5, g); P(7, 5, g); P(9, 5, g); P(5, 5, g); P(6, 5, g); }); P(3, 5, mood === "happy" ? E : "#9fc6e0"); P(8, 5, mood === "happy" ? E : "#9fc6e0"); if (mood === "happy") { P(3, 4, skin); P(8, 4, skin); } }
    if (o.phones) { for (let x = 1; x <= 10; x++) P(x, -1, x === 1 || x === 10 ? o.phones : null); for (let x = 2; x <= 9; x++) P(x, -1, o.phones); P(0, 4, o.phones); P(0, 5, o.phones); P(11, 4, o.phones); P(11, 5, o.phones); P(1, 0, o.phones); P(10, 0, o.phones); }
    // body
    for (let y = 10; y <= 14; y++) for (let x = 2; x <= 9; x++) P(x, y, o.shirt);
    for (let x = 2; x <= 9; x++) P(x, 14, o.shirt2);
    for (let y = 10; y <= 13; y++) { P(1, y, o.shirt2); P(10, y, o.shirt2); }
    P(1, 14, o.skin); P(10, 14, o.skin);
    if (o.ninja) {
      P(5, 10, "#f4f1ea"); P(6, 10, "#f4f1ea"); P(4, 10, "#f4f1ea"); P(7, 11, "#f4f1ea"); P(5, 11, "#f4f1ea"); P(6, 12, "#f4f1ea");
      for (let x = 2; x <= 9; x++) P(x, 13, "#1e2124"); P(8, 13, "#e0443a");
    }
    if (o.cardigan) { P(5, 10, o.cardigan); P(6, 10, o.cardigan); for (let y = 11; y <= 14; y++) { P(5, y, o.cardigan); P(6, y, o.cardigan); } }
    // legs
    for (let x = 3; x <= 8; x++) P(x, 15, o.pants);
    P(3, 16, o.pants); P(4, 16, o.pants); P(7, 16, o.pants); P(8, 16, o.pants);
    P(3, 17, o.shoes); P(4, 17, o.shoes); P(7, 17, o.shoes); P(8, 17, o.shoes);
    // katana hilt over right shoulder (behind head)
    if (o.ninja) {
      const hilt = [[11, 0], [12, -1], [13, -2], [12, 0], [13, -1], [14, -2]];
      hilt.forEach(([x, y], i) => P(x, y, i % 2 ? "#1e2124" : "#f2c037"));
      P(11, 1, "#c99a2e"); P(12, 1, "#c99a2e"); P(14, -3, "#1e2124");
    }
    return p.outlined();
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = v => Math.max(0, Math.min(255, v + amt));
    return "#" + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, "0")).join("");
  }

  const LOOKS = {
    ninja:  { skin: "#f3c9a0", hair: "#22252a", hairHi: "#3b4048", style: "spiky", shirt: "#3f7d3c", shirt2: "#2d5e2b", pants: "#2d5e2b", shoes: "#1e2124", ninja: true },
    // 6–14 ชุดนักเรียน
    kid:    { skin: "#e8b48c", hair: "#2b2422", hairHi: "#463a35", style: "short", shirt: "#f4f1ea", shirt2: "#d6d0c2", pants: "#2f3e66", shoes: "#1e2124" },
    // 15–24 เสื้อเหลือง ใส่หูฟัง
    teen:   { skin: "#e8b48c", hair: "#5a3a2c", hairHi: "#7a5040", style: "long", shirt: "#f2b632", shirt2: "#d4952a", pants: "#3d4f73", shoes: "#f4f1ea", phones: "#e0443a" },
    // 25–44 target หลัก เสื้อเชิ้ตฟ้า ผมยาว
    adult:  { skin: "#e3ab84", hair: "#3a2a24", hairHi: "#5a4038", style: "long", shirt: "#9cc3d9", shirt2: "#7fa9c2", pants: "#55585e", shoes: "#2a2e33" },
    // 45–59 ผมสั้น เสื้อแดงเลือดหมู
    mid:    { skin: "#d9a07a", hair: "#232020", hairHi: "#3d3836", style: "short", shirt: "#8e3b46", shirt2: "#73303a", pants: "#4a4d55", shoes: "#2a2e33" },
    // 60+ ผมขาวมวย ใส่แว่น เสื้อฟ้าอ่อน
    senior: { skin: "#d9a27c", hair: "#d8d4cc", hairHi: "#f2efe8", style: "bun", shirt: "#a9c9e3", shirt2: "#8fb2cf", pants: "#6b5f4f", shoes: "#3b2e24", glasses: true }
  };
  function character(kind, mood) { return person(Object.assign({}, LOOKS[kind], { mood })); }

  // ---------- sandwich (side 3/4 view) ----------
  function sandwich(sw, fi, se, W = 60) {
    const H = 30, p = new Pix(W, H);
    const s = sw.art, f = fi.art;
    const sheet = (y0) => {
      // top face (lighter) + front edge
      p.poly([[3, y0 + 3], [W - 6, y0], [W - 2, y0 + 3], [7, y0 + 6]].map(([x, y]) => [x, y]), s.light);
      p.rect(2, y0 + 3, W - 4, 3, s.base);
      p.poly([[3, y0 + 3], [W - 6, y0], [W - 2, y0 + 3]], s.base);
      p.rect(2, y0 + 6, W - 4, 1, s.dark);
      // texture flecks (fixed pattern)
      for (let i = 0; i < W * 0.6; i++) { const x = 4 + (i * 37) % (W - 8), y = y0 + 1 + (i * 13) % 5; if (p.get(x, y)) p.px(x, y, i % 3 ? s.fleck : s.light); }
    };
    // bottom sheet
    sheet(H - 8);
    // filling block
    const fy = 9, fh = 13;
    p.rect(3, fy, W - 6, fh, f.base);
    p.rect(3, fy + fh - 2, W - 6, 2, f.dark);
    if (f.pattern === "puff") {
      for (let r = 0; r < 3; r++) for (let x = 4 + (r % 2) * 3; x < W - 6; x += 6) { const y = fy + 1 + r * 4; p.ellipse(x + 2, y + 2, 2.6, 2, f.light); p.px(x + 3, y + 3, f.dark); p.px(x + 1, y + 1, "#ffffff"); }
    } else if (f.pattern === "tofu") {
      for (let r = 0; r < 2; r++) for (let x = 4; x < W - 8; x += 7) { const y = fy + 1 + r * 6; p.rect(x, y, 6, 5, f.light); p.rect(x, y + 4, 6, 1, f.dark); p.rect(x + 5, y, 1, 5, f.dark); p.px(x + 1, y + 1, "#ffffff"); }
    } else if (f.pattern === "bean") {
      for (let i = 0; i < 22; i++) { const x = 5 + (i * 23) % (W - 12), y = fy + 2 + (i * 7) % (fh - 4); p.ellipse(x + 1.5, y + 1.2, 2.2, 1.5, f.light); p.px(x + 2, y + 2, f.dark); p.px(x, y, "#fff6dc"); }
    } else if (f.pattern === "tempeh") {
      for (let i = 0; i < 26; i++) { const x = 5 + (i * 29) % (W - 12), y = fy + 2 + (i * 5) % (fh - 5); p.ellipse(x + 1.5, y + 1.2, 2, 1.4, "#c9a35e"); p.px(x + 2, y + 2, f.dark); p.px(x + 1, y, "#e6c98a"); }
      for (let x = 3; x < W - 3; x += 3) p.px(x, fy + 1, f.light);
    } else if (f.pattern === "egg") {
      for (let r = 0; r < 3; r++) for (let x = 4 + (r % 2) * 4; x < W - 6; x += 8) { const y = fy + 1 + r * 4; p.ellipse(x + 3, y + 2, 3.4, 2, f.light); p.px(x + 4, y + 3, f.dark); p.px(x + 1, y + 1, "#f6efdc"); }
    } else if (f.pattern === "skin") {
      for (let r = 0; r < 4; r++) for (let x = 3; x < W - 3; x++) { const y = fy + 1 + r * 3 + Math.round(Math.sin((x + r * 5) / 3) * 1); p.px(x, y, f.light); p.px(x, y + 1, f.dark); }
    }
    // top sheet
    sheet(0);
    // seasoning dust on top
    const d = se.art.dust;
    for (let i = 0; i < 26; i++) { const x = 6 + (i * 29) % (W - 12), y = 1 + (i * 11) % 4; if (p.get(x, y)) p.px(x, y, d[i % 2]); }
    return p.outlined();
  }

  // ---------- background: Koriko kitchen (192x108) ----------
  function kitchen() {
    const W = 192, H = 108, p = new Pix(W, H);
    // wall
    p.rect(0, 0, W, H, "#f4ecd9");
    for (let x = 0; x < W; x += 6) p.rect(x, 0, 1, 70, "#efe4cc");
    p.rect(0, 0, W, 4, "#d6c7a6"); p.rect(0, 4, W, 1, "#c4b38f");
    // window
    p.rect(10, 12, 50, 36, "#6b5236");
    const sky = ["#a6d8ea", "#b4dfee", "#c3e6f2", "#d2ecf5"];
    for (let i = 0; i < 4; i++) p.rect(12, 14 + i * 8, 46, 8, sky[i]);
    // clouds
    [[16, 18], [38, 22]].forEach(([cx, cy]) => { p.rect(cx, cy, 12, 3, "#ffffff"); p.rect(cx + 2, cy - 2, 6, 2, "#ffffff"); p.rect(cx, cy + 3, 12, 1, "#e3f1f6"); });
    // distant sea + seaweed farm poles
    p.rect(12, 38, 46, 8, "#5aa7c4"); p.rect(12, 38, 46, 1, "#7cc0d8");
    for (let x = 15; x < 58; x += 5) { p.rect(x, 36, 1, 6, "#6b5236"); }
    p.rect(34, 12, 2, 36, "#6b5236"); p.rect(10, 29, 50, 2, "#6b5236");
    p.rect(8, 48, 54, 3, "#8a6a44"); p.rect(8, 51, 54, 1, "#6b5236");
    // noren curtain (right)
    p.rect(132, 6, 54, 2, "#6b5236");
    for (let i = 0; i < 3; i++) {
      const x = 133 + i * 18; p.rect(x, 8, 16, 26, "#d8402f"); p.rect(x, 32, 16, 2, "#b5321f");
      p.rect(x + 15, 8, 1, 26, "#b5321f");
    }
    p.ellipse(159, 20, 8, 8, "#f4f1ea");
    // K mark
    p.rect(156, 15, 2, 10, "#d8402f"); p.line(158, 20, 162, 15, "#d8402f"); p.line(158, 20, 162, 25, "#d8402f"); p.line(159, 20, 163, 15, "#d8402f"); p.line(159, 20, 163, 25, "#d8402f");
    // shelf with jars + green packs
    p.rect(72, 30, 50, 2, "#8a6a44"); p.rect(72, 32, 50, 1, "#6b5236");
    [[74, "#3f7d3c"], [82, "#3f7d3c"], [90, "#f2c037"]].forEach(([x, c]) => { p.rect(x, 20, 7, 10, c); p.rect(x + 1, 22, 5, 3, "#f4f1ea"); p.px(x + 3, 23, "#d8402f"); });
    [[100, "#c7dbe0"], [108, "#c7dbe0"], [115, "#e8d3b6"]].forEach(([x, c]) => { p.rect(x, 22, 6, 8, c); p.rect(x, 21, 6, 1, "#8a6a44"); p.rect(x + 1, 25, 4, 4, x === 115 ? "#d4a862" : "#4f7f44"); });
    // hanging lamp
    p.rect(96, 0, 1, 10, "#6b5236"); p.poly([[90, 14], [103, 14], [100, 10], [93, 10]], "#f2a23a"); p.rect(94, 14, 5, 1, "#fff2b0");
    // poster frame
    p.rect(72, 40, 22, 16, "#6b5236"); p.rect(73, 41, 20, 14, "#fff6e0"); p.rect(75, 43, 16, 5, "#1f3a1c"); p.rect(75, 48, 16, 3, "#f1dca6"); p.rect(75, 51, 16, 2, "#1f3a1c");
    // counter
    p.rect(0, 70, W, 4, "#c9a26a"); p.rect(0, 74, W, 1, "#a8834f");
    p.rect(0, 75, W, 33, "#a8834f");
    for (let x = 0; x < W; x += 24) { p.rect(x, 75, 1, 33, "#8a6a44"); }
    for (let x = 4; x < W; x += 24) { p.rect(x, 82, 16, 1, "#b8925c"); p.rect(x, 96, 16, 1, "#b8925c"); }
    // cutting board
    p.rect(52, 66, 88, 6, "#e3c48f"); p.rect(52, 72, 88, 2, "#c9a26a"); p.rect(52, 66, 88, 1, "#f0d9aa");
    return p;
  }

  window.ART = { Pix, person, character, sandwich, kitchen, shade, OUT, LOOKS };
})();
