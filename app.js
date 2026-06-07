// player-test.js — Prototype scripting for redesigned Broadcaster Deck

const MIN_FREQ = 88.9;
const MAX_FREQ = 109.8;

// ── Helper: station lookups ───────────────────────────────────────────────────

function getStationByGenre(genre) {
  return STATIONS.find(s => s.genre === genre) || null;
}

function getStationByFreq(freq) {
  return STATIONS.find(s => s.freq === freq) || null;
}

// ── Helper: time formatting ───────────────────────────────────────────────────

function parseDuration(str) {
  const parts = str.split(':');
  return parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : 2537;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ── Helper: RGB calculations ──────────────────────────────────────────────────

function precalculateColors() {
  STATIONS.forEach(s => {
    const hex = s.colors.neonPink;
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    s.colors.rgb = `${r}, ${g}, ${b}`;
  });
}

// ── Build ticker from STATIONS data ──────────────────────────────────────────

function buildTicker() {
  const ticker = document.getElementById('ticker');
  if (!ticker) return;
  const items = [
    'BLACK BUDDHA FM',
    ...STATIONS.map(s => `EP ${s.epNum} \u2014 ${s.genre}: ${s.title.split('\u2013')[1]?.trim() || s.subtitle}`),
    '30 YEARS OF BLACK BRITISH MUSIC'
  ];
  const html = [...items, ...items].map(t => `<span>${t}</span>`).join('');
  ticker.innerHTML = html;
}

// ── Build horizontal miniature tape shelf in left column ──────────────────────

function buildArchiveCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  STATIONS.forEach((station) => {
    const color = station.colors.neonPink;
    const rgb = station.colors.rgb;
    const button = document.createElement('button');
    button.className = 'cassette-spine';
    button.setAttribute('aria-label', `${station.title} - ${station.genre}`);

    button.style.setProperty('--genre-color', color);
    button.style.setProperty('--genre-color-alpha-heavy', `rgba(${rgb}, 0.4)`);
    button.style.setProperty('--genre-color-alpha-glow', `rgba(${rgb}, 0.15)`);
    button.style.setProperty('--genre-color-sticker', `rgba(${rgb}, 0.85)`);

    const parts = station.title.split(/[\u2013\u2014-]/);
    const epShortName = parts[0] ? parts[0].trim() : `EP ${station.epNum}`;
    const epDisplayTitle = parts.slice(1).join('-').trim();

    let tapeSideImg = null;
    if (station.genre === 'JUNGLE') {
      tapeSideImg = 'images/Jungle tape side.png';
    } else if (station.genre === 'DRUM & BASS') {
      tapeSideImg = 'images/Drum and bass tape side.png';
    }

    button.innerHTML = `
      <div class="cassette-3d-card">
        <!-- Spine Face -->
        <div class="spine-body">
          <div class="spine-label">
            <div class="spine-stripe"></div>
            <div class="spine-text-rotated">
              <div class="rotated-inner">
                ${tapeSideImg ? `<img src="${tapeSideImg}" class="tape-side-mini-img" alt="Tape Side">` : `
                <span class="rotated-title">${epDisplayTitle}</span>
                <span class="rotated-subtitle">${epShortName}</span>
                `}
              </div>
            </div>
          </div>
          <div class="spine-tape-bottom">
            <div class="tape-block" style="height: 4px;"></div>
            <div class="tape-block" style="height: 3px;"></div>
            <div class="tape-block" style="height: 4px;"></div>
          </div>
        </div>
        <!-- Cover Face (Reverse Spin) -->
        <div class="cover-body"${tapeSideImg ? ` style="background-image: url('${tapeSideImg}'); background-size: cover; background-position: center; border: none;"` : ''}>
          ${tapeSideImg ? '' : `
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
          `}
        </div>
      </div>`;

    button.addEventListener('click', () => {
      initAudio();
      if (audioCtx) audioCtx.resume();
      animateTunerTo(station.freq);
      const playerEl = document.getElementById('player');
      if (playerEl) playerEl.scrollIntoView({ behavior: 'smooth' });
    });

    grid.appendChild(button);
  });
}

// ── Build controls panels from template ──────────────────────────────────────

