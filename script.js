// ✅ Wedding date (Colombo time safe-ish)
// Month is 0-based: 5 = June
const weddingDate = new Date(2026, 5, 27, 19, 0, 0); // June 27, 2026 7:00 PM (local browser time)

// ✅ Paste your Google Apps Script WEB APP /exec URL here
// (You already have one — keep it exactly like this)
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

function pad(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  let diff = weddingDate - now;
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  document.getElementById("d").textContent = String(days);
  document.getElementById("h").textContent = pad(hours);
  document.getElementById("m").textContent = pad(mins);
  document.getElementById("s").textContent = pad(secs);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- RSVP Submit ----------
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

const overlay = document.getElementById("thanksOverlay");
const closeThanks = document.getElementById("closeThanks");

function setStatus(type, msg) {
  statusEl.className = "status " + (type || "");
  statusEl.textContent = msg || "";
}

function isUrlSet(url) {
  return url && url.startsWith("https://script.google.com/macros/s/") && url.includes("/exec");
}

// Heart burst effect
function heartBurst(x, y, count = 14) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.textContent = "❤";
    h.style.position = "fixed";
    h.style.left = x + "px";
    h.style.top = y + "px";
    h.style.fontSize = (12 + Math.random() * 18) + "px";
    h.style.color = "rgba(255,91,138,.95)";
    h.style.pointerEvents = "none";
    h.style.zIndex = 60;
    h.style.filter = "drop-shadow(0 10px 16px rgba(255,91,138,.25))";

    const dx = (Math.random() - 0.5) * 220;
    const dy = - (120 + Math.random() * 220);
    const rot = (Math.random() - 0.5) * 90;

    h.animate([
      { transform: `translate(0,0) rotate(0deg) scale(1)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(1.3)`, opacity: 0 }
    ], {
      duration: 900 + Math.random() * 500,
      easing: "cubic-bezier(.2,.9,.2,1)"
    });

    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1600);
  }
}

function showThanks() {
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
}
function hideThanks() {
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
}
closeThanks.addEventListener("click", hideThanks);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) hideThanks();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // If URL is not set, show error
  if (!isUrlSet(APPS_SCRIPT_URL)) {
    setStatus("err", "❌ Apps Script URL not set. Paste your /exec URL into script.js (APPS_SCRIPT_URL).");
    return;
  }

  const reservationName = document.getElementById("reservationName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const adults = document.getElementById("adults").value.trim();
  const children = document.getElementById("children").value.trim();
  const attending = document.getElementById("attending").value;
  const note = document.getElementById("note").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!reservationName || adults === "") {
    setStatus("err", "❌ Please enter Reservation Name and Adults count.");
    return;
  }

  submitBtn.disabled = true;
  setStatus("", "Submitting…");

  // IMPORTANT:
  // To avoid CORS preflight issues, we send as text/plain with JSON string body.
  const payload = {
    reservationName,
    phone,
    adults: Number(adults || 0),
    children: Number(children || 0),
    attending,
    note,
    message
  };

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      // do NOT add application/json header (causes preflight)
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    // Apps Script often returns opaque/cors-limited responses.
    // If request completes, we treat it as success.
    // (If your sheet updates, it's working.)
    setStatus("ok", "✅ Submitted! Thank you.");
    showThanks();

    // Heart burst from button
    const r = submitBtn.getBoundingClientRect();
    heartBurst(r.left + r.width / 2, r.top + r.height / 2, 16);

    form.reset();
  } catch (err) {
    console.error(err);
    setStatus("err", "❌ Network error. Please try again.");
  } finally {
    submitBtn.disabled = false;
  }
});
