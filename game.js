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
