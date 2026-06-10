// player.js — Black Buddha FM

// ── Tuner constants ───────────────────────────────────────────────────────────
const MIN_FREQ = 88.9;
const MAX_FREQ = 109.8;
const SIGNAL_LOCK_THRESH = 0.2;   // freq distance for "locked" state
const SIGNAL_FADE_THRESH = 1.5;   // freq distance for complete fade
const TUNE_LERP_FACTOR = 0.15;  // animation smoothing (0–1)

// ── Fallback genre images (single source of truth) ───────────────────────────
// Used by both renderMagazineCover() and renderBookletSpread()
const GENRE_FALLBACK_IMAGES = {
  'DRUM & BASS': 'images/Drum n Bass Magazine.png',
  'BASSLINE': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop',
  'UK FUNKY': 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop',
  'ROAD RAP': 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop',
  'UK DRILL': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop',
  'AFROSWING': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop',
  _default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
};

// Larger resolution variants for the booklet gallery page
const GENRE_GALLERY_IMAGES = {
  'DRUM & BASS': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=500&auto=format&fit=crop',
  'UK GARAGE': 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=500&auto=format&fit=crop',
  'BASSLINE': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500&auto=format&fit=crop',
  'UK FUNKY': 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=500&auto=format&fit=crop',
  'ROAD RAP': 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=500&auto=format&fit=crop',
  'UK DRILL': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500&auto=format&fit=crop',
  'AFROSWING': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=500&auto=format&fit=crop',
  _default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format&fit=crop',
};

function genreFallbackImg(genre, map) {
  return map[genre] || map._default;
}

// ── SVG icon strings ──────────────────────────────────────────────────────────
const SVG_PLAY = '<path d="M8 5v14l11-7z"/>';
const SVG_PAUSE = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

// ── Helper: station lookups ───────────────────────────────────────────────────
function getStationByGenre(genre) {
  return STATIONS.find(s => s.genre === genre) || null;
}

// ── Helper: time formatting ───────────────────────────────────────────────────

/**
 * Parse a "MM:SS" duration string into seconds.
 * Returns null (instead of a silent magic number) when the string is missing
 * or malformed — callers must handle null explicitly.
 */
