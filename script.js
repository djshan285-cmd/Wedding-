// ====== SETTINGS ======

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

// Event date: June is month 5 (0-based). 4:00 PM start.
const weddingDate = new Date(2026, 5, 20, 16, 0, 0);

// Map pin
const PIN = { lat: 6.9058071, lng: 79.9117206 };
const SL_CENTER = { lat: 7.8731, lng: 80.7718 }; // Sri Lanka center

// ====== HELPERS ======
const $ = (id) => document.getElementById(id);

function pad2(n){ return String(n).padStart(2,"0"); }

// ====== COUNTDOWN with tick animation ======
const ids = {
  d: $("cdDays"),
  h: $("cdHours"),
  m: $("cdMins"),
  s: $("cdSecs"),
};

const last = { d:null, h:null, m:null, s:null };

function setTick(el, value, key){
  if (!el) return;
  if (last[key] !== value){
    el.textContent = value;
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
    last[key] = value;
  }
}

function updateCountdown(){
  const now = new Date();
  let diff = weddingDate - now;
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  setTick(ids.d, days, "d");
  setTick(ids.h, pad2(hours), "h");
  setTick(ids.m, pad2(mins), "m");
  setTick(ids.s, pad2(secs), "s");
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ====== BACKGROUND HEARTS ======
const heartsHost = document.querySelector(".bgHearts");

function spawnHeart(){
  if (!heartsHost) return;

  const h = document.createElement("div");
  h.className = "heart";
  const icons = ["♥","♡","💕","💗","💖"];
  h.textContent = icons[Math.floor(Math.random() * icons.length)];

  const left = Math.random() * 100;
  const size = 14 + Math.random() * 18;
  const duration = 8 + Math.random() * 9;

  h.style.left = left + "vw";
  h.style.bottom = (-10) + "vh";
  h.style.fontSize = size + "px";
  h.style.animationDuration = duration + "s";

  const tints = ["#ff6b90","#ff8fb1","#f7b5c8","#ffd1dc","#f2a7b8"];
  h.style.color = tints[Math.floor(Math.random() * tints.length)];

  heartsHost.appendChild(h);
  setTimeout(() => h.remove(), duration * 1000);
}

for(let i=0;i<18;i++){
  setTimeout(spawnHeart, i * 220);
}
setInterval(spawnHeart, 520);

// ====== RSVP submit + love burst animation ======
const form = $("rsvpForm");
const statusEl = $("status");
const toast = $("loveToast");
const submitBtn = $("submitBtn");

function burstHearts(){
  if (!form) return;

  const parent = form;
  const rect = parent.getBoundingClientRect();

  for(let i=0;i<14;i++){
    const b = document.createElement("div");
    b.className = "burstHeart";
    b.textContent = ["♥","💗","💕","💖"][Math.floor(Math.random()*4)];

    const dx = (Math.random() * 260 - 130) + "px";
    const dy = (-40 - Math.random() * 140) + "px";
    b.style.setProperty("--dx", dx);
    b.style.setProperty("--dy", dy);

    b.style.top = (rect.height - 52) + "px";

    parent.appendChild(b);
    setTimeout(()=> b.remove(), 1500);
  }
}

if (form){
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (statusEl) statusEl.textContent = "";
    if (toast) toast.textContent = "";
    if (submitBtn){
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.85";
    }

    const fd = new FormData(form);
    const payload = new URLSearchParams(fd);

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: payload.toString(),
      });

      if (toast){
        toast.textContent = "Submitted! Thank you. ❤️";
        toast.style.color = "#2b7a4b";
      }

      burstHearts();
      form.reset();

    } catch (err) {
      if (statusEl) statusEl.textContent = "Sorry — submit failed. Please try again.";
      if (toast) toast.textContent = "";
    } finally {
      if (submitBtn){
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      }
    }
  });
}

// ====== MAP ======
function initMap(){
  if (!window.L) return;

  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  const map = L.map("map", {
    zoomControl: true,
    attributionControl: false
  }).setView([SL_CENTER.lat, SL_CENTER.lng], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
  }).addTo(map);

  const marker = L.marker([PIN.lat, PIN.lng]).addTo(map);
  marker.bindPopup("<b>Waters Edge</b><br/>Rajagiriya<br/>4:00 PM – 10:00 PM").openPopup();
}
initMap();

// ====== MUSIC ======
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

async function tryPlay(){
  if (!music) return;
  music.volume = 0.25;
  try { await music.play(); } catch(e) {}
}

tryPlay();
window.addEventListener("pointerdown", tryPlay, { once: true });

if (musicBtn){
  musicBtn.addEventListener("click", async () => {
    if (!music) return;

    if (music.paused){
      await tryPlay();
      musicBtn.textContent = "❚❚ Pause";
    } else {
      music.pause();
      musicBtn.textContent = "♪ Music";
    }
  });
}

// ====== ENVELOPE INTRO ======
const overlay = document.getElementById("envelopeOverlay");
const openBtn = document.getElementById("openInviteBtn");

if (overlay && openBtn) {
  openBtn.addEventListener("click", () => {
    overlay.classList.add("open");
    setTimeout(() => overlay.classList.add("hide"), 900);
    tryPlay();
  });
}
