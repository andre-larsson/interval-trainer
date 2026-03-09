const INTERVALS = [
  { semitones: 0, name: "Prim" },
  { semitones: 1, name: "Liten sekund" },
  { semitones: 2, name: "Stor sekund" },
  { semitones: 3, name: "Liten ters" },
  { semitones: 4, name: "Stor ters" },
  { semitones: 5, name: "Kvart" },
  { semitones: 6, name: "Tritonus" },
  { semitones: 7, name: "Kvint" },
  { semitones: 8, name: "Liten sext" },
  { semitones: 9, name: "Stor sext" },
  { semitones: 10, name: "Liten septima" },
  { semitones: 11, name: "Stor septima" },
  { semitones: 12, name: "Oktav" }
];

const DIFFICULTIES = {
  easy: [0, 3, 4, 5, 7],
  medium: [0, 2, 3, 4, 5, 7, 9, 12],
  hard: INTERVALS.map(i => i.semitones)
};

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const answersEl = $("answers");
const replayBtn = $("replay");
const scoreEl = $("score");
const streakEl = $("streak");

let audioCtx;
let currentQuestion = null;
let score = 0;
let streak = 0;

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPool() {
  const difficulty = $("difficulty").value;
  return INTERVALS.filter(i => DIFFICULTIES[difficulty].includes(i.semitones));
}

function buildAnswerButtons(pool) {
  answersEl.innerHTML = "";
  pool.forEach(interval => {
    const btn = document.createElement("button");
    btn.textContent = interval.name;
    btn.onclick = () => answer(interval.semitones);
    answersEl.appendChild(btn);
  });
}

function envelope(gainNode, when, dur, peak = 0.18) {
  gainNode.gain.setValueAtTime(0.0001, when);
  gainNode.gain.exponentialRampToValueAtTime(peak, when + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, when + dur);
}

function playTone(freq, start, dur, type) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  envelope(gain, start, dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.03);
}

function playInterval(question) {
  ensureAudio();

  const type = $("instrument").value;
  const now = audioCtx.currentTime + 0.03;

  const rootFreq = midiToFreq(question.root);
  const upperFreq = midiToFreq(question.root + question.interval);

  if (question.mode === "melodic") {
    playTone(rootFreq, now, 0.55, type);
    playTone(upperFreq, now + 0.72, 0.55, type);
  } else {
    playTone(rootFreq, now, 1.1, type);
    playTone(upperFreq, now, 1.1, type);
  }
}

function newQuestion() {
  const pool = getPool();
  const picked = randomItem(pool);
  const mode = $("mode").value;

  currentQuestion = {
    interval: picked.semitones,
    root: randomItem([57, 59, 60, 62, 64, 65]), // A3, B3, C4, D4, E4, F4
    mode
  };

  buildAnswerButtons(pool);
  statusEl.textContent = "Lyssna och välj rätt intervall.";
  statusEl.className = "";
  replayBtn.disabled = false;

  playInterval(currentQuestion);
}

function answer(guess) {
  if (!currentQuestion) return;

  const correct = guess === currentQuestion.interval;
  const correctName = INTERVALS.find(i => i.semitones === currentQuestion.interval)?.name;

  if (correct) {
    score += 1;
    streak += 1;
    statusEl.innerHTML = `✅ <span class="ok">Rätt!</span> Det var <strong>${correctName}</strong>.`;
  } else {
    streak = 0;
    statusEl.innerHTML = `❌ <span class="bad">Inte riktigt.</span> Rätt svar var <strong>${correctName}</strong>.`;
  }

  scoreEl.textContent = score;
  streakEl.textContent = streak;
}

$("newQuestion").addEventListener("click", newQuestion);
replayBtn.addEventListener("click", () => currentQuestion && playInterval(currentQuestion));
$("resetScore").addEventListener("click", () => {
  score = 0;
  streak = 0;
  scoreEl.textContent = "0";
  streakEl.textContent = "0";
  statusEl.textContent = "Poäng nollställd. Kör en ny intervall!";
  statusEl.className = "";
});
