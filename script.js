const TRANSLATIONS = {
  sv: {
    title: '🎵 Intervalltränare',
    language: 'Språk',
    setupSound: 'Ljud (inställning)',
    gameSound: 'Ljud',
    direction: 'Melodiriktning',
    root: 'Grundton',
    intervalPicker: 'Välj intervall som ska vara med:',
    startGame: 'Starta spelet',
    playMelodic: 'Spela melodi',
    playHarmonic: 'Spela harmoni',
    startRoundStatus: 'Lyssna och välj rätt intervall för att gå vidare.',
    nextRound: 'Nästa runda',
    score: 'Poäng',
    streak: 'Streak',
    accuracy: 'Rätt av rundor',
    exit: 'Avsluta',
    loading: 'Starta en runda för att börja.',
    minOneInterval: 'Välj minst ett intervall.',
    correct: 'Rätt!',
    wrong: 'Fel.',
    wrongHint: 'Lyssna igen och försök igen — du behöver rätt svar för att gå vidare.',
    noPoint: '0 poäng denna runda (första gissningen var fel).',
    plusPoint: '+1 poäng.',
    directionUp: 'Uppåt',
    directionDown: 'Nedåt',
    directionBoth: 'Båda (slump)',
    rootChromatic: 'Kromatisk (C3–C5)',
    rootC: 'Låst till C',
    semitones: 'st'
  },
  en: {
    title: '🎵 Interval Trainer',
    language: 'Language',
    setupSound: 'Sound (setup)',
    gameSound: 'Sound',
    direction: 'Melodic direction',
    root: 'Root note',
    intervalPicker: 'Choose intervals to include:',
    startGame: 'Start game',
    playMelodic: 'Play melodic',
    playHarmonic: 'Play harmonic',
    startRoundStatus: 'Listen and choose the correct interval to continue.',
    nextRound: 'Next round',
    score: 'Score',
    streak: 'Streak',
    accuracy: 'Correct rounds',
    exit: 'Exit',
    loading: 'Start a round to begin.',
    minOneInterval: 'Select at least one interval.',
    correct: 'Correct!',
    wrong: 'Wrong.',
    wrongHint: 'Listen again and try again — you need the right answer to continue.',
    noPoint: '0 points this round (first guess was wrong).',
    plusPoint: '+1 point.',
    directionUp: 'Up',
    directionDown: 'Down',
    directionBoth: 'Both (random)',
    rootChromatic: 'Chromatic (C3–C5)',
    rootC: 'Locked to C',
    semitones: 'st'
  }
};

const INTERVALS = [
  { semitones: 0, sv: 'Prim', en: 'Unison' },
  { semitones: 1, sv: 'Liten sekund', en: 'Minor second' },
  { semitones: 2, sv: 'Stor sekund', en: 'Major second' },
  { semitones: 3, sv: 'Liten ters', en: 'Minor third' },
  { semitones: 4, sv: 'Stor ters', en: 'Major third' },
  { semitones: 5, sv: 'Kvart', en: 'Perfect fourth' },
  { semitones: 6, sv: 'Tritonus', en: 'Tritone' },
  { semitones: 7, sv: 'Kvint', en: 'Perfect fifth' },
  { semitones: 8, sv: 'Liten sext', en: 'Minor sixth' },
  { semitones: 9, sv: 'Stor sext', en: 'Major sixth' },
  { semitones: 10, sv: 'Liten septima', en: 'Minor seventh' },
  { semitones: 11, sv: 'Stor septima', en: 'Major seventh' },
  { semitones: 12, sv: 'Oktav', en: 'Octave' }
];

