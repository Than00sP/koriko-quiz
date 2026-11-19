/* KORIKO QUIZ — ซองสินค้าแบบพิกเซล (อิงซองจริงจาก nbfthailand.com · raw/nbf-website/)
   PACKS.draw(kind) → ART.Pix · kind: original | noodle | egg | npd | truffle | sourcream | bigsheets */
(function () {
  const A = window.ART, K = "#1d1d1b";

  // ตัวอักษร 3x5
  const F = {
    K: ["101", "110", "100", "110", "101"], O: ["111", "101", "101", "101", "111"], R: ["110", "101", "110", "101", "101"],
    I: ["111", "010", "010", "010", "111"], P: ["110", "101", "110", "100", "100"], T: ["111", "010", "010", "010", "010"],
    E: ["111", "100", "110", "100", "111"], N: ["1001", "1101", "1011", "1001", "1001"], W: ["10001", "10001", "10101", "11011", "10001"],
    B: ["110", "101", "110", "101", "110"], G: ["111", "100", "101", "101", "111"], "1": ["010", "110", "010", "010", "111"],
    "7": ["111", "001", "010", "010", "010"],
    H: ["101", "101", "111", "101", "101"], "6": ["111", "100", "111", "101", "111"], " ": ["000", "000", "000", "000", "000"]
  };
  function text(p, s, x, y, c) { let cx = x; [...s].forEach(ch => { const g = F[ch] || F[" "]; g.forEach((row, j) => [...row].forEach((b, k) => { if (b === "1") p.px(cx + k, y + j, c); })); cx += g[0].length + 1; }); return cx - x - 1; }
  const tw = s => [...s].reduce((a, ch) => a + (F[ch] || F[" "])[0].length + 1, 0) - 1;

  // ทรงซองหมอน + รอยหยักบนล่าง
  function bag(W, H, fill) {
    const p = new A.Pix(W, H);
    for (let y = 3; y < H - 3; y++) { const inset = (y < 6 || y > H - 7) ? 1 : 0; p.rect(1 + inset, y, W - 2 - inset * 2, 1, fill(y)); }
    for (let x = 1; x < W - 1; x++) { const z = x % 2; p.px(x, 1 + z, "#d9d2c0"); p.px(x, 2, "#efe9da"); p.px(x, H - 3, "#efe9da"); p.px(x, H - 3 + z, "#d9d2c0"); }
    return p;
  }
  function logo(p, x, y) {
    p.rect(x, y, 27, 9, "#F7C04A"); p.rect(x + 1, y + 1, 25, 7, "#E0443A");
    text(p, "KORIKO", x + 2, y + 2, "#ffffff");
  }
  function ninja(p, x, y) {
    const n = A.character("ninja", "grin");
    for (let j = 0; j < 14; j++) for (let i = 0; i < n.w; i++) { const c = n.get(i, j); if (c) p.px(x + i, y + j, c); }
  }
  function nori(p, x, y, w, h) {
    p.rect(x, y, w, h, "#2f5230"); p.rect(x, y, w, 1, "#4a7a45"); p.rect(x, y + h - 1, w, 1, "#1c331d");
    for (let i = 0; i < w * h / 6; i++) p.px(x + (i * 37) % w, y + 1 + (i * 13) % Math.max(1, h - 2), "#5f8f55");
  }
  function badge(p, s, x, y, bg, fg) { const w = tw(s) + 4; p.rect(x, y, w, 9, K); p.rect(x + 1, y + 1, w - 2, 7, bg); text(p, s, x + 2, y + 2, fg); }


  // ซอง NPD: พื้นแถบเฉียง 3 สี · โลโก้บนพระอาทิตย์ · นินจาเบ่งกล้าม · HIGH PROTEIN · 16G · แซนวิชไส้เต้าหู้
  function npdPack(o) {
    const W = 44, H = 56, p = bag(W, H, () => o.a);
    p.poly([[28, 3], [43, 3], [43, 53], [29, 53]], o.c);
    p.poly([[19, 3], [28, 3], [29, 53], [10, 53], [9, 30]], o.b);
    // โลโก้ KORIKO สีแดงขอบขาว บนพระอาทิตย์
    p.ellipse(11, 10, 9, 6, "#F7B733"); p.ellipse(10, 9, 6, 3, "#FBD066");
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) text(p, "KORIKO", 3 + dx, 8 + dy, "#ffffff");
    text(p, "KORIKO", 3, 8, "#D8332B");
    // ป้ายรส
    p.rect(3, 16, 18, 5, o.lab); for (let x = 5; x < 19; x += 2) p.px(x, 18, o.labInk);
    // นินจา (ซองจริงเป็นท่าเบ่งกล้าม — พิกเซลเล็กเกินจะใส่แขน ใช้ป้าย HIGH PROTEIN สื่อแทน)
    ninja(p, 26, 3);
    // HIGH PROTEIN
    p.poly([[9, 23], [43, 21], [43, 33], [9, 35]], "#1f4d22"); p.line(9, 23, 43, 21, "#B6E06A"); p.line(9, 35, 43, 33, "#B6E06A");
    text(p, "HIGH", 13, 24, "#B6E06A"); text(p, "PROTEIN", 12, 29, "#ffffff");
    // 16G
    p.rect(29, 37, 13, 8, "#ffffff"); p.rect(29, 37, 13, 1, "#B6E06A"); text(p, "16G", 30, 39, "#1f4d22");
    // แซนวิชสาหร่ายไส้เต้าหู้ + ก้อนเต้าหู้
    nori(p, 3, 37, 22, 3);
    p.rect(4, 40, 20, 4, "#E3B567");
    for (let i = 0; i < 22; i++) p.px(4 + (i * 7) % 20, 40 + (i * 3) % 4, i % 3 ? "#c99a4e" : "#f3d48f");
    nori(p, 3, 44, 22, 3);
    [[26, 47], [8, 49], [16, 50]].forEach(([x, y]) => { p.rect(x, y, 3, 3, "#E3B567"); p.px(x, y, "#f3d48f"); p.px(x + 2, y + 2, "#c99a4e"); });
    if (o.dot) [[24, 49], [5, 31], [20, 51]].forEach(([x, y]) => p.rect(x, y, 2, 2, o.dot));
    return p.outlined(K);
  }

  const draw = {
    // แซนวิชออริจินัล: ส้มแบ่งเขียว · ข้าวพองครีม
    original() {
      const W = 40, H = 56, p = bag(W, H, y => "#F2A23A");
      p.poly([[31, 3], [39, 3], [39, 53], [22, 53]], "#4B8F48");
      logo(p, 3, 6); ninja(p, 22, 15);
      nori(p, 5, 31, 22, 4); for (let i = 0; i < 18; i++) p.px(6 + (i * 7) % 20, 35 + (i * 3) % 4, i % 2 ? "#fff6e0" : "#f0e2bf"); nori(p, 5, 39, 22, 4);
      p.rect(3, 46, 22, 5, "#fff6e0"); p.rect(4, 47, 20, 3, "#F2A23A");
      return p.outlined(K);
    },
    // บะหมี่เกาหลี: ดำแดง · ชามบะหมี่
    noodle() {
      const W = 40, H = 56, p = bag(W, H, y => "#22252a");
      p.poly([[22, 3], [39, 3], [39, 53], [14, 53]], "#E0443A");
      logo(p, 3, 6); ninja(p, 22, 15);
      p.ellipse(15, 37, 11, 4, "#f7d26a"); for (let x = 6; x < 25; x += 2) p.line(x, 34, x + 1, 39, "#e9b23a");
      p.poly([[3, 38], [27, 38], [23, 46], [7, 46]], "#b5321f"); p.rect(5, 38, 20, 1, "#E0443A");
      p.px(10, 33, "#3f7d3c"); p.px(18, 34, "#3f7d3c"); p.px(14, 32, "#E0443A");
      return p.outlined(K);
    },
    // ไข่เค็ม: ส้มเข้ม · ไข่ผ่าครึ่ง
    egg() {
      const W = 40, H = 56, p = bag(W, H, y => y < 30 ? "#E87A2A" : "#F2A23A");
      logo(p, 3, 6); ninja(p, 22, 15);
      p.ellipse(13, 40, 10, 7, "#ffffff"); p.ellipse(13, 40, 9, 6, "#fbf6ea"); p.ellipse(13, 40, 5, 4, "#F2A23A"); p.ellipse(12, 39, 3, 2, "#F7C04A");
      nori(p, 24, 40, 12, 3); for (let i = 0; i < 6; i++) p.px(25 + i * 2, 43, "#f0c48a");
      return p.outlined(K);
    },
    // NPD สาหร่ายแซนวิช ไส้โปรตีนเต้าหู้ — อิงซองที่เพื่อนออกแบบ (raw/from-group/npd-packaging/ · 18 พ.ย. 69)
    npd() { return npdPack({ a: "#A9C93E", b: "#EEEBD8", c: "#2E6B30", lab: "#ffffff", labInk: K }); },
    truffle() { return npdPack({ a: "#5E2D72", b: "#2B1D33", c: "#46205a", lab: K, labInk: "#ffffff", dot: "#4a3a2e" }); },
    sourcream() { return npdPack({ a: "#6CC3B4", b: "#F1EDD6", c: "#3E9C90", lab: "#E87A2A", labInk: "#ffffff", dot: "#8CC152" }); },
    // Big Sheets: ซองเขียวใหญ่ · แผ่นสาหร่ายใหญ่
    bigsheets() {
      const W = 48, H = 62, p = bag(W, H, y => y % 9 === 0 ? "#53a34f" : "#4B8F48");
      logo(p, 3, 6); ninja(p, 29, 14); badge(p, "BIG", 4, 17, K, "#F7C04A");
      p.poly([[4, 34], [36, 30], [44, 36], [10, 42]], "#1c331d"); p.line(4, 34, 36, 30, "#8fd18a");
      p.poly([[6, 42], [38, 38], [44, 46], [12, 52]], "#1c331d"); p.line(6, 42, 38, 38, "#8fd18a");
      for (let i = 0; i < 30; i++) p.px(8 + (i * 13) % 34, 40 + (i * 7) % 10, "#3f6b3a");
      return p.outlined(K);
    }
  };
  window.PACKS = { draw: k => draw[k]() };
})();
