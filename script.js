const desktop = document.getElementById("desktop");
const template = document.getElementById("window-template");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const taskbar = document.getElementById("taskbar");
const taskbarApps = document.getElementById("taskbar-apps");
const clock = document.getElementById("clock");
const bootScreen = document.getElementById("boot-screen");
const biosLog = document.getElementById("bios-log");
const bootSegments = document.getElementById("boot-progress-segments");
const systemMessage = document.getElementById("system-message");
const systemMessageText = document.getElementById("system-message-text");
const systemMessageClose = document.getElementById("system-message-close");

const musicTracks = [
  { title: "1812 Overture - Tchaikovsky", src: "Music/1812%20Overture%20-%20Tchaikovsky.mp3" },
  { title: "Can Can", src: "Music/Can%20Can.mp3" },
  { title: "Cello Suite No. 1", src: "Music/Cello%20Suite%20No.%201.mp3" },
  { title: "Clair de Lune", src: "Music/Clair%20de%20Lune.mp3" },
  { title: "Eine Kleine Nachtmusik Movement 1", src: "Music/Eine%20Kleine%20Nachtmusik%20Movement%201.mp3" },
  { title: "Fur Elise", src: "Music/Fur%20Elise.mp3" },
  { title: "Lacrimosa", src: "Music/Lacrimosa.mp3" },
  { title: "Nocturne Op. 9 No.2", src: "Music/Nocturne%20Op.%209%20No.2.mp3" },
  { title: "Swan Lake Act 2", src: "Music/Swan%20Lake%20Act%202.mp3" }
];

const statusMessages = [
  "3 AIRCRAFT SELECTED",
  "GATE 4 ACTIVE",
  "MEMORY USAGE: 4MB",
  "RUNWAY FLAG: 0X7A",
  "TERMINAL QUEUE: 12"
];

const fakeErrors = [
  "RunwayControl.exe has performed an unexpected maneuver.",
  "TowerManager.dll failed checksum at sector 03.",
  "GateUtility module did not acknowledge beacon ping.",
  "Radar Control reported an impossible altitude vector."
];

const openWindows = new Map();
let z = 100;
let audioContext;

function ensureAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function beep({ frequency = 440, duration = 0.06, type = "square", volume = 0.03 } = {}) {
  ensureAudio();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function playClickSound() {
  beep({ frequency: 660, duration: 0.04, volume: 0.025 });
}

function playOpenSound() {
  beep({ frequency: 320, duration: 0.05, volume: 0.03 });
  setTimeout(() => beep({ frequency: 430, duration: 0.05, volume: 0.03 }), 35);
}

function playErrorSound() {
  beep({ frequency: 180, duration: 0.08, type: "sawtooth", volume: 0.04 });
}

function playStartupChime() {
  beep({ frequency: 260, duration: 0.09, volume: 0.025 });
  setTimeout(() => beep({ frequency: 390, duration: 0.08, volume: 0.025 }), 90);
  setTimeout(() => beep({ frequency: 520, duration: 0.08, volume: 0.025 }), 180);
}

function pickRandomTrackIndex() {
  return Math.floor(Math.random() * musicTracks.length);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function createMusicPlayer() {
  const wrapper = document.createElement("section");
  wrapper.className = "winamp-player";

  let currentTrackIndex = pickRandomTrackIndex();
  let shuffleMode = false;
  let loopMode = false;

  wrapper.innerHTML = `
    <div class="winamp-display" aria-live="polite">
      <p class="winamp-track">TRACK: --</p>
      <p class="winamp-time">0:00 / 0:00</p>
    </div>
    <div class="winamp-progress-wrap">
      <input class="winamp-progress" type="range" min="0" max="100" value="0" aria-label="Song progress" />
    </div>
    <div class="winamp-controls" role="group" aria-label="Player controls">
      <button type="button" data-action="prev">PREV</button>
      <button type="button" data-action="play">PLAY</button>
      <button type="button" data-action="pause">PAUSE</button>
      <button type="button" data-action="stop">STOP</button>
      <button type="button" data-action="next">NEXT</button>
    </div>
    <div class="winamp-controls winamp-controls-secondary" role="group" aria-label="Extended controls">
      <button type="button" data-action="rew">REW</button>
      <button type="button" data-action="ff">FF</button>
      <button type="button" data-action="shuffle">SHUF OFF</button>
      <button type="button" data-action="loop">LOOP OFF</button>
      <button type="button" data-action="mute">MUTE</button>
    </div>
    <div class="winamp-meta-grid">
      <p class="winamp-stat">QUEUE: <span class="winamp-queue">1 / ${musicTracks.length}</span></p>
      <p class="winamp-stat">MODE: <span class="winamp-mode">LINEAR</span></p>
      <p class="winamp-stat">VOL: <span class="winamp-volume-readout">80%</span></p>
      <label class="winamp-volume-wrap">LEVEL
        <input class="winamp-volume" type="range" min="0" max="100" value="80" aria-label="Volume" />
      </label>
    </div>
    <p class="winamp-hint">MODULE: AUDIO UTILITY / ARCHIVE CHANNEL</p>
  `;

  const audio = document.createElement("audio");
  audio.preload = "metadata";
  audio.volume = 0.8;

  const trackEl = wrapper.querySelector(".winamp-track");
  const timeEl = wrapper.querySelector(".winamp-time");
  const progressEl = wrapper.querySelector(".winamp-progress");
  const queueEl = wrapper.querySelector(".winamp-queue");
  const modeEl = wrapper.querySelector(".winamp-mode");
  const volumeReadoutEl = wrapper.querySelector(".winamp-volume-readout");
  const volumeEl = wrapper.querySelector(".winamp-volume");
  const shuffleButton = wrapper.querySelector('[data-action="shuffle"]');
  const loopButton = wrapper.querySelector('[data-action="loop"]');
  const muteButton = wrapper.querySelector('[data-action="mute"]');

  const syncUI = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    progressEl.value = String(duration > 0 ? (current / duration) * 100 : 0);
    timeEl.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    queueEl.textContent = `${currentTrackIndex + 1} / ${musicTracks.length}`;
    modeEl.textContent = shuffleMode ? "SHUFFLE" : loopMode ? "LOOP ONE" : "LINEAR";
    volumeReadoutEl.textContent = `${Math.round(audio.volume * 100)}%${audio.muted ? " M" : ""}`;
  };

  const loadTrack = (index, autoplay = false) => {
    const normalized = (index + musicTracks.length) % musicTracks.length;
    currentTrackIndex = normalized;
    const track = musicTracks[normalized];
    trackEl.textContent = `TRACK: ${track.title}`;
    audio.src = track.src;
    audio.load();
    syncUI();
    if (autoplay) {
      audio.play();
    }
  };

  const nextTrack = (autoplay = true) => {
    const index = shuffleMode ? pickRandomTrackIndex() : currentTrackIndex + 1;
    loadTrack(index, autoplay);
  };

  const previousTrack = () => {
    const index = shuffleMode ? pickRandomTrackIndex() : currentTrackIndex - 1;
    loadTrack(index, true);
  };

  wrapper.querySelector('[data-action="play"]').addEventListener("click", () => {
    playClickSound();
    audio.play();
  });

  wrapper.querySelector('[data-action="pause"]').addEventListener("click", () => {
    playClickSound();
    audio.pause();
  });

  wrapper.querySelector('[data-action="stop"]').addEventListener("click", () => {
    playClickSound();
    audio.pause();
    audio.currentTime = 0;
    syncUI();
  });

  wrapper.querySelector('[data-action="next"]').addEventListener("click", () => {
    playClickSound();
    nextTrack(true);
  });

  wrapper.querySelector('[data-action="prev"]').addEventListener("click", () => {
    playClickSound();
    previousTrack();
  });

  wrapper.querySelector('[data-action="rew"]').addEventListener("click", () => {
    playClickSound();
    audio.currentTime = Math.max(0, audio.currentTime - 10);
    syncUI();
  });

  wrapper.querySelector('[data-action="ff"]').addEventListener("click", () => {
    playClickSound();
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
    syncUI();
  });

  shuffleButton.addEventListener("click", () => {
    playClickSound();
    shuffleMode = !shuffleMode;
    shuffleButton.textContent = shuffleMode ? "SHUF ON" : "SHUF OFF";
    if (shuffleMode) {
      loopMode = false;
      loopButton.textContent = "LOOP OFF";
    }
    syncUI();
  });

  loopButton.addEventListener("click", () => {
    playClickSound();
    loopMode = !loopMode;
    loopButton.textContent = loopMode ? "LOOP ON" : "LOOP OFF";
    if (loopMode) {
      shuffleMode = false;
      shuffleButton.textContent = "SHUF OFF";
    }
    syncUI();
  });

  muteButton.addEventListener("click", () => {
    playClickSound();
    audio.muted = !audio.muted;
    muteButton.textContent = audio.muted ? "UNMUTE" : "MUTE";
    syncUI();
  });

  progressEl.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration === 0) return;
    audio.currentTime = (Number(progressEl.value) / 100) * audio.duration;
  });

  volumeEl.addEventListener("input", () => {
    audio.volume = Number(volumeEl.value) / 100;
    if (audio.volume > 0 && audio.muted) {
      audio.muted = false;
      muteButton.textContent = "MUTE";
    }
    syncUI();
  });

  audio.addEventListener("timeupdate", syncUI);
  audio.addEventListener("loadedmetadata", syncUI);
  audio.addEventListener("ended", () => {
    if (loopMode) {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    nextTrack(true);
  });

  loadTrack(currentTrackIndex, false);
  wrapper.append(audio);
  return wrapper;
}

