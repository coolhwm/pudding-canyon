function roundRect(x, y, w, h, r){
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
function drawSky(){
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#6fd4ff");
  g.addColorStop(0.45, "#87e0ff");
  g.addColorStop(0.78, "#c8f4ff");
  g.addColorStop(1, "#ffe9b8");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sx = W - 110, sy = 72;
  ctx.fillStyle = "#ffe566";
  ctx.beginPath(); ctx.arc(sx, sy, 38, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f0c430"; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = "#ffe566"; ctx.lineWidth = 4;
  for (let i = 0; i \u003c 8; i++){
    const a = i * Math.PI / 4 + t * 0.15;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(a) * 48, sy + Math.sin(a) * 48);
    ctx.lineTo(sx + Math.cos(a) * 62, sy + Math.sin(a) * 62);
    ctx.stroke();
  }
}
function drawHills(){
  const par = camX * 0.28;
  ctx.fillStyle = "#f3c27a";
  ctx.beginPath();
  ctx.ellipse(220 - par, 430, 260, 120, 0, 0, Math.PI * 2);
  ctx.ellipse(640 - par, 450, 200, 90, 0, 0, Math.PI * 2);
  ctx.ellipse(1180 - par, 440, 280, 110, 0, 0, Math.PI * 2);
  ctx.ellipse(1860 - par, 455, 240, 95, 0, 0, Math.PI * 2);
  ctx.ellipse(2580 - par, 438, 270, 115, 0, 0, Math.PI * 2);
  if (currentLevel === 2){
    ctx.ellipse(3300 - par, 442, 250, 108, 0, 0, Math.PI * 2);
    ctx.ellipse(4100 - par, 450, 260, 100, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.fillStyle = "#e8a45c";
  ctx.beginPath();
  ctx.ellipse(400 - par * 0.7, 470, 180, 70, 0, 0, Math.PI * 2);
  ctx.ellipse(1500 - par * 0.7, 475, 220, 80, 0, 0, Math.PI * 2);
  ctx.ellipse(2300 - par * 0.7, 478, 190, 72, 0, 0, Math.PI * 2);
  if (currentLevel === 2){
    ctx.ellipse(3100 - par * 0.7, 478, 200, 75, 0, 0, Math.PI * 2);
    ctx.ellipse(3900 - par * 0.7, 480, 180, 70, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  for (let i = 0; i \u003c 5; i++){
    const cx = ((i * 620 + 80) - camX * 0.15) % (LEVEL_W + 400);
    const cy = 70 + (i % 3) * 22 + Math.sin(t * 0.4 + i) * 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.arc(cx + 24, cy + 4, 18, 0, Math.PI * 2);
    ctx.arc(cx - 22, cy + 6, 16, 0, Math.PI * 2);
    ctx.fill();
  }
}
function drawDirt(p){
  const jig = (p.vanish \u0026\u0026 l2 \u0026\u0026 l2.vanishTimer \u003e 0 \u0026\u0026 !p.vanished) ? Math.sin(t * 40) * (l2.vanishTimer * 6) : 0;
  ctx.save();
  ctx.translate(jig, 0);
  ctx.fillStyle = "#c9844a"; ctx.fillRect(p.x, p.y, p.w, p.h + 40);
  ctx.fillStyle = "#8a4e24"; ctx.fillRect(p.x, p.y, p.w, 10);
  ctx.fillStyle = "#e0b36a"; ctx.fillRect(p.x, p.y, p.w, 5);
  ctx.fillStyle = "#6b3918";
  for (let x = p.x + 16; x \u003c p.x + p.w; x += 38){
    ctx.beginPath(); ctx.arc(x, p.y + 22 + (x % 17), 3.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.w, p.y); ctx.stroke();
  ctx.restore();
}
function drawMud(p){
  ctx.fillStyle = "#5a3318"; ctx.fillRect(p.x, p.y, p.w, p.h + 40);
  ctx.fillStyle = "#3e220f"; ctx.fillRect(p.x, p.y, p.w, 8);
  ctx.fillStyle = "#7a4a22";
  for (let x = p.x + 20; x \u003c p.x + p.w; x += 46){
    ctx.beginPath();
    ctx.ellipse(x, p.y + 4 + Math.sin(t * 2 + x * 0.03) * 2, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
function drawIce(p){
  ctx.fillStyle = "#e8f8ff"; roundRect(p.x - 4, p.y, p.w + 8, p.h + 4, 8); ctx.fill();
  ctx.fillStyle = "#b9e8ff"; ctx.fillRect(p.x, p.y + 8, p.w, 8);
  ctx.strokeStyle = "#7ec8e8"; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(p.x + 18, p.y + 7); ctx.lineTo(p.x + 70, p.y + 7);
  ctx.moveTo(p.x + 110, p.y + 12); ctx.lineTo(p.x + 160, p.y + 12); ctx.stroke();
  for (let i = 0; i \u003c 4; i++){
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(p.x + 30 + i * 55, p.y + 6 + Math.sin(t * 5 + i) * 2, 3, 3);
  }
}
function drawJelly(){
  if (!jelly) return;
  const j = jelly, wob = t * 4.2;
  ctx.beginPath(); ctx.moveTo(j.x, H + 10); ctx.lineTo(j.x, j.y + 10);
  for (let x = 0; x \u003c= j.w; x += 8){
    ctx.lineTo(j.x + x, j.y + Math.sin(x * 0.08 + wob) * 6 + Math.sin(x * 0.17 - wob * 0.7) * 3);
  }
  ctx.lineTo(j.x + j.w, H + 10); ctx.closePath();
  const g = ctx.createLinearGradient(j.x, j.y, j.x, j.y + j.h);
  g.addColorStop(0, "rgba(255,120,170,0.85)");
  g.addColorStop(0.45, "rgba(210,50,120,0.8)");
  g.addColorStop(1, "rgba(90,20,70,0.95)");
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = "#d44a8a"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "rgba(255,210,230,0.45)";
  ctx.beginPath(); ctx.ellipse(j.x + 90, j.y + 18 + Math.sin(wob) * 3, 40, 10, 0, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i \u003c 5; i++){
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath(); ctx.arc(j.x + 40 + i * 60, j.y + 28 + Math.sin(wob + i) * 8, 5 + (i % 2) * 2, 0, Math.PI * 2); ctx.fill();
  }
}
function drawFlag(){
  const fl = fakeFlag;
  ctx.fillStyle = "#c9a070"; ctx.fillRect(fl.x - 18, fl.y + 20, 72, 86);
  ctx.fillStyle = "#b8874c"; ctx.fillRect(fl.x - 18, fl.y + 20, 8, 86);
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.strokeRect(fl.x - 18, fl.y + 20, 72, 86);
  ctx.save(); ctx.translate(fl.x + 6, fl.y + 28); ctx.rotate(-0.08);
  ctx.fillStyle = "#6b3e1d"; ctx.fillRect(0, 0, 6, 78);
  ctx.fillStyle = "#e24b4b";
  ctx.beginPath(); ctx.moveTo(6, 4); ctx.lineTo(40, 16); ctx.lineTo(6, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  ctx.strokeStyle = "rgba(80,40,20,0.35)"; ctx.lineWidth = 1;
  for (let i = 0; i \u003c 6; i++){
    ctx.beginPath(); ctx.moveTo(fl.x - 10 + i * 8, fl.y + 28);
    ctx.quadraticCurveTo(fl.x + i * 7, fl.y + 70, fl.x + 40 - i * 4, fl.y + 100); ctx.stroke();
  }
  ctx.fillStyle = "rgba(180,80,40,0.35)"; ctx.fillRect(fl.x + 30, fl.y + 86, 6, 16);
}
function drawDoor(){
  const d = fakeDoor;
  ctx.save(); ctx.translate(d.x + d.w * 0.5, d.y + d.h); ctx.transform(1, 0, -0.18, 1, 0, 0); ctx.translate(-d.w * 0.5, -d.h);
  ctx.fillStyle = "#7a4a28"; ctx.fillRect(-16, 20, d.w + 40, d.h - 8);
  ctx.fillStyle = "#5c3318"; roundRect(0, 0, d.w, d.h, 8); ctx.fill();
  ctx.fillStyle = "#3d220f";
  ctx.beginPath(); ctx.arc(d.w * 0.5, 18, d.w * 0.48, Math.PI, 0); ctx.lineTo(d.w, d.h); ctx.lineTo(0, d.h); ctx.fill();
  ctx.fillStyle = "#c9844a"; roundRect(10, 28, d.w - 20, d.h - 40, 6); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 3; roundRect(10, 28, d.w - 20, d.h - 40, 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(d.w * 0.5, 32); ctx.lineTo(d.w * 0.5, d.h - 14); ctx.stroke();
  ctx.fillStyle = "#e6c14a"; ctx.beginPath(); ctx.arc(d.w * 0.5 + 12, d.h * 0.58, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "rgba(60,30,10,0.3)"; ctx.lineWidth = 1.2;
  for (let i = 0; i \u003c 7; i++){
    ctx.beginPath(); ctx.moveTo(d.x - 8 + i * 14, d.y + 10); ctx.lineTo(d.x + 10 + i * 12, d.y + d.h); ctx.stroke();
  }
  ctx.fillStyle = "#6b3918"; ctx.fillRect(d.x - 10, GROUND - 6, d.w + 20, 6);
}
function drawCleaner(){
  if (!cleaner) return;
  const bob = Math.sin(t * 3.2) * 4;
  let extraY = 0;
  if (currentLevel === 2 \u0026\u0026 l2) extraY = (1 - l2.vacPop) * 70;
  const x = cleaner.x, y = cleaner.y + bob + extraY;
  ctx.strokeStyle = "#5a5a62"; ctx.lineWidth = 10; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x + 8, y + 36); ctx.bezierCurveTo(x - 30, y + 50, x - 20, y + 78, x - 8, GROUND - 4); ctx.stroke();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + 8, y + 36); ctx.bezierCurveTo(x - 30, y + 50, x - 20, y + 78, x - 8, GROUND - 4); ctx.stroke();
  ctx.fillStyle = "#d8d8e0"; roundRect(x, y + 8, 70, 54, 16); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = "#e24b4b"; ctx.fillRect(x, y + 28, 70, 10);
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath(); ctx.arc(x + 18, y + 62, 10, 0, Math.PI * 2); ctx.arc(x + 52, y + 62, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2b1d12";
  ctx.beginPath(); ctx.arc(x + 18, y + 62, 4, 0, Math.PI * 2); ctx.arc(x + 52, y + 62, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(x + 24, y + 22, 8, 9, 0, 0, Math.PI * 2); ctx.ellipse(x + 48, y + 22, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2b1d12";
  ctx.beginPath(); ctx.arc(x + 26, y + 23, 3.2, 0, Math.PI * 2); ctx.arc(x + 50, y + 23, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x + 25, y + 21, 1.2, 0, Math.PI * 2); ctx.arc(x + 49, y + 21, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x + 36, y + 32, 7, 0.15, Math.PI - 0.15); ctx.stroke();
  ctx.fillStyle = "#9aa0aa"; ctx.beginPath(); ctx.ellipse(x - 2, y + 34, 10, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  for (let i = 0; i \u003c particles.length; i++){
    const p = particles[i];
    ctx.fillStyle = "rgba(80,70,90," + Math.max(0, p.life) + ")";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
}
function drawBall(){
  if (!yarnBall) return;
  const pulse = 1 + Math.sin(t * 4) * 0.04;
  const x = yarnBall.x, y = yarnBall.y;
  ctx.save(); ctx.translate(x, y); ctx.scale(pulse, pulse);
  ctx.strokeStyle = "#e07a9a"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(18, 10); ctx.bezierCurveTo(50, 20, 70, 50, 40, 70); ctx.stroke();
  const g = ctx.createRadialGradient(-6, -6, 4, 0, 0, yarnBall.r);
  g.addColorStop(0, "#ffd36a"); g.addColorStop(0.45, "#ff8eb0"); g.addColorStop(1, "#7ec8ff");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, yarnBall.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let a = 0; a \u003c 8; a++){
    const ang = a * 0.85 + t * 0.4;
    ctx.arc(0, 0, 8 + a * 2.2, ang, ang + 1.4, false);
  }
  ctx.stroke(); ctx.restore();
}
function drawSign(s){
  ctx.fillStyle = "#6b3e1d"; ctx.fillRect(s.x + 22, s.y - 78, 8, 78);
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.strokeRect(s.x + 22, s.y - 78, 8, 78);
  ctx.font = "bold 14px PingFang SC, Noto Sans SC, Microsoft YaHei, sans-serif";
  const tw = Math.max(72, ctx.measureText(s.text).width + 22);
  const bx = s.x + 26 - tw * 0.5, by = s.y - 118;
  ctx.fillStyle = "#e8c36a"; roundRect(bx, by, tw, 44, 6); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#5a3010"; roundRect(bx + 5, by + 5, tw - 10, 34, 4); ctx.fill();
  ctx.fillStyle = "#fff4cc"; roundRect(bx + 7, by + 7, tw - 14, 30, 3); ctx.fill();
  ctx.fillStyle = "#2b1d12"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(s.text, bx + tw * 0.5, by + 22);
}
function drawPlayer(){
  const p = player, sq = p.squash;
  const cx = p.x + p.w * 0.5, feet = p.y + p.h;
  const bh = p.h * sq, bw = p.w / sq;
  ctx.save(); ctx.translate(cx, feet); ctx.scale(p.facing \u003c 0 ? -1 : 1, 1); ctx.translate(0, -p.h);
  ctx.fillStyle = "rgba(40,20,10,0.18)";
  ctx.beginPath(); ctx.ellipse(0, p.h - 2, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath(); ctx.ellipse(0, p.h - bh * 0.48, bw * 0.48, bh * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = "#e8a45c";
  ctx.beginPath(); ctx.arc(-10, p.h - bh * 0.55, 4, 0, Math.PI * 2); ctx.arc(8, p.h - bh * 0.38, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffb0c4";
  ctx.beginPath(); ctx.ellipse(-13, p.h - bh * 0.42, 5, 3.2, 0, 0, Math.PI * 2); ctx.ellipse(13, p.h - bh * 0.42, 5, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  const closed = p.blink \u003e 0 \u0026\u0026 p.blink \u003c 0.12;
  if (closed){
    ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-11, p.h - bh * 0.58); ctx.lineTo(-4, p.h - bh * 0.58);
    ctx.moveTo(4, p.h - bh * 0.58); ctx.lineTo(11, p.h - bh * 0.58); ctx.stroke();
  } else {
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(-8, p.h - bh * 0.6, 7, 8, 0, 0, Math.PI * 2); ctx.ellipse(8, p.h - bh * 0.6, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 1.5; ctx.stroke();
    const look = Math.max(-2, Math.min(2, p.vx * 0.45));
    ctx.fillStyle = "#2b1d12";
    ctx.beginPath(); ctx.arc(-7 + look, p.h - bh * 0.58, 3.2, 0, Math.PI * 2); ctx.arc(9 + look, p.h - bh * 0.58, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-8 + look, p.h - bh * 0.62, 1.2, 0, Math.PI * 2); ctx.arc(8 + look, p.h - bh * 0.62, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, p.h - bh * 0.36, 7, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.restore();
}
function drawPuffs(){
  for (let i = 0; i \u003c puffs.length; i++){
    const p = puffs[i];
    ctx.fillStyle = p.col;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * Math.max(0.2, p.life * 2), 0, Math.PI * 2); ctx.fill();
  }
}
function drawGapDecor(){
  ctx.fillStyle = "#4a2812";
  if (currentLevel === 1){
    ctx.fillRect(520, GROUND + 8, 340, H - GROUND);
    ctx.fillRect(1140, GROUND + 20, 80, H - GROUND);
    ctx.fillRect(2400, GROUND + 20, 120, H - GROUND);
  } else {
    ctx.fillRect(700, GROUND + 8, 100, H - GROUND);
    ctx.fillRect(1080, GROUND + 8, 100, H - GROUND);
    ctx.fillRect(1680, GROUND + 8, 150, H - GROUND);
    ctx.fillRect(2300, GROUND + 8, 140, H - GROUND);
    ctx.fillRect(3820, GROUND + 8, 140, H - GROUND);
  }
}
function drawRainbow(){
  if (!ghostBridge) return;
  const gb = ghostBridge;
  const cols = ["#ff5a7a","#ff9a3c","#ffe566","#7edc8a","#6ec8ff","#c9a0ff"];
  const sl = gb.w / cols.length;
  for (let i = 0; i \u003c cols.length; i++){
    ctx.fillStyle = cols[i];
    roundRect(gb.x + i * sl, GROUND - 8, sl + 1, 18, 5); ctx.fill();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(gb.x + 10, GROUND - 2); ctx.lineTo(gb.x + gb.w - 10, GROUND - 2); ctx.stroke();
}
function drawCheckpointFlag(){
  const fl = fakeFlag;
  if (!fl) return;
  const wave = Math.sin(t * 4) * 3;
  ctx.fillStyle = "#6b3e1d"; ctx.fillRect(fl.x, fl.y, 7, GROUND - fl.y);
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.strokeRect(fl.x, fl.y, 7, GROUND - fl.y);
  ctx.fillStyle = l2 \u0026\u0026 l2.flagUsed ? "#c9a0a0" : "#e24b4b";
  ctx.beginPath();
  ctx.moveTo(fl.x + 7, fl.y + 4);
  ctx.lineTo(fl.x + 48 + wave, fl.y + 16);
  ctx.lineTo(fl.x + 7, fl.y + 30);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#ffe566";
  ctx.beginPath();
  ctx.moveTo(fl.x + 18, fl.y + 12); ctx.lineTo(fl.x + 21, fl.y + 18); ctx.lineTo(fl.x + 28, fl.y + 18);
  ctx.lineTo(fl.x + 22, fl.y + 22); ctx.lineTo(fl.x + 24, fl.y + 28); ctx.lineTo(fl.x + 18, fl.y + 24);
  ctx.lineTo(fl.x + 12, fl.y + 28); ctx.lineTo(fl.x + 14, fl.y + 22); ctx.lineTo(fl.x + 8, fl.y + 18);
  ctx.lineTo(fl.x + 15, fl.y + 18); ctx.closePath(); ctx.fill();
}
function drawCupcake(c){
  const x = c.x, y = c.y;
  ctx.fillStyle = "#d4a056";
  ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x - 14, y - 22); ctx.lineTo(x + 14, y - 22); ctx.lineTo(x + 18, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#ffb0c4";
  ctx.beginPath(); ctx.arc(x, y - 28, 16, Math.PI, 0); ctx.arc(x + 10, y - 22, 8, 0, Math.PI); ctx.arc(x - 10, y - 22, 8, 0, Math.PI); ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e24b4b";
  ctx.beginPath(); ctx.arc(x, y - 42, 5, 0, Math.PI * 2); ctx.fill();
}
function drawBush(b){
  const x = b.x, y = b.y;
  ctx.fillStyle = "#5aaa4a";
  ctx.beginPath();
  ctx.arc(x - 16, y - 16, 16, 0, Math.PI * 2);
  ctx.arc(x + 14, y - 14, 15, 0, Math.PI * 2);
  ctx.arc(x, y - 26, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#e24b4b";
  ctx.beginPath(); ctx.arc(x - 8, y - 22, 3, 0, Math.PI * 2); ctx.arc(x + 10, y - 18, 3, 0, Math.PI * 2); ctx.fill();
}
function drawCakeBig(c){
  const x = c.x + 28, y = c.y;
  ctx.fillStyle = "#f0c27a"; roundRect(x - 32, y - 28, 64, 28, 6); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = "#ff8eb0"; roundRect(x - 28, y - 46, 56, 20, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff4cc"; roundRect(x - 22, y - 58, 44, 16, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#e24b4b"; ctx.beginPath(); ctx.arc(x, y - 64, 6, 0, Math.PI * 2); ctx.fill();
  ctx.stroke();
}
function drawRug(){
  if (!spikeRug) return;
  const r = spikeRug;
  ctx.fillStyle = "#d45a7a";
  roundRect(r.x, r.y, r.w, r.h + 4, 3); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = "#ffe566"; ctx.lineWidth = 2;
  for (let i = 8; i \u003c r.w - 6; i += 14){
    ctx.beginPath(); ctx.moveTo(r.x + i, r.y + 2); ctx.lineTo(r.x + i + 6, r.y + r.h); ctx.stroke();
  }
  if (l2 \u0026\u0026 l2.spikes \u003e 0){
    const hgt = l2.spikes * 28;
    ctx.fillStyle = "#ffb0c4";
    ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2;
    for (let i = 0; i \u003c 6; i++){
      const tx = r.x + 12 + i * 18;
      ctx.beginPath();
      ctx.moveTo(tx - 7, GROUND);
      ctx.lineTo(tx, GROUND - hgt);
      ctx.lineTo(tx + 7, GROUND);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
}
function drawSheep(){
  if (!sheep) return;
  const bob = l2 \u0026\u0026 l2.sheepCharging ? Math.sin(t * 20) * 2 : Math.sin(t * 3) * 2;
  const x = sheep.x, y = GROUND - 6 + bob;
  const face = (l2 \u0026\u0026 l2.sheepCharging) ? -1 : 1;
  ctx.save(); ctx.translate(x + 32, y); ctx.scale(face, 1);
  ctx.fillStyle = "#5a3a22";
  ctx.fillRect(-18, -8, 6, 14); ctx.fillRect(10, -8, 6, 14);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-10, -22, 16, 0, Math.PI * 2);
  ctx.arc(12, -20, 14, 0, Math.PI * 2);
  ctx.arc(0, -30, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.fillStyle = "#ffe8c8";
  ctx.beginPath(); ctx.arc(18, -22, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffb0c4";
  ctx.beginPath(); ctx.ellipse(18, -32, 4, 6, 0, 0, Math.PI * 2); ctx.ellipse(26, -30, 4, 6, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2b1d12";
  ctx.beginPath(); ctx.arc(22, -24, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2;
  if (l2 \u0026\u0026 l2.sheepCharging){
    ctx.beginPath(); ctx.moveTo(14, -18); ctx.lineTo(22, -16); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(22, -16, 5, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  ctx.restore();
}
function drawPie(){
  if (!l2 || !l2.pieStarted) return;
  ctx.save();
  ctx.translate(l2.pieX, l2.pieY);
  if (l2.pieSplat){
    ctx.fillStyle = "#ff8eb0";
    ctx.beginPath(); ctx.ellipse(0, 6, 28, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
  } else {
    ctx.rotate(l2.pieRot);
    ctx.fillStyle = "#e0a04a";
    ctx.beginPath(); ctx.ellipse(0, 4, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ff8eb0";
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#fff4cc";
    ctx.beginPath(); ctx.arc(-2, -6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e24b4b";
    ctx.beginPath(); ctx.arc(0, -12, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function drawWind(){
  if (!l2) return;
  for (let i = 0; i \u003c l2.leaves.length; i++){
    const p = l2.leaves[i];
    ctx.fillStyle = "rgba(255,210,120," + Math.max(0, p.life) + ")";
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, t + i, 0, Math.PI * 2); ctx.fill();
  }
}
function drawCat(){
  if (!realGoal) return;
  const g = realGoal;
  const near = Math.abs(player.x - g.x) \u003c 90;
  ctx.fillStyle = "#e8a0c0";
  ctx.beginPath(); ctx.ellipse(g.x + 28, GROUND - 6, 30, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#f0a04a";
  ctx.beginPath(); ctx.ellipse(g.x + 24, GROUND - 18, 22, 14, -0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(g.x + 42, GROUND - 28, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(g.x + 34, GROUND - 34); ctx.lineTo(g.x + 36, GROUND - 46); ctx.lineTo(g.x + 42, GROUND - 36);
  ctx.moveTo(g.x + 48, GROUND - 36); ctx.lineTo(g.x + 54, GROUND - 46); ctx.lineTo(g.x + 52, GROUND - 34);
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(g.x + 38, GROUND - 28, 2.4, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.beginPath(); ctx.arc(g.x + 48, GROUND - 28, 2.4, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.fillStyle = "#ffb0c4";
  ctx.beginPath(); ctx.ellipse(g.x + 44, GROUND - 24, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f0a04a"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(g.x + 8, GROUND - 16); ctx.quadraticCurveTo(g.x - 8, GROUND - 30, g.x + 4, GROUND - 8); ctx.stroke();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#2b1d12";
  ctx.font = "bold 13px Trebuchet MS, sans-serif";
  ctx.textAlign = "left";
  const zz = 0.6 + Math.sin(t * 2) * 0.4;
  ctx.globalAlpha = 0.55 + zz * 0.3;
  ctx.fillText("Zzz", g.x + 52, GROUND - 48 - zz * 6);
  ctx.globalAlpha = 1;
  if (near){
    ctx.fillStyle = "#ffe566";
    for (let i = 0; i \u003c 3; i++){
      const a = t * 2 + i * 2.1;
      ctx.beginPath(); ctx.arc(g.x + 20 + Math.cos(a) * 22, GROUND - 40 + Math.sin(a) * 8, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawFlower(){
  if (!sneezeFlower) return;
  const x = sneezeFlower.x + 24, y = sneezeFlower.y;
  ctx.fillStyle = "#5aaa4a";
  ctx.fillRect(x - 3, y - 28, 6, 28);
  ctx.fillStyle = extras \u0026\u0026 extras.flowerUsed ? "#ffd36a" : "#ff8eb0";
  for (let i = 0; i \u003c 5; i++){
    const a = i * 1.26 + t * 0.4;
    ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 12, y - 34 + Math.sin(a) * 10, 8, 5, a, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#ffe566";
  ctx.beginPath(); ctx.arc(x, y - 34, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y - 34, 7, 0, Math.PI * 2); ctx.stroke();
}
function drawSnack(){
  if (!extras || !extras.snackStarted) return;
  ctx.save(); ctx.translate(extras.snackX, extras.snackY);
  ctx.fillStyle = "#e8a45c";
  ctx.beginPath(); ctx.ellipse(0, extras.snackSplat ? 6 : 0, extras.snackSplat ? 18 : 12, extras.snackSplat ? 7 : 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ff8eb0";
  ctx.beginPath(); ctx.arc(0, extras.snackSplat ? 2 : -4, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
function drawBee(){
  if (!bee) return;
  const x = bee.x, y = bee.y + Math.sin(t * 10) * 3;
  ctx.fillStyle = "#ffe566";
  ctx.beginPath(); ctx.ellipse(x + 16, y + 12, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#2b1d12";
  ctx.fillRect(x + 10, y + 6, 3, 12); ctx.fillRect(x + 16, y + 6, 3, 12);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath(); ctx.ellipse(x + 10, y + 4, 7, 4, -0.4, 0, Math.PI * 2); ctx.ellipse(x + 22, y + 4, 7, 4, 0.4, 0, Math.PI * 2); ctx.fill();
}
function drawBanana(){
  if (!bananaSpot || !extras || !extras.bananaOn) return;
  ctx.fillStyle = "#ffe566";
  ctx.beginPath(); ctx.ellipse(bananaSpot.x + 30, GROUND - 6, 22, 7, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
}
function drawPillow(){
  if (!pillowCat || (extras \u0026\u0026 extras.pillowUsed)) return;
  const g = pillowCat;
  ctx.fillStyle = "#f4d0de";
  ctx.beginPath(); ctx.ellipse(g.x + 28, GROUND - 10, 30, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#e8a0c0";
  ctx.beginPath(); ctx.arc(g.x + 18, GROUND - 18, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#2b1d12";
  ctx.font = "bold 12px Trebuchet MS, sans-serif";
  ctx.fillText("?", g.x + 48, GROUND - 28);
}
function drawHazards(){
  drawJelly();
  drawRainbow();
  drawCheckpointFlag();
  drawRug();
  for (let i = 0; i \u003c decoBushes.length; i++) drawBush(decoBushes[i]);
  for (let i = 0; i \u003c decoCakes.length; i++){
    if (decoCakes[i].trap) drawCakeBig(decoCakes[i]);
    else drawCupcake(decoCakes[i]);
  }
  if (l2 \u0026\u0026 l2.vacVisible) drawCleaner();
  drawSheep();
  if (yarnBall \u0026\u0026 !(l2 \u0026\u0026 l2.yarnGone)) drawBall();
  drawPie();
  drawBanana();
  drawPillow();
  drawCat();
  drawWind();
}

function draw(){
  ctx.save();
  if (shake \u003e 0) ctx.translate((Math.random() - 0.5) * 10 * shake, (Math.random() - 0.5) * 8 * shake);
  drawSky();
  ctx.save(); ctx.translate(-camX, 0);
  drawHills(); drawGapDecor();
  for (let i = 0; i \u003c platforms.length; i++){
    const p = platforms[i];
    if (p.vanished) continue;
    if (p.kind === "mud") drawMud(p);
    else if (p.kind === "ice") drawIce(p);
    else drawDirt(p);
  }
  if (currentLevel === 1){
    drawJelly(); drawFlag(); drawDoor();
    for (let i = 0; i \u003c signs.length; i++) drawSign(signs[i]);
    drawCleaner(); drawBall();
    drawFlower(); drawSnack(); drawBee();
  } else {
    drawHazards();
  }
  drawPuffs(); drawPlayer();
  ctx.restore(); ctx.restore();
}
let lastTime = performance.now();
function loop(now){
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now; t += dt;
  if (toastT \u003e 0){ toastT -= dt; if (toastT \u003c= 0) toastEl.style.opacity = 0; }
  if (playing) update(dt);
  else {
    const target = player.x + player.w * 0.5 - W * 0.42;
    if (camX \u003c 0) camX = 0;
    if (camX \u003e LEVEL_W - W) camX = LEVEL_W - W;
    camX += (target - camX) * 0.08;
  }
  draw();
  requestAnimationFrame(loop);
}
loadLevel(1);
requestAnimationFrame(loop);
