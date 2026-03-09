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
const directionSetupEl = $("directionSetup");
const directionGameEl = $("directionGame");
const rootModeSetupEl = $("rootModeSetup");
const rootModeGameEl = $("rootModeGame");
const soundInfoEl = $("soundInfo");

const DEFAULT_INTERVALS = new Set([0, 7, 12]); // prim, kvint, oktav

let audioCtx;
let currentQuestion = null;
let score = 0;
let streak = 0;
let rounds = 0;
let attempts = 0;
let firstGuessWrong = false;
let solved = false;
let roundCounted = false;

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

function updateSoundInfo() {
  const preset = SOUND_PRESETS[instrumentGameEl.value] || SOUND_PRESETS.triangle;
  soundInfoEl.textContent = `${preset.info} (attack: ${preset.attack}s, peak: ${preset.peak}, tail: ${preset.tail}s)`;
}

function syncInstrument(fromEl, toEl) {
  toEl.value = fromEl.value;
  updateSoundInfo();
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
    input.checked = DEFAULT_INTERVALS.has(interval.semitones);
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

function clearSelectedAnswer() {
  answersEl.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected-answer"));
}

function buildAnswerButtons(pool) {
  answersEl.innerHTML = "";
  pool.forEach((interval) => {
    const btn = document.createElement("button");
    btn.textContent = interval.label;
    btn.dataset.semitones = String(interval.semitones);
    btn.onclick = () => answer(interval.semitones);
    answersEl.appendChild(btn);
  });
}

const SOUND_PRESETS = {
  sine: { type: "sine", attack: 0.02, peak: 0.18, tail: 0.03, info: "Sinusvåg, nästan inga övertoner. Ren referenston." },
  triangle: { type: "triangle", attack: 0.02, peak: 0.18, tail: 0.03, info: "Triangle-våg. Mjukare än square/saw, bra allround." },
  square: { type: "square", attack: 0.01, peak: 0.14, tail: 0.02, info: "Square-våg med tydliga övertoner och skarpare klang." },
  sawtooth: { type: "sawtooth", attack: 0.01, peak: 0.12, tail: 0.02, info: "Sågtand-våg, ljus och övertonsrik." },
  flute: { type: "sine", attack: 0.05, peak: 0.2, tail: 0.04, info: "Sinusbaserad med lång attack för flöjt-lik känsla." },
  organ: { type: "square", attack: 0.01, peak: 0.09, tail: 0.04, info: "Square-baserad, jämn sustain och lägre peak." },
  bell: { type: "triangle", attack: 0.004, peak: 0.26, tail: 0.18, info: "Triangle-baserad med snabb attack + lång utklingning." },
  warmpad: { type: "triangle", attack: 0.09, peak: 0.16, tail: 0.08, info: "Triangle-baserad pad med lång attack/release." }
};

function envelope(gainNode, when, dur, attack = 0.02, peak = 0.18) {
  gainNode.gain.setValueAtTime(0.0001, when);
  gainNode.gain.exponentialRampToValueAtTime(peak, when + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, when + dur);
}

function playTone(freq, start, dur, presetName) {
  const preset = SOUND_PRESETS[presetName] || SOUND_PRESETS.triangle;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = preset.type;
  osc.frequency.setValueAtTime(freq, start);

  envelope(gain, start, dur, preset.attack, preset.peak);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + dur + (preset.tail ?? 0.03));
}

function playInterval(question, mode) {
  ensureAudio();

  const type = instrumentGameEl.value;
  const now = audioCtx.currentTime + 0.03;

  const rootFreq = midiToFreq(question.root);
  const upperFreq = midiToFreq(question.root + question.interval);

  if (mode === "melodic") {
    if (question.melodicDirection === "down") {
      playTone(upperFreq, now, 0.55, type);
      playTone(rootFreq, now + 0.72, 0.55, type);
    } else {
      playTone(rootFreq, now, 0.55, type);
      playTone(upperFreq, now + 0.72, 0.55, type);
    }
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
  const directionSetting = directionGameEl.value;
  const melodicDirection = directionSetting === "both" ? randomItem(["up", "down"]) : directionSetting;

  const rootPoolFree = [45, 47, 48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72];
  const rootPoolC = [48, 60, 72]; // C3, C4, C5
  const rootMode = rootModeGameEl.value;

  currentQuestion = {
    interval: picked.semitones,
    root: randomItem(rootMode === "c" ? rootPoolC : rootPoolFree),
    melodicDirection
  };

  attempts = 0;
  firstGuessWrong = false;
  solved = false;
  roundCounted = false;

  buildAnswerButtons(pool);
  clearSelectedAnswer();
  statusEl.textContent = "Lyssna och välj rätt intervall för att gå vidare.";
  playMelodicBtn.disabled = false;
  playHarmonicBtn.disabled = false;
  nextRoundBtn.disabled = true;
  nextRoundBtn.textContent = "Nästa runda";

  updateStats();
  playInterval(currentQuestion, "melodic");
}

function answer(guess) {
  if (!currentQuestion || solved) return;

  clearSelectedAnswer();
  const selectedBtn = answersEl.querySelector(`button[data-semitones="${guess}"]`);
  if (selectedBtn) selectedBtn.classList.add("selected-answer");

  if (!roundCounted) {
    rounds += 1;
    roundCounted = true;
  }

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
      statusEl.innerHTML = `✅ <span class="ok">Rätt!</span> ${correctLabel}. 0 poäng denna runda (första gissningen var fel).`;
    }
  } else {
    if (attempts === 1) firstGuessWrong = true;
    streak = 0;
    statusEl.innerHTML = `❌ <span class="bad">Fel.</span> Lyssna igen och försök igen — du behöver rätt svar för att gå vidare.`;
  }

  updateStats();
}

$("startGame").addEventListener("click", () => {
  score = 0;
  streak = 0;
  rounds = 0;
  updateStats();

  syncInstrument(instrumentSetupEl, instrumentGameEl);
  syncInstrument(directionSetupEl, directionGameEl);
  syncInstrument(rootModeSetupEl, rootModeGameEl);
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

directionSetupEl.addEventListener("change", () => {
  if (gameView.classList.contains("hidden")) return;
  syncInstrument(directionSetupEl, directionGameEl);
});

directionGameEl.addEventListener("change", () => {
  syncInstrument(directionGameEl, directionSetupEl);
});

rootModeSetupEl.addEventListener("change", () => {
  if (gameView.classList.contains("hidden")) return;
  syncInstrument(rootModeSetupEl, rootModeGameEl);
});

rootModeGameEl.addEventListener("change", () => {
  syncInstrument(rootModeGameEl, rootModeSetupEl);
});

nextRoundBtn.addEventListener("click", startRound);
playMelodicBtn.addEventListener("click", () => currentQuestion && playInterval(currentQuestion, "melodic"));
playHarmonicBtn.addEventListener("click", () => currentQuestion && playInterval(currentQuestion, "harmonic"));

exitGameBtn.addEventListener("click", () => {
  score = 0;
  streak = 0;
  rounds = 0;
  updateStats();

  gameView.classList.add("hidden");
  setupView.classList.remove("hidden");
});

instrumentGameEl.innerHTML = instrumentSetupEl.innerHTML;
syncInstrument(instrumentSetupEl, instrumentGameEl);
syncInstrument(directionSetupEl, directionGameEl);
syncInstrument(rootModeSetupEl, rootModeGameEl);
buildIntervalCheckboxes();
updateStats();
