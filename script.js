const desktop = document.getElementById("desktop");
const template = document.getElementById("window-template");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const taskbarApps = document.getElementById("taskbar-apps");
const clock = document.getElementById("clock");

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