const appDefs = {
  systems: {
    title: "AIRPORT CONTROL PANEL",
    status: "3 AIRCRAFT SELECTED",
    render: () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <p><strong>TERMINAL CONTROL SYSTEMS</strong></p>
        <p>FLIGHT ID: AC-2041 | GATE: 4 | FLAG: CLR</p>
        <p>FLIGHT ID: BR-0912 | GATE: 7 | FLAG: HOLD</p>
        <p>FLIGHT ID: VX-5503 | GATE: 2 | FLAG: TAXI</p>
        <label><input type="checkbox" checked /> AUTO-BALANCE RUNWAY LOAD</label>
        <br />
        <label><input type="checkbox" /> ENABLE NIGHT DIAGNOSTICS</label>
      `;
      return wrapper;
    }
  },
  hangar: {
    title: "HANGAR MANAGER",
    status: "GATE 4 ACTIVE",
    render: () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <p><strong>MAINTENANCE MODULE</strong></p>
        <p>BAY A1: SERVICE FLAG 0x03</p>
        <p>BAY B2: SERVICE FLAG 0x01</p>
        <p>BAY C3: SERVICE FLAG 0x08</p>
        <label><input type="checkbox" checked /> ENABLE TOOL INVENTORY</label>
      `;
      return wrapper;
    }
  },
  radar: {
    title: "RADAR CONTROL",
    status: "MEMORY USAGE: 4MB",
    render: () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <p><strong>TRANSPONDER DIAGNOSTICS</strong></p>
        <p>SECTOR N2 | TARGETS: 19 | CPU: 42%</p>
        <p>SECTOR E1 | TARGETS: 11 | CPU: 38%</p>
        <p>SECTOR S4 | TARGETS: 23 | CPU: 57%</p>
        <label><input type="checkbox" checked /> FILTER GROUND TRAFFIC</label>
      `;
      return wrapper;
    }
  },
  runway: {
    title: "RUNWAY MONITOR",
    status: "RUNWAY FLAG: 0X7A",
    render: () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <p><strong>RUNWAY QUEUE UTILITY</strong></p>
        <p>R1: AC-2041 READY</p>
        <p>R2: VX-5503 HOLD SHORT</p>
        <p>R3: BR-0912 TAXIING</p>
        <label><input type="checkbox" /> ENABLE EMERGENCY CHANNEL</label>
      `;
      return wrapper;
    }
  },
  archive: {
    title: "ARCHIVE TERMINAL",
    status: "TERMINAL QUEUE: 12",
    render: () => createMusicPlayer()
  }
};

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function refreshTaskbarState() {
  openWindows.forEach(({ window, taskButton }) => {
    taskButton.classList.toggle("active", window.classList.contains("active") && !window.classList.contains("hidden"));
  });
}

