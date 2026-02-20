const desktop = document.getElementById("desktop");
const template = document.getElementById("window-template");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const taskbarApps = document.getElementById("taskbar-apps");
const clock = document.getElementById("clock");

const musicTracks = [
  { title: "1812 Overture - Tchaikovsky", src: "Music/1812%20Overture%20-%20Tchaikovsky.mp3" },
  { title: "Can Can", src: "Music/Can%20Can.mp3" },
  { title: "Cello Suite No. 1", src: "Music/Cello%20Suite%20No.%201.mp3" },
  { title: "Clair de Lune", src: "Music/Clair%20de%20Lune.mp3" },
  { title: "Eine Kleine Nachtmusik Movement 1", src: "Music/Eine%20Kleine%20Nachtmusik%20Movement%201.mp3" },
  { title: "Fur Elise", src: "Music/Fur%20Elise.mp3" },
  { title: "Heartaches (as played by The Caretaker in Everywhere at the End of Time Stage One) (1)", src: "Music/Heartaches%20%28as%20played%20by%20The%20Caretaker%20in%20Everywhere%20at%20the%20End%20of%20Time%20Stage%20One%29%20%281%29.mp3" },
  { title: "Heartaches (as played by The Caretaker in Everywhere at the End of Time Stage One) (2)", src: "Music/Heartaches%20%28as%20played%20by%20The%20Caretaker%20in%20Everywhere%20at%20the%20End%20of%20Time%20Stage%20One%29%20%282%29.mp3" },
  { title: "Heartaches (as played by The Caretaker in Everywhere at the End of Time Stage One)", src: "Music/Heartaches%20%28as%20played%20by%20The%20Caretaker%20in%20Everywhere%20at%20the%20End%20of%20Time%20Stage%20One%29.mp3" },
  { title: "Hungarian-Rhapsody-Nr-2", src: "Music/Hungarian-Rhapsody-Nr-2.mp3" },
  { title: "Lacrimosa", src: "Music/Lacrimosa.mp3" },
  { title: "Marche Funebre", src: "Music/Marche%20Funebre.mp3" },
  { title: "Moonlight Sonata Mvmt. 3", src: "Music/Moonlight%20Sonata%20Mvmt.%203.mp3" },
  { title: "New World Symphony Mvmt. 4", src: "Music/New%20World%20Symphony%20Mvmt.%204.mp3" },
  { title: "Nocturne Op. 9 No.2", src: "Music/Nocturne%20Op.%209%20No.2.mp3" },
  { title: "Swan Lake Act 2", src: "Music/Swan%20Lake%20Act%202.mp3" },
  { title: "Turkish March (Mozart Version)", src: "Music/Turkish%20March%20%28Mozart%20Version%29.mp3" },
  { title: "arabesque-l-66-no-1-in-e-major", src: "Music/arabesque-l-66-no-1-in-e-major.mp3" },
  { title: "gnossienne-no-1", src: "Music/gnossienne-no-1.mp3" },
  { title: "gymnopedie-no-1-satie", src: "Music/gymnopedie-no-1-satie.mp3" },
  { title: "isle-of-the-dead", src: "Music/isle-of-the-dead.mp3" },
  { title: "iv-finale-symphony-no6-pathetique-pyotr-ilyich-tchaikovsky", src: "Music/iv-finale-symphony-no6-pathetique-pyotr-ilyich-tchaikovsky.mp3" },
  { title: "night-on-bald-mountain-noc-na-lysoj-gore", src: "Music/night-on-bald-mountain-noc-na-lysoj-gore.mp3" },
  { title: "peer-gynt-suite-no-1-morning-mood", src: "Music/peer-gynt-suite-no-1-morning-mood.mp3" },
  { title: "prelude-opus-28-no-4-in-e-minor-chopin", src: "Music/prelude-opus-28-no-4-in-e-minor-chopin.mp3" },
  { title: "ravel-pavane-pour-une-infante-defunte", src: "Music/ravel-pavane-pour-une-infante-defunte.mp3" },
  { title: "romeo-and-juliet-op-64-no-13-dance-of-the-knights-sergei-prokofiev", src: "Music/romeo-and-juliet-op-64-no-13-dance-of-the-knights-sergei-prokofiev.mp3" },
  { title: "turkymarch", src: "Music/turkymarch.mp3" },
  { title: "waltz-in-a-minor-opus-34-no-2", src: "Music/waltz-in-a-minor-opus-34-no-2.mp3" }
];