const SOUND_PRESETS = {
  sine: {
    type: 'sine', attack: 0.02, peak: 0.18, tail: 0.03,
    sv: 'Ren ton — sinus, utan övertoner',
    en: 'Pure tone — sine wave, minimal overtones',
    infoSv: 'Sinusvåg, nästan inga övertoner. Ren referenston.',
    infoEn: 'Sine wave with almost no overtones. Clean reference tone.'
  },
  triangle: {
    type: 'triangle', attack: 0.02, peak: 0.18, tail: 0.03,
    sv: 'Mjuk synth — triangle, mjuk attack',
    en: 'Soft synth — triangle, smooth attack',
    infoSv: 'Triangle-våg. Mjukare än square/saw, bra allround.',
    infoEn: 'Triangle wave. Softer than square/saw, good all-round.'
  },
  square: {
    type: 'square', attack: 0.01, peak: 0.14, tail: 0.02,
    sv: 'Klar synth — square, tydliga övertoner',
    en: 'Clear synth — square, rich overtones',
    infoSv: 'Square-våg med tydliga övertoner och skarpare klang.',
    infoEn: 'Square wave with clear overtones and sharper timbre.'
  },
  sawtooth: {
    type: 'sawtooth', attack: 0.01, peak: 0.12, tail: 0.02,
    sv: 'Bright synth — sågtand, ljus/aggressiv',
    en: 'Bright synth — sawtooth, bright/aggressive',
    infoSv: 'Sågtand-våg, ljus och övertonsrik.',
    infoEn: 'Sawtooth wave, bright and overtone-rich.'
  },
  flute: {
    type: 'sine', attack: 0.05, peak: 0.2, tail: 0.04,
    sv: 'Flöjt-lik — sinus, lång attack',
    en: 'Flute-like — sine, long attack',
    infoSv: 'Sinusbaserad med lång attack för flöjt-lik känsla.',
    infoEn: 'Sine-based with longer attack for a flute-like feel.'
  },
  organ: {
    type: 'square', attack: 0.01, peak: 0.09, tail: 0.04,
    sv: 'Orgel-lik — square, låg peak',
    en: 'Organ-like — square, lower peak',
    infoSv: 'Square-baserad, jämn sustain och lägre peak.',
    infoEn: 'Square-based, even sustain and lower peak.'
  },
  bell: {
    type: 'triangle', attack: 0.004, peak: 0.26, tail: 0.18,
    sv: 'Klocka-lik — triangle, snabb attack + lång tail',
    en: 'Bell-like — triangle, quick attack + long tail',
    infoSv: 'Triangle-baserad med snabb attack + lång utklingning.',
    infoEn: 'Triangle-based with fast attack and long decay.'
  },
  warmpad: {
    type: 'triangle', attack: 0.09, peak: 0.16, tail: 0.08,
    sv: 'Varm pad — triangle, lång attack/release',
    en: 'Warm pad — triangle, long attack/release',
    infoSv: 'Triangle-baserad pad med lång attack/release.',
    infoEn: 'Triangle-based pad with long attack/release.'
  }
};

const $ = (id) => document.getElementById(id);
const setupView = $('setupView');
const gameView = $('gameView');
const statusEl = $('status');
const answersEl = $('answers');
const playMelodicBtn = $('playMelodic');
const playHarmonicBtn = $('playHarmonic');
const scoreEl = $('score');
const streakEl = $('streak');
const accuracyEl = $('accuracy');
const checkboxContainer = $('intervalCheckboxes');
const nextRoundBtn = $('nextRound');
const exitGameBtn = $('exitGame');
const instrumentSetupEl = $('instrument');
const instrumentGameEl = $('instrumentGame');
const directionSetupEl = $('directionSetup');
const directionGameEl = $('directionGame');
const rootModeSetupEl = $('rootModeSetup');
const rootModeGameEl = $('rootModeGame');
const langSvBtn = $('langSv');
const langEnBtn = $('langEn');
const soundInfoEl = $('soundInfo');

const DEFAULT_INTERVALS = new Set([0, 7, 12]);

let audioCtx;
let currentQuestion = null;
let score = 0;
let streak = 0;
let rounds = 0;
let attempts = 0;
let firstGuessWrong = false;
let solved = false;
let roundCounted = false;
let currentLang = 'sv';

function t(key) {
  return TRANSLATIONS[currentLang][key] || key;
}

function intervalLabel(interval) {
  return `${interval[currentLang]} (${interval.semitones} ${t('semitones')})`;
}

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
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

function populateSoundOptions() {
  const selected = instrumentSetupEl.value || 'triangle';
  const optionsHtml = Object.entries(SOUND_PRESETS)
    .map(([value, preset]) => `<option value="${value}">${preset[currentLang]}</option>`)
    .join('');

  instrumentSetupEl.innerHTML = optionsHtml;
  instrumentGameEl.innerHTML = optionsHtml;
  instrumentSetupEl.value = selected;
  instrumentGameEl.value = selected;
}