function focusWindow(win) {
  document.querySelectorAll(".window").forEach((w) => w.classList.remove("active"));
  win.classList.add("active");
  z += 1;
  win.style.zIndex = String(z);
  refreshTaskbarState();
}

function createTaskbarButton(title, windowEl) {
  const button = document.createElement("button");
  button.className = "taskbar-app";
  button.textContent = title;
  button.title = "Toggle module window";
  button.addEventListener("click", () => {
    playClickSound();
    const hidden = windowEl.classList.toggle("hidden");
    if (!hidden) {
      focusWindow(windowEl);
    } else {
      windowEl.classList.remove("active");
      refreshTaskbarState();
    }
  });
  taskbarApps.append(button);
  return button;
}

function makeDraggable(windowEl, dragHandle) {
  let active = false;
  let offsetX = 0;
  let offsetY = 0;

  dragHandle.addEventListener("pointerdown", (event) => {
    active = true;
    focusWindow(windowEl);
    const rect = windowEl.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    dragHandle.setPointerCapture(event.pointerId);
  });

  dragHandle.addEventListener("pointermove", (event) => {
    if (!active) return;
    windowEl.style.left = `${Math.max(0, event.clientX - offsetX)}px`;
    windowEl.style.top = `${Math.max(0, event.clientY - offsetY)}px`;
  });

  dragHandle.addEventListener("pointerup", (event) => {
    active = false;
    dragHandle.releasePointerCapture(event.pointerId);
  });
}

function openApp(appId) {
  if (openWindows.has(appId)) {
    const existing = openWindows.get(appId);
    existing.window.classList.remove("hidden");
    focusWindow(existing.window);
    return;
  }

  const definition = appDefs[appId];
  if (!definition) {
    playErrorSound();
    return;
  }

  const windowEl = template.content.firstElementChild.cloneNode(true);
  const titleEl = windowEl.querySelector(".window-title");
  const headerEl = windowEl.querySelector(".window-header");
  const contentEl = windowEl.querySelector(".window-content");
  const statusEl = windowEl.querySelector(".window-status");
  const closeButton = windowEl.querySelector(".close");
  const minimizeButton = windowEl.querySelector(".minimize");
  const maximizeButton = windowEl.querySelector(".maximize");

  titleEl.textContent = definition.title;
  contentEl.append(definition.render());
  statusEl.textContent = definition.status || statusMessages[Math.floor(Math.random() * statusMessages.length)];

  windowEl.style.left = `${80 + openWindows.size * 22 + Math.floor(Math.random() * 6)}px`;
  windowEl.style.top = `${36 + openWindows.size * 18 + Math.floor(Math.random() * 6)}px`;

  makeDraggable(windowEl, headerEl);
  windowEl.addEventListener("pointerdown", () => focusWindow(windowEl));

  const taskButton = createTaskbarButton(definition.title, windowEl);

  closeButton.addEventListener("click", () => {
    playClickSound();
    windowEl.querySelectorAll("audio").forEach((audioEl) => {
      audioEl.pause();
      audioEl.currentTime = 0;
    });
    taskButton.remove();
    windowEl.remove();
    openWindows.delete(appId);
    refreshTaskbarState();
  });

  minimizeButton.addEventListener("click", () => {
    playClickSound();
    windowEl.classList.add("hidden");
    windowEl.classList.remove("active");
    refreshTaskbarState();
  });

  maximizeButton.addEventListener("click", () => {
    playClickSound();
    const maximized = windowEl.dataset.maximized === "true";
    if (maximized) {
      windowEl.style.left = windowEl.dataset.prevLeft;
      windowEl.style.top = windowEl.dataset.prevTop;
      windowEl.style.width = windowEl.dataset.prevWidth;
      windowEl.style.height = windowEl.dataset.prevHeight;
      windowEl.dataset.maximized = "false";
      return;
    }
    windowEl.dataset.prevLeft = windowEl.style.left;
    windowEl.dataset.prevTop = windowEl.style.top;
    windowEl.dataset.prevWidth = windowEl.style.width || "";
    windowEl.dataset.prevHeight = windowEl.style.height || "";
    windowEl.style.left = "0px";
    windowEl.style.top = "0px";
    windowEl.style.width = "calc(100vw - 4px)";
    windowEl.style.height = "calc(100vh - 32px)";
    windowEl.dataset.maximized = "true";
  });

  setTimeout(() => {
    desktop.append(windowEl);
    openWindows.set(appId, { window: windowEl, taskButton });
    focusWindow(windowEl);
    playOpenSound();
  }, 80 + Math.floor(Math.random() * 80));
}

