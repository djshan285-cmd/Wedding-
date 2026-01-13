// ✅ Wedding date (Local time). Month is 0-based: 5 = June
const weddingDate = new Date(2026, 5, 27, 19, 0, 0); // June 27, 2026 7:00 PM

function pad(n) { return String(n).padStart(2, "0"); }

// ✅ Google Apps Script Web App /exec URL
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

// Countdown elements
const elD = document.getElementById("d");
const elH = document.getElementById("h");
const elM = document.getElementById("m");
const elS = document.getElementById("s");

// For tick animation comparison
let last = { d: null, h: null, m: null, s: null };

function tick(el) {
  el.classList.remove("tick");
  // force reflow so animation re-triggers
  void el.offsetWidth;
  el.classList.add("tick");
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

  const next = {
    d: pad(days),
    h: pad(hours),
    m: pad(mins),
    s: pad(secs),
  };

  if (last.d !== null && last.d !== next.d) tick(elD);
  if (last.h !== null && last.h !== next.h) tick(elH);
  if (last.m !== null && last.m !== next.m) tick(elM);
  if (last.s !== null && last.s !== next.s) tick(elS);

  elD.textContent = next.d;
  elH.textContent = next.h;
  elM.textContent = next.m;
  elS.textContent = next.s;

  last = next;
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== RSVP Submit =====
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function setStatus(type, msg) {
  statusEl.className = "status " + (type || "");
  statusEl.innerHTML = msg || "";
}

function makeConfettiHTML() {
  // small joyful burst, uses CSS variables for spread
  const pieces = [];
  for (let i = 0; i < 16; i++) {
    const x = (Math.random() * 180 - 90).toFixed(0) + "px";
    const d = (Math.random() * 0.15).toFixed(2) + "s";
    const h = (Math.random() * 360).toFixed(0);

    pieces.push(
      `<i style="left:${50 + Math.random() * 10 - 5}%;
                top:${Math.random() * 6}px;
                background:hsl(${h} 80% 70%);
                --x:${x};
                animation-delay:${d};"></i>`
    );
  }
  return `<span class="confetti" aria-hidden="true">${pieces.join("")}</span>`;
}

async function postRSVP(payload) {
  // IMPORTANT: use text/plain to avoid CORS preflight
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  // Try to parse JSON (if available)
  let data = null;
  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) throw new Error("Network error");
  if (data && data.ok === false) throw new Error(data.error || "Server error");

  return true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Basic validation
  const reservationName = (document.getElementById("reservationName").value || "").trim();
  const phone = (document.getElementById("phone").value || "").trim();
  const adults = document.getElementById("adults").value;
  const children = document.getElementById("children").value;
  const attending = document.getElementById("attending").value;
  const note = (document.getElementById("note").value || "").trim();
  const message = (document.getElementById("message").value || "").trim();

  if (!reservationName) {
    setStatus("err", "❌ Please enter Reservation Name.");
    return;
  }
  if (adults === "" || Number(adults) < 0) {
    setStatus("err", "❌ Please enter Adults count.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.75";
  setStatus("", "Submitting...");

  const payload = {
    reservationName,
    phone,
    adults: Number(adults),
    children: children === "" ? "" : Number(children),
    attending,
    note,
    message,
  };

  try {
    await postRSVP(payload);

    // success UI
    const burst =
      `<span class="burst">
        <span class="burstHeart">💖</span>
        <span>Submitted! Thank you.</span>
        ${makeConfettiHTML()}
      </span>`;

    setStatus("ok", burst);

    // Keep the form but clear fields (optional)
    form.reset();

    // re-enable after a short time (optional)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
    }, 1200);

  } catch (err) {
    setStatus("err", "❌ Submit failed. Please try again.");
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
  }
});

// ===== Background Music Autoplay Fix =====
// Autoplay may be blocked until user interacts once.
// We try autoplay immediately, then unlock on first click/tap.
(function musicAutoplay() {
  const music = document.getElementById("bgMusic");
  if (!music) return;

  // mild volume
  music.volume = 0.25;

  // try immediately
  music.play().catch(() => { /* ignored */ });

  const unlock = () => {
    music.volume = 0.25;
    music.play().catch(() => {});
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("click", unlock);
  };

  window.addEventListener("touchstart", unlock, { once: true, passive: true });
  window.addEventListener("click", unlock, { once: true });
})();
