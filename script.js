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
  { title: "1812 Overture — Tchaikovsky", src: "Music/1812%20Overture%20-%20Tchaikovsky.mp3" },
  { title: "Can-Can", src: "Music/Can%20Can.mp3" },
  { title: "Cello Suite No. 1", src: "Music/Cello%20Suite%20No.%201.mp3" },
  { title: "Clair de Lune", src: "Music/Clair%20de%20Lune.mp3" },
  { title: "Eine kleine Nachtmusik (Movement 1)", src: "Music/Eine%20Kleine%20Nachtmusik%20Movement%201.mp3" },
  { title: "Für Elise", src: "Music/Fur%20Elise.mp3" },
  { title: "Lacrimosa", src: "Music/Lacrimosa.mp3" },
  { title: "Nocturne, Op. 9 No. 2", src: "Music/Nocturne%20Op.%209%20No.2.mp3" },
  { title: "Swan Lake (Act 2)", src: "Music/Swan%20Lake%20Act%202.mp3" },
  { title: "Turkish March (Mozart)", src: "Music/Turkish%20March%20%28Mozart%20Version%29.mp3" },
  { title: "Arabesque No. 1 in E Major", src: "Music/arabesque-l-66-no-1-in-e-major.mp3" },
  { title: "Gnossienne No. 1", src: "Music/gnossienne-no-1.mp3" },
  { title: "Gymnopédie No. 1", src: "Music/gymnopedie-no-1-satie.mp3" },
  { title: "Isle of the Dead", src: "Music/isle-of-the-dead.mp3" },
  { title: "Symphony No. 6 (Pathétique) — Finale", src: "Music/iv-finale-symphony-no6-pathetique-pyotr-ilyich-tchaikovsky.mp3" },
  { title: "Night on Bald Mountain", src: "Music/night-on-bald-mountain-noc-na-lysoj-gore.mp3" },
  { title: "Peer Gynt Suite No. 1: Morning Mood", src: "Music/peer-gynt-suite-no-1-morning-mood.mp3" },
  { title: "Prelude, Op. 28 No. 4 in E Minor", src: "Music/prelude-opus-28-no-4-in-e-minor-chopin.mp3" },
  { title: "Pavane pour une infante défunte", src: "Music/ravel-pavane-pour-une-infante-defunte.mp3" },
  { title: "Dance of the Knights (Romeo and Juliet)", src: "Music/romeo-and-juliet-op-64-no-13-dance-of-the-knights-sergei-prokofiev.mp3" },
  { title: "Turkish March (Beethoven)", src: "Music/turkymarch.mp3" },
  { title: "Piano Sonata No. 8 “Pathétique” (3rd Movement)", src: "Music/pathetique.mp3" },
  { title: "Waltz in A Minor, Op. 34 No. 2", src: "Music/waltz-in-a-minor-opus-34-no-2.mp3" },
  { title: "Heartaches (Saw Synth)", src: "Music/Heartaches%20%28as%20played%20by%20The%20Caretaker%20in%20Everywhere%20at%20the%20End%20of%20Time%20Stage%20One%29.mp3" },
  { title: "Heartaches (Piano Arrangement)", src: "Music/Heartaches%20%28as%20played%20by%20The%20Caretaker%20in%20Everywhere%20at%20the%20End%20of%20Time%20Stage%20One%29%20%281%29.mp3" },
  { title: "Heartaches (Brass Arrangement)", src: "Music/Heartaches%20%28as%20played%20by%20The%20Caretaker%20in%20Everywhere%20at%20the%20End%20of%20Time%20Stage%20One%29%20%282%29.mp3" },
  { title: "Hungarian Rhapsody No. 2", src: "Music/Hungarian-Rhapsody-Nr-2.mp3" },
  { title: "Marche Funèbre", src: "Music/Marche%20Funebre.mp3" },
  { title: "Moonlight Sonata (Movement 3)", src: "Music/Moonlight%20Sonata%20Mvmt.%203.mp3" },
  { title: "New World Symphony (Movement 4)", src: "Music/New%20World%20Symphony%20Mvmt.%204.mp3" },
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


