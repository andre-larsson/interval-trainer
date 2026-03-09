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

const $ = (id) => document.getElementById(id);
const setupView = $("setupView");
const gameView = $("gameView");
const statusEl = $("status");
const answersEl = $("answers");
const playMelodicBtn = $("playMelodic");
const playHarmonicBtn = $("playHarmonic");
const scoreEl = $("score");
const streakEl = $("streak");
const checkboxContainer = $("intervalCheckboxes");
const nextRoundBtn = $("nextRound");
const exitGameBtn = $("exitGame");

let audioCtx;
let currentQuestion = null;
let score = 0;
let streak = 0;
let attempts = 0;
let firstGuessWrong = false;
let solved = false;

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

function getSelectedSemitones() {
  const checked = [...document.querySelectorAll('input[name="interval-filter"]:checked')];
  return checked.map((el) => Number(el.value));
}

function getPool() {
  const selected = getSelectedSemitones();
  return INTERVALS.filter((i) => selected.includes(i.semitones));
}

function buildIntervalCheckboxes() {
  checkboxContainer.innerHTML = "";

  INTERVALS.forEach((interval) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "interval-filter";
    input.value = interval.semitones;
    input.checked = true;
    input.addEventListener("change", () => {
      const selected = getSelectedSemitones();
      if (selected.length === 0) {
        input.checked = true;
        statusEl.innerHTML = '⚠️ <span class="bad">Välj minst ett intervall.</span>';
        return;
      }
      buildAnswerButtons(getPool());
    });

    const text = document.createElement("span");
    text.textContent = interval.name;

    label.appendChild(input);
    label.appendChild(text);
    checkboxContainer.appendChild(label);
  });
}

function buildAnswerButtons(pool) {
  answersEl.innerHTML = "";
  pool.forEach((interval) => {
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

function playInterval(question, mode) {
  ensureAudio();

  const type = $("instrument").value;
  const now = audioCtx.currentTime + 0.03;

  const rootFreq = midiToFreq(question.root);
  const upperFreq = midiToFreq(question.root + question.interval);

  if (mode === "melodic") {
    playTone(rootFreq, now, 0.55, type);
    playTone(upperFreq, now + 0.72, 0.55, type);
  } else {
    playTone(rootFreq, now, 1.1, type);
    playTone(upperFreq, now, 1.1, type);
  }
}

function startRound() {
  const pool = getPool();
  if (!pool.length) {
    statusEl.innerHTML = '⚠️ <span class="bad">Välj minst ett intervall.</span>';
    return;
  }

  const picked = randomItem(pool);
  currentQuestion = {
    interval: picked.semitones,
    root: randomItem([57, 59, 60, 62, 64, 65])
  };

  attempts = 0;
  firstGuessWrong = false;
  solved = false;

  buildAnswerButtons(pool);
  statusEl.textContent = "Lyssna och gissa. Du går vidare först när du svarat rätt.";
  playMelodicBtn.disabled = false;
  playHarmonicBtn.disabled = false;
  nextRoundBtn.disabled = true;
  nextRoundBtn.textContent = "Nästa runda (låst tills rätt svar)";

  playInterval(currentQuestion, "melodic");
}

function answer(guess) {
  if (!currentQuestion || solved) return;

  attempts += 1;
  const correct = guess === currentQuestion.interval;
  const correctName = INTERVALS.find((i) => i.semitones === currentQuestion.interval)?.name;

  if (correct) {
    solved = true;
    nextRoundBtn.disabled = false;
    nextRoundBtn.textContent = "Nästa runda";

    if (!firstGuessWrong) {
      score += 1;
      streak += 1;
      statusEl.innerHTML = `✅ <span class="ok">Rätt!</span> ${correctName}. +1 poäng.`;
    } else {
      streak = 0;
      statusEl.innerHTML = `✅ <span class="ok">Rätt till slut!</span> ${correctName}. 0 poäng denna runda (första gissningen var fel).`;
    }
  } else {
    if (attempts === 1) firstGuessWrong = true;
    streak = 0;
    statusEl.innerHTML = `❌ <span class="bad">Fel.</span> Lyssna igen och försök igen — du behöver rätt svar för att gå vidare.`;
  }

  scoreEl.textContent = score;
  streakEl.textContent = streak;
}

$("startGame").addEventListener("click", () => {
  setupView.classList.add("hidden");
  gameView.classList.remove("hidden");
  buildIntervalCheckboxes();
  buildAnswerButtons(getPool());
});

nextRoundBtn.addEventListener("click", startRound);
playMelodicBtn.addEventListener("click", () => currentQuestion && playInterval(currentQuestion, "melodic"));
playHarmonicBtn.addEventListener("click", () => currentQuestion && playInterval(currentQuestion, "harmonic"));

$("resetScore").addEventListener("click", () => {
  score = 0;
  streak = 0;
  scoreEl.textContent = "0";
  streakEl.textContent = "0";
  statusEl.textContent = "Poäng nollställd.";
});

exitGameBtn.addEventListener("click", () => {
  gameView.classList.add("hidden");
  setupView.classList.remove("hidden");
});