function updateSelectTexts() {
  directionSetupEl.options[0].textContent = t('directionUp');
  directionSetupEl.options[1].textContent = t('directionDown');
  directionSetupEl.options[2].textContent = t('directionBoth');
  directionGameEl.options[0].textContent = t('directionUp');
  directionGameEl.options[1].textContent = t('directionDown');
  directionGameEl.options[2].textContent = t('directionBoth');

  rootModeSetupEl.options[0].textContent = t('rootChromatic');
  rootModeSetupEl.options[1].textContent = t('rootC');
  rootModeGameEl.options[0].textContent = t('rootChromatic');
  rootModeGameEl.options[1].textContent = t('rootC');
}

function updateSoundInfo() {
  const preset = SOUND_PRESETS[instrumentGameEl.value] || SOUND_PRESETS.triangle;
  const info = currentLang === 'sv' ? preset.infoSv : preset.infoEn;
  soundInfoEl.textContent = `${info} (attack: ${preset.attack}s, peak: ${preset.peak}, tail: ${preset.tail}s)`;
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
  checkboxContainer.innerHTML = '';

  INTERVALS.forEach((interval) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'interval-filter';
    input.value = interval.semitones;
    input.checked = DEFAULT_INTERVALS.has(interval.semitones);
    input.addEventListener('change', () => {
      const selected = getSelectedSemitones();
      if (selected.length === 0) {
        input.checked = true;
        statusEl.innerHTML = `⚠️ <span class="bad">${t('minOneInterval')}</span>`;
        return;
      }
      buildAnswerButtons(getPool());
    });

    const text = document.createElement('span');
    text.textContent = intervalLabel(interval);

    label.appendChild(input);
    label.appendChild(text);
    checkboxContainer.appendChild(label);
  });
}

function clearSelectedAnswer() {
  answersEl.querySelectorAll('button').forEach((btn) => btn.classList.remove('selected-answer'));
}

function buildAnswerButtons(pool) {
  answersEl.innerHTML = '';
  pool.forEach((interval) => {
    const btn = document.createElement('button');
    btn.textContent = intervalLabel(interval);
    btn.dataset.semitones = String(interval.semitones);
    btn.onclick = () => answer(interval.semitones);
    answersEl.appendChild(btn);
  });
}

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

  if (mode === 'melodic') {
    if (question.melodicDirection === 'down') {
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
    statusEl.innerHTML = `⚠️ <span class="bad">${t('minOneInterval')}</span>`;
    return;
  }

  const picked = randomItem(pool);
  const directionSetting = directionGameEl.value;
  const melodicDirection = directionSetting === 'both' ? randomItem(['up', 'down']) : directionSetting;

  const rootPoolChromatic = Array.from({ length: 25 }, (_, i) => 48 + i);
  const rootPoolC = [48, 60, 72];
  const rootMode = rootModeGameEl.value;

  currentQuestion = {
    interval: picked.semitones,
    root: randomItem(rootMode === 'c' ? rootPoolC : rootPoolChromatic),
    melodicDirection
  };

  attempts = 0;
  firstGuessWrong = false;
  solved = false;
  roundCounted = false;

  buildAnswerButtons(pool);
  clearSelectedAnswer();
  statusEl.textContent = t('startRoundStatus');
  playMelodicBtn.disabled = false;
  playHarmonicBtn.disabled = false;
  nextRoundBtn.disabled = true;
  nextRoundBtn.textContent = t('nextRound');

  updateStats();
  playInterval(currentQuestion, 'melodic');
}

