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
].map((i) => ({ ...i, label: `${i.name} (${i.semitones} st)` }));

const $ = (id) => document.getElementById(id);
const setupView = $("setupView");
const gameView = $("gameView");
const statusEl = $("status");
const answersEl = $("answers");
const playMelodicBtn = $("playMelodic");
const playHarmonicBtn = $("playHarmonic");
const scoreEl = $("score");
const streakEl = $("streak");
const accuracyEl = $("accuracy");
const checkboxContainer = $("intervalCheckboxes");
const nextRoundBtn = $("nextRound");
const exitGameBtn = $("exitGame");
const instrumentSetupEl = $("instrument");
const instrumentGameEl = $("instrumentGame");

let audioCtx;
let currentQuestion = null;
let score = 0;
let streak = 0;
let rounds = 0;
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

function updateStats() {
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  accuracyEl.textContent = `${score}/${rounds}`;
}

function syncInstrument(fromEl, toEl) {
  toEl.value = fromEl.value;
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
    text.textContent = interval.label;

    label.appendChild(input);
    label.appendChild(text);
    checkboxContainer.appendChild(label);
  });
}

function buildAnswerButtons(pool) {
  answersEl.innerHTML = "";
  pool.forEach((interval) => {
    const btn = document.createElement("button");
    btn.textContent = interval.label;
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

  const type = instrumentGameEl.value;
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

  rounds += 1;
  attempts = 0;
  firstGuessWrong = false;
  solved = false;

  buildAnswerButtons(pool);
  statusEl.textContent = "Lyssna och gissa. Du går vidare först när du svarat rätt.";
  playMelodicBtn.disabled = false;
  playHarmonicBtn.disabled = false;
  nextRoundBtn.disabled = true;
  nextRoundBtn.textContent = "Nästa runda (låst tills rätt svar)";

  updateStats();
  playInterval(currentQuestion, "melodic");
}

function answer(guess) {
  if (!currentQuestion || solved) return;

  attempts += 1;
  const correct = guess === currentQuestion.interval;
  const correctLabel = INTERVALS.find((i) => i.semitones === currentQuestion.interval)?.label;

  if (correct) {
    solved = true;
    nextRoundBtn.disabled = false;
    nextRoundBtn.textContent = "Nästa runda";

    if (!firstGuessWrong) {
      score += 1;
      streak += 1;
      statusEl.innerHTML = `✅ <span class="ok">Rätt!</span> ${correctLabel}. +1 poäng.`;
    } else {
      streak = 0;
      statusEl.innerHTML = `✅ <span class="ok">Rätt till slut!</span> ${correctLabel}. 0 poäng denna runda (första gissningen var fel).`;
    }
  } else {
    if (attempts === 1) firstGuessWrong = true;
    streak = 0;
    statusEl.innerHTML = `❌ <span class="bad">Fel.</span> Lyssna igen och försök igen — du behöver rätt svar för att gå vidare.`;
  }

  updateStats();
}

$("startGame").addEventListener("click", () => {
  syncInstrument(instrumentSetupEl, instrumentGameEl);
  setupView.classList.add("hidden");
  gameView.classList.remove("hidden");
  startRound();
});

instrumentSetupEl.addEventListener("change", () => {
  if (gameView.classList.contains("hidden")) return;
  syncInstrument(instrumentSetupEl, instrumentGameEl);
});

instrumentGameEl.addEventListener("change", () => {
  syncInstrument(instrumentGameEl, instrumentSetupEl);
});

nextRoundBtn.addEventListener("click", startRound);
playMelodicBtn.addEventListener("click", () => currentQuestion && playInterval(currentQuestion, "melodic"));
playHarmonicBtn.addEventListener("click", () => currentQuestion && playInterval(currentQuestion, "harmonic"));

exitGameBtn.addEventListener("click", () => {
  gameView.classList.add("hidden");
  setupView.classList.remove("hidden");
});

instrumentGameEl.innerHTML = instrumentSetupEl.innerHTML;
buildIntervalCheckboxes();
updateStats();