function createControlsPanel(partNum, label) {
  const panel = document.createElement('div');
  panel.className = 'controls-panel';
  panel.id = `controls-part${partNum}`;
  if (partNum === 3) panel.style.display = 'none';

  const barHeights = [[40, 60, 30, 80, 20, 90, 40, 10], [30, 50, 20, 70, 40, 80, 30, 15], [25, 45, 15, 65, 35, 75, 25, 50]];
  const heights = barHeights[partNum - 1] || barHeights[0];

  panel.innerHTML = `
    <div class="panel-part-label" id="label-pt${partNum}">${label}</div>
    <div class="ctrl-row">
      <button class="play-btn" id="play-btn-${partNum}" aria-label="Play Part ${partNum}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
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

// ── DOM refs ──────────────────────────────────────────────────────────────────

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
    monitorTitle: document.getElementById('monitor-title'),
    monitorDuration: document.getElementById('monitor-duration'),
    monitorFreq: document.getElementById('monitor-freq'),
    progSignals: [null, document.getElementById('prog-signal-1'), document.getElementById('prog-signal-2'), document.getElementById('prog-signal-3')],
    playBtns: [null, document.getElementById('play-btn-1'), document.getElementById('play-btn-2'), document.getElementById('play-btn-3')],
    timeDisplays: [null, document.getElementById('time-1'), document.getElementById('time-2'), document.getElementById('time-3')],
    fills: [null, document.getElementById('fill-1'), document.getElementById('fill-2'), document.getElementById('fill-3')],
    gainKnob: document.getElementById('gain-knob'),
    knobLine: document.getElementById('knob-line'),
    recFlicker: document.querySelector('.rec-row .flicker'),
    heroBars: document.querySelectorAll('#hero-wave .wave-bar'),
    monitorBars: document.querySelectorAll('#monitor-bars .green-bar'),
    stationMarks: null
  };
}

// ── State ─────────────────────────────────────────────────────────────────────

let currentFreq = 88.9;
let isDragging = false;
let activeStation = null;
let lastActiveStation = null;
let currentPart = 1;

let volumeFactor = 0.8;
let staticFactor = 0.06;
let currentBand = 'FM';
let currentMode = 'STEREO';

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
let isAudioInitialized = false;

const SVG_PLAY = '<path d="M8 5v14l11-7z"/>';
const SVG_PAUSE = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

function initAudio() {
  if (isAudioInitialized) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioEl = new Audio();
  audioEl.crossOrigin = 'anonymous';
  audioEl.loop = true;

  audioSource = audioCtx.createMediaElementSource(audioEl);

  filterNode = audioCtx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 20000;

  musicGain = audioCtx.createGain();
  staticGain = audioCtx.createGain();

  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 64;

  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

  staticNode = audioCtx.createBufferSource();
  staticNode.buffer = noiseBuffer;
  staticNode.loop = true;

  audioSource.connect(filterNode);
  filterNode.connect(musicGain);
  musicGain.connect(analyserNode);
  staticNode.connect(staticGain);
  staticGain.connect(analyserNode);
  analyserNode.connect(audioCtx.destination);

  staticNode.start(0);
  staticGain.gain.value = 0;

  audioEl.addEventListener('play', () => {
    startProgressLoop();
    startVisualizerLoop();
  });
  audioEl.addEventListener('pause', stopProgressLoop);

  isAudioInitialized = true;
  startVisualizer();
}

// ── Frequency / Tuner helpers ─────────────────────────────────────────────────

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
    tick.className = 'tuner-tick' + (Number.isInteger(Math.round(f * 10) / 10) ? ' major' : '');
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
      currentFreq += diff * 0.15;
      renderTuningState();
      tunerAnimationId = requestAnimationFrame(step);
    }
  };
  step();
}

// ── Main tuning state renderer ────────────────────────────────────────────────

function renderTuningState() {
  DOM.tunerNeedle.style.left = freqToPercent(currentFreq) + '%';
  DOM.signalBadgeText.textContent = `SIGNAL: ${currentFreq.toFixed(1)} FM`;

  let nearest = null;
  let minDiff = Infinity;
  STATIONS.forEach(s => {
    const d = Math.abs(currentFreq - s.freq);
    if (d < minDiff) { minDiff = d; nearest = s; }
  });

  let volume = 0, staticVol = 1.0, filterFreq = 20000;
  if (minDiff < 1.5) {
    activeStation = nearest;
    const ratio = minDiff / 1.5;
    volume = Math.max(0, 1 - ratio);
    staticVol = ratio;
    filterFreq = 300 + (1 - ratio) * 19700;
  } else {
    activeStation = null;
    staticVol = 1.0;
    filterFreq = 300;
  }

  let stationChanged = false;
  if (activeStation && activeStation !== lastActiveStation) {
    lastActiveStation = activeStation;
    updateUIForStation(activeStation);
    stationChanged = true;
  } else if (!activeStation) {
    lastActiveStation = null;
  }

  if (isAudioInitialized) {
    if (activeStation && stationChanged) {
      resetPartProgressUI(2);
      resetPartProgressUI(3);
      currentPart = 1;
      const wasPlaying = !audioEl.paused;
      audioEl.src = activeStation.trackUrl1;
      audioEl.load();
      if (wasPlaying) audioEl.play().catch(e => console.log(e));
    }

    const t = audioCtx.currentTime;
    musicGain.gain.setTargetAtTime(volume * volumeFactor, t, 0.05);
    staticGain.gain.setTargetAtTime(staticVol * staticFactor * (audioEl && audioEl.paused ? 0.3 : 1.0), t, 0.05);

    if (currentBand === 'AM') {
      filterNode.type = 'bandpass';
      filterNode.frequency.setTargetAtTime(Math.min(filterFreq, 2800), t, 0.05);
    } else {
      filterNode.type = 'lowpass';
      filterNode.frequency.setTargetAtTime(filterFreq, t, 0.05);
    }
    startVisualizerLoop();
  }

  DOM.stationMarks.forEach(mark => {
    const f = parseFloat(mark.getAttribute('data-freq'));
    if (activeStation && activeStation.freq === f && minDiff < 0.2) {
      mark.classList.add('active');
      DOM.tunerStrength.textContent = `STRENGTH: ${Math.round((1 - minDiff / 0.2) * 20 + 80)}%`;
      setSignalStatus('SIGNAL STABLE', 'var(--neon-green)');
    } else {
      mark.classList.remove('active');
    }
  });

  if (!activeStation || minDiff >= 0.2) {
    DOM.tunerStrength.textContent = `STRENGTH: ${activeStation ? Math.round((1 - minDiff / 1.5) * 40) : 0}%`;
    setSignalStatus(activeStation ? 'SIGNAL DRIFT' : 'NO SIGNAL', 'var(--neon-pink)');
  }

  // Update active status classes in mini cassettes shelf
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

function setSignalStatus(text, color) {
  for (let i = 1; i <= 3; i++) {
    const el = DOM.progSignals[i];
    if (el) { el.textContent = text; el.style.color = color; }
  }
}

// ── Part progress UI helpers ──────────────────────────────────────────────────

function resetPartProgressUI(partNum) {
  if (DOM.fills[partNum]) DOM.fills[partNum].style.width = '0%';
  if (DOM.timeDisplays[partNum] && activeStation) {
    const dur = activeStation[`duration${partNum}`] || '00:00';
    DOM.timeDisplays[partNum].textContent = `00:00 / ${dur}`;
  }
}

// ── Full UI update for a station ──────────────────────────────────────────────

function updateUIForStation(station) {
  const r = document.documentElement.style;
  r.setProperty('--surface-lowest', station.colors.surfaceLowest);
  r.setProperty('--surface-low', station.colors.surfaceLow);

  if (currentThemeClass) {
    document.body.classList.remove(currentThemeClass);
  }
  currentThemeClass = `theme-ep${station.epNum}`;
  document.body.classList.add(currentThemeClass);

  DOM.signalBadgeText.textContent = `SIGNAL: ${station.freq.toFixed(1)} FM`;
  if (DOM.monitorTitle) DOM.monitorTitle.textContent = station.genre;
  if (DOM.monitorDuration) DOM.monitorDuration.textContent = station.duration1;
  if (DOM.monitorFreq) DOM.monitorFreq.textContent = `${station.freq.toFixed(1)} FM`;

  DOM.statLength.textContent = station.duration1;
  DOM.statGenre.textContent = station.genre;
  DOM.statLocation.textContent = station.location;

  // Center column custom chalkboard title and dynamic magazine cover mount
  const customTitle = document.getElementById('ep-title-custom');
  if (customTitle) {
    let cleanTitle = '';
    if (station.title.includes(':')) {
      cleanTitle = station.title.split(':').slice(1).join(':').trim();
    } else {
      cleanTitle = station.title.split(/[\u2013\u2014-]/).slice(1).join('-').trim();
    }
    customTitle.textContent = `EP ${station.epNum} - ${station.genre}: ${cleanTitle}`;
  }

  renderMagazineCover(station);

  if (typeof updateTubeMapActiveState === 'function') {
    updateTubeMapActiveState(station.genre);
  }

  DOM.epBadge.textContent = `EP ${station.genre} LIVE`;

  // Controls panels setup
  if (DOM.timeDisplays[1]) DOM.timeDisplays[1].textContent = `00:00 / ${station.duration1}`;
  if (DOM.timeDisplays[2]) DOM.timeDisplays[2].textContent = `00:00 / ${station.duration2}`;
  if (DOM.fills[1]) DOM.fills[1].style.width = '0%';
  if (DOM.fills[2]) DOM.fills[2].style.width = '0%';

  const hasPart3 = !!(station.duration3 && station.tracks3);
  if (DOM.controlsPart3) DOM.controlsPart3.style.display = hasPart3 ? 'flex' : 'none';
  if (hasPart3 && DOM.timeDisplays[3]) DOM.timeDisplays[3].textContent = `00:00 / ${station.duration3}`;
  if (DOM.fills[3]) DOM.fills[3].style.width = '0%';

  // Set vinyl label color and variables
  const labelCenter = document.getElementById('vinyl-label-center');
  if (labelCenter) {
    labelCenter.style.background = station.colors.neonPink;
  }
}

// ── Dynamic Magazine Cover Fallback Generator ──────────────────────────────────

function renderMagazineCover(station) {
  const mount = document.getElementById('magazine-cover-mount');
  if (!mount) return;

  const color = station.colors.neonPink;
  const rgb = station.colors.rgb;

  if (station.cardImg) {
    mount.innerHTML = `<img src="${station.cardImg}" alt="${station.genre} Magazine Cover" class="magazine-img">`;
  } else {
    // Generate static Unsplash background based on genre to keep visual fidelity high
    let fallbackImgUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop';
    if (station.genre === 'DRUM & BASS') fallbackImgUrl = 'images/Drum n Bass Magazine.png';
    else if (station.genre === 'BASSLINE') fallbackImgUrl = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop';
    else if (station.genre === 'UK FUNKY') fallbackImgUrl = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop';
    else if (station.genre === 'ROAD RAP') fallbackImgUrl = 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop';
    else if (station.genre === 'UK DRILL') fallbackImgUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop';
    else if (station.genre === 'AFROSWING') fallbackImgUrl = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop';

    mount.innerHTML = `
      <div class="magazine-dynamic-fallback" style="--genre-color: ${color}">
        <div class="mag-header">
          <span class="mag-brand">${station.genre} CULTURE MAGAZINE</span>
          <span class="mag-issue">ISSUE ${station.epNum}</span>
        </div>
        <div class="mag-title-main">${station.genre}</div>
        <div class="mag-artwork-wrap">
          <div class="mag-artwork-gradient" style="background: radial-gradient(circle, rgba(${rgb}, 0.5) 0%, #000 100%)">
            <img src="${fallbackImgUrl}" class="mag-artwork-img">
          </div>
        </div>
        <div class="mag-content-list">
          <div class="mag-section-title">ORIGINAL VIBES</div>
          <div class="mag-section-desc">THE ROOTS OF ${station.genre} MUSIC</div>
          <div class="mag-interviews">INTERVIEWS: ${station.tracks1[0]?.title.split('–')[0].trim() || 'UNDERGROUND COLLECTIVE'}</div>
          <div class="mag-club-scene">CLUB SCENE: THEN & NOW</div>
        </div>
        <div class="mag-barcode-wrap">
          <div class="mag-barcode"></div>
          <div class="mag-barcode-num">9 771234 567890</div>
        </div>
      </div>
    `;
  }
}

// ── Playback ──────────────────────────────────────────────────────────────────

function playPart(partNum) {
  initAudio();
  if (audioCtx) audioCtx.resume();

  // Stop booklet audio if active when main radio starts playing
  stopBookletAudio();

  if (!activeStation) {
    activeStation = getStationByGenre('JUNGLE');
    currentFreq = activeStation.freq;
    renderTuningState();
  }

  const targetUrl = activeStation[`trackUrl${partNum}`];
  if (!targetUrl) return;

  const targetAbsUrl = new URL(targetUrl, location.href).href;
  if (currentPart !== partNum || audioEl.src !== targetAbsUrl) {
    resetPartProgressUI(currentPart);
    currentPart = partNum;
    audioEl.src = targetAbsUrl;
    audioEl.load();
    audioEl.play().then(() => updatePlayStateUI(true)).catch(e => console.log(e));
  } else {
    if (audioEl.paused) {
      audioEl.play().then(() => updatePlayStateUI(true)).catch(e => console.log(e));
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
  for (let i = 1; i <= 3; i++) {
    const btn = DOM.playBtns[i];
    if (!btn) continue;
    const svg = btn.querySelector('svg');
    if (svg) svg.innerHTML = (isPlaying && currentPart === i) ? SVG_PAUSE : SVG_PLAY;
  }

  if (DOM.heroBayPlayBtn) {
    const svg = DOM.heroBayPlayBtn.querySelector('svg');
    if (svg) svg.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;
    const textNode = DOM.heroBayPlayBtn.childNodes[DOM.heroBayPlayBtn.childNodes.length - 1];
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = isPlaying ? ' PAUSE TRANSMISSION' : ' LISTEN TO LATEST BROADCAST';
    }
  }

  if (DOM.vinylFrame) {
    DOM.vinylFrame.classList.toggle('playing', isPlaying);
  }

  if (DOM.recFlicker) {
    DOM.recFlicker.style.animationPlayState = isPlaying ? 'running' : 'paused';
  }
}

// ── RAF-based progress loop ───────────────────────────────────────────────────

let progressRafId = null;

function startProgressLoop() {
  if (progressRafId) return;
  const tick = () => {
    if (!audioEl || audioEl.paused) {
      progressRafId = null;
      return;
    }
    const elapsed = audioEl.currentTime;
    const durStr = (activeStation && activeStation[`duration${currentPart}`]) || '00:00';
    const dur = audioEl.duration || parseDuration(durStr);
    const pct = (elapsed / dur) * 100;

    const fill = DOM.fills[currentPart];
    const time = DOM.timeDisplays[currentPart];
    if (fill) fill.style.width = pct + '%';
    if (time) time.textContent = `${formatTime(elapsed)} / ${durStr}`;

    progressRafId = requestAnimationFrame(tick);
  };
  progressRafId = requestAnimationFrame(tick);
}

function stopProgressLoop() {
  if (progressRafId) {
    cancelAnimationFrame(progressRafId);
    progressRafId = null;
  }
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
    document.querySelectorAll('#mini-wave-3 .mini-bar')
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

  if (!playing && staticVol === 0) {
    let stillDecaying = false;
    if (decayBars(DOM.heroBars)) stillDecaying = true;
    if (decayBars(DOM.monitorBars)) stillDecaying = true;
    miniBarSets.forEach(set => {
      if (decayBars(set)) stillDecaying = true;
    });

    if (!stillDecaying) {
      isVisualizerRunning = false;
      return;
    }
  } else {
    updateBars(DOM.heroBars, dataArray, 0, 8);
    updateBars(DOM.monitorBars, dataArray, 4, 12);
    const activeMini = miniBarSets[currentPart - 1];
    if (activeMini) updateBars(activeMini, dataArray, 8, 16);
  }

  requestAnimationFrame(drawVisualizer);
}

function updateBars(bars, dataArray, startBin, endBin) {
  if (!bars || !bars.length) return;
  const count = bars.length;
  const binsPerBar = Math.max(1, Math.floor((endBin - startBin) / count));
  bars.forEach((bar, idx) => {
    let sum = 0;
    const binStart = startBin + idx * binsPerBar;
    for (let i = 0; i < binsPerBar; i++) sum += dataArray[binStart + i] || 0;
    bar.style.height = (5 + (sum / binsPerBar / 255) * 93) + '%';
  });
}

function decayBars(bars) {
  if (!bars || !bars.length) return false;
  let active = false;
  bars.forEach(bar => {
    const cur = parseFloat(bar.style.height) || 5;
    if (cur > 5) {
      bar.style.height = Math.max(5, cur - 1.5) + '%';
      active = true;
    }
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

// ── Volume knob (mouse + touch) ───────────────────────────────────────────────

let isAdjustingVolume = false;
let volumeStartY = 0;
let volumeRotation = 45;

function applyKnobDelta(dy) {
  volumeRotation += dy * 2.5;
  volumeRotation = Math.max(-135, Math.min(135, volumeRotation));
  DOM.knobLine.style.transform = `rotate(${volumeRotation}deg)`;
  volumeFactor = (volumeRotation + 135) / 270;

  if (isAudioInitialized && activeStation) {
    const diff = Math.abs(currentFreq - activeStation.freq);
    const ratio = diff / 1.5;
    const vol = diff < 1.5 ? Math.max(0, 1 - ratio) : 0;
    musicGain.gain.setTargetAtTime(vol * volumeFactor, audioCtx.currentTime, 0.05);
    startVisualizerLoop();
  }
}

// ── Booklet Modal Features ───────────────────────────────────────────────────

let currentSpread = 1;
let bookletStation = null;
let bookletAudio = null;
let bookletAudioPlaying = false;
let bookletProgressInterval = null;

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

  // Create separate booklet audio instance
  if (bookletAudio) {
    bookletAudio.pause();
    bookletAudio = null;
  }
  // Load Part 2 (Interview or special audio stream) as separate stream in booklet
  const separateStreamUrl = station.trackUrl2 || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
  bookletAudio = new Audio(separateStreamUrl);
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
    clearInterval(bookletProgressInterval);
    updateBookletAudioUI();
  }
}

function renderBookletSpread() {
  if (!bookletStation) return;

  const color = bookletStation.colors.neonPink;
  const rgb = bookletStation.colors.rgb;
  bookletContainer.style.setProperty('--genre-color', color);
  bookletContainer.style.setProperty('--genre-color-alpha-light', `rgba(${rgb}, 0.08)`);
  bookletContainer.style.setProperty('--genre-color-alpha-heavy', `rgba(${rgb}, 0.4)`);

  if (currentSpread === 1) {
    // Spread 1: Page 1 (Cover fallback/real cover) & Page 2 (Editorial history)

    // Page 1 cover html
    let coverHtml = '';
    if (bookletStation.cardImg) {
      coverHtml = `<img src="${bookletStation.cardImg}" alt="Cover" class="magazine-img">`;
    } else {
      let fallbackImgUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop';
      if (bookletStation.genre === 'DRUM & BASS') fallbackImgUrl = 'images/Drum n Bass Magazine.png';
      else if (bookletStation.genre === 'BASSLINE') fallbackImgUrl = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop';
      else if (bookletStation.genre === 'UK FUNKY') fallbackImgUrl = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop';
      else if (bookletStation.genre === 'ROAD RAP') fallbackImgUrl = 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop';
      else if (bookletStation.genre === 'UK DRILL') fallbackImgUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop';
      else if (bookletStation.genre === 'AFROSWING') fallbackImgUrl = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop';

      coverHtml = `
        <div class="magazine-dynamic-fallback" style="--genre-color: ${color}">
          <div class="mag-header">
            <span class="mag-brand">${bookletStation.genre} CULTURE MAGAZINE</span>
            <span class="mag-issue">ISSUE ${bookletStation.epNum}</span>
          </div>
          <div class="mag-title-main">${bookletStation.genre}</div>
          <div class="mag-artwork-wrap">
            <div class="mag-artwork-gradient" style="background: radial-gradient(circle, rgba(${rgb}, 0.5) 0%, #000 100%)">
              <img src="${fallbackImgUrl}" class="mag-artwork-img">
            </div>
          </div>
          <div class="mag-content-list">
            <div class="mag-section-title">ORIGINAL VIBES</div>
            <div class="mag-section-desc">THE ROOTS OF ${bookletStation.genre} MUSIC</div>
            <div class="mag-interviews">INTERVIEWS: ${bookletStation.tracks1[0]?.title.split('–')[0].trim() || 'UNDERGROUND COLLECTIVE'}</div>
            <div class="mag-club-scene">CLUB SCENE: THEN & NOW</div>
          </div>
          <div class="mag-barcode-wrap">
            <div class="mag-barcode"></div>
            <div class="mag-barcode-num">9 771234 567890</div>
          </div>
        </div>
      `;
    }

    // Page 2 Editorial text
    const editorialText = bookletStation.desc + " From pirate radio towers to the sticky floors of sweaty warehouses, this musical trajectory is built on raw frequencies and community power. This is an archival scan of the movement's evolution. Stay locked to the lineage.";

    bookletContainer.innerHTML = `
      <!-- Page 1 (Left) -->
      <div class="booklet-page left-page" style="padding:0;">
        ${coverHtml}
      </div>

      <!-- Page 2 (Right) -->
      <div class="booklet-page right-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">${bookletStation.genre} EVOLUTION</h2>
          <div class="booklet-subtitle">${bookletStation.subtitle}</div>
          <p class="booklet-text">${bookletStation.desc}</p>
          <p class="booklet-text">${editorialText.substring(0, 160)}...</p>
        </div>
        <div class="booklet-page-num">PAGE 02</div>
      </div>
    `;

    prevBtn.disabled = true;
    nextBtn.disabled = false;
    pageIndicator.textContent = "SPREAD 1 / 4 (PAGES 1-2)";

  } else if (currentSpread === 2) {
    // Spread 2: Page 3 (Tracklisting) & Page 4 (Visual Archive gallery)

    // Generate tracklist list html
    let tracksHtml = '';
    if (bookletStation.tracks1 && bookletStation.tracks1.length > 0) {
      bookletStation.tracks1.forEach((tr, idx) => {
        tracksHtml += `
          <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:10px; font-family:'Space Mono',monospace; font-size:10px; color:#222; border-bottom:1px dashed rgba(0,0,0,0.05); padding-bottom:4px;">
            <span style="color:${color}; font-weight:700; font-family:sans-serif;">${String(idx + 1).padStart(2, '0')}</span>
            <span>${tr.title}</span>
          </div>`;
      });
    } else {
      tracksHtml = '<p class="booklet-text">No transmission log available.</p>';
    }

    // Choose beautiful gallery photo
    let subcultureImgUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format&fit=crop';
    if (bookletStation.genre === 'DRUM & BASS') subcultureImgUrl = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=500&auto=format&fit=crop';
    else if (bookletStation.genre === 'UK GARAGE') subcultureImgUrl = 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=500&auto=format&fit=crop';
    else if (bookletStation.genre === 'BASSLINE') subcultureImgUrl = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500&auto=format&fit=crop';
    else if (bookletStation.genre === 'UK FUNKY') subcultureImgUrl = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=500&auto=format&fit=crop';
    else if (bookletStation.genre === 'ROAD RAP') subcultureImgUrl = 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=500&auto=format&fit=crop';
    else if (bookletStation.genre === 'UK DRILL') subcultureImgUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500&auto=format&fit=crop';
    else if (bookletStation.genre === 'AFROSWING') subcultureImgUrl = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=500&auto=format&fit=crop';

    // Artist list badges
    const artists = [...new Set(bookletStation.tracks1.map(t => t.title.split(/[\u2013\u2014-]/)[0].trim()))].slice(0, 4);
    const artistsBadges = artists.map(a => `<span class="booklet-artist-badge">${a}</span>`).join('');

    bookletContainer.innerHTML = `
      <!-- Page 3 (Left) -->
      <div class="booklet-page left-page">
        <h2 class="booklet-title" style="--genre-color: ${color}">TRACKLISTING</h2>
        <div class="booklet-subtitle">LOGGED WAVEFORM RECORDINGS</div>
        <div style="flex:1; overflow-y:auto; padding-right:6px;">
          ${tracksHtml}
        </div>
        <div class="booklet-page-num" style="margin-top:10px;">PAGE 03</div>
      </div>

      <!-- Page 4 (Right) -->
      <div class="booklet-page right-page">
        <div class="booklet-gallery-wrap">
          <h2 class="booklet-title" style="--genre-color: ${color}">VISUAL ARCHIVE</h2>
          <div class="booklet-img-frame">
            <img src="${subcultureImgUrl}" class="booklet-img" alt="Visual archive">
          </div>
          <div>
            <div class="booklet-artists-label">KEY MOVEMENT PROPAGATORS:</div>
            <div class="booklet-artists-list">
              ${artistsBadges}
            </div>
          </div>
        </div>
        <div class="booklet-page-num">PAGE 04</div>
      </div>
    `;

    prevBtn.disabled = false;
    nextBtn.disabled = false;
    pageIndicator.textContent = "SPREAD 2 / 4 (PAGES 3-4)";

  } else if (currentSpread === 3) {
    // Spread 3: Page 5 (Tech Specs/Telemetry) & Page 6 (Interview Excerpts Q&A)
    bookletContainer.innerHTML = `
      <!-- Page 5 (Left) -->
      <div class="booklet-page left-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">RADIO TELEMETRY</h2>
          <div class="booklet-subtitle">TECHNICAL SIGNAL ANALYSIS</div>
          <div style="font-family:'Space Mono', monospace; font-size:10px; color:#333; margin-top:15px; line-height:1.6;">
            <div style="border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:4px; margin-bottom:8px;">
              <span style="font-weight:700; color:${color};">PARAMETER</span>
              <span style="float:right; font-weight:700;">VALUE</span>
            </div>
            <div style="margin-bottom:6px;">
              <span>FREQUENCY</span>
              <span style="float:right; color:${color}; font-weight:700;">${bookletStation.freq} MHz</span>
            </div>
            <div style="margin-bottom:6px;">
              <span>SIGNAL PATH</span>
              <span style="float:right;">94.8 FM Relay</span>
            </div>
            <div style="margin-bottom:6px;">
              <span>TRANSMITTER</span>
              <span style="float:right;">500W ERP Dipole</span>
            </div>
            <div style="margin-bottom:8px;">
              <span>ENCODING</span>
              <span style="float:right;">Phase Lock Loop Stereo</span>
            </div>
          </div>
          <p class="booklet-text" style="font-size:10px; margin-top:15px; line-height:1.4;">Rigged on high-rise rooftops in clandestine sectors, our custom masts relay sub-heavy signals across metropolitan zones. Continuous telemetry monitoring verifies clean spectrum bandwidth allocation free from interference patterns.</p>
        </div>
        <div class="booklet-page-num">PAGE 05</div>
      </div>

      <!-- Page 6 (Right) -->
      <div class="booklet-page right-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">CONVERSATION SCANS</h2>
          <div class="booklet-subtitle">PIRATE SELECTOR INTERVIEW</div>
          <p class="booklet-text" style="font-size:10.5px; font-weight:700; color:#111; margin-top:10px; margin-bottom:4px;">Q: How do you choose your transmission sites?</p>
          <p class="booklet-text" style="font-size:10px; color:#444; margin-bottom:10px; line-height:1.45;">A: "Elevation is everything. We look for blocks with clear lines of sight to key boroughs. We pack up the gear, climb up, set the rig, and lock the doors. If they locate the signal, we move. Keep moving, keep transmitting."</p>
          <p class="booklet-text" style="font-size:10.5px; font-weight:700; color:#111; margin-bottom:4px;">Q: What defines the ${bookletStation.genre} sound?</p>
          <p class="booklet-text" style="font-size:10px; color:#444; line-height:1.45;">A: "The low-end frequencies. It's the pressure that hits your chest, combined with the frantic breakbeats or rhythm shifts. That energy is built for packed basement clubs."</p>
        </div>
        <div class="booklet-page-num">PAGE 06</div>
      </div>
    `;

    prevBtn.disabled = false;
    nextBtn.disabled = false;
    pageIndicator.textContent = "SPREAD 3 / 4 (PAGES 5-6)";

  } else if (currentSpread === 4) {
    // Spread 4: Page 7 (Outro credits) & Page 8 (Mixtape Separate player)

    bookletContainer.innerHTML = `
      <!-- Page 7 (Left) -->
      <div class="booklet-page left-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">TRANSMISSION CREDITS</h2>
          <div class="booklet-subtitle">PIRATE RADIO ARCHIVAL PROJECT</div>
          <p class="booklet-text">Broadcasting raw frequencies continuously. This booklet functions as a catalog and scanned artifact of early 90s to modern UK bass movements.</p>
          <p class="booklet-text">All mixtape decks are digitized from physical tapes and remastered at 320 kbps. Special thanks to all participating transmitters, pirate crews, and selectors across London sub-sectors.</p>
          <p class="booklet-text" style="font-style:italic; color:#666;">"Keep the frequency stable. Protect the underground."</p>
        </div>
        <div class="booklet-page-num">PAGE 07</div>
      </div>

      <!-- Page 8 (Right) -->
      <div class="booklet-page right-page">
        <div>
          <h2 class="booklet-title" style="--genre-color: ${color}">SPECIAL STREAM</h2>
          <div class="booklet-subtitle">CLANDESTINE AUDIO SOURCE</div>
          <p class="booklet-text" style="font-size:11px;">Unlock the secondary transmission log. Tap below to initiate connection to the high-bitrate interview segment or special underground bootleg recorded live.</p>
          
          <!-- Custom player card -->
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
      </div>
    `;

    prevBtn.disabled = false;
    nextBtn.disabled = true;
    pageIndicator.textContent = "SPREAD 4 / 4 (PAGES 7-8)";

    // Wire up booklet special player events
    const bPlayBtn = document.getElementById('special-play-btn');
    if (bPlayBtn) {
      bPlayBtn.addEventListener('click', toggleBookletAudio);
    }
    const bProgressTrack = document.getElementById('special-progress-track');
    if (bProgressTrack) {
      bProgressTrack.addEventListener('click', seekBookletAudio);
    }

    updateBookletAudioUI();
  }
}

function toggleBookletAudio() {
  if (!bookletAudio) return;

  if (bookletAudioPlaying) {
    bookletAudio.pause();
    bookletAudioPlaying = false;
    clearInterval(bookletProgressInterval);
    updateBookletAudioUI();
  } else {
    // PAUSE the main player first (critical feature!)
    if (audioEl && !audioEl.paused) {
      audioEl.pause();
      updatePlayStateUI(false);
    }

    bookletAudio.play().then(() => {
      bookletAudioPlaying = true;
      updateBookletAudioUI();
      startBookletProgressLoop();
    }).catch(e => console.log(e));
  }
}

function startBookletProgressLoop() {
  clearInterval(bookletProgressInterval);
  bookletProgressInterval = setInterval(() => {
    if (!bookletAudio) return;
    const elapsed = bookletAudio.currentTime;
    const duration = bookletAudio.duration || parseDuration(bookletStation.duration2);
    const pct = (elapsed / duration) * 100;

    const fill = document.getElementById('special-progress-fill');
    const timeDisplay = document.getElementById('special-current-time');

    if (fill) fill.style.width = pct + '%';
    if (timeDisplay) timeDisplay.textContent = formatTime(elapsed);
  }, 300);
}

function seekBookletAudio(e) {
  if (!bookletAudio) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  const duration = bookletAudio.duration || parseDuration(bookletStation.duration2);
  bookletAudio.currentTime = pct * duration;

  const fill = document.getElementById('special-progress-fill');
  if (fill) fill.style.width = (pct * 100) + '%';
}

function updateBookletAudioUI() {
  const btn = document.getElementById('special-play-btn');
  if (!btn) return;
  btn.textContent = bookletAudioPlaying ? '■' : '▶';
  btn.style.background = bookletAudioPlaying ? '#ffffff' : bookletStation.colors.neonPink;
}

// ── Wire event listeners ──────────────────────────────────────────────────────

function wireEvents() {
  DOM.tunerDisplay.addEventListener('mousedown', e => {
    isDragging = true;
    initAudio();
    if (audioCtx) audioCtx.resume();
    updateNeedlePosition(e.clientX);
  });
  window.addEventListener('mousemove', e => { if (isDragging) updateNeedlePosition(e.clientX); });
  window.addEventListener('mouseup', () => { isDragging = false; });

  DOM.tunerDisplay.addEventListener('touchstart', e => {
    isDragging = true;
    initAudio();
    if (audioCtx) audioCtx.resume();
    updateNeedlePosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => { if (isDragging) updateNeedlePosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

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

  for (let i = 1; i <= 3; i++) {
    const btn = DOM.playBtns[i];
    if (btn) btn.addEventListener('click', () => playPart(i));
  }
  if (DOM.heroBayPlayBtn) DOM.heroBayPlayBtn.addEventListener('click', togglePlay);

  document.getElementById('band-group')?.querySelectorAll('.btn-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      initAudio(); if (audioCtx) audioCtx.resume();
      document.getElementById('band-group').querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active-green'));
      btn.classList.add('active-green');
      currentBand = btn.textContent.trim();
      renderTuningState();
    });
  });

  document.getElementById('mode-group')?.querySelectorAll('.btn-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      initAudio(); if (audioCtx) audioCtx.resume();
      document.getElementById('mode-group').querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active-pink'));
      btn.classList.add('active-pink');
      currentMode = btn.textContent.trim();
    });
  });

  // Magazine Modal events
  const magMount = document.getElementById('magazine-cover-mount');
  if (magMount) {
    magMount.addEventListener('click', () => {
      openBookletModal(activeStation || STATIONS[0]);
    });
  }

  const closeMBtn = document.getElementById('magazine-close-btn');
  if (closeMBtn) {
    closeMBtn.addEventListener('click', closeBookletModal);
  }

  prevBtn.addEventListener('click', () => {
    if (currentSpread > 1) {
      currentSpread--;
      renderBookletSpread();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentSpread < 4) {
      currentSpread++;
      renderBookletSpread();
    }
  });

  window.addEventListener('resize', () => {
    if (typeof drawTubeLines === 'function') drawTubeLines();
  });
}

// ── Tube Map Timeline Integration ────────────────────────────────────────────

const GENRES_METADATA = [
  {
    id: "jungle",
    name: "Jungle",
    era: "1991–1995",
    color: "#39FF14",
    x: 80, y: 100,
    description: "Born in the raves. Breakbeat science meets sound system culture — ragga vocals over amen breaks at 160bpm. The original signal.",
    artists: ["Goldie", "Shy FX", "LTJ Bukem", "DJ Hype"],
    genreKey: "JUNGLE"
  },
  {
    id: "dnb",
    name: "Drum & Bass",
    era: "1996–2005",
    color: "#0066FF",
    x: 200, y: 70,
    description: "Jungle evolved, refined, exported. The amen break went global. Rollers, liquid, neurofunk — a genre fracturing into movements.",
    artists: ["Goldie", "LTJ Bukem", "Roni Size", "J Majik", "Dillinja"],
    genreKey: "DRUM & BASS"
  },
  {
    id: "ukgarage",
    name: "UK Garage",
    era: "1996–2002",
    color: "#D4AF37",
    x: 320, y: 130,
    description: "US house through a South London filter. 2-step rhythms, pitched-up vocals, champagne in the club. Speed garage gave way to something smoother.",
    artists: ["Craig David", "MJ Cole", "Artful Dodger", "So Solid Crew"],
    genreKey: "UK GARAGE"
  },
  {
    id: "grime",
    name: "Grime",
    color: "#B0B7C3",
    era: "2002–2010",
    x: 440, y: 130,
    description: "8-bar frequencies from E3. Pirate radio, Nokia ringtones, clashing MCs. Wiley's eskibeat rewired the cultural mainframe.",
    artists: ["Wiley", "Dizzee Rascal", "Skepta", "JME", "Tinchy Stryder"],
    genreKey: "GRIME"
  },
  {
    id: "dubstep",
    name: "Dubstep",
    era: "2001–2011",
    color: "#2b21de",
    x: 560, y: 100,
    description: "140bpm. Sub-bass that moved furniture. Croydon's answer to everything. From Plastic People to festival stages — the wobble heard worldwide.",
    artists: ["Benga", "Skream", "Burial", "Digital Mystikz", "Kode9"],
    genreKey: "DUBSTEP"
  },
  {
    id: "bassline",
    name: "Bassline",
    era: "2003–2008",
    color: "#FF2DAA",
    x: 680, y: 70,
    description: "Sheffield's contribution. 4x4 kicks, pitched basslines, speed garage's northern cousin. Underground but felt everywhere.",
    artists: ["DJ Q", "T2", "Virus Syndicate", "Chunky"],
    genreKey: "BASSLINE"
  },
  {
    id: "ukfunky",
    name: "UK Funky",
    era: "2006–2012",
    color: "#FF6B1A",
    x: 800, y: 130,
    description: "Warmth returned to the underground. Soulful house merged with syncopated Afro-Caribbean soca rhythms, tribal bongo loops, and euphoric vocals.",
    artists: ["Donae'o", "Crazy Cousinz", "Roska", "Lil Silva", "Kyla"],
    genreKey: "UK FUNKY"
  },
  {
    id: "roadrap",
    name: "Road Rap",
    era: "2007–2016",
    color: "#2f2e2e",
    x: 920, y: 130,
    description: "Peckham and Brixton street stories slowed down the tempo. Raw baritone flows, mixtape culture, and heavy sub-bass documenting road realities.",
    artists: ["Giggs", "Blade Brown", "Potter Payper", "Casisdead", "Nines"],
    genreKey: "ROAD RAP"
  },
  {
    id: "ukdrill",
    name: "UK Drill",
    era: "2014–2023",
    color: "#B3001B",
    x: 1040, y: 100,
    description: "South London's sliding 808 glides and brutalist narratives. Chicago's drill blueprints re-engineered for the estates, conquering global charts.",
    artists: ["67", "Harlem Spartans", "Loski", "MizOrMac", "Unknown T"],
    genreKey: "UK DRILL"
  },
  {
    id: "afroswing",
    name: "Afroswing",
    era: "2015–2023",
    color: "#00C2B2",
    x: 1160, y: 100,
    description: "Melodic fusions of British bass weight, West African highlife, and Jamaican dancehall. Joyous, cross-continental diaspora waves.",
    artists: ["J Hus", "Kojo Funds", "Not3s", "Dave", "MoStack"],
    genreKey: "AFROSWING"
  }
];

let activeGenreId = null;
const timelineNodeEls = [];

function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

// Precalculate RGBs for metadata
GENRES_METADATA.forEach(g => {
  g.rgb = hexToRgb(g.color) || "255, 255, 255";
});

function drawTubeLines() {
  const svg = document.getElementById("tube-lines-svg-el");
  if (!svg) return;
  svg.innerHTML = "";

  let pathD = "";
  GENRES_METADATA.forEach((genre, idx) => {
    if (idx === 0) {
      pathD = `M ${genre.x} ${genre.y}`;
    } else {
      const prev = GENRES_METADATA[idx - 1];
      const midX = prev.x + (genre.x - prev.x) / 2;
      pathD += ` Q ${midX} ${genre.y} ${genre.x} ${genre.y}`;
    }
  });

  const glowLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
  glowLine.setAttribute("d", pathD);
  glowLine.setAttribute("fill", "none");
  glowLine.setAttribute("stroke", "#1a202c");
  glowLine.setAttribute("stroke-width", "8");
  glowLine.setAttribute("stroke-linecap", "round");
  glowLine.setAttribute("stroke-linejoin", "round");
  svg.appendChild(glowLine);

  for (let i = 0; i < GENRES_METADATA.length - 1; i++) {
    const start = GENRES_METADATA[i];
    const end = GENRES_METADATA[i + 1];
    const segment = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const midX = start.x + (end.x - start.x) / 2;
    segment.setAttribute("d", `M ${start.x} ${start.y} Q ${midX} ${end.y} ${end.x} ${end.y}`);
    segment.setAttribute("fill", "none");
    segment.setAttribute("stroke", start.color);
    segment.setAttribute("stroke-width", "5");
    segment.setAttribute("stroke-linecap", "round");
    segment.setAttribute("stroke-linejoin", "round");
    svg.appendChild(segment);
  }
}

function initTimelineNodes() {
  const container = document.getElementById("tube-stations-mount");
  if (!container) return;
  container.innerHTML = "";
  timelineNodeEls.length = 0;

  GENRES_METADATA.forEach(genre => {
    const btn = document.createElement("button");
    btn.className = "genre-node-btn";
    btn.style.left = `${genre.x}px`;
    btn.style.top = `${genre.y}px`;

    const rgb = genre.rgb;
    btn.style.setProperty("--genre-color", genre.color);
    btn.style.setProperty("--genre-color-alpha", `rgba(${rgb}, 0.4)`);
    btn.style.setProperty("--genre-color-alpha-light", `rgba(${rgb}, 0.1)`);
    btn.style.setProperty("--genre-color-alpha-heavy", `rgba(${rgb}, 0.2)`);
    btn.style.setProperty("--genre-color-alpha-glow", `rgba(${rgb}, 0.15)`);
    btn.style.setProperty("--genre-color-sticker", `rgba(${rgb}, 0.85)`);

    btn.innerHTML = `
      <div class="genre-node-circle" style="border-color: ${genre.color}; box-shadow: 0 0 10px rgba(${rgb}, 0.45);"></div>
      <div class="genre-node-label">
        <span class="genre-node-name">${genre.name}</span>
        <span class="genre-node-era">${genre.era}</span>
      </div>
    `;

    btn.addEventListener("click", () => {
      handleSelect(genre.id);
    });

    container.appendChild(btn);
    timelineNodeEls.push({ el: btn, genre: genre });
  });
}

function renderTimelineNodes() {
  timelineNodeEls.forEach(item => {
    const isActive = activeGenreId === item.genre.id;
    const isDimmed = activeGenreId !== null && !isActive;
    item.el.classList.toggle("active", isActive);
    item.el.classList.toggle("dimmed", isDimmed);
  });
}

function handleSelect(id) {
  const clearBtn = document.getElementById("clear-signal-footer");

  if (activeGenreId === id) {
    activeGenreId = null;
    if (clearBtn) clearBtn.style.display = "none";
  } else {
    activeGenreId = id;
    if (clearBtn) clearBtn.style.display = "block";
    const g = GENRES_METADATA.find(x => x.id === id);

    // Auto-tune the main radio player
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
  const pulseDot = document.getElementById("radar-pulse");
  const statusText = document.getElementById("radar-status-text");
  if (!pulseDot || !statusText) return;

  if (activeGenreId) {
    const genre = GENRES_METADATA.find(g => g.id === activeGenreId);
    pulseDot.style.background = genre.color;
    pulseDot.style.boxShadow = `0 0 10px ${genre.color}`;
    statusText.innerText = `${genre.name} LINE ACTIVE`;
    statusText.style.color = genre.color;
  } else {
    pulseDot.style.background = "#ff0055";
    pulseDot.style.boxShadow = "0 0 6px #ff0055";
    statusText.innerText = "1992 → PRESENT";
    statusText.style.color = "";
  }
}

function renderInfoPanel() {
  const mount = document.getElementById("info-panel-mount");
  if (!mount) return;
  mount.innerHTML = "";

  if (!activeGenreId) return;

  const genre = GENRES_METADATA.find(g => g.id === activeGenreId);
  const rgb = genre.rgb;

  const panel = document.createElement("div");
  panel.className = "info-panel-container";

  panel.style.setProperty("--genre-color", genre.color);
  panel.style.setProperty("--genre-color-alpha", `rgba(${rgb}, 0.4)`);
  panel.style.setProperty("--genre-color-alpha-heavy", `rgba(${rgb}, 0.2)`);
  panel.style.setProperty("--genre-color-alpha-light", `rgba(${rgb}, 0.1)`);
  panel.style.setProperty("--genre-color-alpha-glow", `rgba(${rgb}, 0.08)`);
  panel.style.setProperty("--genre-color-sticker", `rgba(${rgb}, 0.8)`);

  let tagsHtml = "";
  genre.artists.forEach(a => {
    tagsHtml += `<span class="artist-badge">${a}</span>`;
  });

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
          <span class="info-panel-era">${genre.era} Era</span>
        </div>
        <button class="info-close-btn" id="info-close-trigger">✕ DISCONNECT</button>
      </div>

      <p class="info-description">${genre.description}</p>

      <div class="info-metadata-row">
        <div>
          <span class="artists-label" style="font-family:'Space Mono', monospace; font-size:10px; color:#a0aec0; display:block; margin-bottom:8px; text-transform:uppercase;">KEY OPERATING TRANSMITTERS</span>
          <div class="artists-tags-container" style="display:flex; flex-wrap:wrap; gap:8px;">
            ${tagsHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  panel.querySelector("#info-close-trigger").addEventListener("click", () => {
    handleSelect(genre.id);
  });

  mount.appendChild(panel);
}

function updateTubeMapActiveState(genreName) {
  const matchingGenre = GENRES_METADATA.find(g => g.genreKey === genreName.toUpperCase());
  if (matchingGenre) {
    activeGenreId = matchingGenre.id;
  } else {
    activeGenreId = null;
  }
  renderTimelineNodes();
  renderInfoPanel();
  updateRadarStatus();
}

// ── Boot ──────────────────────────────────────────────────────────────────────

(function init() {
  precalculateColors();
  buildTicker();
  buildControlsPanels();
  buildArchiveCards();
  cacheDOMRefs();
  setupTunerUI();
  wireEvents();

  // Initialize London Tube Line elements
  initTimelineNodes();
  drawTubeLines();

  // Set default station (Jungle)
  const defaultStation = getStationByGenre('JUNGLE') || STATIONS[0];
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

  // Wire clear signal footer button
  const clearBtn = document.getElementById("clear-signal-footer");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (activeGenreId) {
        handleSelect(activeGenreId);
      }
    });
  }
})();
