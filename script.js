// ====== SETTINGS ======

// Your Apps Script URL (same one you used)
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

// Event date: June is month 5 (0-based). 4:00 PM start.
const weddingDate = new Date(2026, 5, 20, 16, 0, 0);

// Map pin (Waters Edge - Rajagiriya) — you can fine-tune later if needed
const PIN = { lat: 6.904917, lng: 79.908601 };
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
  if (last[key] !== value){
    el.textContent = value;
    el.classList.remove("tick");
    // force reflow
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

// ====== BACKGROUND HEARTS (more visible + more frequent) ======
const heartsHost = document.querySelector(".bgHearts");

function spawnHeart(){
  const h = document.createElement("div");
  h.className = "heart";
  const icons = ["♥","♡","💕","💗","💖"];
  h.textContent = icons[Math.floor(Math.random() * icons.length)];

  const left = Math.random() * 100;             // vw
  const size = 14 + Math.random() * 18;         // px
  const duration = 8 + Math.random() * 9;       // sec

  h.style.left = left + "vw";
  h.style.bottom = (-10) + "vh";
  h.style.fontSize = size + "px";
  h.style.animationDuration = duration + "s";

  // slightly random tint
  const tints = ["#ff6b90","#ff8fb1","#f7b5c8","#ffd1dc","#f2a7b8"];
  h.style.color = tints[Math.floor(Math.random() * tints.length)];

  heartsHost.appendChild(h);
  setTimeout(() => h.remove(), duration * 1000);
}

// start with some hearts already visible
for(let i=0;i<18;i++){
  setTimeout(spawnHeart, i * 220);
}
// continuous
setInterval(spawnHeart, 520);

// ====== RSVP submit + love burst animation ======
const form = $("rsvpForm");
const statusEl = $("status");
const toast = $("loveToast");
const submitBtn = $("submitBtn");

function burstHearts(){
  // burst from bottom center of RSVP card
  const parent = form;
  const rect = parent.getBoundingClientRect();

  for(let i=0;i<14;i++){
    const b = document.createElement("div");
    b.className = "burstHeart";
    b.textContent = ["♥","💗","💕","💖"][Math.floor(Math.random()*4)];

    // random burst direction
    const dx = (Math.random() * 260 - 130) + "px";
    const dy = (-40 - Math.random() * 140) + "px";
    b.style.setProperty("--dx", dx);
    b.style.setProperty("--dy", dy);

    // position near bottom-center of the form
    b.style.top = (rect.height - 52) + "px";

    parent.appendChild(b);
    setTimeout(()=> b.remove(), 1500);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  toast.textContent = "";
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.85";

  const fd = new FormData(form);
  const payload = new URLSearchParams(fd);

  try {
    // IMPORTANT: Apps Script often needs no-cors from static sites
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: payload.toString(),
    });

    // With no-cors we can't read response; assume ok
    statusEl.textContent = "";
    toast.textContent = "Submitted! Thank you. ❤️";
    toast.style.color = "#2b7a4b";

    burstHearts();
    form.reset();

  } catch (err) {
    statusEl.textContent = "Sorry — submit failed. Please try again.";
    toast.textContent = "";
  } finally {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
  }
});

// ====== CLEAN MAP (Sri Lanka view + pinned venue) ======
function initMap(){
  const map = L.map("map", {
    zoomControl: true,
    attributionControl: false
  }).setView([SL_CENTER.lat, SL_CENTER.lng], 7); // whole Sri Lanka view

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
  }).addTo(map);

  const marker = L.marker([PIN.lat, PIN.lng]).addTo(map);
  marker.bindPopup("<b>Waters Edge</b><br/>Rajagiriya<br/>4:00 PM – 10:00 PM").openPopup();
}
initMap();

// ====== MUSIC AUTOPLAY (will be blocked until first user interaction sometimes) ======
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

async function tryPlay(){
  if (!music) return;
  music.volume = 0.25; // mild sound
  try { await music.play(); } catch(e) {}
}

// try autoplay
tryPlay();

// first user gesture will allow it
window.addEventListener("pointerdown", tryPlay, { once: true });

musicBtn.addEventListener("click", async () => {
  if (music.paused){
    await tryPlay();
    musicBtn.textContent = "❚❚ Pause";
  } else {
    music.pause();
    musicBtn.textContent = "♪ Music";
  }
});