function parseDuration(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split(':');
  if (parts.length !== 2) return null;
  const m = parseInt(parts[0], 10);
  const s = parseInt(parts[1], 10);
  if (isNaN(m) || isNaN(s)) return null;
  return m * 60 + s;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ── Helper: hex → "r, g, b" string (single definition used everywhere) ────────
function hexToRgb(hex) {
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const full = hex.replace(shorthand, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255';
}

// ── Pre-calculate rgb strings on the STATIONS array ──────────────────────────
function precalculateColors() {
  STATIONS.forEach(s => {
    s.colors.rgb = hexToRgb(s.colors.neonPink);
  });
}

// ── Build ticker from STATIONS data ──────────────────────────────────────────
function buildTicker() {
  const ticker = document.getElementById('ticker');
  if (!ticker) return;
  const items = [
    'BLACK BUDDHA FM',
    ...STATIONS.map(s => `EP ${s.epNum} \u2014 ${s.genre}: ${s.title.split('\u2013')[1]?.trim() || s.subtitle}`),
    '30 YEARS OF BLACK BRITISH MUSIC',
  ];
  ticker.innerHTML = [...items, ...items].map(t => `<span>${t}</span>`).join('');
}

/** Feature 2: Update ticker text dynamically when station changes */
function updateTickerForStation(station) {
  const ticker = document.getElementById('ticker');
  if (!ticker || !station) return;
  const items = [
    `NOW TRANSMITTING: EP ${station.epNum} — ${station.genre}`,
    `LIVE ON ${station.freq.toFixed(1)} FM`,
    'BLACK BUDDHA FM',
    'PIRATE BROADCASTING 24/7',
    `${station.title}`,
    `HOSTED BY DJ PRESIDENT BAILEY`,
    '30 YEARS OF BLACK BRITISH MUSIC',
    `SIGNAL LOCKED: ${station.freq.toFixed(1)} MHz`,
  ];
  ticker.innerHTML = [...items, ...items].map(t => `<span>${t}</span>`).join('');
}

// ── Build miniature cassette shelf ───────────────────────────────────────────
function buildArchiveCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  STATIONS.forEach(station => {
    const color = station.colors.neonPink;
    const rgb = station.colors.rgb;
    const btn = document.createElement('button');
    btn.className = 'cassette-spine';
    btn.setAttribute('aria-label', `${station.title} - ${station.genre}`);

    btn.style.setProperty('--genre-color', color);
    btn.style.setProperty('--genre-color-alpha-heavy', `rgba(${rgb}, 0.4)`);
    btn.style.setProperty('--genre-color-alpha-glow', `rgba(${rgb}, 0.15)`);
    btn.style.setProperty('--genre-color-sticker', `rgba(${rgb}, 0.85)`);

    const parts = station.title.split(/[\u2013\u2014-]/);
    const epShortName = parts[0] ? parts[0].trim() : `EP ${station.epNum}`;
    const epDisplayTitle = parts.slice(1).join('-').trim();

    btn.innerHTML = `
      <div class="cassette-3d-card">
        <div class="spine-body">
          <div class="spine-label">
            <div class="spine-stripe"></div>
            <div class="spine-text-rotated">
              <div class="rotated-inner">
                <span class="rotated-title">${epDisplayTitle}</span>
                <span class="rotated-subtitle">${epShortName}</span>
              </div>
            </div>
          </div>
          <div class="spine-tape-bottom">
            <div class="tape-block" style="height:4px;"></div>
            <div class="tape-block" style="height:3px;"></div>
            <div class="tape-block" style="height:4px;"></div>
          </div>
        </div>
        <div class="cover-body">
          <div class="cover-jcard">
            <div class="cover-stripe"></div>
            <div class="cover-content">
              <div class="cover-header">
                <span class="cover-genre">${station.genre}</span>
                <span class="cover-number">${epShortName}</span>
              </div>
              <div class="cover-main">
                <h3 class="cover-title">${epDisplayTitle}</h3>
                <span class="cover-dj">PRESIDENT BAILEY</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    btn.addEventListener('click', () => {
      initAudio();
      if (audioCtx) audioCtx.resume();
      animateTunerTo(station.freq);
      document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' });
    });

    grid.appendChild(btn);
  });
}

// ── Build controls panels ─────────────────────────────────────────────────────
function createControlsPanel(partNum, label) {
  const panel = document.createElement('div');
  panel.className = 'controls-panel';
  panel.id = `controls-part${partNum}`;
  if (partNum === 3) panel.style.display = 'none';

  const barHeightSets = [
    [40, 60, 30, 80, 20, 90, 40, 10],
    [30, 50, 20, 70, 40, 80, 30, 15],
    [25, 45, 15, 65, 35, 75, 25, 50],
  ];
  const heights = barHeightSets[partNum - 1] || barHeightSets[0];

  panel.innerHTML = `
    <div class="panel-part-label" id="label-pt${partNum}">${label}</div>
    <div class="ctrl-row">
      <button class="play-btn" id="play-btn-${partNum}" aria-label="Play Part ${partNum}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">${SVG_PLAY}</svg>
      </button>
      <div class="host-info">
        <span class="host-micro">HOST</span>
        <span class="host-name">PRESIDENT BAILEY</span>
      </div>
    </div>
    <div class="progress-block">
      <div class="progress-meta">
        <span class="prog-time" id="time-${partNum}">00:00 / 00:00</span>
        <span class="prog-signal" id="prog-signal-${partNum}">SIGNAL STABLE</span>
      </div>
      <div class="mini-wave" id="mini-wave-${partNum}">
        ${heights.map(h => `<div class="mini-bar" style="height:${h}%"></div>`).join('')}
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" id="fill-${partNum}"></div>
      </div>
    </div>`;

  return panel;
}

function buildControlsPanels() {
  const container = document.getElementById('controls-container');
  if (!container) return;
  container.appendChild(createControlsPanel(1, 'PART 1: THE MIX'));
  container.appendChild(createControlsPanel(2, 'PART 2: THE INTERVIEW'));
  container.appendChild(createControlsPanel(3, 'PART 3: THE SECTOR CHANGE'));
}

// ── DOM cache ─────────────────────────────────────────────────────────────────
// NOTE: cacheDOMRefs() must be called AFTER buildControlsPanels() and
//       buildArchiveCards() so the dynamically-created IDs already exist.
let DOM = {};

function cacheDOMRefs() {
  DOM = {
    tunerDisplay: document.getElementById('tuner-display'),
    tunerNeedle: document.getElementById('tuner-needle'),
    tunerStrength: document.getElementById('tuner-strength'),
    signalBadgeText: document.getElementById('signal-badge-text'),
    vinylFrame: document.getElementById('vinyl-frame'),
    heroBayPlayBtn: document.getElementById('hero-play-btn'),
    epBadge: document.getElementById('ep-badge'),
    statLength: document.getElementById('stat-length'),
    statGenre: document.getElementById('stat-genre'),
    statLocation: document.getElementById('stat-location'),
    // Optional monitor refs — null-checked before use (no shim divs needed)
    monitorTitle: document.getElementById('monitor-title'),
    monitorDuration: document.getElementById('monitor-duration'),
    monitorFreq: document.getElementById('monitor-freq'),
    gainKnob: document.getElementById('gain-knob'),
    knobLine: document.getElementById('knob-line'),
    recFlicker: document.querySelector('.rec-row .flicker'),
    heroBars: document.querySelectorAll('#hero-wave .wave-bar'),
    monitorBars: document.querySelectorAll('#monitor-bars .green-bar'),
    stationMarks: null, // populated after setupTunerUI()
    // 1-based part refs stored in plain objects (avoids null-at-0 footgun)
    progSignals: {
      1: document.getElementById('prog-signal-1'),
      2: document.getElementById('prog-signal-2'),
      3: document.getElementById('prog-signal-3'),
    },
    playBtns: {
      1: document.getElementById('play-btn-1'),
      2: document.getElementById('play-btn-2'),
      3: document.getElementById('play-btn-3'),
    },
    timeDisplays: {
      1: document.getElementById('time-1'),
      2: document.getElementById('time-2'),
      3: document.getElementById('time-3'),
    },
    fills: {
      1: document.getElementById('fill-1'),
      2: document.getElementById('fill-2'),
      3: document.getElementById('fill-3'),
    },
    vuSegmentsLeft: document.querySelectorAll('#vu-meter-left .vu-segment'),
    vuSegmentsRight: document.querySelectorAll('#vu-meter-right .vu-segment'),
  };
}

// ── Player state ──────────────────────────────────────────────────────────────
let currentFreq = 88.9;
let isDragging = false;
let lastElapsedSecond = -1;
let lastProgressPct = -1;
let activeStation = null;
let lastActiveStation = null;
let currentPart = 1;
let volumeFactor = 0.8;
let staticFactor = 0.06;
let currentBand = 'FM';
let currentThemeClass = null;
let isVisualizerRunning = false;

// ── Web Audio ─────────────────────────────────────────────────────────────────
let audioCtx = null;
let audioEl = null;
let audioSource = null;
let staticNode = null;
let staticGain = null;
let musicGain = null;
let filterNode = null;
let analyserNode = null;
let bassFilter = null;
let midFilter = null;
let trebleFilter = null;
let isAudioInitialized = false;

function initAudio() {
  if (isAudioInitialized) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioEl = new Audio();
  audioEl.crossOrigin = 'anonymous';
  audioEl.loop = true;

  audioSource = audioCtx.createMediaElementSource(audioEl);
  
  // Initialize EQ filters
  bassFilter = audioCtx.createBiquadFilter();
  bassFilter.type = 'lowshelf';
  bassFilter.frequency.value = 150;
  bassFilter.gain.value = 0;

  midFilter = audioCtx.createBiquadFilter();
  midFilter.type = 'peaking';
  midFilter.frequency.value = 1000;
  midFilter.Q.value = 1.0;
  midFilter.gain.value = 0;

  trebleFilter = audioCtx.createBiquadFilter();
  trebleFilter.type = 'highshelf';
  trebleFilter.frequency.value = 4000;
  trebleFilter.gain.value = 0;

  filterNode = audioCtx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 20000;

  musicGain = audioCtx.createGain();
  staticGain = audioCtx.createGain();
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 64;

  // White noise buffer for static effect
  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

  staticNode = audioCtx.createBufferSource();
  staticNode.buffer = noiseBuffer;
  staticNode.loop = true;

  // Connect EQ nodes in series: audioSource -> Bass -> Mid -> Treble -> lowpass -> musicGain -> Analyser -> destination
  audioSource.connect(bassFilter);
  bassFilter.connect(midFilter);
  midFilter.connect(trebleFilter);
  trebleFilter.connect(filterNode);
  filterNode.connect(musicGain);
  
  musicGain.connect(analyserNode);
  staticNode.connect(staticGain);
  staticGain.connect(analyserNode);
  analyserNode.connect(audioCtx.destination);

  staticNode.start(0);
  staticGain.gain.value = 0;

  audioEl.addEventListener('play', () => { startProgressLoop(); startVisualizerLoop(); });
  audioEl.addEventListener('pause', stopProgressLoop);

  isAudioInitialized = true;
  startVisualizer();
}

/**
 * Tear down the audio graph and stop the static source.
 * Called on window beforeunload to prevent AudioContext leaks.
 */
function teardownAudio() {
  if (!isAudioInitialized) return;
  try {
    if (audioEl) { audioEl.pause(); audioEl.src = ''; }
    if (staticNode) staticNode.stop();
    if (audioCtx) audioCtx.close();
  } catch (_) { /* ignore errors during teardown */ }
}

// ── Frequency helpers ─────────────────────────────────────────────────────────
function freqToPercent(freq) {
  const ratio = (freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
  return 5 + ratio * 90;
}

function percentToFreq(pct) {
  const ratio = Math.max(0, Math.min(1, (pct - 5) / 90));
  return MIN_FREQ + ratio * (MAX_FREQ - MIN_FREQ);
}

// ── Tuner UI setup ────────────────────────────────────────────────────────────
function setupTunerUI() {
  const ticksContainer = document.getElementById('tuner-ticks');
  const stationsContainer = document.getElementById('tuner-stations-container');

  const startTick = 88.5, endTick = 110.0;
  const totalTicks = Math.floor((endTick - startTick) / 0.5);
  for (let i = 0; i <= totalTicks; i++) {
    const f = startTick + i * 0.5;
    if (f < MIN_FREQ || f > MAX_FREQ) continue;
    const tick = document.createElement('div');
    const isMajor = Number.isInteger(Math.round(f * 10) / 10);
    tick.className = 'tuner-tick' + (isMajor ? ' major' : '');
    tick.style.left = freqToPercent(f) + '%';
    ticksContainer.appendChild(tick);
  }

  STATIONS.forEach(station => {
    const mark = document.createElement('div');
    mark.className = 'tuner-station-mark';
    mark.style.left = freqToPercent(station.freq) + '%';
    mark.setAttribute('data-freq', station.freq);
    mark.innerHTML = `<span class="freq-num">${station.freq.toFixed(1)}</span><span class="genre-name">${station.genre}</span>`;
    mark.addEventListener('click', e => {
      e.stopPropagation();
      initAudio();
      if (audioCtx) audioCtx.resume();
      animateTunerTo(station.freq);
    });
    stationsContainer.appendChild(mark);
  });

  DOM.stationMarks = document.querySelectorAll('.tuner-station-mark');
}

// ── Needle animation ──────────────────────────────────────────────────────────
let tunerAnimationId = null;

function animateTunerTo(targetFreq) {
  if (tunerAnimationId) cancelAnimationFrame(tunerAnimationId);
  const step = () => {
    const diff = targetFreq - currentFreq;
    if (Math.abs(diff) < 0.05) {
      currentFreq = targetFreq;
      renderTuningState();
    } else {
      currentFreq += diff * TUNE_LERP_FACTOR;
      renderTuningState();
      tunerAnimationId = requestAnimationFrame(step);
    }
  };
  step();
}

// ── Tuning state — decomposed into focused functions ─────────────────────────

/** Pure signal math: returns { volume, staticVol, filterFreq, minDiff, nearest } */
function calcSignalMath() {
  let nearest = null, minDiff = Infinity;
  STATIONS.forEach(s => {
    const d = Math.abs(currentFreq - s.freq);
    if (d < minDiff) { minDiff = d; nearest = s; }
  });

  let volume = 0, staticVol = 1.0, filterFreq = 300;
  if (minDiff < SIGNAL_FADE_THRESH) {
    const ratio = minDiff / SIGNAL_FADE_THRESH;
    volume = Math.max(0, 1 - ratio);
    staticVol = ratio;
    filterFreq = 300 + (1 - ratio) * 19700;
  }

  return { volume, staticVol, filterFreq, minDiff, nearest };
}

/** Apply volume/filter values to the audio graph */
function applyAudioSignal(volume, staticVol, filterFreq) {
  if (!isAudioInitialized) return;
  const t = audioCtx.currentTime;
  musicGain.gain.setTargetAtTime(volume * volumeFactor, t, 0.05);
  staticGain.gain.setTargetAtTime(
    staticVol * staticFactor * (audioEl && audioEl.paused ? 0.3 : 1.0),
    t, 0.05
  );
  if (currentBand === 'AM') {
    filterNode.type = 'bandpass';
    filterNode.frequency.setTargetAtTime(Math.min(filterFreq, 2800), t, 0.05);
  } else {
    filterNode.type = 'lowpass';
    filterNode.frequency.setTargetAtTime(filterFreq, t, 0.05);
  }
  startVisualizerLoop();
}

/** Update header badge, needle, station-mark highlights, strength readout */
function updateNeedleUI(minDiff, nearest) {
  DOM.tunerNeedle.style.left = freqToPercent(currentFreq) + '%';
  DOM.signalBadgeText.textContent = `SIGNAL: ${currentFreq.toFixed(1)} FM`;

  const locked = minDiff < SIGNAL_LOCK_THRESH;
  DOM.stationMarks.forEach(mark => {
    const f = parseFloat(mark.getAttribute('data-freq'));
    if (nearest && nearest.freq === f && locked) {
      mark.classList.add('active');
    } else {
      mark.classList.remove('active');
    }
  });

  if (locked) {
    DOM.tunerStrength.textContent = `STRENGTH: ${Math.round((1 - minDiff / SIGNAL_LOCK_THRESH) * 20 + 80)}%`;
    setSignalStatus('SIGNAL STABLE', 'var(--neon-green)');
  } else if (minDiff < SIGNAL_FADE_THRESH) {
    DOM.tunerStrength.textContent = `STRENGTH: ${Math.round((1 - minDiff / SIGNAL_FADE_THRESH) * 40)}%`;
    setSignalStatus('SIGNAL DRIFT', 'var(--neon-pink)');
  } else {
    DOM.tunerStrength.textContent = 'STRENGTH: 0%';
    setSignalStatus('NO SIGNAL', 'var(--neon-pink)');
  }
}

/** Dim/undim cassette spines in the shelf */
function updateShelfHighlight() {
  document.querySelectorAll('#cards-grid .cassette-spine').forEach(spine => {
    const label = spine.getAttribute('aria-label');
    if (activeStation && label.includes(activeStation.genre)) {
      spine.classList.remove('dimmed');
    } else if (activeStation) {
      spine.classList.add('dimmed');
    } else {
      spine.classList.remove('dimmed');
    }
  });
}

/** Top-level coordinator — called on every needle move */
function renderTuningState() {
  const { volume, staticVol, filterFreq, minDiff, nearest } = calcSignalMath();

  const inRange = minDiff < SIGNAL_FADE_THRESH;
  const newActiveStation = inRange ? nearest : null;

  const stationChanged = newActiveStation && newActiveStation !== lastActiveStation;
  if (stationChanged) {
    lastActiveStation = newActiveStation;
    activeStation = newActiveStation;
    updateUIForStation(newActiveStation);

    if (isAudioInitialized) {
      resetPartProgressUI(2);
      resetPartProgressUI(3);
      currentPart = 1;
      const wasPlaying = !audioEl.paused;
      audioEl.src = newActiveStation.trackUrl1;
      audioEl.load();
      if (wasPlaying) audioEl.play().catch(e => console.warn(e));
    }
  } else if (!newActiveStation) {
    lastActiveStation = null;
    activeStation = null;
  }

  applyAudioSignal(volume, staticVol, filterFreq);
  updateNeedleUI(minDiff, nearest);
  updateShelfHighlight();
}

function setSignalStatus(text, color) {
  [1, 2, 3].forEach(i => {
    const el = DOM.progSignals[i];
    if (el) { el.textContent = text; el.style.color = color; }
  });
}

// ── Part progress UI helpers ──────────────────────────────────────────────────
function resetPartProgressUI(partNum) {
  if (DOM.fills[partNum]) DOM.fills[partNum].style.width = '0%';
  if (DOM.timeDisplays[partNum] && activeStation) {
    DOM.timeDisplays[partNum].textContent = `00:00 / ${activeStation[`duration${partNum}`] || '00:00'}`;
  }
  if (partNum === currentPart) {
    lastElapsedSecond = -1;
    lastProgressPct = -1;
  }
}

// ── Cassette animation helpers ────────────────────────────────────────────────
function animateCassetteLoading(station) {
  const door = document.getElementById('tape-door-lid');
  const tapeWrap = document.getElementById('cassette-tape-wrap');
  
  if (!door || !tapeWrap) return;

  // 1. Open the door
  door.classList.add('open');
  
  // 2. Slide the tape out
  tapeWrap.classList.remove('slide-in');
  tapeWrap.classList.add('slide-out');
  
  setTimeout(() => {
    // 3. Update the labels while the tape is hidden
    const epLabel = document.getElementById('cassette-ep-label');
    const genreLabel = document.getElementById('cassette-genre-label');
    const titleLabel = document.getElementById('cassette-title-label');
    
    if (epLabel) epLabel.textContent = `EP 0${station.epNum || 1}`;
    if (genreLabel) genreLabel.textContent = station.genre || 'PIRATE';
    if (titleLabel) {
      const cleanTitle = station.title.includes(':')
        ? station.title.split(':').slice(1).join(':').trim()
        : station.title.split(/[\u2013\u2014-]/).slice(1).join('-').trim();
      titleLabel.textContent = cleanTitle;
    }
    
    // 4. Slide the new tape in
    tapeWrap.classList.remove('slide-out');
    tapeWrap.classList.add('slide-in');
    
    setTimeout(() => {
      // 5. Close the door
      door.classList.remove('open');
    }, 600);
  }, 400);
}

function updateTapeReels(percent) {
  const rollLeft = document.getElementById('tape-roll-left');
  const rollRight = document.getElementById('tape-roll-right');
  if (!rollLeft || !rollRight) return;

  const minSize = 16;
  const maxSize = 34;
  
  const leftSize = maxSize - (percent / 100) * (maxSize - minSize);
  const rightSize = minSize + (percent / 100) * (maxSize - minSize);
  
  rollLeft.style.width = `${leftSize}px`;
  rollLeft.style.height = `${leftSize}px`;
  rollRight.style.width = `${rightSize}px`;
  rollRight.style.height = `${rightSize}px`;
}

function updatePartSelectorUI(partNum) {
  document.querySelectorAll('.tape-part-btn').forEach(btn => {
    const p = parseInt(btn.getAttribute('data-part'), 10);
    if (p === partNum) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// ── Full UI update when station changes ───────────────────────────────────────
function updateUIForStation(station) {
  // Theme class swap
  if (currentThemeClass) document.body.classList.remove(currentThemeClass);
  currentThemeClass = `theme-ep${station.epNum}`;
  document.body.classList.add(currentThemeClass);

  // CSS custom properties on root
  document.documentElement.style.setProperty('--surface-lowest', station.colors.surfaceLowest);
  document.documentElement.style.setProperty('--surface-low', station.colors.surfaceLow);

  // Badge and stat labels
  DOM.signalBadgeText.textContent = `SIGNAL: ${station.freq.toFixed(1)} FM`;
  DOM.statLength.textContent = station.duration1;
  DOM.statGenre.textContent = station.genre;
  DOM.statLocation.textContent = station.location;
  if (DOM.epBadge) DOM.epBadge.textContent = `EP ${station.genre} LIVE`;

  // Optional monitor elements (null-guarded — no shim divs required)
  if (DOM.monitorTitle) DOM.monitorTitle.textContent = station.genre;
  if (DOM.monitorDuration) DOM.monitorDuration.textContent = station.duration1;
  if (DOM.monitorFreq) DOM.monitorFreq.textContent = `${station.freq.toFixed(1)} FM`;

  // Center column episode title
  const customTitle = document.getElementById('ep-title-custom');
  if (customTitle) {
    const cleanTitle = station.title.includes(':')
      ? station.title.split(':').slice(1).join(':').trim()
      : station.title.split(/[\u2013\u2014-]/).slice(1).join('-').trim();
    customTitle.textContent = `EP ${station.epNum} - ${station.genre}: ${cleanTitle}`;
  }

  // Animate physical cassette load sequence
  animateCassetteLoading(station);

  renderMagazineCover(station);

  // Feature 2: Live dynamic ticker
  updateTickerForStation(station);

  // Feature 6: Deep linking — update URL without reload
  const url = new URL(window.location);
  url.searchParams.set('station', station.freq.toFixed(1));
  window.history.replaceState(null, '', url);

  if (typeof updateTubeMapActiveState === 'function') {
    updateTubeMapActiveState(station.genre);
  }

  // Controls panels timing
  if (DOM.timeDisplays[1]) DOM.timeDisplays[1].textContent = `00:00 / ${station.duration1}`;
  if (DOM.timeDisplays[2]) DOM.timeDisplays[2].textContent = `00:00 / ${station.duration2}`;
  if (DOM.fills[1]) DOM.fills[1].style.width = '0%';
  if (DOM.fills[2]) DOM.fills[2].style.width = '0%';

  const hasPart3 = !!(station.duration3 && station.trackUrl3);
  const part3Panel = document.getElementById('controls-part3');
  if (part3Panel) part3Panel.style.display = hasPart3 ? 'flex' : 'none';
  if (hasPart3 && DOM.timeDisplays[3]) DOM.timeDisplays[3].textContent = `00:00 / ${station.duration3}`;
  if (DOM.fills[3]) DOM.fills[3].style.width = '0%';

  const part3Btn = document.getElementById('tape-part-btn-3');
  if (part3Btn) {
    part3Btn.style.display = hasPart3 ? 'block' : 'none';
  }
  updatePartSelectorUI(1);
}

// ── Magazine cover renderer ───────────────────────────────────────────────────
function buildMagazineFallbackHTML(station, imgUrl) {
  const color = station.colors.neonPink;
  const rgb = station.colors.rgb;
  return `
    <div class="magazine-dynamic-fallback" style="--genre-color: ${color}">
      <div class="mag-header">
        <span class="mag-brand">${station.genre} CULTURE MAGAZINE</span>
        <span class="mag-issue">ISSUE ${station.epNum}</span>
      </div>
      <div class="mag-title-main">${station.genre}</div>
      <div class="mag-artwork-wrap">
        <div class="mag-artwork-gradient" style="background: radial-gradient(circle, rgba(${rgb}, 0.5) 0%, #000 100%)">
          <img src="${imgUrl}" class="mag-artwork-img" alt="${station.genre} artwork">
        </div>
      </div>
      <div class="mag-content-list">
        <div class="mag-section-title">ORIGINAL VIBES</div>
        <div class="mag-section-desc">THE ROOTS OF ${station.genre} MUSIC</div>
        <div class="mag-interviews">INTERVIEWS: ${station.tracks1[0]?.title.split('–')[0].trim() || 'UNDERGROUND COLLECTIVE'}</div>
        <div class="mag-club-scene">CLUB SCENE: THEN &amp; NOW</div>
      </div>
      <div class="mag-barcode-wrap">
        <div class="mag-barcode"></div>
        <div class="mag-barcode-num">9 771234 567890</div>
      </div>
    </div>`;
}

function renderMagazineCover(station) {
  const mount = document.getElementById('magazine-cover-mount');
  if (!mount) return;
  if (station.cardImg) {
    // Feature 8: Skeleton loading state
    mount.innerHTML = `<div class="img-skeleton"><img src="${station.cardImg}" alt="${station.genre} Magazine Cover" class="magazine-img" loading="lazy"></div>`;
    const img = mount.querySelector('img');
    if (img) {
      img.addEventListener('load', () => img.closest('.img-skeleton')?.classList.add('loaded'));
      if (img.complete) img.closest('.img-skeleton')?.classList.add('loaded');
    }
  } else {
    mount.innerHTML = buildMagazineFallbackHTML(
      station,
      genreFallbackImg(station.genre, GENRE_FALLBACK_IMAGES)
    );
  }
}

// ── Playback ──────────────────────────────────────────────────────────────────
function playPart(partNum) {
  initAudio();
  if (audioCtx) audioCtx.resume();
  stopBookletAudio();

  if (!activeStation) {
    activeStation = getStationByGenre('JUNGLE') || STATIONS[0];
    currentFreq = activeStation.freq;
    renderTuningState();
  }

  const targetUrl = activeStation[`trackUrl${partNum}`];
  if (!targetUrl) return;

  const targetAbsUrl = new URL(targetUrl, location.href).href;
  if (currentPart !== partNum || audioEl.src !== targetAbsUrl) {
    resetPartProgressUI(currentPart);
    currentPart = partNum;
    updatePartSelectorUI(partNum);
    audioEl.src = targetAbsUrl;
    audioEl.load();
    audioEl.play().then(() => updatePlayStateUI(true)).catch(e => console.warn(e));
  } else {
    if (audioEl.paused) {
      audioEl.play().then(() => updatePlayStateUI(true)).catch(e => console.warn(e));
    } else {
      audioEl.pause();
      updatePlayStateUI(false);
    }
  }
}

function togglePlay() {
  playPart(currentPart);
}

function updatePlayStateUI(isPlaying) {
  [1, 2, 3].forEach(i => {
    const btn = DOM.playBtns[i];
    if (!btn) return;
    const svg = btn.querySelector('svg');
    if (svg) svg.innerHTML = (isPlaying && currentPart === i) ? SVG_PAUSE : SVG_PLAY;
  });

  if (DOM.heroBayPlayBtn) {
    const svg = DOM.heroBayPlayBtn.querySelector('svg');
    if (svg) svg.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;
    const textNode = DOM.heroBayPlayBtn.childNodes[DOM.heroBayPlayBtn.childNodes.length - 1];
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = isPlaying ? ' PAUSE TRANSMISSION' : ' LISTEN TO LATEST BROADCAST';
    }
  }

  DOM.vinylFrame?.classList.toggle('playing', isPlaying);
  if (DOM.recFlicker) DOM.recFlicker.style.animationPlayState = isPlaying ? 'running' : 'paused';

  // Spin spindles
  const rLeft = document.getElementById('reel-left');
  const rRight = document.getElementById('reel-right');
  if (rLeft) rLeft.classList.toggle('spinning', isPlaying);
  if (rRight) rRight.classList.toggle('spinning', isPlaying);

  // Update physical transport buttons pressed states
  const tPlay = document.getElementById('t-btn-play');
  const tPause = document.getElementById('t-btn-pause');
  if (tPlay) {
    tPlay.classList.toggle('active-pressed', isPlaying || (isAudioInitialized && !audioEl.paused));
  }
  if (tPause) {
    const isPaused = isAudioInitialized && audioEl.paused && audioEl.src !== '';
    tPause.classList.toggle('active-pressed', isPaused);
  }

  // Feature 1: Restore CSS idle bounce when paused
  const heroWave = document.getElementById('hero-wave');
  if (heroWave) {
    if (isPlaying) {
      heroWave.classList.add('active-visualizer');
    } else {
      heroWave.classList.remove('active-visualizer');
    }
  }
}

// ── RAF-based main progress loop ──────────────────────────────────────────────
let progressRafId = null;

function startProgressLoop() {
  if (progressRafId) return;
  const tick = () => {
    if (!audioEl || audioEl.paused) { progressRafId = null; return; }

    const elapsed = audioEl.currentTime;
    const elapsedSecRounded = Math.floor(elapsed);
    const durStr = (activeStation && activeStation[`duration${currentPart}`]) || '00:00';
    const durSecs = parseDuration(durStr);
    const dur = (durSecs !== null) ? durSecs : (audioEl.duration || 0);
    const pct = dur > 0 ? (elapsed / dur) * 100 : 0;

    if (Math.abs(pct - lastProgressPct) >= 0.25) {
      if (DOM.fills[currentPart]) DOM.fills[currentPart].style.width = pct + '%';
      updateTapeReels(pct);
      lastProgressPct = pct;
    }

    if (elapsedSecRounded !== lastElapsedSecond) {
      if (DOM.timeDisplays[currentPart]) DOM.timeDisplays[currentPart].textContent = `${formatTime(elapsed)} / ${durStr}`;
      lastElapsedSecond = elapsedSecRounded;
    }

    progressRafId = requestAnimationFrame(tick);
  };
  progressRafId = requestAnimationFrame(tick);
}

function stopProgressLoop() {
  if (progressRafId) { cancelAnimationFrame(progressRafId); progressRafId = null; }
}

// ── Visualizer ────────────────────────────────────────────────────────────────
let miniBarSets = [];
let bufferLength = 0;
let dataArray = null;

function startVisualizer() {
  document.getElementById('hero-wave')?.classList.add('active-visualizer');
  miniBarSets = [
    document.querySelectorAll('#mini-wave-1 .mini-bar'),
    document.querySelectorAll('#mini-wave-2 .mini-bar'),
    document.querySelectorAll('#mini-wave-3 .mini-bar'),
  ];
  bufferLength = analyserNode.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  startVisualizerLoop();
}

function startVisualizerLoop() {
  if (isVisualizerRunning || !isAudioInitialized) return;
  isVisualizerRunning = true;
  requestAnimationFrame(drawVisualizer);
}

function drawVisualizer() {
  analyserNode.getByteFrequencyData(dataArray);
  const playing = audioEl && !audioEl.paused;
  const staticVol = staticGain ? staticGain.gain.value : 0;

  const segmentsLeft = DOM.vuSegmentsLeft;
  const segmentsRight = DOM.vuSegmentsRight;

  if (!playing && staticVol === 0) {
    const stillDecaying = [
      decayBars(DOM.heroBars),
      decayBars(DOM.monitorBars),
      ...miniBarSets.map(decayBars),
    ].some(Boolean);

    decayVUMeter(segmentsLeft);
    decayVUMeter(segmentsRight);

    if (!stillDecaying) { isVisualizerRunning = false; return; }
  } else {
    updateBars(DOM.heroBars, dataArray, 0, 8);
    updateBars(DOM.monitorBars, dataArray, 4, 12);
    const activeMini = miniBarSets[currentPart - 1];
    if (activeMini) updateBars(activeMini, dataArray, 8, 16);

    // Calculate dynamic channel Left and Right VU levels
    let sumL = 0;
    for (let i = 0; i < 8; i++) sumL += dataArray[i] || 0;
    const avgL = sumL / 8;

    let sumR = 0;
    for (let i = 4; i < 12; i++) sumR += dataArray[i] || 0;
    const avgR = sumR / 8;

    updateVUMeter(segmentsLeft, avgL);
    updateVUMeter(segmentsRight, avgR);
  }

  requestAnimationFrame(drawVisualizer);
}

function updateVUMeter(segments, average) {
  if (!segments || !segments.length) return;
  const numSegments = segments.length;
  // Convert 0-255 average to active segments (0-10) with some sensitivity headroom
  const activeCount = Math.min(numSegments, Math.floor((average / 230) * numSegments));

  segments.forEach((seg, idx) => {
    const isLit = (numSegments - 1 - idx) < activeCount;
    seg.classList.toggle('active', isLit);
  });
}

function decayVUMeter(segments) {
  if (!segments || !segments.length) return;
  segments.forEach(seg => seg.classList.remove('active'));
}

function updateBars(bars, dataArr, startBin, endBin) {
  if (!bars || !bars.length) return;
  const binsPerBar = Math.max(1, Math.floor((endBin - startBin) / bars.length));
  bars.forEach((bar, idx) => {
    let sum = 0;
    const binStart = startBin + idx * binsPerBar;
    for (let i = 0; i < binsPerBar; i++) sum += dataArr[binStart + i] || 0;
    bar.style.height = (5 + (sum / binsPerBar / 255) * 93) + '%';
  });
}

function decayBars(bars) {
  if (!bars || !bars.length) return false;
  let active = false;
  bars.forEach(bar => {
    const cur = parseFloat(bar.style.height) || 5;
    if (cur > 5) { bar.style.height = Math.max(5, cur - 1.5) + '%'; active = true; }
  });
  return active;
}

// ── Tuner drag (mouse + touch) ────────────────────────────────────────────────
function updateNeedlePosition(clientX) {
  const rect = DOM.tunerDisplay.getBoundingClientRect();
  const pct = ((clientX - rect.left) / rect.width) * 100;
  currentFreq = Math.round(percentToFreq(pct) * 10) / 10;
  renderTuningState();
}

// ── Volume knob ───────────────────────────────────────────────────────────────
let isAdjustingVolume = false;
let volumeStartY = 0;
let volumeRotation = 45;

function applyKnobDelta(dy) {
  volumeRotation = Math.max(-135, Math.min(135, volumeRotation + dy * 2.5));
  DOM.knobLine.style.transform = `rotate(${volumeRotation}deg)`;
  volumeFactor = (volumeRotation + 135) / 270;

  if (isAudioInitialized && activeStation) {
    const diff = Math.abs(currentFreq - activeStation.freq);
    const ratio = diff / SIGNAL_FADE_THRESH;
    const vol = diff < SIGNAL_FADE_THRESH ? Math.max(0, 1 - ratio) : 0;
    musicGain.gain.setTargetAtTime(vol * volumeFactor, audioCtx.currentTime, 0.05);
    startVisualizerLoop();
  }
}

// ── Booklet modal ─────────────────────────────────────────────────────────────
let currentSpread = 1;
let bookletStation = null;
let bookletAudio = null;
let bookletAudioPlaying = false;
let bookletRafId = null; // RAF-based progress (replaces setInterval)

const magazineModal = document.getElementById('magazine-modal');
const bookletContainer = document.getElementById('booklet-container');
const prevBtn = document.getElementById('booklet-prev-btn');
const nextBtn = document.getElementById('booklet-next-btn');
const pageIndicator = document.getElementById('booklet-page-indicator');

function openBookletModal(station) {
  if (!station) return;
  bookletStation = station;
  currentSpread = 1;
  magazineModal.style.display = 'flex';
  renderBookletSpread();

  if (bookletAudio) { bookletAudio.pause(); bookletAudio = null; }
  bookletAudio = new Audio(station.trackUrl2 || '');
  bookletAudio.crossOrigin = 'anonymous';
  bookletAudioPlaying = false;
}

function closeBookletModal() {
  magazineModal.style.display = 'none';
  stopBookletAudio();
  bookletStation = null;
}

function stopBookletAudio() {
  if (bookletAudio) {
    bookletAudio.pause();
    bookletAudioPlaying = false;
  }
  if (bookletRafId) { cancelAnimationFrame(bookletRafId); bookletRafId = null; }
  updateBookletAudioUI();
}

// ── Booklet RAF progress loop (replaces setInterval) ─────────────────────────
function startBookletProgressLoop() {
  if (bookletRafId) cancelAnimationFrame(bookletRafId);
  const tick = () => {
    if (!bookletAudio || !bookletAudioPlaying) { bookletRafId = null; return; }

    const elapsed = bookletAudio.currentTime;
    const durSecs = parseDuration(bookletStation?.duration2);
    const dur = (durSecs !== null) ? durSecs : (bookletAudio.duration || 0);
    const pct = dur > 0 ? (elapsed / dur) * 100 : 0;

    const fill = document.getElementById('special-progress-fill');
    const timeDisplay = document.getElementById('special-current-time');
    if (fill) fill.style.width = pct + '%';
    if (timeDisplay) timeDisplay.textContent = formatTime(elapsed);

    bookletRafId = requestAnimationFrame(tick);
  };
  bookletRafId = requestAnimationFrame(tick);
}

function toggleBookletAudio() {
  if (!bookletAudio) return;
  if (bookletAudioPlaying) {
    bookletAudio.pause();
    bookletAudioPlaying = false;
    if (bookletRafId) { cancelAnimationFrame(bookletRafId); bookletRafId = null; }
    updateBookletAudioUI();
  } else {
    // Pause main player first
    if (audioEl && !audioEl.paused) { audioEl.pause(); updatePlayStateUI(false); }
    bookletAudio.play().then(() => {
      bookletAudioPlaying = true;
      updateBookletAudioUI();
      startBookletProgressLoop();
    }).catch(e => console.warn(e));
  }
}

function seekBookletAudio(e) {
  if (!bookletAudio) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  const durSecs = parseDuration(bookletStation?.duration2);
  const dur = (durSecs !== null) ? durSecs : (bookletAudio.duration || 0);
  bookletAudio.currentTime = pct * dur;
  const fill = document.getElementById('special-progress-fill');
  if (fill) fill.style.width = (pct * 100) + '%';
}

function updateBookletAudioUI() {
  const btn = document.getElementById('special-play-btn');
  if (!btn || !bookletStation) return;
  btn.textContent = bookletAudioPlaying ? '■' : '▶';
  btn.style.background = bookletAudioPlaying ? '#ffffff' : bookletStation.colors.neonPink;
}

// ── Booklet spread renderer ───────────────────────────────────────────────────
function renderBookletSpread() {
  if (!bookletStation) return;

  const color = bookletStation.colors.neonPink;
  const rgb = bookletStation.colors.rgb;
  bookletContainer.style.setProperty('--genre-color', color);
  bookletContainer.style.setProperty('--genre-color-alpha-light', `rgba(${rgb}, 0.08)`);
  bookletContainer.style.setProperty('--genre-color-alpha-heavy', `rgba(${rgb}, 0.4)`);

  const coverHtml = bookletStation.cardImg
    ? `<img src="${bookletStation.cardImg}" alt="Cover" class="magazine-img">`
    : buildMagazineFallbackHTML(bookletStation, genreFallbackImg(bookletStation.genre, GENRE_FALLBACK_IMAGES));

  if (currentSpread === 1) {
    const editorialText = `${bookletStation.desc} From pirate radio towers to the sticky floors of sweaty warehouses, this musical trajectory is built on raw frequencies and community power. This is an archival scan of the movement's evolution. Stay locked to the lineage.`;

    bookletContainer.innerHTML = `
      <div class="booklet-page left-page" style="padding:0;">${coverHtml}</div>
      <div class="booklet-page right-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">${bookletStation.genre} EVOLUTION</h2>
          <div class="booklet-subtitle">${bookletStation.subtitle}</div>
          <p class="booklet-text">${bookletStation.desc}</p>
          <p class="booklet-text">${editorialText.substring(0, 160)}...</p>
        </div>
        <div class="booklet-page-num">PAGE 02</div>
      </div>`;

    prevBtn.disabled = true;
    nextBtn.disabled = false;
    pageIndicator.textContent = 'SPREAD 1 / 4 (PAGES 1-2)';

  } else if (currentSpread === 2) {
    let tracksHtml = '';
    if (bookletStation.tracks1?.length) {
      bookletStation.tracks1.forEach((tr, idx) => {
        tracksHtml += `
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#222;border-bottom:1px dashed rgba(0,0,0,0.05);padding-bottom:4px;">
            <span style="color:${color};font-weight:700;">${String(idx + 1).padStart(2, '0')}</span>
            <span>${tr.title}</span>
          </div>`;
      });
    } else {
      tracksHtml = '<p class="booklet-text">No transmission log available.</p>';
    }

    const galleryImg = genreFallbackImg(bookletStation.genre, GENRE_GALLERY_IMAGES);
    const artists = [...new Set(bookletStation.tracks1.map(t => t.title.split(/[\u2013\u2014-]/)[0].trim()))].slice(0, 4);
    const artistsBadges = artists.map(a => `<span class="booklet-artist-badge">${a}</span>`).join('');

    bookletContainer.innerHTML = `
      <div class="booklet-page left-page">
        <h2 class="booklet-title" style="--genre-color: ${color}">TRACKLISTING</h2>
        <div class="booklet-subtitle">LOGGED WAVEFORM RECORDINGS</div>
        <div style="flex:1;overflow-y:auto;padding-right:6px;scrollbar-width:thin;">${tracksHtml}</div>
        <div class="booklet-page-num" style="margin-top:10px;">PAGE 03</div>
      </div>
      <div class="booklet-page right-page">
        <div class="booklet-gallery-wrap">
          <h2 class="booklet-title" style="--genre-color: ${color}">VISUAL ARCHIVE</h2>
          <div class="booklet-img-frame img-skeleton">
            <img src="${galleryImg}" class="booklet-img" alt="Visual archive" loading="lazy" onload="this.closest('.img-skeleton')?.classList.add('loaded')">
          </div>
          <div>
            <div class="booklet-artists-label">KEY MOVEMENT PROPAGATORS:</div>
            <div class="booklet-artists-list">${artistsBadges}</div>
          </div>
        </div>
        <div class="booklet-page-num">PAGE 04</div>
      </div>`;

    prevBtn.disabled = false;
    nextBtn.disabled = false;
    pageIndicator.textContent = 'SPREAD 2 / 4 (PAGES 3-4)';

  } else if (currentSpread === 3) {
    bookletContainer.innerHTML = `
      <div class="booklet-page left-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">RADIO TELEMETRY</h2>
          <div class="booklet-subtitle">TECHNICAL SIGNAL ANALYSIS</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#333;margin-top:15px;line-height:1.6;">
            <div style="border-bottom:1px solid rgba(0,0,0,0.1);padding-bottom:4px;margin-bottom:8px;">
              <span style="font-weight:700;color:${color};">PARAMETER</span>
              <span style="float:right;font-weight:700;">VALUE</span>
            </div>
            <div style="margin-bottom:6px;"><span>FREQUENCY</span><span style="float:right;color:${color};font-weight:700;">${bookletStation.freq} MHz</span></div>
            <div style="margin-bottom:6px;"><span>SIGNAL PATH</span><span style="float:right;">94.8 FM Relay</span></div>
            <div style="margin-bottom:6px;"><span>TRANSMITTER</span><span style="float:right;">500W ERP Dipole</span></div>
            <div style="margin-bottom:8px;"><span>ENCODING</span><span style="float:right;">Phase Lock Loop Stereo</span></div>
          </div>
          <p class="booklet-text" style="font-size:10px;margin-top:15px;line-height:1.4;">Rigged on high-rise rooftops in clandestine sectors, our custom masts relay sub-heavy signals across metropolitan zones.</p>
        </div>
        <div class="booklet-page-num">PAGE 05</div>
      </div>
      <div class="booklet-page right-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">CONVERSATION SCANS</h2>
          <div class="booklet-subtitle">PIRATE SELECTOR INTERVIEW</div>
          <p class="booklet-text" style="font-size:10.5px;font-weight:700;color:#111;margin-top:10px;margin-bottom:4px;">Q: How do you choose your transmission sites?</p>
          <p class="booklet-text" style="font-size:10px;color:#444;margin-bottom:10px;line-height:1.45;">A: "Elevation is everything. We look for blocks with clear lines of sight to key boroughs. Pack the gear, climb up, set the rig, lock the doors. If they locate the signal, we move."</p>
          <p class="booklet-text" style="font-size:10.5px;font-weight:700;color:#111;margin-bottom:4px;">Q: What defines the ${bookletStation.genre} sound?</p>
          <p class="booklet-text" style="font-size:10px;color:#444;line-height:1.45;">A: "The low-end frequencies. The pressure that hits your chest, combined with frantic breakbeats. That energy is built for packed basement clubs."</p>
        </div>
        <div class="booklet-page-num">PAGE 06</div>
      </div>`;

    prevBtn.disabled = false;
    nextBtn.disabled = false;
    pageIndicator.textContent = 'SPREAD 3 / 4 (PAGES 5-6)';

  } else if (currentSpread === 4) {
    bookletContainer.innerHTML = `
      <div class="booklet-page left-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">TRANSMISSION CREDITS</h2>
          <div class="booklet-subtitle">PIRATE RADIO ARCHIVAL PROJECT</div>
          <p class="booklet-text">Broadcasting raw frequencies continuously. This booklet functions as a catalog of early 90s to modern UK bass movements.</p>
          <p class="booklet-text">All mixtape decks digitized from physical tapes and remastered at 320 kbps. Special thanks to all participating transmitters, pirate crews, and selectors across London sub-sectors.</p>
          <p class="booklet-text" style="font-style:italic;color:#666;">"Keep the frequency stable. Protect the underground."</p>
        </div>
        <div class="booklet-page-num">PAGE 07</div>
      </div>
      <div class="booklet-page right-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">SPECIAL STREAM</h2>
          <div class="booklet-subtitle">CLANDESTINE AUDIO SOURCE</div>
          <p class="booklet-text" style="font-size:11px;">Unlock the secondary transmission log. Tap below to initiate connection to the high-bitrate interview segment.</p>
          <div class="booklet-special-player-card" style="--genre-color: ${color}">
            <div class="special-player-header">
              <div class="special-player-indicator"></div>
              <span class="special-player-title">CLANDESTINE FEED DECK B</span>
            </div>
            <div class="special-player-controls-row">
              <button class="special-play-btn" id="special-play-btn" aria-label="Play booklet stream">▶</button>
              <div class="special-track-info">
                <span class="special-track-title">${bookletStation.genre} SESSION</span>
                <span class="special-track-subtitle">EP ${bookletStation.epNum} - PART 2 EDITORIAL</span>
              </div>
            </div>
            <div class="special-progress-block">
              <div class="special-progress-track" id="special-progress-track">
                <div class="special-progress-fill" id="special-progress-fill"></div>
              </div>
              <div class="special-time-row">
                <span id="special-current-time">00:00</span>
                <span id="special-total-time">${bookletStation.duration2}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="booklet-page-num">PAGE 08</div>
      </div>`;

    prevBtn.disabled = false;
    nextBtn.disabled = true;
    pageIndicator.textContent = 'SPREAD 4 / 4 (PAGES 7-8)';

    document.getElementById('special-play-btn')?.addEventListener('click', toggleBookletAudio);
    document.getElementById('special-progress-track')?.addEventListener('click', seekBookletAudio);
    updateBookletAudioUI();
  }
}

// ── Event wiring ──────────────────────────────────────────────────────────────
function wireEvents() {
  // Tuner drag — mouse
  DOM.tunerDisplay.addEventListener('mousedown', e => {
    isDragging = true;
    initAudio();
    if (audioCtx) audioCtx.resume();
    updateNeedlePosition(e.clientX);
  });
  window.addEventListener('mousemove', e => { if (isDragging) updateNeedlePosition(e.clientX); });
  window.addEventListener('mouseup', () => { isDragging = false; });

  // Tuner drag — touch
  DOM.tunerDisplay.addEventListener('touchstart', e => {
    isDragging = true;
    initAudio();
    if (audioCtx) audioCtx.resume();
    updateNeedlePosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => { if (isDragging) updateNeedlePosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Volume knob — mouse
  DOM.gainKnob.addEventListener('mousedown', e => {
    isAdjustingVolume = true;
    volumeStartY = e.clientY;
    initAudio();
    if (audioCtx) audioCtx.resume();
  });
  window.addEventListener('mousemove', e => {
    if (!isAdjustingVolume) return;
    const dy = volumeStartY - e.clientY;
    volumeStartY = e.clientY;
    applyKnobDelta(dy);
  });
  window.addEventListener('mouseup', () => { isAdjustingVolume = false; });

  // Volume knob — touch
  DOM.gainKnob.addEventListener('touchstart', e => {
    isAdjustingVolume = true;
    volumeStartY = e.touches[0].clientY;
    initAudio();
    if (audioCtx) audioCtx.resume();
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (!isAdjustingVolume) return;
    const dy = volumeStartY - e.touches[0].clientY;
    volumeStartY = e.touches[0].clientY;
    applyKnobDelta(dy);
  }, { passive: true });
  window.addEventListener('touchend', () => { isAdjustingVolume = false; });

  // Part play buttons (1-indexed object)
  [1, 2, 3].forEach(i => {
    DOM.playBtns[i]?.addEventListener('click', () => playPart(i));
  });
  DOM.heroBayPlayBtn?.addEventListener('click', togglePlay);

  // Tape Parts Selector Buttons
  document.querySelectorAll('.tape-part-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const partNum = parseInt(btn.getAttribute('data-part'), 10);
      playPart(partNum);
    });
  });

  // Mechanical Cassette Deck Transport Controls
  document.getElementById('t-btn-rew')?.addEventListener('click', () => {
    if (!audioEl || !isAudioInitialized) return;
    audioEl.currentTime = Math.max(0, audioEl.currentTime - 30);
  });

  document.getElementById('t-btn-ffw')?.addEventListener('click', () => {
    if (!audioEl || !isAudioInitialized) return;
    audioEl.currentTime = Math.min(audioEl.duration || Infinity, audioEl.currentTime + 30);
  });

  document.getElementById('t-btn-play')?.addEventListener('click', () => {
    initAudio();
    if (audioCtx) audioCtx.resume();
    if (audioEl.paused) {
      audioEl.play().then(() => updatePlayStateUI(true)).catch(e => console.warn(e));
    }
  });

  document.getElementById('t-btn-pause')?.addEventListener('click', () => {
    if (!audioEl || !isAudioInitialized) return;
    if (!audioEl.paused) {
      audioEl.pause();
      updatePlayStateUI(false);
    }
  });

  document.getElementById('t-btn-stop')?.addEventListener('click', () => {
    if (!audioEl || !isAudioInitialized) return;
    audioEl.pause();
    audioEl.currentTime = 0;
    resetPartProgressUI(currentPart);
    updatePlayStateUI(false);
  });
  document.getElementById('t-btn-eject')?.addEventListener('click', () => {
    if (audioEl && isAudioInitialized) {
      audioEl.pause();
      updatePlayStateUI(false);
    }
    const door = document.getElementById('tape-door-lid');
    const tapeWrap = document.getElementById('cassette-tape-wrap');
    if (door && tapeWrap) {
      door.classList.add('open');
      tapeWrap.classList.remove('slide-in');
      tapeWrap.classList.add('slide-out');
    }
  });

  // EQ Knobs vertical drag logic
  ['bass', 'mid', 'treble'].forEach(param => {
    const knob = document.getElementById(`knob-${param}`);
    if (!knob) return;

    let isDraggingKnob = false;
    let startY = 0;
    let currentAngle = 0; // starts at 0 (center)

    knob.addEventListener('mousedown', e => {
      isDraggingKnob = true;
      startY = e.clientY;
      initAudio();
      if (audioCtx) audioCtx.resume();
    });

    window.addEventListener('mousemove', e => {
      if (!isDraggingKnob) return;
      const dy = startY - e.clientY; // upward drag increases value
      startY = e.clientY;

      // Update angle (approx 1.5 deg per pixel drag)
      currentAngle = Math.max(-135, Math.min(135, currentAngle + dy * 1.5));
      knob.style.transform = `rotate(${currentAngle}deg)`;

      // Map angle (-135 to 135) to Gain (-12 to 12 dB)
      const gainVal = (currentAngle / 135) * 12;
      
      // Update filter node gain
      if (param === 'bass' && bassFilter) bassFilter.gain.value = gainVal;
      if (param === 'mid' && midFilter) midFilter.gain.value = gainVal;
      if (param === 'treble' && trebleFilter) trebleFilter.gain.value = gainVal;
    });

    window.addEventListener('mouseup', () => {
      isDraggingKnob = false;
    });

    // Mobile touch support
    knob.addEventListener('touchstart', e => {
      isDraggingKnob = true;
      startY = e.touches[0].clientY;
      initAudio();
      if (audioCtx) audioCtx.resume();
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (!isDraggingKnob) return;
      const dy = startY - e.touches[0].clientY;
      startY = e.touches[0].clientY;

      currentAngle = Math.max(-135, Math.min(135, currentAngle + dy * 1.5));
      knob.style.transform = `rotate(${currentAngle}deg)`;

      const gainVal = (currentAngle / 135) * 12;
      if (param === 'bass' && bassFilter) bassFilter.gain.value = gainVal;
      if (param === 'mid' && midFilter) midFilter.gain.value = gainVal;
      if (param === 'treble' && trebleFilter) trebleFilter.gain.value = gainVal;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDraggingKnob = false;
    });
  });

  // Band / mode toggles
  document.getElementById('band-group')?.querySelectorAll('.btn-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      initAudio();
      if (audioCtx) audioCtx.resume();
      document.getElementById('band-group').querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active-green'));
      btn.classList.add('active-green');
      currentBand = btn.textContent.trim();
      renderTuningState();
    });
  });

  document.getElementById('mode-group')?.querySelectorAll('.btn-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('mode-group').querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active-pink'));
      btn.classList.add('active-pink');
    });
  });

  // Magazine cover click → booklet
  document.getElementById('magazine-cover-mount')?.addEventListener('click', () => {
    openBookletModal(activeStation || STATIONS[0]);
  });

  document.getElementById('magazine-close-btn')?.addEventListener('click', closeBookletModal);

  prevBtn?.addEventListener('click', () => {
    if (currentSpread > 1) { currentSpread--; renderBookletSpread(); }
  });
  nextBtn?.addEventListener('click', () => {
    if (currentSpread < 4) { currentSpread++; renderBookletSpread(); }
  });

  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (typeof drawTubeLines === 'function') drawTubeLines();
    }, 100);
  });

  const navHamburger = document.getElementById('nav-hamburger');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerAboutLink = document.getElementById('drawer-about-link');

  if (navHamburger && mobileDrawer) {
    navHamburger.addEventListener('click', () => {
      const isExpanded = navHamburger.getAttribute('aria-expanded') === 'true';
      navHamburger.setAttribute('aria-expanded', !isExpanded);
      mobileDrawer.setAttribute('aria-hidden', isExpanded);
    });

    // Auto collapse menu drawer panel frame layer when link trigger maps anchor target location
    document.querySelectorAll('.mobile-drawer-link').forEach(link => {
      link.addEventListener('click', () => {
        navHamburger.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // Cleanup on page unload to prevent AudioContext / static node leaks
  window.addEventListener('beforeunload', teardownAudio);
}

// ── Tube Map / Timeline ───────────────────────────────────────────────────────
const GENRES_METADATA = [
  {
    id: 'jungle', name: 'Jungle', era: '1991–1995', color: '#39FF14',
    x: 80, y: 100, genreKey: 'JUNGLE',
    location: 'Amen Park',
    description: "At Black Buddha HQ Charing Cross, the story begins with Jungle, the sound that erupted from London's early- 1990s rave underground. " +
      "Built on chopped breakbeats, heavy basslines, reggae influences, and multicultural energy, Jungle reflected the fast-moving pulse of the capital. " +
      "Positioned in the heart of the city, Charing Cross symbolizes the genre's role as the meeting point of Britain's emerging rave cultures.",
    artists: ['Goldie', 'Shy FX', 'LTJ Bukem', 'DJ Hype'],
  },
  {
    id: 'dnb', name: 'Drum & Bass', era: '1996–2005', color: '#0066FF',
    x: 200, y: 70, genreKey: 'DRUM & BASS',
    location: 'Sub Pressure',
    description: "Moving east to Black Buddha HQ Hoxton, Jungle evolves into the sleek, futuristic sound of Drum & Bass. " +
      "Hoxton's creative and club-focused atmosphere mirrors the genre's refinement, where rolling rhythms, technical production, and deep sub-bass became the new standard. " +
      "The area's influential clubs and record shops helped establish Drum & Bass as a global electronic movement.",
    artists: ['Goldie', 'LTJ Bukem', 'Roni Size', 'J Majik', 'Dillinja'],
  },
  {
    id: 'ukgarage', name: 'UK Garage', era: '1996–2002', color: '#D4AF37',
    x: 320, y: 130, genreKey: 'UK GARAGE',
    location: 'Champagne Square',
    description: "At Black Buddha HQ Soho, UK Garage captures the glamorous and stylish side of late-1990s London nightlife. " +
      "Characterized by shuffling rhythms, soulful vocals, and champagne-fuelled club culture, Garage thrived in the city's fashionable West End. " +
      "Soho represents the genre's crossover moment, when underground sounds entered mainstream British culture.",
    artists: ['Craig David', 'MJ Cole', 'Artful Dodger', 'So Solid Crew'],
  },
  {
    id: 'grime', name: 'Grime', era: '2002–2010', color: '#B0B7C3',
    x: 440, y: 130, genreKey: 'GRIME',
    location: 'Eskimo Central',
    description: "Black Buddha HQ Bow E3 marks the birthplace of Grime, a genre forged in East London's tower blocks, pirate radio stations, and youth clubs. " +
      "Built around icy synths, 140 BPM rhythms, and sharp lyricism, Grime reflected the realities and ambitions of a new generation. " +
      "Bow remains one of the most important locations in British music history due to its role in shaping the scene's pioneers.",
    artists: ['Wiley', 'Dizzee Rascal', 'Skepta', 'JME', 'Tinchy Stryder'],
  },
  {
    id: 'dubstep', name: 'Dubstep', era: '2001–2011', color: '#2b21de',
    x: 560, y: 100, genreKey: 'DUBSTEP',
    location: 'Croydon South',
    description: "At Black Buddha HQ Croydon, Dubstep emerges from South London's experimental underground. " +
      "Combining the darkness of dub, the weight of bass culture, and sparse electronic production, the genre created a completely new sonic language. " +
      "Croydon became legendary as the home of producers who transformed local innovation into a worldwide movement.",
    artists: ['Benga', 'Skream', 'Burial', 'Digital Mystikz', 'Kode9'],
  },
  {
    id: 'bassline', name: 'Bassline', era: '2003–2008', color: '#FF2DAA',
    x: 680, y: 70, genreKey: 'BASSLINE',
    location: 'Sheffield Exchange',
    description: "Black Buddha HQ Sheffield celebrates Bassline's rise in northern England. " +
      "Developed through clubs such as Niche, the genre amplified the speed garage formula with energetic basslines, catchy hooks, and an unmistakably regional identity. " +
      "Sheffield's independent spirit helped Bassline thrive outside London's cultural orbit while building a devoted national following.",
    artists: ['DJ Q', 'T2', 'Virus Syndicate', 'Chunky'],
  },
  {
    id: 'ukfunky', name: 'UK Funky', era: '2006–2012', color: '#FF6B1A',
    x: 800, y: 130, genreKey: 'UK FUNKY',
    location: 'Tribal Square',
    description: "At Black Buddha HQ Stratford, UK Funky represents a vibrant fusion of house music, Afro-Caribbean rhythms, and London's multicultural dance floors. " +
      "The genre brought warmth, percussion, and movement back to UK club culture during the late 2000s. " +
      "Stratford's diverse communities reflect the cross-cultural influences that gave UK Funky its distinctive sound.",
    artists: ["Donae'o", 'Crazy Cousinz', 'Roska', 'Lil Silva', 'Kyla'],
  },
  {
    id: 'roadrap', name: 'Road Rap', era: '2007–2016', color: '#2f2e2e',
    x: 920, y: 130, genreKey: 'ROAD RAP',
    location: 'Roadman Junction',
    description: "Black Buddha HQ Brixton explores UK Road Rap, the soundtrack of South London's streets and estates. " +
      "Inspired by both American hip-hop and local realities, the genre focused on authentic storytelling, ambition, and survival. " +
      "Brixton's long history of Black British culture and musical innovation makes it a fitting home for Road Rap's rise.",
    artists: ['Giggs', 'Blade Brown', 'Potter Payper', 'Casisdead', 'Nines'],
  },
  {
    id: 'ukdrill', name: 'UK Drill', era: '2014–2023', color: '#B3001B',
    x: 1040, y: 100, genreKey: 'UK DRILL',
    location: 'Brixton Central',
    description: "At Black Buddha HQ Kennington, UK Drill pushes the intensity of Road Rap into darker and more minimalist territory. " +
      "Defined by sliding basslines, sharp percussion, and uncompromising lyricism, the genre became one of Britain's most influential modern exports. " +
      "Kennington played a pivotal role in the development of the sound and remains closely associated with its earliest wave.",
    artists: ['67', 'Harlem Spartans', 'Loski', 'MizOrMac', 'Unknown T'],
  },
  {
    id: 'afroswing', name: 'Afroswing', era: '2015–2023', color: '#00C2B2',
    x: 1160, y: 100, genreKey: 'AFROSWING',
    location: 'Summer Heights',
    description: "The journey concludes at Black Buddha HQ Peckham, where Afroswing reflects London's global future. " +
      "Blending Afrobeats, rap, dancehall, R&B, and contemporary British influences, the genre celebrates connection between African and UK cultures. " +
      "Peckham's strong African diaspora communities helped make it one of the key centres of Afroswing's emergence and success.",
    artists: ['J Hus', 'Kojo Funds', "Not3s", 'Dave', 'MoStack'],
  },
];

// Pre-calculate rgb strings for GENRES_METADATA using the shared hexToRgb()
GENRES_METADATA.forEach(g => { g.rgb = hexToRgb(g.color); });

let activeGenreId = null;
const timelineNodeEls = [];

function drawTubeLines() {
  const svg = document.getElementById('tube-lines-svg-el');
  if (!svg) return;
  svg.innerHTML = '';

  // Background track
  let pathD = '';
  GENRES_METADATA.forEach((genre, idx) => {
    if (idx === 0) { pathD = `M ${genre.x} ${genre.y}`; return; }
    const prev = GENRES_METADATA[idx - 1];
    const midX = prev.x + (genre.x - prev.x) / 2;
    pathD += ` Q ${midX} ${genre.y} ${genre.x} ${genre.y}`;
  });

  const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  glowLine.setAttribute('d', pathD);
  glowLine.setAttribute('fill', 'none');
  glowLine.setAttribute('stroke', '#1a202c');
  glowLine.setAttribute('stroke-width', '8');
  glowLine.setAttribute('stroke-linecap', 'round');
  svg.appendChild(glowLine);

  // Coloured segments
  for (let i = 0; i < GENRES_METADATA.length - 1; i++) {
    const start = GENRES_METADATA[i];
    const end = GENRES_METADATA[i + 1];
    const midX = start.x + (end.x - start.x) / 2;
    const seg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    seg.setAttribute('d', `M ${start.x} ${start.y} Q ${midX} ${end.y} ${end.x} ${end.y}`);
    seg.setAttribute('fill', 'none');
    seg.setAttribute('stroke', start.color);
    seg.setAttribute('stroke-width', '5');
    seg.setAttribute('stroke-linecap', 'round');
    svg.appendChild(seg);
  }
}

function initTimelineNodes() {
  const container = document.getElementById('tube-stations-mount');
  if (!container) return;
  container.innerHTML = '';
  timelineNodeEls.length = 0;

  GENRES_METADATA.forEach(genre => {
    const btn = document.createElement('button');
    btn.className = 'genre-node-btn';
    btn.style.left = `${genre.x}px`;
    btn.style.top = `${genre.y}px`;

    btn.style.setProperty('--genre-color', genre.color);
    btn.style.setProperty('--genre-color-alpha', `rgba(${genre.rgb}, 0.4)`);
    btn.style.setProperty('--genre-color-alpha-light', `rgba(${genre.rgb}, 0.1)`);
    btn.style.setProperty('--genre-color-alpha-heavy', `rgba(${genre.rgb}, 0.2)`);
    btn.style.setProperty('--genre-color-alpha-glow', `rgba(${genre.rgb}, 0.15)`);
    btn.style.setProperty('--genre-color-sticker', `rgba(${genre.rgb}, 0.85)`);

    btn.innerHTML = `
      <div class="genre-node-circle" style="border-color:${genre.color};box-shadow:0 0 10px rgba(${genre.rgb}, 0.45);"></div>
      <div class="genre-node-label">
        <span class="genre-node-name">${genre.name}</span>
        <span class="genre-node-era">${genre.era}</span>
      </div>`;

    btn.addEventListener('click', () => handleGenreSelect(genre.id));
    container.appendChild(btn);
    timelineNodeEls.push({ el: btn, genre });
  });
}

function renderTimelineNodes() {
  timelineNodeEls.forEach(item => {
    item.el.classList.toggle('active', activeGenreId === item.genre.id);
    item.el.classList.toggle('dimmed', activeGenreId !== null && activeGenreId !== item.genre.id);
  });
}

function handleGenreSelect(id) {
  const clearBtn = document.getElementById('clear-signal-footer');

  if (activeGenreId === id) {
    activeGenreId = null;
    if (clearBtn) clearBtn.style.display = 'none';
  } else {
    activeGenreId = id;
    if (clearBtn) clearBtn.style.display = 'block';
    const g = GENRES_METADATA.find(x => x.id === id);
    const station = STATIONS.find(s => s.genre === g.genreKey);
    if (station) {
      initAudio();
      if (audioCtx) audioCtx.resume();
      animateTunerTo(station.freq);
    }
  }

  renderTimelineNodes();
  renderInfoPanel();
  updateRadarStatus();
}

function updateRadarStatus() {
  const pulseDot = document.getElementById('radar-pulse');
  const statusText = document.getElementById('radar-status-text');
  if (!pulseDot || !statusText) return;

  if (activeGenreId) {
    const genre = GENRES_METADATA.find(g => g.id === activeGenreId);
    pulseDot.style.background = genre.color;
    pulseDot.style.boxShadow = `0 0 10px ${genre.color}`;
    statusText.textContent = `${genre.name} LINE ACTIVE`;
    statusText.style.color = genre.color;
  } else {
    pulseDot.style.background = '#ff0055';
    pulseDot.style.boxShadow = '0 0 6px #ff0055';
    statusText.textContent = '1992 → PRESENT';
    statusText.style.color = '';
  }
}

function renderInfoPanel() {
  const mount = document.getElementById('info-panel-mount');
  if (!mount) return;
  mount.innerHTML = '';
  if (!activeGenreId) return;

  const genre = GENRES_METADATA.find(g => g.id === activeGenreId);

  const panel = document.createElement('div');
  panel.className = 'info-panel-container';
  panel.style.setProperty('--genre-color', genre.color);
  panel.style.setProperty('--genre-color-alpha', `rgba(${genre.rgb}, 0.4)`);
  panel.style.setProperty('--genre-color-alpha-heavy', `rgba(${genre.rgb}, 0.2)`);
  panel.style.setProperty('--genre-color-alpha-light', `rgba(${genre.rgb}, 0.1)`);
  panel.style.setProperty('--genre-color-alpha-glow', `rgba(${genre.rgb}, 0.08)`);
  panel.style.setProperty('--genre-color-sticker', `rgba(${genre.rgb}, 0.8)`);

  const tagsHtml = genre.artists.map(a => `<span class="artist-badge">${a}</span>`).join('');

  panel.innerHTML = `
    <div class="info-panel-glow"></div>
    <div class="info-panel-body">
      <div class="info-panel-header">
        <div>
          <div class="info-status-row">
            <div class="info-status-dot"></div>
            <span class="info-status-text">ROUTE CONNECTED</span>
          </div>
          <h3 class="info-panel-title">${genre.name} Station</h3>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--genre-color);margin-top:4px;font-weight:700;letter-spacing:0.05em;">LOCATION: ${genre.location.toUpperCase()}</div>
          <span class="info-panel-era">${genre.era} Era</span>
        </div>
        <button class="info-close-btn" id="info-close-trigger">✕ DISCONNECT</button>
      </div>
      <p class="info-description">${genre.description}</p>
      <div class="info-metadata-row">
        <div>
          <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#a0aec0;display:block;margin-bottom:8px;text-transform:uppercase;">GENRE ARCHITECTS</span>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">${tagsHtml}</div>
        </div>
      </div>
    </div>`;

  panel.querySelector('#info-close-trigger').addEventListener('click', () => handleGenreSelect(genre.id));
  mount.appendChild(panel);
}

/** Called by updateUIForStation to keep tube map in sync when radio tunes */
function updateTubeMapActiveState(genreName) {
  const match = GENRES_METADATA.find(g => g.genreKey === genreName.toUpperCase());
  activeGenreId = match ? match.id : null;
  renderTimelineNodes();
  renderInfoPanel();
  updateRadarStatus();
}

// ── CRT Glitch Engine ─────────────────────────────────────────────────────────
function initCrtGlitchEngine() {
  const mount = document.getElementById('magazine-cover-mount');
  if (!mount) return;

  // Set up periodic random glitches
  setInterval(() => {
    // 30% chance to trigger glitch every 3 seconds
    if (Math.random() < 0.3) {
      mount.classList.add('crt-monitor-glitch');
      setTimeout(() => {
        mount.classList.remove('crt-monitor-glitch');
      }, 250 + Math.random() * 200); // glitch duration between 250ms and 450ms
    }
  }, 3000);
}

// ── Boot sequence ─────────────────────────────────────────────────────────────
(function init() {
  precalculateColors();
  buildTicker();
  initCrtGlitchEngine();

  // Build dynamic DOM first, then cache refs to it
  buildControlsPanels();
  buildArchiveCards();
  cacheDOMRefs();

  setupTunerUI();
  wireEvents();

  // Tube map
  initTimelineNodes();
  drawTubeLines();

  // Feature 6: Deep linking — check URL for ?station= param
  const urlParams = new URLSearchParams(window.location.search);
  const stationParam = urlParams.get('station');
  let defaultStation;
  if (stationParam) {
    const targetFreq = parseFloat(stationParam);
    defaultStation = STATIONS.find(s => Math.abs(s.freq - targetFreq) < 0.05) || getStationByGenre('JUNGLE') || STATIONS[0];
  } else {
    defaultStation = getStationByGenre('JUNGLE') || STATIONS[0];
  }
  activeStation = defaultStation;
  lastActiveStation = defaultStation;
  currentFreq = defaultStation.freq;
  updateUIForStation(defaultStation);

  DOM.tunerNeedle.style.left = freqToPercent(defaultStation.freq) + '%';
  document.querySelectorAll('.tuner-station-mark').forEach(mark => {
    if (parseFloat(mark.getAttribute('data-freq')) === defaultStation.freq) {
      mark.classList.add('active');
    }
  });

  // Clear signal footer button
  document.getElementById('clear-signal-footer')?.addEventListener('click', () => {
    if (activeGenreId) handleGenreSelect(activeGenreId);
  });

  // Scroll-aware Header & Ticker logic
  window.addEventListener('scroll', () => {
    const ticker = document.querySelector('.ticker-wrap');
    const header = document.querySelector('header');
    if (window.scrollY > 40) {
      ticker?.classList.add('scrolled');
      header?.classList.add('scrolled');
    } else {
      ticker?.classList.remove('scrolled');
      header?.classList.remove('scrolled');
    }
  });

  // Magazine/Booklet keyboard shortcuts
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const modalOpen = magazineModal && magazineModal.style.display === 'flex';
    if (!modalOpen) return;

    if (e.code === 'Escape') {
      e.preventDefault();
      closeBookletModal();
    } else if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
      e.preventDefault();
      if (currentSpread < 4) { currentSpread++; renderBookletSpread(); }
    } else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (currentSpread > 1) { currentSpread--; renderBookletSpread(); }
    } else if (e.code === 'Space') {
      e.preventDefault();
      toggleBookletAudio();
    }
  });

  // Feature 4: JS-driven glitch page transitions (works on file:// and http://)
  // Create the transition overlay element
  const transOverlay = document.createElement('div');
  transOverlay.className = 'page-transition-overlay';
  document.body.appendChild(transOverlay);

  // Play glitch-in animation on page load
  document.body.classList.add('glitch-entering');
  document.body.addEventListener('animationend', function handler(e) {
    if (e.animationName === 'glitch-in') {
      document.body.classList.remove('glitch-entering');
      document.body.removeEventListener('animationend', handler);
    }
  });

  // Intercept internal navigation links
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only intercept local page navigations (not anchors, not external)
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.href;

      // Trigger glitch-out on the whole page
      document.body.style.animation = 'glitch-out 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      transOverlay.style.opacity = '1';
      transOverlay.style.background = '#000';

      setTimeout(() => {
        window.location.href = target;
      }, 280);
    });
  });
})();
