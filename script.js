// ====== SET THESE TWO VALUES ======
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

// Wedding date (local time). Month is 0-based: 5 = June
const weddingDate = new Date(2026, 5, 27, 19, 0, 0); // June 27 2026, 7:00 PM

// ====== HELPERS ======
function pad(n){ return String(n).padStart(2, "0"); }

function setText(id, val){
  const el = document.getElementById(id);
  if (!el) return;

  const newVal = String(val);
  if (el.textContent !== newVal){
    el.textContent = newVal;
    el.classList.remove("tick");
    // reflow to restart animation
    void el.offsetWidth;
    el.classList.add("tick");
  }
}

// ====== COUNTDOWN ======
function updateCountdown(){
  const now = new Date();
  let diff = weddingDate - now;
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  setText("d", pad(days));
  setText("h", pad(hours));
  setText("m", pad(mins));
  setText("s", pad(secs));
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ====== RSVP SUBMIT ======
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");
const burst = document.getElementById("successBurst");

function showBurst(){
  if (!burst) return;
  burst.innerHTML = "";
  const hearts = ["💛","💖","💞","💗","❤️"];
  for (let i=0; i<12; i++){
    const h = document.createElement("div");
    h.className = "burstHeart";
    h.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    const x = (Math.random()*220 - 110).toFixed(0) + "px";
    h.style.setProperty("--x", x);
    h.style.animationDelay = (Math.random()*0.12).toFixed(2) + "s";
    burst.appendChild(h);
  }
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    reservationName: document.getElementById("reservationName")?.value?.trim() || "",
    phone: document.getElementById("phone")?.value?.trim() || "",
    adults: document.getElementById("adults")?.value || "",
    children: document.getElementById("children")?.value || "",
    attending: document.getElementById("attending")?.value || "Yes",
    note: document.getElementById("note")?.value?.trim() || "",
    message: document.getElementById("message")?.value?.trim() || ""
  };

  submitBtn.disabled = true;
  statusEl.textContent = "Submitting…";

  try{
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}

    if (!res.ok || data.ok === false){
      throw new Error(data.error || "Submit failed. Please try again.");
    }

    statusEl.style.color = "#1f7a46";
    statusEl.textContent = "Submitted! Thank you. 💖";
    showBurst();
    form.reset();

  }catch(err){
    statusEl.style.color = "#b00020";
    statusEl.textContent = String(err.message || err);
  }finally{
    submitBtn.disabled = false;
  }
});

// ====== MUSIC AUTOPLAY (browser-safe) ======
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

// You asked: autoplay when link opened.
// Reality: browsers block autoplay-with-sound.
// So we do: try play muted -> then unmute on first tap/click anywhere.
let userUnlocked = false;

function setMusicUI(isOn){
  if (!musicBtn) return;
  musicBtn.classList.toggle("on", isOn);
  musicBtn.textContent = isOn ? "❚❚" : "♪";
  musicBtn.title = isOn ? "Pause music" : "Play music";
}

async function tryAutoPlay(){
  if (!music) return;

  music.volume = 0.18;     // mild sound
  music.muted = true;      // allowed to autoplay
  try{
    await music.play();
    setMusicUI(true);
  }catch{
    setMusicUI(false);
  }
}

function unlockSound(){
  if (!music || userUnlocked) return;
  userUnlocked = true;
  music.muted = false;
  music.volume = 0.18;
  music.play().then(()=>setMusicUI(true)).catch(()=>setMusicUI(false));
}

tryAutoPlay();

// First user interaction unlocks sound
window.addEventListener("pointerdown", unlockSound, { once:true });
window.addEventListener("keydown", unlockSound, { once:true });

musicBtn?.addEventListener("click", async () => {
  if (!music) return;

  // any click counts as unlock
  if (!userUnlocked){
    unlockSound();
    return;
  }

  if (music.paused){
    try{ await music.play(); setMusicUI(true); }catch{ setMusicUI(false); }
  } else {
    music.pause();
    setMusicUI(false);
  }
});
