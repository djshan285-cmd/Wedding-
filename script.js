// Wedding date: June 27, 2026
const weddingDate = new Date("2026-06-27T19:00:00");

function pad(n){ return String(n).padStart(2,"0"); }

function updateCountdown(){
  const diff = weddingDate - new Date();
  if(diff <= 0){
    ["d","h","m","s"].forEach(id => document.getElementById(id).textContent = "00");
    return;
  }
  const t = Math.floor(diff/1000);
  const days  = Math.floor(t/(3600*24));
  const hours = Math.floor((t%(3600*24))/3600);
  const mins  = Math.floor((t%3600)/60);
  const secs  = t%60;

  document.getElementById("d").textContent = pad(days);
  document.getElementById("h").textContent = pad(hours);
  document.getElementById("m").textContent = pad(mins);
  document.getElementById("s").textContent = pad(secs);
}
setInterval(updateCountdown,1000);
updateCountdown();

// ✅ Your Apps Script URL
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function showThanksPopup(){
  const overlay = document.getElementById("thanksOverlay");
  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 1600);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  statusEl.textContent = "Submitting...";

  const fd = new FormData(form);
  const payload = {
    reservationName: (fd.get("reservationName") || "").toString().trim(),
    phone: (fd.get("phone") || "").toString().trim(),
    adults: (fd.get("adults") || "").toString().trim(),
    children: (fd.get("children") || "0").toString().trim(),
    attending: (fd.get("attending") || "Yes").toString(),
    messageShort: (fd.get("messageShort") || "").toString().trim(),
    message: (fd.get("message") || "").toString().trim(),
  };

  // ✅ FIXED validation message (NO "Family Count")
  if(!payload.reservationName || !payload.adults){
    statusEl.textContent = "Please enter Reservation Name and Adults count.";
    submitBtn.disabled = false;
    return;
  }

  try{
    await fetch(APPS_SCRIPT_URL, {
      method:"POST",
      mode:"no-cors",
      headers:{ "Content-Type":"text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    statusEl.textContent = "✅ Submitted! Thank you.";
    showThanksPopup();
    form.reset();
  }catch(err){
    statusEl.textContent = "❌ Network error. Please try again.";
  }finally{
    submitBtn.disabled = false;
  }
});
