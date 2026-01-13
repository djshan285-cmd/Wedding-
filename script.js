// ✅ Wedding date (Colombo time safe-ish)
// Month is 0-based in JS: 5 = June
const weddingDate = new Date(2026, 5, 27, 19, 0, 0); // June 27, 2026 7:00 PM

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

/* ✅ Your Google Apps Script Web App /exec URL */
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function setStatus(type, msg) {
  statusEl.className = "status " + (type || "");
  statusEl.textContent = msg || "";
}

function heartBurst(x, y) {
  // small heart burst animation on success
  const hearts = 10;
  for (let i = 0; i < hearts; i++) {
    const el = document.createElement("div");
    el.textContent = "♡";
    el.style.position = "fixed";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.zIndex = 9999;
    el.style.pointerEvents = "none";
    el.style.fontSize = 14 + Math.random() * 18 + "px";
    el.style.color = ["#ff6b8a", "#d9b25f", "#c49bff"][Math.floor(Math.random() * 3)];
    el.style.opacity = "0.95";
    document.body.appendChild(el);

    const dx = (Math.random() - 0.5) * 180;
    const dy = (Math.random() - 1.0) * 180;

    el.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 0.95 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.8)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.2,1)" }
    ).onfinish = () => el.remove();
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const reservationName = document.getElementById("reservationName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const adults = document.getElementById("adults").value.trim(); // maps to Adults column
  const attending = document.getElementById("attending").value;
  const message = document.getElementById("message").value.trim();

  if (!reservationName || !adults) {
    setStatus("err", "Please enter Reservation Name and How many will attend.");
    return;
  }

  submitBtn.disabled = true;
  setStatus("", "Submitting...");

  // Sheet mapping:
  // Timestamp | ReservationName | # | Phone | Adults | Children | Attending | Message | Note
  // UI stays same as your screenshot:
  // - Adults = "How many will attend?"
  // - Children = 0
  // - Note = ""
  const payload = {
    reservationName,
    phone,
    adults: Number(adults),
    children: 0,
    attending,
    message,
    note: "",
  };

  try {
    // Avoid CORS issues on GitHub Pages
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    setStatus("ok", "✅ Submitted! Thank you.");
    const rect = submitBtn.getBoundingClientRect();
    heartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

    form.reset();
    document.getElementById("attending").value = "Yes";
  } catch (err) {
    setStatus("err", "❌ Network error. Please try again.");
  } finally {
    submitBtn.disabled = false;
  }
});
