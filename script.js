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

// Playlist locale + covers
const playlist = [
  {
    src: "Audio/Customize.mp3",
    title: "Customize",
    artist: "Rafflesia Online",
    cover: "Audio/covers/customize.jpg"
  },
  {
    src: "Audio/Eshop.mp3",
    title: "Eshop Theme",
    artist: "Kazumi Totaka",
    cover: "Audio/covers/Eshop.jpg"
  },
  {
    src: "Audio/Hip Shop.mp3",
    title: "Hip Shop",
    artist: "Toby Fox",
    cover: "Audio/covers/hipshop.jpg"
  },
  {
    src: "Audio/Takeshi Abo.mp3",
    title: "Takeshi Abo",
    artist: "Steins;Gate",
    cover: "Audio/covers/takeshi.jpg"
  },
  {
    src: "Audio/yume 2kki.mp3",
    title: "Yume 2kki Theme",
    artist: "Fan OST",
    cover: "Audio/covers/yume.jpg"
  }
];

let currentTrackIndex = Math.floor(Math.random() * playlist.length);
const music = new Audio(playlist[currentTrackIndex].src);
music.volume = 0.4;

const titleEl = document.getElementById("music-title");
const artistEl = document.getElementById("music-artist");
const coverEl = document.getElementById("music-cover");
const toggleBtn = document.getElementById("music-toggle");
const skipBtn = document.getElementById("music-skip");
const progressEl = document.getElementById("music-progress");
const currentEl = document.getElementById("music-current");
const durationEl = document.getElementById("music-duration");

// Chargement de la musique
function loadTrack(i) {
  const track = playlist[i];
  music.src = track.src;
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  coverEl.src = track.cover;
  music.load();
  music.play();
  toggleBtn.textContent = "⏸";
}

// Play/Pause
toggleBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    toggleBtn.textContent = "⏸";
  } else {
    music.pause();
    toggleBtn.textContent = "▶";
  }
});

// Skip aléatoire
skipBtn.addEventListener("click", () => {
  let next;
  do {
    next = Math.floor(Math.random() * playlist.length);
  } while (next === currentTrackIndex);
  currentTrackIndex = next;
  loadTrack(currentTrackIndex);
});

// Progression
music.addEventListener("timeupdate", () => {
  if (!isNaN(music.duration)) {
    progressEl.value = (music.currentTime / music.duration) * 100;
    const m = Math.floor(music.currentTime / 60);
    const s = Math.floor(music.currentTime % 60).toString().padStart(2, "0");
    currentEl.textContent = `${m}:${s}`;
  }
});

music.addEventListener("loadedmetadata", () => {
  const m = Math.floor(music.duration / 60);
  const s = Math.floor(music.duration % 60).toString().padStart(2, "0");
  durationEl.textContent = `${m}:${s}`;
});

progressEl.addEventListener("input", () => {
  music.currentTime = (progressEl.value / 100) * music.duration;
});

music.addEventListener("ended", () => {
  skipBtn.click();
});

// Démarrage
loadTrack(currentTrackIndex);

document.addEventListener("click", () => {
  if (music.paused) {
    music.play().then(() => {
      toggleBtn.textContent = "⏸";
    }).catch(err => console.log("Lecture bloquée :", err));
  }
}, { once: true });




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


function updateTaskbarTime() {
  const timeEl = document.getElementById("taskbar-time");
  const now = new Date();
  const h = now.getHours().toString().padStart(2,'0');
  const m = now.getMinutes().toString().padStart(2,'0');
  timeEl.textContent = `${h}:${m}`;
}
setInterval(updateTaskbarTime, 1000);
updateTaskbarTime();


const startBtn = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const clock = document.getElementById("clock");

// Ouvrir / fermer le menu
startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startMenu.style.display = startMenu.style.display === "block" ? "none" : "block";
});

// Fermer si clic en dehors
document.addEventListener("click", () => {
  startMenu.style.display = "none";
});

// Horloge fonctionnelle
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12
  clock.textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();





