const desktop = document.getElementById("desktop");
const template = document.getElementById("window-template");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const taskbarApps = document.getElementById("taskbar-apps");
const clock = document.getElementById("clock");

const musicTrack = {
  title: "Clair de Lune",
  src: "Music/Clair%20de%20Lune.mp3"
};

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
  const wrapper = document.createElement("section");
  wrapper.className = "winamp-player";

  wrapper.innerHTML = `
    <div class="winamp-display" aria-live="polite">
      <p class="winamp-track">${musicTrack.title}</p>
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
    <p class="winamp-hint">Now playing from /Music: ${musicTrack.title}</p>
  `;

  const audio = document.createElement("audio");
  audio.src = musicTrack.src;
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
