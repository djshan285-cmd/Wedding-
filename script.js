// ====== CONFIG ======
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

// Wedding date (Local time). Month is 0-based: 5 = June
const weddingDate = new Date(2026, 5, 27, 19, 0, 0); // June 27, 2026 7:00 PM

// ====== Helpers ======
function pad(n){ return String(n).padStart(2, "0"); }

function pulse(el){
  el.classList.remove("pulse");
  // force reflow
  void el.offsetWidth;
  el.classList.add("pulse");
}

function setTick(id, value){
  const el = document.getElementById(id);
  if (!el) return;
  if (el.textContent !== String(value)){
    el.textContent = value;
    pulse(el);
  }
}

// ====== Countdown ======
function updateCountdown(){
  const now = new Date();
  let diff = weddingDate - now;
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  setTick("d", days);
  setTick("h", pad(hours));
  setTick("m", pad(mins));
  setTick("s", pad(secs));
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ====== RSVP submit + success animation ======
const form = document.getElementById("rsvpForm");
const success = document.getElementById("success");

function heartBurst(){
  const span = document.createElement("span");
  span.className = "heartBurst";
  span.textContent = "💖";
  return span;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  const payload = {
    reservationName: (fd.get("reservationName") || "").toString().trim(),
    phone: (fd.get("phone") || "").toString().trim(),
    adults: (fd.get("adults") || "").toString().trim(),
    children: (fd.get("children") || "").toString().trim(),
    attending: (fd.get("attending") || "").toString(),
    note: (fd.get("note") || "").toString().trim(),
    message: (fd.get("message") || "").toString().trim(),
  };

  // quick validation (adults must be number-ish)
  if (!payload.reservationName) return;
  if (!payload.adults) return;

  success.textContent = "Submitting...";
  success.classList.add("show");

  try{
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok !== true){
      throw new Error(data.error || "Submit failed");
    }

    // Joyful success
    success.textContent = "Submitted! Thank you.";
    success.appendChild(heartBurst());
    success.classList.add("show");

    form.reset();

  }catch(err){
    success.textContent = "Sorry — submit failed. Please try again.";
    success.classList.add("show");
    console.error(err);
  }
});

// ====== Floating hearts + sparkles ======
function rand(min, max){ return Math.random() * (max - min) + min; }

function makeHearts(){
  const wrap = document.getElementById("hearts");
  if (!wrap) return;

  const count = 14;
  for (let i=0; i<count; i++){
    const s = document.createElement("span");
    s.textContent = "♥";
    s.style.left = rand(0, 100) + "vw";
    s.style.fontSize = rand(14, 28) + "px";
    s.style.animationDuration = rand(10, 18) + "s";
    s.style.animationDelay = rand(0, 6) + "s";
    wrap.appendChild(s);
  }
}

function makeSparkles(){
  const wrap = document.getElementById("sparkles");
  if (!wrap) return;

  const count = 22;
  for (let i=0; i<count; i++){
    const s = document.createElement("span");
    s.style.left = rand(0, 100) + "vw";
    s.style.top = rand(0, 100) + "vh";
    s.style.animationDuration = rand(2.2, 4.8) + "s";
    s.style.animationDelay = rand(0, 2.2) + "s";
    wrap.appendChild(s);
  }
}

makeHearts();
makeSparkles();

// ====== Music autoplay attempt (with fallback) ======
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");

function fadeTo(audio, target=0.22, ms=800){
  const start = audio.volume;
  const t0 = performance.now();
  function step(t){
    const p = Math.min(1, (t - t0) / ms);
    audio.volume = start + (target - start) * p;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

async function tryAutoplay(){
  if (!bgm) return;

  bgm.volume = 0.0; // start silent then fade to mild sound
  try{
    await bgm.play();
    fadeTo(bgm, 0.18, 900);
    if (musicBtn) musicBtn.style.display = "none";
  }catch{
    // autoplay blocked -> show button
    if (musicBtn) musicBtn.style.display = "inline-flex";
  }
}

musicBtn?.addEventListener("click", async () => {
  if (!bgm) return;
  try{
    await bgm.play();
    fadeTo(bgm, 0.18, 700);
    musicBtn.textContent = "🔊 Music on (tap to pause)";
  }catch{
    // ignore
  }
});

musicBtn?.addEventListener("dblclick", () => {
  // quick pause on double click
  if (!bgm) return;
  bgm.pause();
  musicBtn.textContent = "🔈 Tap to play music";
});

tryAutoplay();

// Also try again on first user interaction (helps on mobile)
window.addEventListener("pointerdown", () => {
  if (!bgm) return;
  if (bgm.paused) tryAutoplay();
}, { once: true });
