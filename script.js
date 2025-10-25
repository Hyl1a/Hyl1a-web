// ---------------- Gestion des Onglets ----------------
document.querySelectorAll('.window').forEach(win => {
  const tabs = win.querySelectorAll('.tab');
  const contents = win.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      win.querySelector(`#${tab.dataset.tab}`).classList.add('active');
    });
  });
});

// ---------------- Gestion des Boutons Fenêtre ----------------
document.querySelectorAll('.window').forEach(win => {
  const btnMin = win.querySelector('.minimize');
  const btnMax = win.querySelector('.maximize');
  const btnClose = win.querySelector('.close');

  if (btnMin) {
    btnMin.addEventListener('click', () => {
      const content = win.querySelector('.content');
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (btnMax) {
    btnMax.addEventListener('click', () => {
      if (win.dataset.maximized === 'true') {
        win.style.width = win.dataset.oldWidth;
        win.style.height = win.dataset.oldHeight;
        win.style.left = win.dataset.oldLeft;
        win.style.top = win.dataset.oldTop;
        win.dataset.maximized = 'false';
      } else {
        win.dataset.oldWidth = win.style.width;
        win.dataset.oldHeight = win.style.height;
        win.dataset.oldLeft = win.style.left;
        win.dataset.oldTop = win.style.top;

        win.style.left = '0';
        win.style.top = '0';
        win.style.width = '100%';
        win.style.height = '100vh';
        win.dataset.maximized = 'true';
      }
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      win.style.display = 'none';
    });
  }
});

// ---------------- Déplacement des Fenêtres ----------------
let activeDrag = { win: null, offsetX: 0, offsetY: 0 };
let highestZ = 1000;

document.querySelectorAll('.window').forEach(win => {
  const titleBar = win.querySelector('.title');
  if (getComputedStyle(win).position === 'static') win.style.position = 'absolute';

  const startDrag = (clientX, clientY) => {
    activeDrag.win = win;
    activeDrag.offsetX = clientX - win.offsetLeft;
    activeDrag.offsetY = clientY - win.offsetTop;
    highestZ++;
    win.style.zIndex = highestZ;
    titleBar.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  titleBar.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
  titleBar.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (t) startDrag(t.clientX, t.clientY);
  }, { passive: false });
});

document.addEventListener('mousemove', e => {
  if (!activeDrag.win) return;
  const win = activeDrag.win;
  const x = e.clientX - activeDrag.offsetX;
  const y = e.clientY - activeDrag.offsetY;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const rect = win.getBoundingClientRect();
  const w = rect.width, h = rect.height;

  win.style.left = Math.min(Math.max(x, -w + 40), vw - 40) + 'px';
  win.style.top = Math.min(Math.max(y, -h + 40), vh - 40) + 'px';
});

document.addEventListener('touchmove', e => {
  if (!activeDrag.win) return;
  const t = e.touches[0];
  if (!t) return;
  e.preventDefault();

  const win = activeDrag.win;
  const x = t.clientX - activeDrag.offsetX;
  const y = t.clientY - activeDrag.offsetY;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const rect = win.getBoundingClientRect();
  const w = rect.width, h = rect.height;

  win.style.left = Math.min(Math.max(x, -w + 40), vw - 40) + 'px';
  win.style.top = Math.min(Math.max(y, -h + 40), vh - 40) + 'px';
}, { passive: false });

const stopDrag = () => {
  if (!activeDrag.win) return;
  activeDrag.win.querySelector('.title').style.cursor = 'grab';
  document.body.style.userSelect = '';
  activeDrag.win = null;
};
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);

// ---------------- Musique ----------------
const music = document.getElementById("background-music");
const musicToggle = document.getElementById("music-toggle");
const progressBar = document.getElementById("music-progress");
const currentTimeDisplay = document.getElementById("music-current");
const durationDisplay = document.getElementById("music-duration");
const trackName = document.getElementById("music-title");

if (music) {
  music.volume = 0.3;

  // Titre propre
  if (trackName) trackName.textContent = decodeURIComponent(music.src.split("/").pop());

  // Durée totale
  music.addEventListener("loadedmetadata", () => {
    if (durationDisplay) {
      const m = Math.floor(music.duration / 60);
      const s = Math.floor(music.duration % 60).toString().padStart(2, '0');
      durationDisplay.textContent = `${m}:${s}`;
    }
  });

  // Progression
  music.addEventListener("timeupdate", () => {
    if (progressBar) progressBar.value = (music.currentTime / music.duration) * 100 || 0;
    if (currentTimeDisplay) {
      const m = Math.floor(music.currentTime / 60);
      const s = Math.floor(music.currentTime % 60).toString().padStart(2, '0');
      currentTimeDisplay.textContent = `${m}:${s}`;
    }
  });

  if (progressBar) {
    progressBar.addEventListener("input", () => {
      music.currentTime = (progressBar.value / 100) * music.duration;
    });
  }
}

// Play / Pause
if (musicToggle && music) {
  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      music.play();
      musicToggle.textContent = "Pause";
    } else {
      music.pause();
      musicToggle.textContent = "Play";
    }
  });
}

// ---------------- Auto-alternance Onglets ----------------
const autoTabs = document.querySelectorAll('#window3 .tab');
const autoContents = document.querySelectorAll('#window3 .tab-content');
let currentIndex = 0;
const switchInterval = 5000;

setInterval(() => {
  autoTabs[currentIndex].classList.remove('active');
  autoContents[currentIndex].style.opacity = 0;

  currentIndex = (currentIndex + 1) % autoTabs.length;
  const nextTab = autoTabs[currentIndex];
  const nextContent = autoContents[currentIndex];

  nextTab.classList.add('active');
  setTimeout(() => {
    autoContents.forEach(tc => tc.classList.remove('active'));
    nextContent.classList.add('active');
    nextContent.style.opacity = 1;
    nextContent.querySelector('video')?.play();
  }, 200);
}, switchInterval);


const splashes = [
  "Bienvenue sur mon site !",
  "Also try terraria !",
  "Notch is here ",
  " | VHS Style | ",
  "Easter Egg !"
];

const splashText = document.getElementById("splash-text");

setInterval(() => {
  const randomIndex = Math.floor(Math.random() * splashes.length);
  splashText.textContent = splashes[randomIndex];
}, 5000); // change toutes les 5s
