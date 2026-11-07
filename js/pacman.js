(() => {
"use strict";
const pcxT = 20;
const pcxMap = [
"###################","#........#........#","#o##.###.#.###.##o#","#.................#",
"#.##.#.#####.#.##.#","#....#...#...#....#","####.###.#.###.####","####.#       #.####",
"####.# ##-## #.####","      .#   #.      ","####.# ##### #.####","####.#       #.####",
"####.# ##### #.####","#........#........#","#.##.###.#.###.##.#","#o.#...........#.o#",
"##.#.#.#####.#.#.##","#....#...#...#....#","#.######.#.######.#","#.................#",
"###################"];
const pcxW = pcxMap[0].length, pcxH = pcxMap.length;
const pcxCv = document.getElementById("pcxStage");
const pcxCx = pcxCv.getContext("2d");
pcxCv.width = pcxW * pcxT; pcxCv.height = pcxH * pcxT;
const pcxUi = {score: document.getElementById("pcxScoreBox"), high: document.getElementById("pcxHighBox"),
  lives: document.getElementById("pcxLivesBox"), banner: document.getElementById("pcxBanner")};
const pcxCfg = {pacSpeed: 5.6, ghostSpeed: 5.0, scaredSpeed: 3.2, deadSpeed: 11, scaredTime: 7, startLives: 3};
const pcxKeys = {ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0],
  ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1]};
