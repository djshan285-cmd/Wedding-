// ===============================
// Wedding Countdown + RSVP Submit
// ===============================

// Wedding date/time (change time if needed)
const weddingDate = new Date("2026-06-26T19:00:00"); // 7:00 PM

function pad(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  const diff = weddingDate - new Date();

  // If date passed, show zeros
  if (diff <= 0) {
    const dEl = document.getElementById("d");
    const hEl = document.getElementById("h");
    const mEl = document.getElementById("m");
    const sEl = document.getElementById("s");
    if (dEl) dEl.textContent = "00";
    if (hEl) hEl.textContent = "00";
    if (mEl) mEl.textContent = "00";
    if (sEl) sEl.textContent = "00";
    return;
  }

  const t = Math.floor(diff / 1000);
  const days = Math.floor(t / (3600 * 24));
  const hours = Math.floor((t % (3600 * 24)) / 3600);
  const mins = Math.floor((t % 3600) / 60);
  const secs = t % 60;

  document.getElementById("d").textContent = pad(days);
  document.getElementById("h").textContent = pad(hours);
  document.getElementById("m").textContent = pad(mins);
  document.getElementById("s").textContent = pad(secs);
}

setInterval(updateCountdown, 1000);
updateCountdown();


// ✅ IMPORTANT: This must be the Web App URL ending with /exec
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";


// RSVP Form submit
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function showThanksPopup() {
  const overlay = document.getElementById("thanksOverlay");
  if (!overlay) return;

  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  }, 1800);
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) statusEl.textContent = "Submitting...";

    const fd = new FormData(form);
    const payload = {
      reservationName: (fd.get("reservationName") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      familyCount: (fd.get("familyCount") || "").toString().trim(),
      attending: (fd.get("attending") || "Yes").toString(),
      message: (fd.get("message") || "").toString().trim(),
    };

    if (!payload.reservationName || !payload.familyCount) {
      if (statusEl) statusEl.textContent = "Please enter Reservation Name and Family Count.";
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    try {
      // no-cors: request will be sent without browser blocking
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      if (statusEl) statusEl.textContent = "✅ Submitted! Thank you.";
      showThanksPopup();
      form.reset();

    } catch (err) {
      if (statusEl) statusEl.textContent = "❌ Network error. Please try again.";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