const aircraftCatalog = [
  { name: "Cessna 172", category: "GA", passengerCapacity: 4, runwayLengthRequired: 790, turnaroundMinutes: 30, fuelCost: 420, landingFeeMultiplier: 0.7 },
  { name: "Piper PA-28", category: "GA", passengerCapacity: 4, runwayLengthRequired: 820, turnaroundMinutes: 34, fuelCost: 450, landingFeeMultiplier: 0.72 },
  { name: "Beechcraft Bonanza", category: "GA", passengerCapacity: 6, runwayLengthRequired: 860, turnaroundMinutes: 36, fuelCost: 510, landingFeeMultiplier: 0.76 },
  { name: "Diamond DA42", category: "GA", passengerCapacity: 5, runwayLengthRequired: 900, turnaroundMinutes: 38, fuelCost: 560, landingFeeMultiplier: 0.79 },
  { name: "Pilatus PC-12", category: "GA", passengerCapacity: 9, runwayLengthRequired: 940, turnaroundMinutes: 44, fuelCost: 700, landingFeeMultiplier: 0.88 },

  { name: "ATR 42-600", category: "Regional", passengerCapacity: 50, runwayLengthRequired: 1070, turnaroundMinutes: 42, fuelCost: 1800, landingFeeMultiplier: 1.05 },
  { name: "ATR 72-600", category: "Regional", passengerCapacity: 72, runwayLengthRequired: 1210, turnaroundMinutes: 46, fuelCost: 2200, landingFeeMultiplier: 1.12 },
  { name: "Dash 8 Q400", category: "Regional", passengerCapacity: 78, runwayLengthRequired: 1320, turnaroundMinutes: 48, fuelCost: 2500, landingFeeMultiplier: 1.16 },
  { name: "Embraer E175", category: "Regional", passengerCapacity: 88, runwayLengthRequired: 1420, turnaroundMinutes: 50, fuelCost: 2800, landingFeeMultiplier: 1.2 },
  { name: "CRJ900", category: "Regional", passengerCapacity: 90, runwayLengthRequired: 1480, turnaroundMinutes: 52, fuelCost: 3000, landingFeeMultiplier: 1.23 },

  { name: "Airbus A220-300", category: "Narrowbody", passengerCapacity: 145, runwayLengthRequired: 1700, turnaroundMinutes: 58, fuelCost: 5400, landingFeeMultiplier: 1.45 },
  { name: "Airbus A320neo", category: "Narrowbody", passengerCapacity: 186, runwayLengthRequired: 1800, turnaroundMinutes: 62, fuelCost: 6200, landingFeeMultiplier: 1.52 },
  { name: "Boeing 737-800", category: "Narrowbody", passengerCapacity: 189, runwayLengthRequired: 1820, turnaroundMinutes: 63, fuelCost: 6400, landingFeeMultiplier: 1.55 },
  { name: "Boeing 737 MAX 8", category: "Narrowbody", passengerCapacity: 178, runwayLengthRequired: 1880, turnaroundMinutes: 64, fuelCost: 6600, landingFeeMultiplier: 1.58 },
  { name: "Airbus A321neo", category: "Narrowbody", passengerCapacity: 220, runwayLengthRequired: 2100, turnaroundMinutes: 68, fuelCost: 7200, landingFeeMultiplier: 1.66 },

  { name: "Airbus A330-300", category: "Widebody", passengerCapacity: 300, runwayLengthRequired: 2500, turnaroundMinutes: 86, fuelCost: 11200, landingFeeMultiplier: 2.1 },
  { name: "Boeing 787-9", category: "Widebody", passengerCapacity: 290, runwayLengthRequired: 2550, turnaroundMinutes: 90, fuelCost: 11800, landingFeeMultiplier: 2.2 },
  { name: "Boeing 777-300ER", category: "Widebody", passengerCapacity: 396, runwayLengthRequired: 2800, turnaroundMinutes: 98, fuelCost: 13200, landingFeeMultiplier: 2.35 },
  { name: "Airbus A350-900", category: "Widebody", passengerCapacity: 325, runwayLengthRequired: 2650, turnaroundMinutes: 94, fuelCost: 12500, landingFeeMultiplier: 2.28 },
  { name: "Airbus A380-800", category: "Widebody", passengerCapacity: 555, runwayLengthRequired: 3000, turnaroundMinutes: 118, fuelCost: 16800, landingFeeMultiplier: 2.9 },

  { name: "Boeing 737-800BCF", category: "Cargo", passengerCapacity: 0, runwayLengthRequired: 1900, turnaroundMinutes: 75, fuelCost: 7000, landingFeeMultiplier: 1.8 },
  { name: "Airbus A321P2F", category: "Cargo", passengerCapacity: 0, runwayLengthRequired: 2100, turnaroundMinutes: 82, fuelCost: 7800, landingFeeMultiplier: 1.95 },
  { name: "Boeing 767-300F", category: "Cargo", passengerCapacity: 0, runwayLengthRequired: 2500, turnaroundMinutes: 92, fuelCost: 10200, landingFeeMultiplier: 2.2 },
  { name: "Boeing 777F", category: "Cargo", passengerCapacity: 0, runwayLengthRequired: 2800, turnaroundMinutes: 105, fuelCost: 13400, landingFeeMultiplier: 2.6 },
  { name: "Antonov An-124", category: "Cargo", passengerCapacity: 0, runwayLengthRequired: 3000, turnaroundMinutes: 124, fuelCost: 18200, landingFeeMultiplier: 3.1 }
];

