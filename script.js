// ============================
// CONFIG
// ============================

// ✅ Your Apps Script Web App URL (/exec)
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

// Wedding date (Local time). Month is 0-based: 5 = June
const weddingDate = new Date(2026, 5, 27, 19, 0, 0);

// Dropdown max
const MAX_ADULTS = 2;
const MAX_CHILDREN = 2;

// ============================
// Helpers
// ============================
const $ = (id) => document.getElementById(id);

function pad2(n){ return String(n).padStart(2,"0"); }

function buildQS(params){
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => {
    usp.set(k, String(v ?? ""));
  });
  // cache-bust
  usp.set("_ts", String(Date.now()));
  return usp.toString();
}

// Submit via hidden iframe (avoids CORS/XHR problems)
// Works with Apps Script doGet or doPost (we do GET navigation)
function submitViaIframe(url, params){
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.name = "rsvp_iframe_" + Date.now();

    let done = false;

    const cleanup = () => {
      setTimeout(() => iframe.remove(), 500);
    };

    iframe.onload = () => {
      if (done) return;
      done = true;
      cleanup();
      resolve(true);
    };

    iframe.onerror = () => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error("iframe submit failed"));
    };

    document.body.appendChild(iframe);

    const src = url + "?" + buildQS(params);
    iframe.src = src;

    // safety timeout (if Apps Script is slow)
    setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      // still treat as success (Apps Script often returns slowly but saves)
      resolve(true);
    }, 6000);
  });
}

// Joyful hearts burst
function heartsBurst(){
  const layer = $("successFX");
  if (!layer) return;
  layer.innerHTML = "";

  const rect = layer.getBoundingClientRect();
  const hearts = 14;

  for(let i=0;i<hearts;i++){
    const h = document.createElement("div");
    h.className = "popHeart";
    h.textContent = (i % 3 === 0) ? "💖" : "💗";
    const x = Math.random() * rect.width;
    const y = rect.height - 30 + Math.random() * 20;
    h.style.left = x + "px";
    h.style.top = y + "px";
    h.style.animationDelay = (Math.random() * 0.18) + "s";
    h.style.fontSize = (18 + Math.random() * 14) + "px";
    layer.appendChild(h);
  }
}

// Countdown update + tick animation
function setTick(el, value){
  if (!el) return;
  if (el.textContent !== value){
    el.textContent = value;
    el.classList.remove("tick");
    // trigger reflow
    void el.offsetWidth;
    el.classList.add("tick");
    setTimeout(() => el.classList.remove("tick"), 180);
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

  setTick($("cdDays"), String(days));
  setTick($("cdHours"), pad2(hours));
  setTick($("cdMins"), pad2(mins));
  setTick($("cdSecs"), pad2(secs));
}

// ============================
// Music autoplay logic
// ============================
// Browsers often BLOCK autoplay with sound.
// We try to autoplay muted first, then user can tap Music once to enable sound.
async function initMusic(){
  const audio = $("bgMusic");
  const btn = $("musicBtn");
  const label = $("musicLabel");

  if (!audio || !btn || !label) return;

  audio.volume = 0.18;       // mild sound
  audio.muted = true;        // allow autoplay attempt
  audio.loop = true;

  const setUI = (on) => {
    btn.classList.toggle("on", on);
    label.textContent = on ? "Music On" : "Music";
  };

  // attempt autoplay (muted)
  try{
    await audio.play();
    setUI(true);
  }catch{
    // autoplay blocked even muted (some browsers)
    setUI(false);
  }

  // button toggles
  btn.addEventListener("click", async () => {
    try{
      if (audio.paused){
        audio.muted = false;
        await audio.play();
        setUI(true);
      }else{
        audio.pause();
        setUI(false);
      }
    }catch{
      // If blocked, try muted play then ask user to click again
      audio.muted = true;
      try{ await audio.play(); setUI(true); }catch{}
    }
  });

  // First user interaction anywhere -> unmute once (optional)
  const unlock = async () => {
    if (!audio.paused){
      audio.muted = false;
      // keep mild volume
      audio.volume = 0.18;
    }
    window.removeEventListener("pointerdown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
}

// ============================
// Dropdowns
// ============================
function fillSelect(selectEl, max){
  for(let i=0;i<=max;i++){
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = String(i);
    selectEl.appendChild(opt);
  }
}

// ============================
// Form submit
// ============================
function setStatus(msg, isError=false){
  const el = $("status");
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle("err", isError);
}

function clearForm(){
  $("rsvpForm").reset();
  // restore placeholders selected state
  $("adults").selectedIndex = 0;
  $("children").selectedIndex = 0;
}

function initForm(){
  const form = $("rsvpForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Submitting…", false);

    const payload = {
      reservationName: $("reservationName").value.trim(),
      phone: $("phone").value.trim(),
      adults: $("adults").value,
      children: $("children").value || "0",
      attending: $("attending").value,
      note: $("note").value.trim(),
      message: $("message").value.trim(),
    };

    if (!payload.reservationName){
      setStatus("Please enter Reservation Name.", true);
      return;
    }
    if (!payload.adults){
      setStatus("Please select Adults count.", true);
      return;
    }

    // IMPORTANT:
    // Apps Script WebApp must be:
    // Deploy -> "Web app" -> Who has access: "Anyone" (or Anyone with link)
    try{
      await submitViaIframe(APPS_SCRIPT_URL, payload);

      setStatus("Submitted! Thank you. 💖", false);
      heartsBurst();
      clearForm();

      // small extra joy
      window.scrollTo({ top: 0, behavior: "smooth" });
    }catch(err){
      setStatus("Sorry — submit failed. Please try again.", true);
      console.error(err);
    }
  });
}

// ============================
// Init
// ============================
document.addEventListener("DOMContentLoaded", () => {
  // countdown
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // dropdowns
  fillSelect($("adults"), MAX_ADULTS);
  fillSelect($("children"), MAX_CHILDREN);

  // music
  initMusic();

  // form
  initForm();
});
