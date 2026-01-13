// Countdown date
const weddingDate = new Date("2026-06-26T19:00:00");

function pad(n){ return String(n).padStart(2,"0"); }
function updateCountdown(){
  const diff = weddingDate - new Date();
  if(diff <= 0) return;

  const t = Math.floor(diff/1000);
  const days = Math.floor(t/(3600*24));
  const hours = Math.floor((t%(3600*24))/3600);
  const mins = Math.floor((t%3600)/60);
  const secs = t%60;

  document.getElementById("d").textContent = pad(days);
  document.getElementById("h").textContent = pad(hours);
  document.getElementById("m").textContent = pad(mins);
  document.getElementById("s").textContent = pad(secs);
}
setInterval(updateCountdown,1000);
updateCountdown();

/* ✅ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL IN THE NEXT LINE */
const APPS_SCRIPT_URL = "const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";";

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  statusEl.textContent = "Submitting...";

  const fd = new FormData(form);
  const payload = {
    reservationName: fd.get("reservationName"),
    phone: fd.get("phone"),
    familyCount: fd.get("familyCount"),
    attending: fd.get("attending"),
    message: fd.get("message"),
  };

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) {
      statusEl.textContent = "✅ Saved!";
      form.reset();
    } else {
      statusEl.textContent = "❌ Not saved.";
    }
  } catch (err) {
    statusEl.textContent = "❌ Network error.";
  } finally {
    submitBtn.disabled = false;
  }
});
