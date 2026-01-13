// Wedding date: June 27, 2026 (Saturday) 7:00 PM
const weddingDate = new Date(2026, 5, 27, 19, 0, 0); // month=5 is June

function pad(n){ return String(n).padStart(2, "0"); }

function updateCountdown(){
  const now = new Date();
  let diff = weddingDate - now;
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const days  = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins  = Math.floor((totalSeconds % 3600) / 60);
  const secs  = totalSeconds % 60;

  document.getElementById("d").textContent = pad(days);
  document.getElementById("h").textContent = pad(hours);
  document.getElementById("m").textContent = pad(mins);
  document.getElementById("s").textContent = pad(secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ✅ Your Web App /exec URL (THIS ONE IS CORRECT)
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function setStatus(msg, ok=true){
  statusEl.textContent = msg;
  statusEl.style.color = ok ? "#2f7a4b" : "#a03a54";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // IMPORTANT: stops ?reservationName=... URL

  const reservationName = document.getElementById("reservationName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const adults = document.getElementById("adults").value;
  const children = document.getElementById("children").value;
  const attending = document.getElementById("attending").value;
  const note = document.getElementById("note").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!reservationName){
    setStatus("Please enter Reservation Name.", false);
    return;
  }
  if (adults === "" || Number(adults) < 0){
    setStatus("Please enter Adults count (0 or more).", false);
    return;
  }

  submitBtn.disabled = true;
  setStatus("Submitting...", true);

  const payload = {
    reservationName,
    phone,
    adults: Number(adults),
    children: children === "" ? "" : Number(children),
    attending,
    message,
    note
  };

  try{
    // use text/plain to avoid some Apps Script preflight issues
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let data = {};
    try{ data = JSON.parse(text); } catch(_) {}

    if (!res.ok || data.ok === false){
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    setStatus("Submitted! Thank you. 💖", true);
    form.reset();
    document.getElementById("children").value = 0;

  }catch(err){
    setStatus("Submit failed: " + String(err.message || err), false);
  }finally{
    submitBtn.disabled = false;
  }
});

// Floating hearts + sparkles (premium love vibe)
const heartsRoot = document.getElementById("hearts");
const sparkRoot = document.getElementById("sparkles");

function spawnHeart(){
  const el = document.createElement("div");
  el.className = "heart";
  el.textContent = Math.random() < 0.5 ? "♡" : "♥";

  const left = Math.random() * 100;
  const size = 14 + Math.random() * 22;
  const dur = 6 + Math.random() * 6;
  const drift = (Math.random() * 140 - 70) + "px";

  el.style.left = left + "vw";
  el.style.bottom = "-10vh";
  el.style.fontSize = size + "px";
  el.style.animationDuration = dur + "s";
  el.style.setProperty("--drift", drift);

  heartsRoot.appendChild(el);
  setTimeout(() => el.remove(), (dur + 0.5) * 1000);
}

function spawnSpark(){
  const el = document.createElement("div");
  el.className = "spark";

  el.style.left = (Math.random() * 100) + "vw";
  el.style.top  = (Math.random() * 100) + "vh";
  el.style.animationDuration = (1.8 + Math.random() * 1.6) + "s";

  sparkRoot.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// steady stream (not too heavy)
setInterval(spawnHeart, 550);
setInterval(spawnSpark, 420);
