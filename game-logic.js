const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const toastEl = document.getElementById("toast");
const failsEl = document.getElementById("fails");
const winEl = document.getElementById("win");
const againBtn = document.getElementById("again");
const nextBtn = document.getElementById("next");
const backBtn = document.getElementById("back1");
const titleEl = document.querySelector("h1");
const hintEl = document.querySelector("p.hint");
const winTitleEl = document.getElementById("winTitle");
const winMsgEl = document.getElementById("winMsg");
let fails = 0, toastT = 0, camX = 0, t = 0;
function toast(msg){
  toastEl.textContent = msg;
  toastEl.style.opacity = 1;
  toastT = 2.4;
}
const keys = {};
function unlockAudio(){
  if (AC && AC.state === "suspended") AC.resume();
}
addEventListener("keydown", e => {
  unlockAudio();
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (k === " " || k.startsWith("arrow") || k === "w") e.preventDefault();
  if (!e.repeat && (k === " " || k === "arrowup" || k === "w")) jumpBuf = 0.12;
});
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
addEventListener("pointerdown", unlockAudio);
const AC = window.AudioContext ? new AudioContext() : (window.webkitAudioContext ? new webkitAudioContext() : null);
function beep(freq, dur, type, vol){
  if (!AC) return;
  type = type || "square";
  vol = vol == null ? 0.04 : vol;
  const o = AC.createOscillator();
  const g = AC.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(AC.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
  o.stop(AC.currentTime + dur);
}
function boing(){
  beep(220, 0.07, "sine", 0.07);
  setTimeout(() => beep(340, 0.14, "sine", 0.06), 60);
}
function sadBeep(){
  beep(180, 0.16, "sawtooth", 0.045);
  setTimeout(() => beep(110, 0.28, "sawtooth", 0.04), 130);
}
function happyBeeps(){
  [523, 659, 784, 988, 1175].forEach((f, i) => setTimeout(() => beep(f, 0.16, "square", 0.045), i * 110));
}
function wrongBeep(){
  beep(240, 0.08, "triangle", 0.04);
  setTimeout(() => beep(190, 0.1, "triangle", 0.03), 90);
}
function popBeep(){
  beep(520, 0.05, "square", 0.035);
  setTimeout(() => beep(180, 0.08, "triangle", 0.03), 50);
}
const GROUND = 460;
const PW = 40, PH = 44;
let currentLevel = 1;
let LEVEL_W = 3200;
let platforms = [];
let signs = [];
let jelly = null;
let fakeFlag = null;
let yarnBall = null;
let cleaner = null;
let fakeDoor = null;
let SPAWN = { x:86, y:GROUND - PH };
let spikeRug = null;
let ghostBridge = null;
let surpriseVac = null;
let pieZone = null;
let sheep = null;
let windZone = null;
let realGoal = null;
let decoCakes = [];
let decoBushes = [];
let l2 = null;
let extras = null;
let sneezeFlower = null;
let snackZone = null;
let bee = null;
let bananaSpot = null;
let pillowCat = null;
const player = { x:SPAWN.x, y:SPAWN.y, w:PW, h:PH, vx:0, vy:0, facing:1, onGround:false, groundKind:"dirt", squash:1, blink:0 };
let lastSafe = { x:SPAWN.x, y:SPAWN.y };
let playing = true, jumpBuf = 0, coyote = 0, toastedJelly = false, touchFlag = false, touchDoor = false, shake = 0;
const particles = [];
const puffs = [];
function makeExtras(){
  return {
    flowerUsed: false,
    snackStarted: false, snackX: 0, snackY: -40, snackVy: 3, snackSplat: false,
    beeCharging: false,
    bananaOn: false,
    pillowUsed: false
  };
}
function makeL2State(){
  return {
    vanishTimer: 0,
    yarnFlee: false,
    yarnGone: false,
    vacVisible: false,
    vacPop: 0,
    pieStarted: false,
    pieX: 0, pieY: -48, pieVy: 3, pieSplat: false, pieRot: 0,
    iceOn: false,
    flagUsed: false,
    ghostToast: false,
    spikes: 0,
    spikesArmed: false,
    sheepCharging: false,
    windToast: false,
    leaves: []
  };
}
function resetL2World(){
  l2 = makeL2State();
  for (let i = 0; i < platforms.length; i++){
    const p = platforms[i];
    if (p.vanish) p.vanished = false;
    if (p.iceSurprise) p.kind = "dirt";
  }
  if (yarnBall){ yarnBall.x = 2580; yarnBall.y = 432; }
  if (sheep){ sheep.x = 3720; sheep.vx = 0; }
}
function updateUIForLevel(){
  if (currentLevel === 1){
    document.title = "布丁峡谷 · 第一关";
    titleEl.textContent = "布丁峡谷 · 第一关：请勿相信路牌";
    hintEl.textContent = "方向键 / A D 走路，空格或上键跳跃。路牌都在说谎。";
    winTitleEl.textContent = "回家啦！";
    winMsgEl.textContent = "毛线球才是大门。路牌？全是骗子。";
    nextBtn.style.display = "";
    backBtn.style.display = "none";
  } else {
    document.title = "布丁峡谷 · 第二关";
    titleEl.textContent = "布丁峡谷 · 第二关：没人提示";
    hintEl.textContent = "方向键 / A D 走路，空格或上键跳跃。这次没有路牌了。";
    winTitleEl.textContent = "找到啦！";
    winMsgEl.textContent = "毛线球是假的。午睡的小猫才是家。";
    nextBtn.style.display = "none";
    backBtn.style.display = "";
  }
}
function clearLevelRefs(){
  platforms.length = 0;
  signs.length = 0;
  decoCakes = [];
  decoBushes = [];
  jelly = null; fakeFlag = null; yarnBall = null; cleaner = null; fakeDoor = null;
  spikeRug = null; ghostBridge = null; surpriseVac = null; pieZone = null;
  sheep = null; windZone = null; realGoal = null; l2 = null;
  extras = null; sneezeFlower = null; snackZone = null; bee = null; bananaSpot = null; pillowCat = null;
}
function loadLevel1(){
  LEVEL_W = 3200;
  platforms.push({ x:0, y:GROUND, w:520, h:80, kind:"dirt" });
  platforms.push({ x:860, y:300, w:280, h:28, kind:"dirt" });
  platforms.push({ x:1220, y:GROUND, w:420, h:80, kind:"dirt" });
  platforms.push({ x:1780, y:390, w:240, h:24, kind:"ice" });
  platforms.push({ x:1680, y:GROUND, w:720, h:80, kind:"mud" });
  platforms.push({ x:2520, y:GROUND, w:680, h:80, kind:"dirt" });
  jelly = { x:520, y:452, w:340, h:88 };
  fakeFlag = { x:980, y:210, w:36, h:90 };
  yarnBall = { x:3048, y:432, r:28 };
  cleaner = { x:2100, y:390, w:70, h:70 };
  fakeDoor = { x:2668, y:318, w:78, h:142 };
  signs.push({ x:368, y:GROUND, text:"危险！粘浆坑" });
  signs.push({ x:872, y:300, text:"终点 →" });
  signs.push({ x:1696, y:GROUND, text:"安全桥" });
  signs.push({ x:1972, y:GROUND, text:"吸尘器是朋友" });
  signs.push({ x:2554, y:GROUND, text:"大门在这边" });
  signs.push({ x:2910, y:GROUND, text:"毛线球不要碰" });
  sneezeFlower = { x:250, y:GROUND };
  snackZone = { x:1380, w:200 };
  bee = { x:1888, y:GROUND - 36, w:36, h:28 };
  SPAWN = { x:86, y:GROUND - PH };
}
function loadLevel2(){
  LEVEL_W = 4600;
  platforms.push({ x:0, y:GROUND, w:520, h:80, kind:"dirt" });
  platforms.push({ x:520, y:GROUND, w:180, h:80, kind:"dirt", vanish:true, safe:false, vanished:false }); // 1 vanishing floor
  platforms.push({ x:800, y:GROUND, w:280, h:80, kind:"dirt" });
  jelly = { x:1080, y:452, w:100, h:88 }; // 7 false spring, ~100px so edge jump clears
  platforms.push({ x:1180, y:GROUND, w:500, h:80, kind:"dirt" });
  fakeFlag = { x:1390, y:370, w:36, h:90 }; // 9 fake checkpoint
  ghostBridge = { x:1680, y:GROUND, w:150, h:22 }; // 5 ghost rainbow
  platforms.push({ x:1830, y:GROUND, w:270, h:80, kind:"dirt" });
  platforms.push({ x:2100, y:GROUND, w:200, h:80, kind:"dirt", iceSurprise:true, safe:false }); // 8 surprise ice
  platforms.push({ x:2440, y:GROUND, w:1380, h:80, kind:"dirt" });
  yarnBall = { x:2580, y:432, r:28 };
  spikeRug = { x:2760, y:GROUND - 6, w:120, h:10 }; // 10 rug teeth
  decoCakes.push({ x:940, y:GROUND, trap:false });
  decoBushes.push({ x:1560, y:GROUND });
  decoCakes.push({ x:3140, y:GROUND, trap:true });
  surpriseVac = { x:3140, y:390, w:70, h:70 }; // 3 surprise vacuum
  pieZone = { x:3380, w:240 }; // 4 falling pie
  sheep = { x:3720, y:GROUND - 44, w:64, h:48, vx:0 }; // 6 charging sheep
  windZone = { x:3700, w:260 }; // 11 wind gust
  platforms.push({ x:3960, y:GROUND, w:640, h:80, kind:"dirt" });
  decoCakes.push({ x:4100, y:GROUND, trap:false });
  realGoal = { x:4420, y:GROUND - 28, w:64, h:36 }; // 12 sleeping cat goal
  bananaSpot = { x:2488, w:90 };
  pillowCat = { x:4248, y:GROUND - 28, w:64, h:36 };
  SPAWN = { x:86, y:GROUND - PH };
  resetL2World();
}
function loadLevel(n){
  currentLevel = n;
  playing = true;
  fails = 0;
  failsEl.textContent = "0";
  winEl.classList.remove("show");
  toastedJelly = false;
  touchFlag = false;
  touchDoor = false;
  jumpBuf = 0; coyote = 0; shake = 0;
  particles.length = 0; puffs.length = 0;
  clearLevelRefs();
  if (n === 1) loadLevel1();
  else loadLevel2();
  extras = makeExtras();
  player.x = SPAWN.x; player.y = SPAWN.y; player.vx = 0; player.vy = 0;
  player.facing = 1; player.onGround = true; player.groundKind = "dirt"; player.squash = 1;
  lastSafe = { x:SPAWN.x, y:SPAWN.y };
  camX = 0; toastEl.style.opacity = 0; toastT = 0;
  updateUIForLevel();
}
function resetLevel(){
  loadLevel(currentLevel);
}
function fail(msg){
  fails += 1;
  failsEl.textContent = String(fails);
  toast(msg);
  sadBeep();
  shake = 0.35;
  extras = makeExtras();
  if (bee) bee.x = 1888;
  if (currentLevel === 2) resetL2World();
  player.x = SPAWN.x; player.y = SPAWN.y; player.vx = 0; player.vy = 0;
  camX = 0;
  player.squash = 1.15; coyote = 0; jumpBuf = 0;
  touchFlag = false; touchDoor = false;
}
function winGame(){
  if (!playing) return;
  playing = false;
  winEl.classList.add("show");
  happyBeeps();
}
againBtn.addEventListener("click", () => { unlockAudio(); resetLevel(); });
nextBtn.addEventListener("click", () => { unlockAudio(); loadLevel(2); });
backBtn.addEventListener("click", () => { unlockAudio(); loadLevel(1); });
function aabb(a, b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function circleBox(cx, cy, r, b){
  const nx = Math.max(b.x, Math.min(cx, b.x + b.w));
  const ny = Math.max(b.y, Math.min(cy, b.y + b.h));
  const dx = cx - nx, dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}
function leftHeld(){ return keys.arrowleft || keys.a; }
function rightHeld(){ return keys.arrowright || keys.d; }
function jumpHeld(){ return keys[" "] || keys.arrowup || keys.w; }
function spawnPuff(x, y, n, col){
  for (let i = 0; i < n; i++){
    puffs.push({ x:x, y:y, vx:(Math.random()-0.5)*2.4, vy:-Math.random()*1.6-0.3, life:0.35+Math.random()*0.25, r:3+Math.random()*4, col:col||"rgba(90,60,30,0.35)" });
  }
}
function burstConfetti(x, y){
  const cols = ["#ff6b9a","#ffd36a","#7ec8ff","#b8e986","#ff9a56","#fff"];
  for (let i = 0; i < 30; i++){
    puffs.push({ x:x, y:y, vx:(Math.random()-0.5)*9, vy:-Math.random()*7-2, life:0.55+Math.random()*0.55, r:3+Math.random()*3.5, col:cols[i % cols.length] });
  }
}
function l2SafeLanding(p){
  if (p.kind !== "dirt" || p.safe === false) return false;
  if (spikeRug && player.x + player.w > spikeRug.x && player.x < spikeRug.x + spikeRug.w) return false;
  if (player.x > 3260) return false;
  return true;
}
function update(dt){
  const f = dt * 60;
  if (jumpBuf > 0) jumpBuf -= dt;
  if (coyote > 0) coyote -= dt;
  if (shake > 0) shake -= dt;
  player.blink -= dt;
  if (player.blink < -3) player.blink = 2.2 + Math.random() * 2;
  const ice = player.onGround && player.groundKind === "ice";
  const mud = player.onGround && player.groundKind === "mud";
  let input = 0;
  if (leftHeld()) input -= 1;
  if (rightHeld()) input += 1;
  if (input !== 0) player.facing = input;
  if (ice){
    player.vx += input * 0.18 * f;
    if (input === 0) player.vx *= Math.pow(0.985, f);
    if (player.vx > 6.8) player.vx = 6.8;
    if (player.vx < -6.8) player.vx = -6.8;
  } else if (mud){
    player.vx += input * 0.32 * f;
    if (input === 0) player.vx *= Math.pow(0.72, f);
    else player.vx *= Math.pow(0.9, f);
    if (player.vx > 4.2) player.vx = 4.2;
    if (player.vx < -4.2) player.vx = -4.2;
  } else {
    const air = player.onGround ? 1 : 0.78;
    player.vx += input * 0.58 * air * f;
    if (input === 0) player.vx *= Math.pow(player.onGround ? 0.68 : 0.9, f);
    if (player.vx > 4.7) player.vx = 4.7;
    if (player.vx < -4.7) player.vx = -4.7;
  }
  if (jumpBuf > 0 && (player.onGround || coyote > 0)){
    player.vy = -12.1; player.onGround = false; coyote = 0; jumpBuf = 0; player.squash = 0.78;
    beep(620, 0.06, "square", 0.03);
  }
  if (!jumpHeld() && player.vy < -5) player.vy *= Math.pow(0.88, f);
  player.vy += 0.52 * f;
  if (player.vy > 16) player.vy = 16;
  const prevBottom = player.y + player.h;
  player.x += player.vx * f;
  player.y += player.vy * f;
  if (player.x < 4){ player.x = 4; player.vx = 0; }
  if (player.x + player.w > LEVEL_W - 4){ player.x = LEVEL_W - 4 - player.w; player.vx = 0; }
  player.onGround = false;
  player.groundKind = "air";
  let onVanish = false;
  for (let i = 0; i < platforms.length; i++){
    const p = platforms[i];
    if (p.vanished) continue;
    if (!aabb(player, p)) continue;
    if (player.vy >= -0.2 && prevBottom <= p.y + 14){
      player.y = p.y - player.h;
      if (player.vy > 3) spawnPuff(player.x + player.w * 0.5, p.y, 4);
      player.vy = 0; player.onGround = true; player.groundKind = p.kind; coyote = 0.08;
      if (p.vanish) onVanish = true;
      if (currentLevel === 1){
        if (p.kind === "dirt") lastSafe = { x:player.x, y:player.y };
      } else if (l2SafeLanding(p)){
        lastSafe = { x:player.x, y:player.y };
      }
    }
  }
  if (currentLevel === 1 && !player.onGround && player.vy >= 0 && aabb(player, jelly) && prevBottom <= jelly.y + 18){
    player.y = jelly.y - player.h;
    player.vy = -16.8;
    player.squash = 0.62;
    boing();
    spawnPuff(player.x + player.w * 0.5, jelly.y, 8, "rgba(255,90,160,0.45)");
    if (!toastedJelly){ toast("粘糊坑是弹簧！"); toastedJelly = true; }
  }
  if (player.onGround) player.squash += (1 - player.squash) * 0.25 * f;
  else {
    const stretch = 1 + Math.min(0.18, Math.abs(player.vy) * 0.012);
    player.squash += (stretch - player.squash) * 0.15 * f;
  }
  if (currentLevel === 1){
    if (updateHazardsL1(dt, f)) return;
  } else {
    if (updateHazardsL2(dt, prevBottom, f, onVanish)) return;
  }
  if (player.y > H + 24){ fail("掉进布丁里了！"); return; }
  for (let i = puffs.length - 1; i >= 0; i--){
    const p = puffs[i]; p.x += p.vx * f; p.y += p.vy * f; p.vy += 0.08 * f; p.life -= dt;
    if (p.life <= 0) puffs.splice(i, 1);
  }
  const target = player.x + player.w * 0.5 - W * 0.42;
  camX += (target - camX) * Math.min(1, 0.12 * f);
  if (camX < 0) camX = 0;
  if (camX > LEVEL_W - W) camX = LEVEL_W - W;
}
function updateHazardsL1(dt, f){
  const bobY = Math.sin(t * 3.2) * 4;
  const cleanerBox = { x:cleaner.x + 6, y:cleaner.y + 10 + bobY, w:cleaner.w - 10, h:cleaner.h - 12 };
  if (aabb(player, cleanerBox)){ fail("吸尘器才是真危险！"); return true; }
  if (aabb(player, fakeFlag)){
    if (!touchFlag){ toast("这面旗子是画的！"); wrongBeep(); }
    touchFlag = true;
  } else touchFlag = false;
  if (aabb(player, fakeDoor)){
    if (!touchDoor){ toast("这扇门是画上去的！"); wrongBeep(); }
    touchDoor = true;
  } else touchDoor = false;
  if (circleBox(yarnBall.x, yarnBall.y, yarnBall.r - 4, player)){ winGame(); return true; }
  if (Math.random() < 0.55){
    particles.push({ x:cleaner.x - 10 - Math.random()*55, y:cleaner.y + 28 + bobY + (Math.random()-0.5)*28, vx:1.4+Math.random()*1.2, vy:(Math.random()-0.5)*0.4, life:0.55, r:2+Math.random()*2.5 });
  }
  for (let i = particles.length - 1; i >= 0; i--){
    const p = particles[i]; p.x += p.vx * f; p.y += p.vy * f; p.life -= dt;
    if (p.life <= 0 || p.x > cleaner.x + 18) particles.splice(i, 1);
  }
  if (extras && sneezeFlower && !extras.flowerUsed && player.x + player.w > sneezeFlower.x + 10 && player.x < sneezeFlower.x + 50){
    extras.flowerUsed = true;
    player.vx = 6.4;
    player.vy = -4.2;
    toast("阿嚏！");
    popBeep();
  }
  if (extras && snackZone && !extras.snackStarted && player.x + player.w > snackZone.x && player.x < snackZone.x + snackZone.w){
    extras.snackStarted = true;
    extras.snackX = player.x + player.w * 0.5;
    extras.snackY = -36;
    extras.snackVy = 4;
  }
  if (extras && extras.snackStarted && !extras.snackSplat){
    extras.snackVy += 0.45 * f;
    extras.snackY += extras.snackVy * f;
    if (circleBox(extras.snackX, extras.snackY, 16, player)){ fail("天上掉点心！"); return true; }
    if (extras.snackY > GROUND - 10){ extras.snackSplat = true; extras.snackY = GROUND - 10; }
  }
  if (extras && bee){
    if (!extras.beeCharging && player.x > bee.x - 220 && player.x < bee.x + 40){
      extras.beeCharging = true;
      toast("蚂蚂蚂！");
    }
    if (extras.beeCharging){
      bee.x -= 6.4 * f;
      const box = { x:bee.x, y:bee.y, w:bee.w, h:bee.h };
      if (aabb(player, box)){ fail("蜜蜂催你走！"); return true; }
    }
  }
  return false;
}
function updateHazardsL2(dt, prevBottom, f, onVanish){
  if (onVanish){
    l2.vanishTimer += dt;
    if (l2.vanishTimer > 0.45){
      for (let i = 0; i < platforms.length; i++){
        if (platforms[i].vanish) platforms[i].vanished = true;
      }
      toast("地板跑掉了！");
      popBeep();
      spawnPuff(player.x + player.w * 0.5, GROUND, 10, "rgba(201,132,74,0.5)");
      player.onGround = false;
      coyote = 0.1;
    }
  } else {
    l2.vanishTimer = 0;
  }
  if (jelly && aabb(player, jelly) && player.vy >= -0.2 && prevBottom <= jelly.y + 18){
    fail("这次真的是陷阱！");
    return true;
  }
  if (ghostBridge && !l2.ghostToast && player.vy > 1 && player.y + player.h > GROUND - 16){
    if (player.x + player.w > ghostBridge.x + 8 && player.x < ghostBridge.x + ghostBridge.w - 8){
      toast("彩虹是假的！");
      wrongBeep();
      l2.ghostToast = true;
    }
  }
  if (fakeFlag && !l2.flagUsed && aabb(player, { x:fakeFlag.x - 10, y:fakeFlag.y, w:fakeFlag.w + 20, h:fakeFlag.h + 20 })){
    l2.flagUsed = true;
    burstConfetti(fakeFlag.x + 12, fakeFlag.y + 20);
    toast("并不是存档！");
    wrongBeep();
    player.vx = -7.6;
    player.vy = -6.4;
    player.onGround = false;
  }
  if (!l2.iceOn && player.onGround && player.x + player.w > 2100 && player.x < 2300){
    l2.iceOn = true;
    for (let i = 0; i < platforms.length; i++){
      if (platforms[i].iceSurprise) platforms[i].kind = "ice";
    }
    player.groundKind = "ice";
    toast("脚下结冰了！");
    beep(880, 0.06, "sine", 0.03);
  }
  if (yarnBall && !l2.yarnGone){
    const near = circleBox(yarnBall.x, yarnBall.y, yarnBall.r + 70, player);
    const hit = circleBox(yarnBall.x, yarnBall.y, yarnBall.r - 2, player);
    if (!l2.yarnFlee && (near || hit)){
      l2.yarnFlee = true;
      toast("假的！跑掉了！");
      wrongBeep();
    }
    if (l2.yarnFlee){
      yarnBall.x += 7.2 * f;
      yarnBall.y = 432 + Math.sin(t * 18) * 3;
      if (hit || yarnBall.x > 2748){
        l2.yarnGone = true;
        popBeep();
        spawnPuff(yarnBall.x, yarnBall.y, 12, "rgba(255,142,176,0.5)");
        if (hit) toast("抓到了也没用！");
      }
    }
  }
  if (spikeRug){
    const onRug = player.onGround && player.x + player.w > spikeRug.x + 4 && player.x < spikeRug.x + spikeRug.w - 4;
    if (onRug) l2.spikesArmed = true;
    if (l2.spikesArmed) l2.spikes = Math.min(1, l2.spikes + dt * 6);
    if (l2.spikes > 0.32){
      const teeth = { x:spikeRug.x + 6, y:GROUND - l2.spikes * 30, w:spikeRug.w - 12, h:l2.spikes * 30 };
      if (aabb(player, teeth)){ fail("地毯咬人！"); return true; }
    }
  }
  const cakeX = 3140;
  if (!l2.vacVisible && player.x + player.w > cakeX - 70 && player.x < cakeX + 90){
    l2.vacVisible = true;
    cleaner = { x:surpriseVac.x, y:surpriseVac.y, w:70, h:70 };
    popBeep();
  }
  if (l2.vacVisible){
    l2.vacPop = Math.min(1, l2.vacPop + dt * 3.2);
    const bobY = Math.sin(t * 3.2) * 4;
    const vy = surpriseVac.y + (1 - l2.vacPop) * 70 + bobY;
    cleaner.y = surpriseVac.y;
    if (l2.vacPop > 0.4){
      const cleanerBox = { x:cleaner.x + 6, y:vy + 10, w:cleaner.w - 10, h:cleaner.h - 12 };
      if (aabb(player, cleanerBox)){ fail("伏击！"); return true; }
    }
    if (Math.random() < 0.55 * l2.vacPop){
      particles.push({ x:cleaner.x - 10 - Math.random()*55, y:vy + 28 + (Math.random()-0.5)*28, vx:1.4+Math.random()*1.2, vy:(Math.random()-0.5)*0.4, life:0.55, r:2+Math.random()*2.5 });
    }
  }
  for (let i = particles.length - 1; i >= 0; i--){
    const p = particles[i]; p.x += p.vx * f; p.y += p.vy * f; p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
  if (pieZone && !l2.pieStarted && player.x + player.w > pieZone.x && player.x < pieZone.x + pieZone.w){
    l2.pieStarted = true;
    l2.pieX = player.x + player.w * 0.5 + 18;
    l2.pieY = -48;
    l2.pieVy = 3;
    l2.pieSplat = false;
  }
  if (l2.pieStarted && !l2.pieSplat){
    l2.pieVy += 0.25 * f;
    l2.pieY += l2.pieVy * f;
    l2.pieRot += 0.12 * f;
    if (circleBox(l2.pieX, l2.pieY, 22, player)){ fail("天上掉布丁！"); return true; }
    if (l2.pieY > GROUND - 12){
      l2.pieY = GROUND - 8;
      l2.pieSplat = true;
      spawnPuff(l2.pieX, GROUND - 6, 8, "rgba(255,120,170,0.45)");
    }
  }
  if (sheep){
    if (!l2.sheepCharging && player.x > 3480 && player.x < 3820){
      l2.sheepCharging = true;
      sheep.vx = -5.2;
      toast("咩！");
      beep(300, 0.07, "square", 0.04);
    }
    if (l2.sheepCharging){
      sheep.x += sheep.vx * f;
      if (sheep.x < 2440) sheep.x = 2440;
    }
    const sbox = { x:sheep.x + 6, y:GROUND - 42, w:52, h:42 };
    if (l2.sheepCharging && aabb(player, sbox)){ fail("小羊不客气！"); return true; }
  }
  if (windZone && player.x + player.w > windZone.x && player.x < 3960){
    if (!l2.windToast){
      l2.windToast = true;
      player.vx += 4.8;
      toast("好大的风！");
      beep(500, 0.12, "sine", 0.03);
    }
    player.vx += 0.16 * f;
    if (Math.random() < 0.7){
      l2.leaves.push({ x:player.x - 20 - Math.random()*80, y:player.y + Math.random()*40, vx:6+Math.random()*4, vy:(Math.random()-0.5)*1.4, life:0.5, r:3+Math.random()*3 });
    }
  }
  for (let i = l2.leaves.length - 1; i >= 0; i--){
    const p = l2.leaves[i]; p.x += p.vx * f; p.y += p.vy * f; p.life -= dt;
    if (p.life <= 0) l2.leaves.splice(i, 1);
  }
  if (extras && bananaSpot && player.onGround && player.x + player.w > bananaSpot.x && player.x < bananaSpot.x + bananaSpot.w){
    if (!extras.bananaOn){
      extras.bananaOn = true;
      toast("香蕉皮！");
      popBeep();
    }
    player.groundKind = "ice";
  }
  if (extras && pillowCat && !extras.pillowUsed && aabb(player, { x:pillowCat.x - 4, y:pillowCat.y - 12, w:pillowCat.w + 8, h:pillowCat.h + 16 })){
    extras.pillowUsed = true;
    player.vx = -6.5;
    player.vy = -5;
    toast("这是抱枕！");
    wrongBeep();
  }
  if (realGoal && aabb(player, { x:realGoal.x - 6, y:realGoal.y - 10, w:realGoal.w + 12, h:realGoal.h + 16 })){
    winGame();
    return true;
  }
  return false;
}