function pickRandomTrack() {
  const randomIndex = Math.floor(Math.random() * musicTracks.length);
  return musicTracks[randomIndex];
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function createMusicPlayer() {
  const track = pickRandomTrack();
  const wrapper = document.createElement("section");
  wrapper.className = "winamp-player";

  wrapper.innerHTML = `
    <div class="winamp-display" aria-live="polite">
      <p class="winamp-track">${track.title}</p>
      <p class="winamp-time">0:00 / 0:00</p>
    </div>
    <div class="winamp-progress-wrap">
      <input class="winamp-progress" type="range" min="0" max="100" value="0" aria-label="Song progress" />
    </div>
    <div class="winamp-controls" role="group" aria-label="Player controls">
      <button type="button" data-action="play">▶ Play</button>
      <button type="button" data-action="pause">⏸ Pause</button>
      <button type="button" data-action="stop">⏹ Stop</button>
    </div>
    <p class="winamp-hint">Now playing from /Music: ${track.title}</p>
  `;

  const audio = document.createElement("audio");
  audio.src = track.src;
  audio.preload = "metadata";

  const timeEl = wrapper.querySelector(".winamp-time");
  const progressEl = wrapper.querySelector(".winamp-progress");

  const syncUI = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const percent = duration > 0 ? (current / duration) * 100 : 0;
    progressEl.value = String(percent);
    timeEl.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  };

  wrapper.querySelector('[data-action="play"]').addEventListener("click", () => {
    audio.play();
  });

  wrapper.querySelector('[data-action="pause"]').addEventListener("click", () => {
    audio.pause();
  });

  wrapper.querySelector('[data-action="stop"]').addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
    syncUI();
  });

  progressEl.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration === 0) return;
    const percent = Number(progressEl.value) / 100;
    audio.currentTime = percent * audio.duration;
  });

  audio.addEventListener("timeupdate", syncUI);
  audio.addEventListener("loadedmetadata", syncUI);
  audio.addEventListener("ended", syncUI);

  wrapper.append(audio);
  return wrapper;
}

const appDefs = {
  computer: {
    title: "My Computer",
    render: () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <p><strong>System Properties</strong></p>
        <p>Operating System: Windows 95 (simulated)</p>
        <p>Processor: Pentium vibes ✨</p>
        <p>Memory: Enough for Minesweeper and Solitaire.</p>
      `;
      return wrapper;
    }
  },
  notepad: {
    title: "Notepad",
    render: () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <p>Untitled - Notepad</p>
        <textarea placeholder="Type your retro masterpiece..."></textarea>
      `;
      return wrapper;
    }
  },
  browser: {
    title: "Internet Explorer",
    render: () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <p><strong>Welcome to the Information Superhighway!</strong></p>
        <ul>
          <li>Dial-up tone not included</li>
          <li>Open apps from desktop or Start menu</li>
          <li>Drag windows and minimize to taskbar</li>
        </ul>
      `;
      return wrapper;
    }
  },
  winamp: {
    title: "Winamp",
    render: () => createMusicPlayer()
  },
  about: {
    title: "About",
    render: () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <p><strong>Windows 95 Inspired Desktop</strong></p>
        <p>Made with plain HTML, CSS, and JavaScript.</p>
      `;
      return wrapper;
    }
  }
};

const openWindows = new Map();
let z = 100;

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
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
  button.addEventListener("click", () => {
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
  if (!definition) return;

  const windowEl = template.content.firstElementChild.cloneNode(true);
  const titleEl = windowEl.querySelector(".window-title");
  const headerEl = windowEl.querySelector(".window-header");
  const contentEl = windowEl.querySelector(".window-content");
  const closeButton = windowEl.querySelector(".close");
  const minimizeButton = windowEl.querySelector(".minimize");

  titleEl.textContent = definition.title;
  contentEl.append(definition.render());

  windowEl.style.left = `${95 + openWindows.size * 28}px`;
  windowEl.style.top = `${45 + openWindows.size * 24}px`;

  makeDraggable(windowEl, headerEl);
  windowEl.addEventListener("pointerdown", () => focusWindow(windowEl));

  const taskButton = createTaskbarButton(definition.title, windowEl);

  closeButton.addEventListener("click", () => {
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
    windowEl.classList.add("hidden");
    windowEl.classList.remove("active");
    refreshTaskbarState();
  });

  desktop.append(windowEl);
  openWindows.set(appId, { window: windowEl, taskButton });
  focusWindow(windowEl);
}

function toggleStartMenu(force) {
  const shouldOpen = force ?? startMenu.classList.contains("hidden");
  startMenu.classList.toggle("hidden", !shouldOpen);
  startButton.setAttribute("aria-expanded", String(shouldOpen));
}

updateClock();
setInterval(updateClock, 1000);

document.querySelectorAll("[data-app]").forEach((button) => {
  button.addEventListener("click", () => {
    openApp(button.dataset.app);
    toggleStartMenu(false);
  });
});

startButton.addEventListener("click", () => toggleStartMenu());

document.addEventListener("pointerdown", (event) => {
  if (!startMenu.contains(event.target) && event.target !== startButton) {
    toggleStartMenu(false);
  }
});
