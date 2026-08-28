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
const player = { x:SPAWN.x, y:SPAWN.y, w:PW, h:PH, vx:0, vy:0, facing:1, onGround:false, groundKind:"dirt", squash:1, blink:0 };
let lastSafe = { x:SPAWN.x, y:SPAWN.y };
let playing = true, jumpBuf = 0, coyote = 0, toastedJelly = false, touchFlag = false, touchDoor = false, shake = 0;
const particles = [];
const puffs = [];
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
  SPAWN = { x:86, y:GROUND - PH };
}
function loadLevel2(){
  LEVEL_W = 4600;
  platforms.push({ x:0, y:GROUND, w:520, h:80, kind:"dirt" });
  platforms.push({ x:520, y:GROUND, w:180, h:80, kind:"dirt", vanish:true, safe:false, vanished:false }); // 1 vanishing floor
  platforms.push({ x:800, y:GROUND, w:280, h:80, kind:"dirt" });
  jelly = { x:1080, y:452, w:168, h:88 }; // 7 false spring
  platforms.push({ x:1248, y:GROUND, w:432, h:80, kind:"dirt" });
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
  if (currentLevel === 2) resetL2World();
  player.x = lastSafe.x; player.y = lastSafe.y; player.vx = 0; player.vy = 0;
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
  if (realGoal && aabb(player, { x:realGoal.x - 6, y:realGoal.y - 10, w:realGoal.w + 12, h:realGoal.h + 16 })){
    winGame();
    return true;
  }
  return false;
}
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
  for (let i = 0; i < 8; i++){
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
  for (let i = 0; i < 5; i++){
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
  const jig = (p.vanish && l2 && l2.vanishTimer > 0 && !p.vanished) ? Math.sin(t * 40) * (l2.vanishTimer * 6) : 0;
  ctx.save();
  ctx.translate(jig, 0);
  ctx.fillStyle = "#c9844a"; ctx.fillRect(p.x, p.y, p.w, p.h + 40);
  ctx.fillStyle = "#8a4e24"; ctx.fillRect(p.x, p.y, p.w, 10);
  ctx.fillStyle = "#e0b36a"; ctx.fillRect(p.x, p.y, p.w, 5);
  ctx.fillStyle = "#6b3918";
  for (let x = p.x + 16; x < p.x + p.w; x += 38){
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
  for (let x = p.x + 20; x < p.x + p.w; x += 46){
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
  for (let i = 0; i < 4; i++){
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(p.x + 30 + i * 55, p.y + 6 + Math.sin(t * 5 + i) * 2, 3, 3);
  }
}
function drawJelly(){
  if (!jelly) return;
  const j = jelly, wob = t * 4.2;
  ctx.beginPath(); ctx.moveTo(j.x, H + 10); ctx.lineTo(j.x, j.y + 10);
  for (let x = 0; x <= j.w; x += 8){
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
  for (let i = 0; i < 5; i++){
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
  for (let i = 0; i < 6; i++){
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
  for (let i = 0; i < 7; i++){
    ctx.beginPath(); ctx.moveTo(d.x - 8 + i * 14, d.y + 10); ctx.lineTo(d.x + 10 + i * 12, d.y + d.h); ctx.stroke();
  }
  ctx.fillStyle = "#6b3918"; ctx.fillRect(d.x - 10, GROUND - 6, d.w + 20, 6);
}
function drawCleaner(){
  if (!cleaner) return;
  const bob = Math.sin(t * 3.2) * 4;
  let extraY = 0;
  if (currentLevel === 2 && l2) extraY = (1 - l2.vacPop) * 70;
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
  for (let i = 0; i < particles.length; i++){
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
  for (let a = 0; a < 8; a++){
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
  ctx.save(); ctx.translate(cx, feet); ctx.scale(p.facing < 0 ? -1 : 1, 1); ctx.translate(0, -p.h);
  ctx.fillStyle = "rgba(40,20,10,0.18)";
  ctx.beginPath(); ctx.ellipse(0, p.h - 2, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath(); ctx.ellipse(0, p.h - bh * 0.48, bw * 0.48, bh * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = "#e8a45c";
  ctx.beginPath(); ctx.arc(-10, p.h - bh * 0.55, 4, 0, Math.PI * 2); ctx.arc(8, p.h - bh * 0.38, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffb0c4";
  ctx.beginPath(); ctx.ellipse(-13, p.h - bh * 0.42, 5, 3.2, 0, 0, Math.PI * 2); ctx.ellipse(13, p.h - bh * 0.42, 5, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  const closed = p.blink > 0 && p.blink < 0.12;
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
  for (let i = 0; i < puffs.length; i++){
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
    ctx.fillRect(1080, GROUND + 8, 168, H - GROUND);
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
  for (let i = 0; i < cols.length; i++){
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
  ctx.fillStyle = l2 && l2.flagUsed ? "#c9a0a0" : "#e24b4b";
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
  for (let i = 8; i < r.w - 6; i += 14){
    ctx.beginPath(); ctx.moveTo(r.x + i, r.y + 2); ctx.lineTo(r.x + i + 6, r.y + r.h); ctx.stroke();
  }
  if (l2 && l2.spikes > 0){
    const hgt = l2.spikes * 28;
    ctx.fillStyle = "#ffb0c4";
    ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++){
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
  const bob = l2 && l2.sheepCharging ? Math.sin(t * 20) * 2 : Math.sin(t * 3) * 2;
  const x = sheep.x, y = GROUND - 6 + bob;
  const face = (l2 && l2.sheepCharging) ? -1 : 1;
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
  if (l2 && l2.sheepCharging){
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
  for (let i = 0; i < l2.leaves.length; i++){
    const p = l2.leaves[i];
    ctx.fillStyle = "rgba(255,210,120," + Math.max(0, p.life) + ")";
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, t + i, 0, Math.PI * 2); ctx.fill();
  }
}
function drawCat(){
  if (!realGoal) return;
  const g = realGoal;
  const near = Math.abs(player.x - g.x) < 90;
  ctx.fillStyle = "#e8a0c0";
  ctx.beginPath(); ctx.ellipse(g.x + 28, GROUND - 6, 30, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2b1d12"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#f0a04a";
  ctx.beginPath(); ctx.ellipse(g.x + 24, GROUND - 18, 22, 14, -0.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
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
    for (let i = 0; i < 3; i++){
      const a = t * 2 + i * 2.1;
      ctx.beginPath(); ctx.arc(g.x + 20 + Math.cos(a) * 22, GROUND - 40 + Math.sin(a) * 8, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }
}
function drawHazards(){
  drawJelly();
  drawRainbow();
  drawCheckpointFlag();
  drawRug();
  for (let i = 0; i < decoBushes.length; i++) drawBush(decoBushes[i]);
  for (let i = 0; i < decoCakes.length; i++){
    if (decoCakes[i].trap) drawCakeBig(decoCakes[i]);
    else drawCupcake(decoCakes[i]);
  }
  if (l2 && l2.vacVisible) drawCleaner();
  drawSheep();
  if (yarnBall && !(l2 && l2.yarnGone)) drawBall();
  drawPie();
  drawCat();
  drawWind();
}

function draw(){
  ctx.save();
  if (shake > 0) ctx.translate((Math.random() - 0.5) * 10 * shake, (Math.random() - 0.5) * 8 * shake);
  drawSky();
  ctx.save(); ctx.translate(-camX, 0);
  drawHills(); drawGapDecor();
  for (let i = 0; i < platforms.length; i++){
    const p = platforms[i];
    if (p.vanished) continue;
    if (p.kind === "mud") drawMud(p);
    else if (p.kind === "ice") drawIce(p);
    else drawDirt(p);
  }
  if (currentLevel === 1){
    drawJelly(); drawFlag(); drawDoor();
    for (let i = 0; i < signs.length; i++) drawSign(signs[i]);
    drawCleaner(); drawBall();
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
  if (toastT > 0){ toastT -= dt; if (toastT <= 0) toastEl.style.opacity = 0; }
  if (playing) update(dt);
  else {
    const target = player.x + player.w * 0.5 - W * 0.42;
    if (camX < 0) camX = 0;
    if (camX > LEVEL_W - W) camX = LEVEL_W - W;
    camX += (target - camX) * 0.08;
  }
  draw();
  requestAnimationFrame(loop);
}
loadLevel(1);
requestAnimationFrame(loop);
