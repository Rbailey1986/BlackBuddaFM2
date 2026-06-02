// ─────────────────────────────────────────────────────────────────────────────
// BlackBuddaFM — app.js
// STATIONS is loaded from stations-data.js (single source of truth)
// ─────────────────────────────────────────────────────────────────────────────

const MIN_FREQ = 88.9;
const MAX_FREQ = 109.8;

// ── Helper: station lookups ───────────────────────────────────────────────────

function getStationByGenre(genre) {
  return STATIONS.find(s => s.genre === genre) || null;
}

function getStationByFreq(freq) {
  return STATIONS.find(s => s.freq === freq) || null;
}

function getNearestStation(freq) {
  return STATIONS.reduce((nearest, s) => {
    return Math.abs(s.freq - freq) < Math.abs(nearest.freq - freq) ? s : nearest;
  });
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

// ── Helper: CSS custom property theming ──────────────────────────────────────
// Bridges per-station color data onto :root so every CSS rule picks it up

function applyStationTheme(station) {
  const r = document.documentElement.style;
  r.setProperty('--surface-lowest', station.colors.surfaceLowest);
  r.setProperty('--surface-low', station.colors.surfaceLow);
}

// ── Build ticker from STATIONS data (no hardcoded duplication) ───────────────

function buildTicker() {
  const ticker = document.getElementById('ticker');
  if (!ticker) return;
  const items = [
    'BLACK BUDDHA FM',
    ...STATIONS.map(s => `EP ${s.epNum} \u2014 ${s.genre}: ${s.title.split('\u2013')[1]?.trim() || s.subtitle}`),
    '30 YEARS OF BLACK BRITISH MUSIC'
  ];
  // Duplicate for seamless loop (CSS animation goes -50%)
  const html = [...items, ...items].map(t => `<span>${t}</span>`).join('');
  ticker.innerHTML = html;
}

// ── Build archive cards from STATIONS data ───────────────────────────────────

function buildArchiveCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  // Show only stations that have a cardImg defined
  const withCards = STATIONS.filter(s => s.cardImg);
  withCards.forEach((station, i) => {
    const rotations = [-2, 1.5, -1, 2.5];
    const rot = rotations[i % rotations.length];
    const card = document.createElement('div');
    card.className = 'capture-card';
    card.style.transform = `rotate(${rot}deg)`;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-img-wrap">
          <img src="${station.cardImg}" alt="${station.genre}" loading="lazy">
          <div class="genre-sticker">${station.genre}</div>
        </div>
        <div class="card-footer">
          <span class="card-ep">${station.cardEp}</span>
          <span class="card-date">${station.cardDate}</span>
        </div>
      </div>`;
    card.addEventListener('click', () => {
      initAudio();
      if (audioCtx) audioCtx.resume();
      animateTunerTo(station.freq);
      document.getElementById('player').scrollIntoView({ behavior: 'smooth' });
    });
    grid.appendChild(card);
  });
}

// ── Build controls panels (parts 1–3) from template ──────────────────────────

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

// ── DOM refs (cached after panels are injected) ───────────────────────────────

let DOM = {};

function cacheDOMRefs() {
  DOM = {
    tunerDisplay:    document.getElementById('tuner-display'),
    tunerNeedle:     document.getElementById('tuner-needle'),
    tunerStrength:   document.getElementById('tuner-strength'),
    signalBadgeText: document.getElementById('signal-badge-text'),
    vinylImg:        document.getElementById('vinyl-img'),
    heroBayPlayBtn:  document.getElementById('hero-play-btn'),
    epTitle:         document.getElementById('ep-title'),
    epSubtitle:      document.getElementById('ep-subtitle'),
    epDesc:          document.getElementById('ep-desc'),
    epBadge:         document.getElementById('ep-badge'),
    statLength:      document.getElementById('stat-length'),
    statGenre:       document.getElementById('stat-genre'),
    statLocation:    document.getElementById('stat-location'),
    monitorTitle:    document.getElementById('monitor-title'),
    monitorDuration: document.getElementById('monitor-duration'),
    monitorFreq:     document.getElementById('monitor-freq'),
    tracklistPanel:  document.getElementById('tracklist-panel'),
    tracklistList:   document.getElementById('tracklist-list'),
    tracklistTabs:   document.querySelectorAll('.tracklist-tab'),
    tabPt3:          document.getElementById('tab-pt3'),
    controlsPart3:   document.getElementById('controls-part3'),
    progSignals:     [null, document.getElementById('prog-signal-1'), document.getElementById('prog-signal-2'), document.getElementById('prog-signal-3')],
    playBtns:        [null, document.getElementById('play-btn-1'), document.getElementById('play-btn-2'), document.getElementById('play-btn-3')],
    timeDisplays:    [null, document.getElementById('time-1'), document.getElementById('time-2'), document.getElementById('time-3')],
    fills:           [null, document.getElementById('fill-1'), document.getElementById('fill-2'), document.getElementById('fill-3')],
    gainKnob:        document.getElementById('gain-knob'),
    knobLine:        document.getElementById('knob-line'),
    recFlicker:      document.querySelector('.rec-row .flicker'),
    heroBars:        document.querySelectorAll('#hero-wave .wave-bar'),
    monitorBars:     document.querySelectorAll('#monitor-bars .green-bar'),
    stationMarks:    null // populated after setupTunerUI
  };
}

// ── State ─────────────────────────────────────────────────────────────────────

let currentFreq    = 93.5; // default: UK Garage
let isDragging     = false;
let activeStation  = null;
let lastActiveStation = null;
let currentPart    = 1;
let selectedTracklistPart = 1;

let volumeFactor   = 0.8;
let staticFactor   = 0.06;
let currentBand    = 'FM';
let currentMode    = 'STEREO';

// ── Web Audio ─────────────────────────────────────────────────────────────────

let audioCtx           = null;
let audioEl            = null;
let audioSource        = null;
let staticNode         = null;
let staticGain         = null;
let musicGain          = null;
let filterNode         = null;
let analyserNode       = null;
let isAudioInitialized = false;

// SVG paths for play/pause (constants, not rebuilt on every call)
const SVG_PLAY  = '<path d="M8 5v14l11-7z"/>';
const SVG_PAUSE = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

function initAudio() {
  if (isAudioInitialized) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioEl  = new Audio();
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

  // White-noise buffer for FM static
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

  audioEl.addEventListener('play', startProgressLoop);
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
  const ticksContainer    = document.getElementById('tuner-ticks');
  const stationsContainer = document.getElementById('tuner-stations-container');

  // Tick marks
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

  // Station labels
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

  // Cache marks ref now that they exist
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

  // Find nearest station
  let nearest  = null;
  let minDiff  = Infinity;
  STATIONS.forEach(s => {
    const d = Math.abs(currentFreq - s.freq);
    if (d < minDiff) { minDiff = d; nearest = s; }
  });

  // Proximity-based volume/static
  let volume = 0, staticVol = 1.0, filterFreq = 20000;
  if (minDiff < 1.5) {
    activeStation = nearest;
    const ratio = minDiff / 1.5;
    volume      = Math.max(0, 1 - ratio);
    staticVol   = ratio;
    filterFreq  = 300 + (1 - ratio) * 19700;
  } else {
    activeStation = null;
    staticVol = 1.0;
    filterFreq = 300;
  }

  // Station changed — update UI + audio source
  let stationChanged = false;
  if (activeStation && activeStation !== lastActiveStation) {
    lastActiveStation = activeStation;
    updateUIForStation(activeStation);
    stationChanged = true;
  } else if (!activeStation) {
    lastActiveStation = null;
  }

  // Audio node updates
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
  }

  // Update dial highlights using cached refs
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
}

function setSignalStatus(text, color) {
  // Update all three prog-signal spans
  for (let i = 1; i <= 3; i++) {
    const el = DOM.progSignals[i];
    if (el) { el.textContent = text; el.style.color = color; }
  }
}

// ── Part progress UI helpers ──────────────────────────────────────────────────

function resetPartProgressUI(partNum) {
  if (DOM.fills[partNum])        DOM.fills[partNum].style.width = '0%';
  if (DOM.timeDisplays[partNum] && activeStation) {
    const dur = activeStation[`duration${partNum}`] || '00:00';
    DOM.timeDisplays[partNum].textContent = `00:00 / ${dur}`;
  }
}

// ── Full UI update for a station ──────────────────────────────────────────────

function updateUIForStation(station) {
  // Apply CSS theme colors to :root (bridges entire page)
  applyStationTheme(station);

  // Apply episodic body theme class
  document.body.className = document.body.className
    .split(' ')
    .filter(c => !c.startsWith('theme-ep'))
    .join(' ');
  document.body.classList.add(`theme-ep${station.epNum}`);

  // Header / hero
  DOM.signalBadgeText.textContent = `SIGNAL: ${station.freq.toFixed(1)} FM`;
  DOM.monitorTitle.textContent = station.genre;
  DOM.monitorDuration.textContent = station.duration1;
  DOM.monitorFreq.textContent = `${station.freq.toFixed(1)} FM`;

  // Player left
  DOM.statLength.textContent   = station.duration1;
  DOM.statGenre.textContent    = station.genre;
  DOM.statLocation.textContent = station.location;

  // Player center
  DOM.epTitle.textContent    = station.title;
  DOM.epSubtitle.textContent = station.subtitle;
  DOM.epDesc.textContent     = station.desc;

  // Player right
  DOM.vinylImg.src = station.vinylImg;
  DOM.epBadge.textContent = `EP ${station.genre} LIVE`;

  // Progress displays
  if (DOM.timeDisplays[1]) DOM.timeDisplays[1].textContent = `00:00 / ${station.duration1}`;
  if (DOM.timeDisplays[2]) DOM.timeDisplays[2].textContent = `00:00 / ${station.duration2}`;
  if (DOM.fills[1]) DOM.fills[1].style.width = '0%';
  if (DOM.fills[2]) DOM.fills[2].style.width = '0%';

  // Show/hide Part 3
  const hasPart3 = !!(station.duration3 && station.tracks3);
  if (DOM.controlsPart3) DOM.controlsPart3.style.display = hasPart3 ? 'flex' : 'none';
  if (DOM.tabPt3)        DOM.tabPt3.style.display        = hasPart3 ? 'block' : 'none';
  if (hasPart3 && DOM.timeDisplays[3]) DOM.timeDisplays[3].textContent = `00:00 / ${station.duration3}`;
  if (DOM.fills[3]) DOM.fills[3].style.width = '0%';

  // Clear tracklist
  DOM.tracklistList.innerHTML = '';
  DOM.tracklistTabs.forEach(t => t.classList.remove('active'));
}

// ── Tracklist renderer ────────────────────────────────────────────────────────

function renderTracklistForPart(partNum) {
  if (!activeStation) return;
  selectedTracklistPart = partNum;

  DOM.tracklistTabs.forEach(tab => {
    tab.classList.toggle('active', parseInt(tab.getAttribute('data-part')) === partNum);
  });

  const tracks = activeStation[`tracks${partNum}`];
  DOM.tracklistList.innerHTML = '';

  if (tracks && tracks.length) {
    tracks.forEach((tr, idx) => {
      const li = document.createElement('li');
      li.className = 'tracklist-item';
      li.innerHTML = `<span class="track-num">${String(idx + 1).padStart(2, '0')}</span>
        <span class="track-title">${tr.title}</span>
        ${tr.note ? `<span class="track-note">${tr.note}</span>` : ''}`;
      DOM.tracklistList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.className = 'tracklist-empty';
    li.textContent = 'NO TRANSMISSION LOG FOR THIS SEGMENT.';
    DOM.tracklistList.appendChild(li);
  }
}

// ── Playback ──────────────────────────────────────────────────────────────────

function playPart(partNum) {
  initAudio();
  if (audioCtx) audioCtx.resume();

  if (!activeStation) {
    activeStation = getStationByGenre('UK GARAGE');
    currentFreq = activeStation.freq;
    renderTuningState();
  }

  const targetUrl = activeStation[`trackUrl${partNum}`];
  if (!targetUrl) return;

  const targetAbsUrl = new URL(targetUrl, location.href).href;
  if (currentPart !== partNum || audioEl.src !== targetAbsUrl) {
    // Reset old part progress
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
  // Update part play buttons (swap SVG path only — no string rebuild)
  for (let i = 1; i <= 3; i++) {
    const btn = DOM.playBtns[i];
    if (!btn) continue;
    const svg = btn.querySelector('svg');
    if (svg) svg.innerHTML = (isPlaying && currentPart === i) ? SVG_PAUSE : SVG_PLAY;
  }

  // Hero button
  if (DOM.heroBayPlayBtn) {
    const svg = DOM.heroBayPlayBtn.querySelector('svg');
    if (svg) svg.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;
    const textNode = DOM.heroBayPlayBtn.childNodes[DOM.heroBayPlayBtn.childNodes.length - 1];
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = isPlaying ? ' PAUSE TRANSMISSION' : ' LISTEN TO LATEST BROADCAST';
    }
  }

  // Vinyl spin
  if (DOM.vinylImg) {
    DOM.vinylImg.classList.toggle('spinning', isPlaying);
    DOM.vinylImg.classList.toggle('paused', !isPlaying);
  }

  // Rec indicator
  if (DOM.recFlicker) {
    DOM.recFlicker.style.animationPlayState = isPlaying ? 'running' : 'paused';
  }
}

// ── RAF-based progress loop (only runs while audio is playing) ────────────────

let progressRafId = null;

function startProgressLoop() {
  if (progressRafId) return;
  const tick = () => {
    if (!audioEl || audioEl.paused) {
      progressRafId = null;
      return;
    }
    const elapsed = audioEl.currentTime;
    const durStr  = (activeStation && activeStation[`duration${currentPart}`]) || '00:00';
    const dur     = audioEl.duration || parseDuration(durStr);
    const pct     = (elapsed / dur) * 100;

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

function startVisualizer() {
  document.getElementById('hero-wave')?.classList.add('active-visualizer');

  const miniBarSets = [
    document.querySelectorAll('#mini-wave-1 .mini-bar'),
    document.querySelectorAll('#mini-wave-2 .mini-bar'),
    document.querySelectorAll('#mini-wave-3 .mini-bar')
  ];
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray    = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyserNode.getByteFrequencyData(dataArray);
    const playing   = audioEl && !audioEl.paused;
    const staticVol = staticGain ? staticGain.gain.value : 0;

    if (!playing && staticVol === 0) {
      decayBars(DOM.heroBars);
      decayBars(DOM.monitorBars);
      miniBarSets.forEach(decayBars);
      return;
    }

    updateBars(DOM.heroBars,    dataArray, 0,  8);
    updateBars(DOM.monitorBars, dataArray, 4,  12);
    const activeMini = miniBarSets[currentPart - 1];
    if (activeMini) updateBars(activeMini, dataArray, 8, 16);
  }
  draw();
}

function updateBars(bars, dataArray, startBin, endBin) {
  if (!bars || !bars.length) return;
  const count      = bars.length;
  const binsPerBar = Math.max(1, Math.floor((endBin - startBin) / count));
  bars.forEach((bar, idx) => {
    let sum = 0;
    const binStart = startBin + idx * binsPerBar;
    for (let i = 0; i < binsPerBar; i++) sum += dataArray[binStart + i] || 0;
    bar.style.height = (5 + (sum / binsPerBar / 255) * 93) + '%';
  });
}

function decayBars(bars) {
  if (!bars || !bars.length) return;
  bars.forEach(bar => {
    const cur = parseFloat(bar.style.height) || 5;
    if (cur > 5) bar.style.height = (cur - 1.5) + '%';
  });
}

// ── Tuner drag (mouse + touch) ────────────────────────────────────────────────

function updateNeedlePosition(clientX) {
  const rect = DOM.tunerDisplay.getBoundingClientRect();
  const pct  = ((clientX - rect.left) / rect.width) * 100;
  currentFreq = Math.round(percentToFreq(pct) * 10) / 10;
  renderTuningState();
}

// ── Volume knob (mouse + touch) ───────────────────────────────────────────────

let isAdjustingVolume = false;
let volumeStartY      = 0;
let volumeRotation    = 45;

function applyKnobDelta(dy) {
  volumeRotation += dy * 2.5;
  volumeRotation = Math.max(-135, Math.min(135, volumeRotation));
  DOM.knobLine.style.transform = `rotate(${volumeRotation}deg)`;
  volumeFactor = (volumeRotation + 135) / 270;

  if (isAudioInitialized && activeStation) {
    const diff  = Math.abs(currentFreq - activeStation.freq);
    const ratio = diff / 1.5;
    const vol   = diff < 1.5 ? Math.max(0, 1 - ratio) : 0;
    musicGain.gain.setTargetAtTime(vol * volumeFactor, audioCtx.currentTime, 0.05);
  }
}



// ── Wire event listeners ──────────────────────────────────────────────────────

function wireEvents() {
  // Tuner drag — mouse
  DOM.tunerDisplay.addEventListener('mousedown', e => {
    isDragging = true;
    initAudio();
    if (audioCtx) audioCtx.resume();
    updateNeedlePosition(e.clientX);
  });
  window.addEventListener('mousemove', e => { if (isDragging) updateNeedlePosition(e.clientX); });
  window.addEventListener('mouseup',   ()  => { isDragging = false; });

  // Tuner drag — touch
  DOM.tunerDisplay.addEventListener('touchstart', e => {
    isDragging = true;
    initAudio();
    if (audioCtx) audioCtx.resume();
    updateNeedlePosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => { if (isDragging) updateNeedlePosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend',  ()  => { isDragging = false; });

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

  // Play buttons
  for (let i = 1; i <= 3; i++) {
    const btn = DOM.playBtns[i];
    if (btn) btn.addEventListener('click', () => playPart(i));
  }
  if (DOM.heroBayPlayBtn) DOM.heroBayPlayBtn.addEventListener('click', togglePlay);

  // Band buttons
  document.getElementById('band-group')?.querySelectorAll('.btn-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      initAudio(); if (audioCtx) audioCtx.resume();
      document.getElementById('band-group').querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active-green'));
      btn.classList.add('active-green');
      currentBand = btn.textContent.trim();
      renderTuningState();
    });
  });

  // Mode buttons
  document.getElementById('mode-group')?.querySelectorAll('.btn-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      initAudio(); if (audioCtx) audioCtx.resume();
      document.getElementById('mode-group').querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active-pink'));
      btn.classList.add('active-pink');
      currentMode = btn.textContent.trim();
    });
  });

  // Tracklist tabs
  DOM.tracklistTabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.stopPropagation();
      renderTracklistForPart(parseInt(tab.getAttribute('data-part')));
    });
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

(function init() {
  buildTicker();
  buildControlsPanels();
  buildArchiveCards();
  cacheDOMRefs();
  setupTunerUI();
  wireEvents();

  // Toggle tracklist visibility on heading click
  const tracklistHeading = document.querySelector('.tracklist-heading');
  const tracklistPanel = document.getElementById('tracklist-panel');
  if (tracklistHeading && tracklistPanel) {
    tracklistHeading.addEventListener('click', () => {
      tracklistPanel.classList.toggle('collapsed');
    });
  }

  // Set default station (Jungle)
  const defaultStation = getStationByGenre('JUNGLE') || STATIONS[0];
  activeStation = defaultStation;
  lastActiveStation = defaultStation;
  currentFreq = defaultStation.freq;
  updateUIForStation(defaultStation);

  // Position needle
  DOM.tunerNeedle.style.left = freqToPercent(defaultStation.freq) + '%';

  // Mark default tuner station active
  document.querySelectorAll('.tuner-station-mark').forEach(mark => {
    if (parseFloat(mark.getAttribute('data-freq')) === defaultStation.freq) {
      mark.classList.add('active');
    }
  });
})();
