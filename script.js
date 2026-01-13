// ✅ Wedding date (Local time). Month is 0-based: 5 = June
const weddingDate = new Date(2026, 5, 27, 19, 0, 0); // June 27, 2026 7:00 PM

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

/* ✅ Your Google Apps Script Web App URL (EXEC) */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

const overlay = document.getElementById("thanksOverlay");

function setStatus(type, msg){
  statusEl.className = "status " + (type || "");
  statusEl.textContent = msg || "";
}

function showThanks(){
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
  // auto-close
  setTimeout(() => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  }, 1800);
}

function heartBurst(x, y){
  // small burst particles
  const n = 12;
  for (let i = 0; i < n; i++){
    const p = document.createElement("div");
    p.textContent = "♥";
    p.style.position = "fixed";
    p.style.left = x + "px";
    p.style.top  = y + "px";
    p.style.fontSize = (12 + Math.random()*18) + "px";
    p.style.color = "rgba(255,95,143,.95)";
    p.style.pointerEvents = "none";
    p.style.zIndex = 9999;
    p.style.transform = "translate(-50%,-50%)";
    document.body.appendChild(p);

    const ang = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist;

    p.animate([
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.6)`, opacity: 0 }
    ], {
      duration: 900 + Math.random()*300,
      easing: "cubic-bezier(.2,.7,.2,1)",
      fill: "forwards"
    }).onfinish = () => p.remove();
  }
}

async function postJson(url, payload){
  // Try normal CORS first; if it fails, fallback to no-cors
  try{
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    // If Apps Script returns JSON (CORS enabled), read it:
    const text = await r.text();
    try { return JSON.parse(text); } catch { return { ok: true, raw: text }; }

  }catch(err){
    // fallback: no-cors (cannot read response, but submits)
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return { ok: true, noCors: true };
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const reservationName = document.getElementById("reservationName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const adults = document.getElementById("adults").value;
  const children = document.getElementById("children").value;
  const attending = document.getElementById("attending").value;
  const note = document.getElementById("note").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!APPS_SCRIPT_URL || !APPS_SCRIPT_URL.includes("script.google.com/macros/s/")){
    setStatus("err", "❌ Apps Script URL not set. Paste your /exec URL into script.js");
    return;
  }

  if (!reservationName || adults === ""){
    setStatus("err", "Please enter Reservation Name and Adults count.");
    return;
  }

  submitBtn.disabled = true;
  setStatus("", "Submitting...");

  const payload = {
    reservationName,
    phone,
    adults: adults === "" ? "" : Number(adults),
    children: children === "" ? "" : Number(children),
    attending,
    message,
    note
  };

  try{
    const result = await postJson(APPS_SCRIPT_URL, payload);

    setStatus("ok", "✅ Submitted! Thank you.");
    showThanks();

    // burst hearts from button center
    const rect = submitBtn.getBoundingClientRect();
    heartBurst(rect.left + rect.width/2, rect.top + rect.height/2);

    form.reset();
  }catch(err){
    setStatus("err", "❌ Submit failed. Please try again.");
  }finally{
    submitBtn.disabled = false;
  }
});
