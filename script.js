// ✅ Wedding date (Colombo time safe-ish)
// Month is 0-based (5 = June). Here: June 27, 2026 7:00 PM
const weddingDate = new Date(2026, 5, 27, 19, 0, 0);

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

/* ✅ PASTE YOUR GOOGLE APPS SCRIPT WEB APP /exec URL HERE */
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function setStatus(type, msg) {
  statusEl.className = "status " + (type || "");
  statusEl.textContent = msg || "";
}

function heartBurst() {
  // tiny burst effect near the button (simple + safe for GitHub Pages)
  const btn = submitBtn.getBoundingClientRect();
  for (let i = 0; i < 10; i++) {
    const s = document.createElement("span");
    s.textContent = "♥";
    s.style.position = "fixed";
    s.style.left = btn.left + btn.width / 2 + "px";
    s.style.top = btn.top + btn.height / 2 + "px";
    s.style.fontSize = (10 + Math.random() * 10) + "px";
    s.style.color = ["#ff5c7f", "#d7b25c", "#ffffff"][Math.floor(Math.random() * 3)];
    s.style.opacity = "0.95";
    s.style.pointerEvents = "none";
    s.style.transform = "translate(-50%,-50%)";
    s.style.transition = "transform 900ms ease, opacity 900ms ease";
    document.body.appendChild(s);

    const dx = (Math.random() - 0.5) * 140;
    const dy = (Math.random() - 0.8) * 160;

    requestAnimationFrame(() => {
      s.style.transform = `translate(${dx}px, ${dy}px) scale(${0.8 + Math.random() * 0.8})`;
      s.style.opacity = "0";
    });

    setTimeout(() => s.remove(), 950);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!APPS_SCRIPT_URL || !APPS_SCRIPT_URL.includes("/exec")) {
    setStatus("err", "❌ Apps Script URL not set. Paste your /exec URL into script.js");
    return;
  }

  const reservationName = document.getElementById("reservationName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const adults = document.getElementById("adults").value;
  const children = document.getElementById("children").value;
  const attending = document.getElementById("attending").value;
  const note = document.getElementById("note").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!reservationName || adults === "") {
    setStatus("err", "Please enter Reservation Name and Adults count.");
    return;
  }

  submitBtn.disabled = true;
  setStatus("", "Submitting…");

  const payload = {
    reservationName,
    phone,
    adults: Number(adults || 0),
    children: Number(children || 0),
    attending,
    message,
    note
  };

  try {
    // IMPORTANT: Apps Script web apps sometimes require text/plain to avoid CORS preflight issues.
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const txt = await res.text();
    let data = {};
    try { data = JSON.parse(txt); } catch {}

    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    heartBurst();
    setStatus("ok", "✅ Submitted! Thank you.");
    form.reset();
  } catch (err) {
    setStatus("err", "❌ Network error. " + (err?.message || "Please try again."));
  } finally {
    submitBtn.disabled = false;
  }
});