function toggleStartMenu(force) {
  const shouldOpen = force ?? startMenu.classList.contains("hidden");
  startMenu.classList.toggle("hidden", !shouldOpen);
  startButton.setAttribute("aria-expanded", String(shouldOpen));
}

function showRandomSystemMessage() {
  if (!systemMessage.classList.contains("hidden")) return;
  if (Math.random() > 0.015) return;
  systemMessageText.textContent = fakeErrors[Math.floor(Math.random() * fakeErrors.length)];
  systemMessage.classList.remove("hidden");
  playErrorSound();
}

function bootSequence() {
  for (let i = 0; i < 20; i += 1) {
    const seg = document.createElement("span");
    seg.className = "boot-seg";
    bootSegments.append(seg);
  }

  let memory = 0;
  let segCount = 0;
  const bootTimer = setInterval(() => {
    memory += Math.floor(Math.random() * 180 + 120);
    biosLog.textContent = `AIRPORTOS BIOS v1.96\nCPU: TERMINAL CONTROL UNIT\nMEMORY TEST: ${String(memory).padStart(4, "0")} KB\nDETECTING DRIVES... OK\nINITIALIZING AIRPORTOS...`;

    const segments = bootSegments.querySelectorAll(".boot-seg");
    if (segCount < segments.length) {
      segments[segCount].classList.add("on");
      segCount += 1;
    }

    if (segCount >= segments.length) {
      clearInterval(bootTimer);
      setTimeout(() => {
        bootScreen.classList.add("hidden");
        desktop.classList.remove("hidden");
        taskbar.classList.remove("hidden");
        playStartupChime();
      }, 220);
    }
  }, 90);
}

updateClock();
setInterval(updateClock, 1000);
setInterval(showRandomSystemMessage, 4000);
bootSequence();

document.querySelectorAll(".desktop-icon").forEach((button) => {
  button.addEventListener("dblclick", () => {
    playClickSound();
    openApp(button.dataset.app);
  });
});

document.querySelectorAll(".start-menu [data-app]").forEach((button) => {
  button.addEventListener("click", () => {
    playClickSound();
    openApp(button.dataset.app);
    toggleStartMenu(false);
  });
});

document.querySelectorAll("[data-theme]").forEach((button) => {
  button.addEventListener("click", () => {
    playClickSound();
    document.body.setAttribute("data-theme", button.dataset.theme);
  });
});

startButton.addEventListener("click", () => {
  playClickSound();
  toggleStartMenu();
});

systemMessageClose.addEventListener("click", () => {
  playClickSound();
  systemMessage.classList.add("hidden");
});

document.addEventListener("pointerdown", (event) => {
  if (!startMenu.contains(event.target) && event.target !== startButton) {
    toggleStartMenu(false);
  }
});