const airlineProfiles = [
  { name: "AeroNorth", budgetTier: "Budget", reputationRequirement: 10, flightFrequency: 14, preferredAircraftSize: "Regional", basePaymentMultiplier: 0.95 },
  { name: "TerminalJet", budgetTier: "Standard", reputationRequirement: 20, flightFrequency: 20, preferredAircraftSize: "Narrowbody", basePaymentMultiplier: 1.05 },
  { name: "SkyBridge Air", budgetTier: "Standard", reputationRequirement: 25, flightFrequency: 22, preferredAircraftSize: "Narrowbody", basePaymentMultiplier: 1.08 },
  { name: "RunwayLink", budgetTier: "Budget", reputationRequirement: 8, flightFrequency: 16, preferredAircraftSize: "Regional", basePaymentMultiplier: 0.92 },
  { name: "Blue Meridian", budgetTier: "Premium", reputationRequirement: 40, flightFrequency: 18, preferredAircraftSize: "Widebody", basePaymentMultiplier: 1.2 },
  { name: "CargoAxis", budgetTier: "Contract", reputationRequirement: 15, flightFrequency: 10, preferredAircraftSize: "Cargo", basePaymentMultiplier: 1.15 },
  { name: "Atlas Charter", budgetTier: "Charter", reputationRequirement: 30, flightFrequency: 9, preferredAircraftSize: "Narrowbody", basePaymentMultiplier: 1.18 },
  { name: "RegioWing", budgetTier: "Budget", reputationRequirement: 12, flightFrequency: 19, preferredAircraftSize: "Regional", basePaymentMultiplier: 0.97 },
  { name: "Pacific Crown", budgetTier: "Premium", reputationRequirement: 50, flightFrequency: 15, preferredAircraftSize: "Widebody", basePaymentMultiplier: 1.28 },
  { name: "VIP Horizon", budgetTier: "VIP", reputationRequirement: 60, flightFrequency: 6, preferredAircraftSize: "GA", basePaymentMultiplier: 1.4 },
  { name: "FreightOne", budgetTier: "Contract", reputationRequirement: 18, flightFrequency: 12, preferredAircraftSize: "Cargo", basePaymentMultiplier: 1.12 },
  { name: "Continental Grid", budgetTier: "Standard", reputationRequirement: 28, flightFrequency: 21, preferredAircraftSize: "Narrowbody", basePaymentMultiplier: 1.1 }
];

const progressionUnlocks = {
  aircraftClassByLevel: {
    1: ["GA", "Regional"],
    3: ["Narrowbody"],
    5: ["Cargo"],
    7: ["Widebody"]
  },
  airlineTierByLevel: {
    1: ["Budget"],
    3: ["Standard"],
    5: ["Contract", "Charter"],
    7: ["Premium"],
    9: ["VIP"]
  },
  infrastructureByLevel: {
    2: ["RUNWAY TIER 2", "GATE TIER 2"],
    4: ["TOWER MK II", "FIRE STATION LVL 2"],
    6: ["SECURITY LVL 3", "HANGAR EXPANSION"],
    8: ["RUNWAY TIER 3", "POWER GRID+"],
    10: ["MAP EXPANSION", "TERMINAL SATELLITE"]
  }
};

const difficultyProfiles = {
  easy: { incomeMultiplier: 1.25, expenseMultiplier: 0.75, eventRate: 0.65 },
  normal: { incomeMultiplier: 1, expenseMultiplier: 1, eventRate: 1 },
  hard: { incomeMultiplier: 0.82, expenseMultiplier: 1.3, eventRate: 1.35 },
  sandbox: { incomeMultiplier: 1, expenseMultiplier: 0, eventRate: 0.5 }
};

