// ---------------- Gestion des Onglets ----------------
document.querySelectorAll('.window').forEach(win => {
  const tabs = win.querySelectorAll('.tab');
  const contents = win.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = win.querySelector(`#${tab.dataset.tab}`);
      if (target) target.classList.add('active');
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
    btnClose.addEventListener('click', () => { win.style.display = 'none'; });
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
  win.style.left = Math.min(Math.max(x, -rect.width + 40), vw - 40) + 'px';
  win.style.top = Math.min(Math.max(y, -rect.height + 40), vh - 40) + 'px';
});

const stopDrag = () => {
  if (!activeDrag.win) return;
  activeDrag.win.querySelector('.title').style.cursor = 'grab';
  document.body.style.userSelect = '';
  activeDrag.win = null;
};
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);

// ---------------- Musique ----------------

const playlist = [
  { src: "Audio/Customize.mp3", title: "Customize", artist: "Rafflesia Online", cover: "Audio/covers/customize.jpg" },
  { src: "Audio/Eshop.mp3", title: "Eshop Theme", artist: "Kazumi Totaka", cover: "Audio/covers/Eshop.jpg" },
  { src: "Audio/Hip Shop.mp3", title: "Hip Shop", artist: "Toby Fox", cover: "Audio/covers/hipshop.jpg" },
  { src: "Audio/Takeshi Abo.mp3", title: "Takeshi Abo", artist: "Steins;Gate", cover: "Audio/covers/takeshi.jpg" },
  { src: "Audio/yume 2kki.mp3", title: "Yume 2kki Theme", artist: "Fan OST", cover: "Audio/covers/yume.jpg" }
];

let currentTrackIndex = Math.floor(Math.random() * playlist.length);
// On crée l'objet sans charger de source immédiatement pour éviter les erreurs
const music = new Audio();
music.volume = 0.4;

const titleEl = document.getElementById("music-title");
const artistEl = document.getElementById("music-artist");
const coverEl = document.getElementById("music-cover");
const toggleBtn = document.getElementById("music-toggle");
const skipBtn = document.getElementById("music-skip");
const progressEl = document.getElementById("music-progress");
const currentEl = document.getElementById("music-current");
const durationEl = document.getElementById("music-duration");

// Fonction de chargement sécurisée
function loadTrack(i) {
  const track = playlist[i];
  if (!track) return;
  
  music.src = track.src;
  if(titleEl) titleEl.textContent = track.title;
  if(artistEl) artistEl.textContent = track.artist;
  if(coverEl) coverEl.src = track.cover;
  
  music.load();
  // On ne fait play() que si c'est déclenché par un clic, 
  // sinon on attend que l'utilisateur appuie sur Play
}

// Play/Pause
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    // Si aucune musique n'est chargée, on charge la première
    if (!music.src) loadTrack(currentTrackIndex);
    
    if (music.paused) {
      music.play().catch(err => console.log("Erreur play:", err));
      toggleBtn.textContent = "⏸";
    } else {
      music.pause();
      toggleBtn.textContent = "▶";
    }
  });
}

// Skip
if (skipBtn) {
  skipBtn.addEventListener("click", () => {
    let next;
    do {
      next = Math.floor(Math.random() * playlist.length);
    } while (next === currentTrackIndex);
    currentTrackIndex = next;
    loadTrack(currentTrackIndex);
    music.play().catch(e => {});
  });
}

// Mise à jour de la barre de progression
music.addEventListener("timeupdate", () => {
  if (!isNaN(music.duration) && progressEl) {
    progressEl.value = (music.currentTime / music.duration) * 100;
    const m = Math.floor(music.currentTime / 60);
    const s = Math.floor(music.currentTime % 60).toString().padStart(2, "0");
    if(currentEl) currentEl.textContent = `${m}:${s}`;
  }
});

// Affichage de la durée totale
music.addEventListener("loadedmetadata", () => {
  if(durationEl) {
    const m = Math.floor(music.duration / 60);
    const s = Math.floor(music.duration % 60).toString().padStart(2, "0");
    durationEl.textContent = `${m}:${s}`;
  }
});

// Interaction avec la barre de progression
if (progressEl) {
  progressEl.addEventListener("input", () => {
    if (music.duration) {
      music.currentTime = (progressEl.value / 100) * music.duration;
    }
  });
}

// Passage à la suivante automatique
music.addEventListener("ended", () => {
  if (skipBtn) skipBtn.click();
});

// AU DÉMARRAGE : On prépare juste l'affichage (sans lancer le son)
const initialTrack = playlist[currentTrackIndex];
if(titleEl) titleEl.textContent = initialTrack.title;
if(artistEl) artistEl.textContent = initialTrack.artist;
if(coverEl) coverEl.src = initialTrack.cover;