const pcxNamed = {left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
const pcxCompass = [[0,-1],[-1,0],[0,1],[1,0]];
const pcxCorners = {blinky:[17,0], pinky:[1,0], inky:[17,20], clyde:[1,20]};
const pcxGhosts = [
  {name:"blinky", color:"#ff3030", sx:9, sy:7, rel:0},
  {name:"pinky",  color:"#ffb8ff", sx:9, sy:9, rel:2},
  {name:"inky",   color:"#00e5ff", sx:8, sy:9, rel:5},
  {name:"clyde",  color:"#ffb852", sx:10, sy:9, rel:8}];
const pcxPac = {};
let pcxGrid = [], pcxDots = 0, pcxScore = 0, pcxHigh = 0, pcxLives = 3, pcxLevel = 1;
let pcxMode = "title", pcxScared = 0, pcxChain = 0, pcxPause = 0, pcxLast = 0, pcxTick = 0, pcxClock = 0;
const pcxWallLayer = document.createElement("canvas");
pcxWallLayer.width = pcxCv.width; pcxWallLayer.height = pcxCv.height;
try { pcxHigh = +localStorage.getItem("pcxHigh") || 0; } catch (e) {}

function pcxBuild() {
  pcxGrid = pcxMap.map(r => r.split(""));
  pcxDots = pcxGrid.flat().filter(c => c === "." || c === "o").length;
}
function pcxSpawn() {
  Object.assign(pcxPac, {tx:9, ty:15, dx:0, dy:0, prog:0, want:[0,0], face:[-1,0]});
  for (const g of pcxGhosts) {
    Object.assign(g, {tx:g.sx, ty:g.sy, dx: g.name === "blinky" ? -1 : 0, dy:0, prog:0,
      state: g.name === "blinky" ? "roam" : "home", timer: g.rel, scared:false});
  }
  pcxScared = 0; pcxChain = 0; pcxClock = 0;
}
function pcxBlocked(x, y, door) {
  if (y < 0 || y >= pcxH) return true;
  const c = pcxGrid[y][(x + pcxW) % pcxW];
  return c === "#" || (c === "-" && !door);
}
function pcxPos(e) { return [e.tx + e.dx * e.prog, e.ty + e.dy * e.prog]; }
function pcxAdvance(e, speed, dt, onArrive) {
  e.prog += speed * dt;
  while (e.prog >= 1) {
    e.prog -= 1;
    e.tx = (e.tx + e.dx + pcxW) % pcxW; e.ty += e.dy;
    onArrive(e);
    if (!e.dx && !e.dy) { e.prog = 0; break; }
  }
}
function pcxSetFace(p) { if (p.dx || p.dy) p.face = [p.dx, p.dy]; }
function pcxPacArrive(p) {
  const c = pcxGrid[p.ty][p.tx];
  if (c === "." || c === "o") {
    pcxGrid[p.ty][p.tx] = " "; pcxDots--;
    if (c === ".") pcxScore += 10;
    else {
      pcxScore += 50; pcxScared = pcxCfg.scaredTime; pcxChain = 0;
      pcxGhosts.forEach(g => { if (g.state === "roam") g.scared = true; });
    }
  }
  const w = p.want;
  if ((w[0] || w[1]) && !pcxBlocked(p.tx + w[0], p.ty + w[1], false)) { p.dx = w[0]; p.dy = w[1]; }
  if (pcxBlocked(p.tx + p.dx, p.ty + p.dy, false)) { p.dx = 0; p.dy = 0; }
  pcxSetFace(p);
}
function pcxUpdPac(dt) {
  const p = pcxPac, w = p.want;
  if ((p.dx || p.dy) && w[0] === -p.dx && w[1] === -p.dy) {
    p.tx = (p.tx + p.dx + pcxW) % pcxW; p.ty += p.dy; p.prog = 1 - p.prog; p.dx = w[0]; p.dy = w[1];
  }
  if (!p.dx && !p.dy && (w[0] || w[1]) && !pcxBlocked(p.tx + w[0], p.ty + w[1], false)) { p.dx = w[0]; p.dy = w[1]; }
  pcxSetFace(p);
  if (p.dx || p.dy) pcxAdvance(p, pcxCfg.pacSpeed, dt, pcxPacArrive);
}
function pcxTarget(g) {
  const p = pcxPac, f = p.face;
  if (g.state === "dead") return [9, 9];
  if (g.state === "home") return [9, 7];
  if (pcxClock % 26 < 6) return pcxCorners[g.name];
  if (g.name === "blinky") return [p.tx, p.ty];
  if (g.name === "pinky") return [p.tx + 4 * f[0], p.ty + 4 * f[1]];
  if (g.name === "inky") { const b = pcxGhosts[0]; return [2 * (p.tx + 2 * f[0]) - b.tx, 2 * (p.ty + 2 * f[1]) - b.ty]; }
  return Math.hypot(p.tx - g.tx, p.ty - g.ty) > 8 ? [p.tx, p.ty] : pcxCorners.clyde;
}
function pcxGhostTurn(g) {
  if (g.state === "dead" && g.tx === 9 && g.ty === 9) { g.state = "home"; g.timer = 1.5; }
  if (g.state === "home" && g.timer <= 0 && g.ty <= 7) g.state = "roam";
  const door = g.state === "dead" || (g.state === "home" && g.timer <= 0);
  const moving = g.dx || g.dy;
  let opts = pcxCompass.filter(d => !(moving && d[0] === -g.dx && d[1] === -g.dy) && !pcxBlocked(g.tx + d[0], g.ty + d[1], door));
  if (!opts.length) opts = pcxCompass.filter(d => !pcxBlocked(g.tx + d[0], g.ty + d[1], door));
  if (!opts.length) { g.dx = 0; g.dy = 0; return; }
  let pick;
  if ((g.state === "home" && g.timer > 0) || (g.state === "roam" && g.scared)) {
    pick = opts[Math.floor(Math.random() * opts.length)];
  } else {
    const t = pcxTarget(g);
    pick = opts.reduce((best, d) => {
      const dist = (g.tx + d[0] - t[0]) ** 2 + (g.ty + d[1] - t[1]) ** 2;
      return dist < best.dist ? {d, dist} : best;
    }, {d: opts[0], dist: Infinity}).d;
  }
  g.dx = pick[0]; g.dy = pick[1];
}
function pcxUpdGhost(g, dt) {
  if (g.state === "home" && g.timer > 0) g.timer -= dt;
  const sp = g.state === "dead" ? pcxCfg.deadSpeed : g.scared ? pcxCfg.scaredSpeed
    : pcxCfg.ghostSpeed * (1 + 0.04 * (pcxLevel - 1));
  if (!g.dx && !g.dy) pcxGhostTurn(g);
  if (g.dx || g.dy) pcxAdvance(g, sp, dt, pcxGhostTurn);
}
function pcxCollide() {
  const [px, py] = pcxPos(pcxPac);
  for (const g of pcxGhosts) {
    if (g.state === "dead") continue;
    const [gx, gy] = pcxPos(g);
    if (Math.hypot(px - gx, py - gy) < 0.6) {
      if (g.scared) { g.state = "dead"; g.scared = false; pcxScore += 200 * 2 ** pcxChain; pcxChain++; }
      else { pcxMode = "dying"; pcxPause = 1.2; return; }
    }
  }
}
function pcxFinishRun() {
  pcxMode = "over";
  if (pcxScore > pcxHigh) { pcxHigh = pcxScore; try { localStorage.setItem("pcxHigh", pcxHigh); } catch (e) {} }
  pcxShow(`GAME OVER<small>Score ${pcxScore}<br>Press any key or tap to retry</small>`);
}
function pcxShow(html) { pcxUi.banner.innerHTML = html; pcxUi.banner.classList.remove("pcx-hide"); }
function pcxHide() { pcxUi.banner.classList.add("pcx-hide"); }
function pcxNewGame() {
  pcxScore = 0; pcxLives = pcxCfg.startLives; pcxLevel = 1;
  pcxBuild(); pcxSpawn(); pcxMode = "ready"; pcxPause = 1.5; pcxHide();
}
function pcxUpdate(dt) {
  if (pcxMode === "ready") { if ((pcxPause -= dt) <= 0) pcxMode = "play"; return; }
  if (pcxMode === "dying") {
    if ((pcxPause -= dt) <= 0) {
      if (--pcxLives <= 0) pcxFinishRun(); else { pcxSpawn(); pcxMode = "ready"; pcxPause = 1.5; }
    }
    return;
  }
  if (pcxMode !== "play") return;
  pcxClock += dt;
  if (pcxScared > 0 && (pcxScared -= dt) <= 0) pcxGhosts.forEach(g => g.scared = false);
  pcxUpdPac(dt); pcxGhosts.forEach(g => pcxUpdGhost(g, dt)); pcxCollide();
  if (pcxMode === "play" && pcxDots <= 0) { pcxLevel++; pcxBuild(); pcxSpawn(); pcxMode = "ready"; pcxPause = 2; }
}
/* ---------- drawing ---------- */
function pcxPaintWalls() {
  const c = pcxWallLayer.getContext("2d");
  c.strokeStyle = "#3b5bff"; c.lineWidth = 2; c.shadowColor = "#3b5bff"; c.shadowBlur = 6; c.beginPath();
  const solid = (x, y) => y < 0 || y >= pcxH || x < 0 || x >= pcxW || pcxMap[y][x] === "#";
  for (let y = 0; y < pcxH; y++) for (let x = 0; x < pcxW; x++) {
    if (pcxMap[y][x] !== "#") continue;
    const l = x * pcxT, t = y * pcxT, r = l + pcxT, b = t + pcxT;
    if (!solid(x, y - 1)) { c.moveTo(l, t + 1); c.lineTo(r, t + 1); }
    if (!solid(x, y + 1)) { c.moveTo(l, b - 1); c.lineTo(r, b - 1); }
    if (!solid(x - 1, y)) { c.moveTo(l + 1, t); c.lineTo(l + 1, b); }
    if (!solid(x + 1, y)) { c.moveTo(r - 1, t); c.lineTo(r - 1, b); }
  }
  c.stroke(); c.shadowBlur = 0; c.fillStyle = "#ffb8ff";
  for (let x = 0; x < pcxW; x++) for (let y = 0; y < pcxH; y++) if (pcxMap[y][x] === "-") c.fillRect(x * pcxT, y * pcxT + 8, pcxT, 3);
}
function pcxDrawPac() {
  const p = pcxPac, [x, y] = pcxPos(p), cx = (x + .5) * pcxT, cy = (y + .5) * pcxT, a = Math.atan2(p.face[1], p.face[0]);
  let open = (p.dx || p.dy) ? 0.05 + 0.27 * Math.abs(Math.sin(pcxTick * 12)) : 0.25;
  if (pcxMode === "dying") open = Math.min(1, 1 - pcxPause / 1.2);
  pcxCx.fillStyle = "#ffe600"; pcxCx.beginPath(); pcxCx.moveTo(cx, cy);
  pcxCx.arc(cx, cy, pcxT * 0.46, a + open * Math.PI, a + (2 - open) * Math.PI); pcxCx.closePath(); pcxCx.fill();
}
function pcxDrawGhost(g) {
  const [x, y] = pcxPos(g), cx = (x + .5) * pcxT, cy = (y + .5) * pcxT, r = pcxT * 0.45, c = pcxCx;
  if (g.state !== "dead") {
    const flash = g.scared && pcxScared < 2 && Math.floor(pcxTick * 8) % 2;
    c.fillStyle = g.scared ? (flash ? "#fff" : "#2a2aff") : g.color;
    c.beginPath(); c.arc(cx, cy - 1, r, Math.PI, 0); c.lineTo(cx + r, cy + r);
    for (let i = 1; i <= 6; i++) c.lineTo(cx + r - i * (2 * r / 6), cy + r - (i % 2 ? 3 : 0));
    c.closePath(); c.fill();
  }
  c.fillStyle = "#fff";
  if (g.scared && g.state !== "dead") { c.fillStyle = "#ffd0d0"; c.fillRect(cx - 4, cy - 3, 2.5, 2.5); c.fillRect(cx + 2, cy - 3, 2.5, 2.5); return; }
  for (const ox of [-3.5, 3.5]) { c.beginPath(); c.arc(cx + ox, cy - 2, 2.8, 0, 7); c.fill(); }
  c.fillStyle = "#1a1aff";
  for (const ox of [-3.5, 3.5]) { c.beginPath(); c.arc(cx + ox + g.dx * 1.4, cy - 2 + g.dy * 1.4, 1.4, 0, 7); c.fill(); }
}
function pcxDraw() {
  const c = pcxCx; c.fillStyle = "#000"; c.fillRect(0, 0, pcxCv.width, pcxCv.height);
  c.drawImage(pcxWallLayer, 0, 0);
  for (let y = 0; y < pcxH; y++) for (let x = 0; x < pcxW; x++) {
    const ch = pcxGrid[y] && pcxGrid[y][x];
    if (ch === ".") { c.fillStyle = "#ffd9b0"; c.fillRect(x * pcxT + 8.5, y * pcxT + 8.5, 3, 3); }
    else if (ch === "o" && Math.floor(pcxTick * 3) % 2 === 0) { c.fillStyle = "#ffd9b0"; c.beginPath(); c.arc((x + .5) * pcxT, (y + .5) * pcxT, 5, 0, 7); c.fill(); }
  }
  if (pcxMode === "title") return;
  pcxDrawPac();
  if (pcxMode !== "dying") pcxGhosts.forEach(pcxDrawGhost);
  if (pcxMode === "ready") { c.fillStyle = "#ffe600"; c.font = "bold 14px Courier New"; c.textAlign = "center"; c.fillText("READY!", pcxCv.width / 2, 11 * pcxT + 6); }
  pcxUi.score.textContent = pcxScore; pcxUi.high.textContent = Math.max(pcxHigh, pcxScore); pcxUi.lives.textContent = pcxLives;
}
function pcxLoop(ts) {
  const dt = Math.min(0.05, (ts - pcxLast) / 1000 || 0); pcxLast = ts; pcxTick += dt;
  pcxUpdate(dt); pcxDraw(); requestAnimationFrame(pcxLoop);
}
/* ---------- input ---------- */
function pcxSteer(d) {
  pcxPac.want = d;
  if (pcxMode === "title" || pcxMode === "over") pcxNewGame();
}
window.addEventListener("keydown", e => {
  if (pcxKeys[e.key]) { e.preventDefault(); pcxSteer(pcxKeys[e.key]); }
  else if (pcxMode === "title" || pcxMode === "over") pcxNewGame();
});
let pcxSwipe = null;
pcxCv.parentElement.addEventListener("pointerdown", e => { window.focus(); pcxSwipe = [e.clientX, e.clientY];
  if (pcxMode === "title" || pcxMode === "over") pcxNewGame(); });
window.addEventListener("pointerup", e => {
  if (!pcxSwipe) return;
  const dx = e.clientX - pcxSwipe[0], dy = e.clientY - pcxSwipe[1]; pcxSwipe = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  pcxSteer(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
});
document.querySelectorAll("[data-pcx-dir]").forEach(b => b.addEventListener("pointerdown", e => {
  e.stopPropagation(); pcxSteer(pcxNamed[b.dataset.pcxDir]); }));
pcxBuild(); pcxSpawn(); pcxPaintWalls(); window.focus(); requestAnimationFrame(pcxLoop);
})();