const randomEventPool = [
  "STORM EVENT",
  "FOG EVENT",
  "SNOW EVENT",
  "BIRD STRIKE",
  "FUEL SHORTAGE",
  "STAFF STRIKE",
  "VIP INSPECTION",
  "SYSTEM POWER OUTAGE"
];

const gameState = {
  difficulty: "normal",
  economy: {
    money: 250000,
    fuelPrice: 1.12,
    loanPrincipal: 85000,
    loanInterestRate: 0.05,
    income: { landingFees: 0, passengerTax: 0, gateUsage: 0, cargoHandling: 0 },
    expenses: { maintenance: 0, staffWages: 0, utilities: 0, emergencyCosts: 0 }
  },
  reputation: {
    score: 62,
    safetyRating: 88,
    penalties: { longDelays: 0, crashes: 0, emergencyMismanagement: 0 },
    bonuses: { fastTurnaround: 0, noDelays: 0, highSafetyRating: 0 }
  },
  infrastructure: {
    runwayLevel: 1,
    gateLevel: 1,
    controlTowerLevel: 1,
    fireStationLevel: 1,
    securityLevel: 1,
    maintenanceHangarLevel: 1,
    powerCapacity: 120,
    waterCapacity: 95
  },
  progression: {
    airportLevel: 1,
    unlockedAircraftClasses: ["GA", "Regional"],
    unlockedAirlineTiers: ["Budget"],
    unlockedInfrastructure: [],
    mapExpansionUnlocked: false
  },
  save: {
    autosaveEnabled: true,
    unlockedItems: []
  },
  ai: {
    landingQueue: [],
    departureQueue: [],
    gateAssignments: {},
    emergencyPriorityOverride: false
  }
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function chance(probability) {
  return Math.random() < probability;
}

function getUnlockedAircraftCategories(level) {
  const unlocked = new Set();
  Object.entries(progressionUnlocks.aircraftClassByLevel).forEach(([unlockLevel, categories]) => {
    if (level >= Number(unlockLevel)) {
      categories.forEach((c) => unlocked.add(c));
    }
  });
  return [...unlocked];
}

function getUnlockedAirlineTiers(level) {
  const unlocked = new Set();
  Object.entries(progressionUnlocks.airlineTierByLevel).forEach(([unlockLevel, tiers]) => {
    if (level >= Number(unlockLevel)) {
      tiers.forEach((t) => unlocked.add(t));
    }
  });
  return [...unlocked];
}

function nextFlightId(prefix = "AC") {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateFlight(flightKind = "ARRIVAL") {
  const categories = getUnlockedAircraftCategories(gameState.progression.airportLevel);
  const eligibleAircraft = aircraftCatalog.filter((aircraft) => categories.includes(aircraft.category));
  const tierUnlock = getUnlockedAirlineTiers(gameState.progression.airportLevel);
  const eligibleAirlines = airlineProfiles.filter((airline) => tierUnlock.includes(airline.budgetTier));
  const selectedAircraft = pickRandom(eligibleAircraft.length > 0 ? eligibleAircraft : aircraftCatalog);
  const selectedAirline = pickRandom(eligibleAirlines.length > 0 ? eligibleAirlines : airlineProfiles);

  const isVIP = chance(0.06);
  const isCharter = chance(0.11);
  const isCargoContract = selectedAircraft.category === "Cargo" || chance(0.14);

  return {
    id: nextFlightId(flightKind === "DEPARTURE" ? "DP" : "AR"),
    type: flightKind,
    airline: selectedAirline.name,
    aircraft: selectedAircraft.name,
    category: selectedAircraft.category,
    passengers: selectedAircraft.passengerCapacity,
    delayMinutes: chance(0.18) ? Math.floor(15 + Math.random() * 100) : 0,
    cancelled: chance(0.05),
    emergencyLanding: chance(0.02),
    vipFlight: isVIP,
    charterFlight: isCharter,
    cargoContract: isCargoContract,
    landingFeeMultiplier: selectedAircraft.landingFeeMultiplier,
    turnaroundMinutes: selectedAircraft.turnaroundMinutes,
    runwayRequired: selectedAircraft.runwayLengthRequired
  };
}

function assignGateAndRunway(flight) {
  const gateCount = 3 + gameState.infrastructure.gateLevel * 2;
  const runwayCount = 1 + gameState.infrastructure.runwayLevel;
  const gate = `G${1 + (Object.keys(gameState.ai.gateAssignments).length % gateCount)}`;
  const runway = `R${1 + (gameState.ai.landingQueue.length % runwayCount)}`;

  gameState.ai.gateAssignments[flight.id] = gate;
  if (flight.emergencyLanding) {
    gameState.ai.emergencyPriorityOverride = true;
    gameState.ai.landingQueue.unshift({ ...flight, gate, runway, priority: "EMERGENCY" });
  } else if (flight.type === "ARRIVAL") {
    gameState.ai.landingQueue.push({ ...flight, gate, runway, priority: "NORMAL" });
  } else {
    gameState.ai.departureQueue.push({ ...flight, gate, runway, priority: "NORMAL" });
  }

  return { gate, runway };
}

function evaluateEconomyForFlight(flight) {
  const difficulty = difficultyProfiles[gameState.difficulty];
  const baseLandingFee = 1200 * flight.landingFeeMultiplier;
  const landingFees = baseLandingFee * difficulty.incomeMultiplier;
  const passengerTax = flight.passengers * 18 * difficulty.incomeMultiplier;
  const gateUsage = (240 + flight.turnaroundMinutes * 3) * difficulty.incomeMultiplier;
  const cargoHandling = flight.cargoContract ? 1800 * difficulty.incomeMultiplier : 0;

  const maintenance = (350 + flight.runwayRequired * 0.15) * difficulty.expenseMultiplier;
  const staffWages = (420 + flight.turnaroundMinutes * 4.2) * difficulty.expenseMultiplier;
  const utilities = (280 + gameState.infrastructure.powerCapacity * 0.8) * difficulty.expenseMultiplier;
  const emergencyCosts = flight.emergencyLanding ? 2200 * difficulty.expenseMultiplier : 0;

  gameState.economy.income.landingFees += landingFees;
  gameState.economy.income.passengerTax += passengerTax;
  gameState.economy.income.gateUsage += gateUsage;
  gameState.economy.income.cargoHandling += cargoHandling;

  gameState.economy.expenses.maintenance += maintenance;
  gameState.economy.expenses.staffWages += staffWages;
  gameState.economy.expenses.utilities += utilities;
  gameState.economy.expenses.emergencyCosts += emergencyCosts;

  const net = landingFees + passengerTax + gateUsage + cargoHandling - maintenance - staffWages - utilities - emergencyCosts;
  gameState.economy.money += net;

  return net;
}

function applyLoanInterest() {
  if (gameState.difficulty === "sandbox") return 0;
  const interest = gameState.economy.loanPrincipal * gameState.economy.loanInterestRate;
  gameState.economy.money -= interest;
  return interest;
}

function updateFuelPrice() {
  const drift = (Math.random() - 0.5) * 0.2;
  gameState.economy.fuelPrice = Math.max(0.75, Number((gameState.economy.fuelPrice + drift).toFixed(2)));
}

function applyReputationEffects(flight) {
  let delta = 0;
  if (flight.delayMinutes > 60) {
    delta -= 4;
    gameState.reputation.penalties.longDelays += 1;
  } else if (flight.delayMinutes === 0) {
    delta += 2;
    gameState.reputation.bonuses.noDelays += 1;
  }

  if (flight.emergencyLanding && !gameState.ai.emergencyPriorityOverride) {
    delta -= 8;
    gameState.reputation.penalties.emergencyMismanagement += 1;
  }

  if (flight.turnaroundMinutes <= 50) {
    delta += 1;
    gameState.reputation.bonuses.fastTurnaround += 1;
  }

  if (gameState.reputation.safetyRating >= 85) {
    delta += 1;
    gameState.reputation.bonuses.highSafetyRating += 1;
  }

  gameState.reputation.score = Math.max(0, Math.min(100, gameState.reputation.score + delta));
  return delta;
}

function maybeRandomEvent() {
  const difficulty = difficultyProfiles[gameState.difficulty];
  if (!chance(0.16 * difficulty.eventRate)) return null;
  const eventName = pickRandom(randomEventPool);
  if (eventName === "SYSTEM POWER OUTAGE") {
    gameState.infrastructure.powerCapacity = Math.max(60, gameState.infrastructure.powerCapacity - 18);
  }
  if (eventName === "FUEL SHORTAGE") {
    gameState.economy.fuelPrice = Number((gameState.economy.fuelPrice + 0.25).toFixed(2));
  }
  if (eventName === "STAFF STRIKE") {
    gameState.reputation.score = Math.max(0, gameState.reputation.score - 3);
  }
  return eventName;
}

function evaluateProgression() {
  const newLevel = Math.min(10, Math.max(1, Math.floor((gameState.economy.money + 250000) / 90000)));
  if (newLevel > gameState.progression.airportLevel) {
    gameState.progression.airportLevel = newLevel;
  }

  gameState.progression.unlockedAircraftClasses = getUnlockedAircraftCategories(gameState.progression.airportLevel);
  gameState.progression.unlockedAirlineTiers = getUnlockedAirlineTiers(gameState.progression.airportLevel);

  const unlockedInfrastructure = [];
  Object.entries(progressionUnlocks.infrastructureByLevel).forEach(([lvl, unlocks]) => {
    if (gameState.progression.airportLevel >= Number(lvl)) {
      unlockedInfrastructure.push(...unlocks);
    }
  });
  gameState.progression.unlockedInfrastructure = unlockedInfrastructure;
  gameState.progression.mapExpansionUnlocked = gameState.progression.airportLevel >= 8;
}

function hasBankruptcyCondition() {
  if (gameState.difficulty === "sandbox") return false;
  return gameState.economy.money < -50000;
}

function saveGameState() {
  const payload = {
    money: gameState.economy.money,
    reputation: gameState.reputation.score,
    unlockedItems: [...new Set([...gameState.progression.unlockedInfrastructure, ...gameState.progression.unlockedAircraftClasses])],
    airportLayout: {
      runwayLevel: gameState.infrastructure.runwayLevel,
      gateLevel: gameState.infrastructure.gateLevel,
      towerLevel: gameState.infrastructure.controlTowerLevel
    },
    autosaveEnabled: gameState.save.autosaveEnabled
  };
  localStorage.setItem("airportOS_save", JSON.stringify(payload));
  gameState.save.unlockedItems = payload.unlockedItems;
  return payload;
}

function runOperationCycle() {
  const arrivals = Array.from({ length: 3 }, () => generateFlight("ARRIVAL"));
  const departures = Array.from({ length: 2 }, () => generateFlight("DEPARTURE"));
  const flights = [...arrivals, ...departures];

  const cycleEvents = [];
  const cycleRows = [];

  flights.forEach((flight) => {
    const assigned = assignGateAndRunway(flight);
    const net = evaluateEconomyForFlight(flight);
    const repDelta = applyReputationEffects(flight);

    cycleRows.push(`${flight.id} ${flight.type.padEnd(9)} ${flight.airline.padEnd(15)} ${assigned.gate}/${assigned.runway} DELAY:${String(flight.delayMinutes).padStart(3)}M VIP:${flight.vipFlight ? "Y" : "N"} CXL:${flight.cancelled ? "Y" : "N"} NET:${Math.round(net)}`);
    if (flight.emergencyLanding) {
      cycleEvents.push(`${flight.id} EMERGENCY LANDING PRIORITY OVERRIDE ACTIVE`);
    }
    if (repDelta !== 0) {
      cycleEvents.push(`${flight.id} REPUTATION ${repDelta > 0 ? "+" : ""}${repDelta}`);
    }
  });

  const interest = applyLoanInterest();
  updateFuelPrice();
  const randomEvent = maybeRandomEvent();
  if (randomEvent) cycleEvents.push(`EVENT: ${randomEvent}`);
  if (interest > 0) cycleEvents.push(`LOAN INTEREST CHARGED: ${Math.round(interest)}`);

  evaluateProgression();
  const bankruptcy = hasBankruptcyCondition();
  if (bankruptcy) {
    cycleEvents.push("BANKRUPTCY CONDITION TRIGGERED");
  }

  if (gameState.save.autosaveEnabled) {
    saveGameState();
    cycleEvents.push("AUTOSAVE COMPLETED");
  }

  return {
    arrivals,
    departures,
    cycleRows,
    cycleEvents,
    bankruptcy,
    snapshot: {
      money: Math.round(gameState.economy.money),
      reputation: gameState.reputation.score,
      fuelPrice: gameState.economy.fuelPrice,
      level: gameState.progression.airportLevel,
      unlockedAircraft: gameState.progression.unlockedAircraftClasses.join(", "),
      unlockedTiers: gameState.progression.unlockedAirlineTiers.join(", "),
      queueLanding: gameState.ai.landingQueue.length,
      queueDeparture: gameState.ai.departureQueue.length,
      power: gameState.infrastructure.powerCapacity,
      water: gameState.infrastructure.waterCapacity
    }
  };
}

function createSystemsPanel() {
  const wrapper = document.createElement("div");
  const aircraftByCategory = aircraftCatalog.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = 0;
    acc[item.category] += 1;
    return acc;
  }, {});

  wrapper.innerHTML = `
    <p><strong>TERMINAL CONTROL SYSTEMS</strong></p>
    <p>AIRCRAFT REGISTER: ${aircraftCatalog.length} | AIRLINES: ${airlineProfiles.length}</p>
    <p>CATEGORIES: GA ${aircraftByCategory.GA || 0} | REGIONAL ${aircraftByCategory.Regional || 0} | NARROWBODY ${aircraftByCategory.Narrowbody || 0} | WIDEBODY ${aircraftByCategory.Widebody || 0} | CARGO ${aircraftByCategory.Cargo || 0}</p>
    <p>INFRA RUNWAY L${gameState.infrastructure.runwayLevel} | GATE L${gameState.infrastructure.gateLevel} | TOWER L${gameState.infrastructure.controlTowerLevel} | FIRE L${gameState.infrastructure.fireStationLevel} | SECURITY L${gameState.infrastructure.securityLevel}</p>
    <p>POWER ${gameState.infrastructure.powerCapacity}MW | WATER ${gameState.infrastructure.waterCapacity}KL | DIFFICULTY ${gameState.difficulty.toUpperCase()}</p>
    <div class="systems-controls">
      <button type="button" data-action="run-cycle">RUN OPERATION CYCLE</button>
      <button type="button" data-action="save-now">SAVE SNAPSHOT</button>
      <label><input type="checkbox" data-action="autosave" ${gameState.save.autosaveEnabled ? "checked" : ""} /> AUTOSAVE</label>
    </div>
    <pre class="systems-log">READY. PRESS RUN OPERATION CYCLE.</pre>
  `;

  const logEl = wrapper.querySelector(".systems-log");
  const autosaveEl = wrapper.querySelector('[data-action="autosave"]');

  const renderCycle = () => {
    const report = runOperationCycle();
    logEl.textContent = [
      "=== FLIGHT OPS CYCLE ===",
      ...report.cycleRows,
      "",
      `ECONOMY MONEY:${report.snapshot.money} FUEL:${report.snapshot.fuelPrice} REP:${report.snapshot.reputation}`,
      `LEVEL:${report.snapshot.level} AIRCRAFT:${report.snapshot.unlockedAircraft}`,
      `AIRLINE TIERS:${report.snapshot.unlockedTiers}`,
      `QUEUES LAND:${report.snapshot.queueLanding} DEP:${report.snapshot.queueDeparture}`,
      `UTILITIES POWER:${report.snapshot.power} WATER:${report.snapshot.water}`,
      report.bankruptcy ? "STATUS: BANKRUPT" : "STATUS: OPERATIONAL",
      "",
      "EVENT LOG:",
      ...(report.cycleEvents.length > 0 ? report.cycleEvents : ["NONE"])
    ].join("\n");
  };

  wrapper.querySelector('[data-action="run-cycle"]').addEventListener("click", () => {
    playClickSound();
    renderCycle();
  });

  wrapper.querySelector('[data-action="save-now"]').addEventListener("click", () => {
    playClickSound();
    const savePayload = saveGameState();
    logEl.textContent = `SAVE COMPLETE\nMONEY:${Math.round(savePayload.money)} REP:${savePayload.reputation}\nUNLOCKED:${savePayload.unlockedItems.join(", ") || "NONE"}`;
  });

  autosaveEl.addEventListener("change", () => {
    gameState.save.autosaveEnabled = autosaveEl.checked;
  });

  return wrapper;
}

const appDefs = {
  systems: {
    title: "AIRPORT CONTROL PANEL",
    status: "3 AIRCRAFT SELECTED",
    render: () => createSystemsPanel()
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
  const fullscreenButton = windowEl.querySelector(".fullscreen");

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

  const stopHeaderDrag = (event) => event.stopPropagation();
  [minimizeButton, fullscreenButton, closeButton].forEach((button) => {
    button.addEventListener("pointerdown", stopHeaderDrag);
  });

  fullscreenButton.addEventListener("click", () => {
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