// On lance la musique uniquement au premier clic sur la page pour respecter les navigateurs
document.addEventListener("click", () => {
  if (!music.src) {
    loadTrack(currentTrackIndex);
    music.play().then(() => {
        if(toggleBtn) toggleBtn.textContent = "⏸";
    }).catch(err => console.log("Lecture bloquée au démarrage"));
  }
}, { once: true });

// ---------------- Splash & Horloge ----------------
const splashes = ["Bienvenue sur mon site !", "Also try terraria !", "Notch is here ", " | VHS Style | ", "Easter Egg !"];
const splashText = document.getElementById("splash-text");
if(splashText) {
  setInterval(() => { splashText.textContent = splashes[Math.floor(Math.random() * splashes.length)]; }, 5000);
}

function updateClock() {
  const clock = document.getElementById("clock");
  const taskbarTime = document.getElementById("taskbar-time");
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if(taskbarTime) taskbarTime.textContent = timeStr;
  if(clock) {
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    clock.textContent = `${h}:${m} ${ampm}`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// ---------------- Mewo ----------------
const mewo = document.getElementById('mewo');
let mewoClicks = 0;
if(mewo) {
  const msg = document.createElement('div');
  msg.id = 'stop-message';
  msg.textContent = 'Stop 😾';
  document.body.appendChild(msg);
  mewo.addEventListener('click', () => {
    mewoClicks++;
    if(mewoClicks === 5) {
      msg.classList.add('show');
      setTimeout(() => { msg.classList.remove('show'); }, 3000);
      mewoClicks = 0;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
//  FIREBASE 
// ═══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    apiKey: "AIzaSyA0Wk9axU7QwTKoIbxHX8YyiIJV0NDxA0Y",
    authDomain: "hyl1a-web.firebaseapp.com",
    projectId: "hyl1a-web",
    storageBucket: "hyl1a-web.firebasestorage.app",
    messagingSenderId: "1056027646874",
    appId: "1:1056027646874:web:1860a91881f74b0c1cb823",
    measurementId: "G-3PDM4DWKGH"
  };

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- CHAT ---
  const chatMessages = document.getElementById('chat-messages');
  const chatPseudo = document.getElementById('chat-pseudo');
  const chatMessage = document.getElementById('chat-message');
  const chatSend = document.getElementById('chat-send');

  if (chatMessages) {
    db.collection('chat').orderBy('timestamp', 'asc').limitToLast(50).onSnapshot(snap => {
      chatMessages.innerHTML = '';
      snap.forEach(doc => {
        const d = doc.data();
        const t = d.timestamp ? d.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "...";
        chatMessages.innerHTML += `<div class="chat-message"><strong>${escapeHtml(d.pseudo || "Anonyme")}</strong> <small>${t}</small><p>${escapeHtml(d.message)}</p></div>`;
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  window.sendChatMessage = function() {
    const msg = chatMessage.value.trim();
    if (!msg) return;
    db.collection('chat').add({
      pseudo: chatPseudo.value.trim() || "Anonyme",
      message: msg,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => { chatMessage.value = ''; });
  }

  if (chatSend) chatSend.onclick = sendChatMessage;
  if (chatMessage) chatMessage.onkeypress = (e) => { if(e.key === 'Enter') sendChatMessage(); };

  // --- HALL OF FAME ---
  const hofList = document.getElementById('halloffame-list');
  const hofPseudo = document.getElementById('hof-pseudo');
  const hofMessage = document.getElementById('hof-message');
  const hofSubmit = document.getElementById('hof-submit');

  db.collection('halloffame').orderBy('timestamp', 'desc').onSnapshot(snap => {
    if (hofList) hofList.innerHTML = '';
    const items = [];
    snap.forEach(doc => {
      const d = doc.data();
      if (hofList) {
        hofList.innerHTML += `<div class="hof-signature"><strong> ${escapeHtml(d.pseudo)}</strong><p>${escapeHtml(d.message)}</p></div>`;
      }
      items.push(`<strong>${escapeHtml(d.pseudo)}:</strong> ${escapeHtml(d.message)} `);
    });

    // Ticker
    const oldTicker = document.querySelector('.hof-ticker');
    if (oldTicker) oldTicker.remove();
    if (items.length > 0) {
      const ticker = document.createElement('div');
      ticker.className = 'hof-ticker';
      ticker.innerHTML = `<div class="ticker-content">${items.map(i => `<span class="ticker-item">${i}</span>`).join('')}</div>`;
      document.body.appendChild(ticker);
    }
  });

  window.submitHof = function() {
    const p = hofPseudo.value.trim();
    const m = hofMessage.value.trim();
    if (!p || !m) return alert("Champs vides !");
    db.collection('halloffame').add({
      pseudo: p, message: m, timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      hofPseudo.value = ''; hofMessage.value = '';
      alert("Signé !");
    });
  }

  if (hofSubmit) hofSubmit.onclick = submitHof;
});