function answer(guess) {
  if (!currentQuestion || solved) return;

  clearSelectedAnswer();
  const selectedBtn = answersEl.querySelector(`button[data-semitones="${guess}"]`);
  if (selectedBtn) selectedBtn.classList.add('selected-answer');

  if (!roundCounted) {
    rounds += 1;
    roundCounted = true;
  }

  attempts += 1;
  const correct = guess === currentQuestion.interval;
  const correctLabel = intervalLabel(INTERVALS.find((i) => i.semitones === currentQuestion.interval));

  if (correct) {
    solved = true;
    nextRoundBtn.disabled = false;
    nextRoundBtn.textContent = t('nextRound');

    if (!firstGuessWrong) {
      score += 1;
      streak += 1;
      statusEl.innerHTML = `✅ <span class="ok">${t('correct')}</span> ${correctLabel}. ${t('plusPoint')}`;
    } else {
      streak = 0;
      statusEl.innerHTML = `✅ <span class="ok">${t('correct')}</span> ${correctLabel}. ${t('noPoint')}`;
    }
  } else {
    if (attempts === 1) firstGuessWrong = true;
    streak = 0;
    statusEl.innerHTML = `❌ <span class="bad">${t('wrong')}</span> ${t('wrongHint')}`;
  }

  updateStats();
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.title = currentLang === 'sv' ? 'Intervalltränare' : 'Interval Trainer';

  $('titleSetup').textContent = t('title');
  $('titleGame').textContent = t('title');
  $('labelInstrumentSetup').textContent = t('setupSound');
  $('labelInstrumentGame').textContent = t('gameSound');
  $('labelDirectionSetup').textContent = t('direction');
  $('labelDirectionGame').textContent = t('direction');
  $('labelRootSetup').textContent = t('root');
  $('labelRootGame').textContent = t('root');
  $('intervalPickerText').textContent = t('intervalPicker');
  $('startGame').textContent = t('startGame');
  playMelodicBtn.textContent = t('playMelodic');
  playHarmonicBtn.textContent = t('playHarmonic');
  nextRoundBtn.textContent = t('nextRound');
  $('scoreLabel').textContent = t('score');
  $('streakLabel').textContent = t('streak');
  $('accuracyLabel').textContent = t('accuracy');
  exitGameBtn.textContent = t('exit');

  langSvBtn.classList.toggle('active', currentLang === 'sv');
  langEnBtn.classList.toggle('active', currentLang === 'en');

  updateSelectTexts();
  populateSoundOptions();
  buildIntervalCheckboxes();
  buildAnswerButtons(getPool());
  updateSoundInfo();

  if (!currentQuestion && gameView.classList.contains('hidden')) {
    statusEl.textContent = t('loading');
  }
}

$('startGame').addEventListener('click', () => {
  score = 0;
  streak = 0;
  rounds = 0;
  updateStats();

  syncInstrument(instrumentSetupEl, instrumentGameEl);
  syncInstrument(directionSetupEl, directionGameEl);
  syncInstrument(rootModeSetupEl, rootModeGameEl);
  setupView.classList.add('hidden');
  gameView.classList.remove('hidden');
  startRound();
});

instrumentSetupEl.addEventListener('change', () => {
  if (gameView.classList.contains('hidden')) return;
  syncInstrument(instrumentSetupEl, instrumentGameEl);
});

instrumentGameEl.addEventListener('change', () => {
  syncInstrument(instrumentGameEl, instrumentSetupEl);
});

directionSetupEl.addEventListener('change', () => {
  if (gameView.classList.contains('hidden')) return;
  syncInstrument(directionSetupEl, directionGameEl);
});

directionGameEl.addEventListener('change', () => {
  syncInstrument(directionGameEl, directionSetupEl);
});

rootModeSetupEl.addEventListener('change', () => {
  if (gameView.classList.contains('hidden')) return;
  syncInstrument(rootModeSetupEl, rootModeGameEl);
});

rootModeGameEl.addEventListener('change', () => {
  syncInstrument(rootModeGameEl, rootModeSetupEl);
});

function setLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'sv';
  applyTranslations();
}

langSvBtn.addEventListener('click', () => setLanguage('sv'));
langEnBtn.addEventListener('click', () => setLanguage('en'));

nextRoundBtn.addEventListener('click', startRound);
playMelodicBtn.addEventListener('click', () => currentQuestion && playInterval(currentQuestion, 'melodic'));
playHarmonicBtn.addEventListener('click', () => currentQuestion && playInterval(currentQuestion, 'harmonic'));

exitGameBtn.addEventListener('click', () => {
  score = 0;
  streak = 0;
  rounds = 0;
  updateStats();

  gameView.classList.add('hidden');
  setupView.classList.remove('hidden');
});

setLanguage('sv');
updateStats();
