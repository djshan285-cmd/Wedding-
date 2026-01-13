// ✅ Wedding date (Colombo time safe-ish)
// Use local date without timezone string to avoid shifting in some browsers.
const weddingDate = new Date(2026, 5, 27, 19, 0, 0); // June=5, day=27, 7:00 PM

function pad(n){ return String(n).padStart(2, "0"); }

function updateCountdown(){
  const now = new Date();
  let diff = weddingDate - now;
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  document.getElementById("d").textContent = pad(days);
  document.getElementById("h").textContent = pad(hours);
  document.getElementById("m").textContent = pad(mins);
  document.getElementById("s").textContent = pad(secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ✅ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE */
const APPS_SCRIPT_URL = "PASTE_YOUR_EXEC_URL_HERE";

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function setStatus(type, msg){
  statusEl.className = "status " + (type || "");
  statusEl.textContent = msg || "";
}

function heartBurst(){
  // small heart pop animation near button
  const rect = submitBtn.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;

  for (let i=0;i<12;i++){
    const h = document.createElement("div");
    h.textContent = "❤";
    h.style.position = "fixed";
    h.style.left = cx + "px";
    h.style.top = cy + "px";
    h.style.transform = "translate(-50%,-50%)";
    h.style.fontSize = (12 + Math.random()*14) + "px";
    h.style.color = "rgba(255,77,115,.9)";
    h.style.textShadow = "0 10px 30px rgba(255,77,115,.35)";
    h.style.pointerEvents = "none";
    h.style.zIndex = "9999";
    document.body.appendChild(h);

    const angle = (Math.PI * 2) * (i/12);
    const dist = 40 + Math.random()*40;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    h.animate([
      { transform:`translate(-50%,-50%) translate(0px,0px) scale(1)`, opacity:1 },
      { transform:`translate(-50%,-50%) translate(${dx}px,${dy}px) scale(1.25)`, opacity:0 }
    ], { duration: 700 + Math.random()*250, easing:"cubic-bezier(.2,.8,.2,1)" })
    .onfinish = () => h.remove();
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  setStatus("", "");
  submitBtn.disabled = true;
  submitBtn.querySelector(".btnText").textContent = "Submitting...";

  try{
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR_EXEC_URL_HERE")){
      throw new Error("Apps Script URL not set. Paste your /exec URL into script.js");
    }

    const fd = new FormData(form);

    // Basic validation
    const reservationName = (fd.get("reservationName") || "").toString().trim();
    const adults = (fd.get("adults") || "").toString().trim();

    if (!reservationName || adults === ""){
      setStatus("err", "Please enter Reservation Name and Adults count.");
      submitBtn.disabled = false;
      submitBtn.querySelector(".btnText").textContent = "Submit RSVP";
      return;
    }

    const payload = {
      reservationName,
      phone: (fd.get("phone") || "").toString().trim(),
      adults: Number(fd.get("adults") || 0),
      children: Number(fd.get("children") || 0),
      attending: (fd.get("attending") || "Yes").toString(),
      shortNote: (fd.get("shortNote") || "").toString().trim(),
      message: (fd.get("message") || "").toString().trim(),
    };

    // ✅ Send as JSON
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { ok: res.ok }; }

    if (!res.ok || !json.ok){
      throw new Error(json.error || "Network error");
    }

    heartBurst();
    setStatus("ok", "✅ Submitted! Thank you.");
    form.reset();
    // keep children default 0
    form.querySelector('input[name="children"]').value = 0;

  } catch(err){
    setStatus("err", "❌ " + (err?.message || "Network error"));
  } finally{
    submitBtn.disabled = false;
    submitBtn.querySelector(".btnText").textContent = "Submit RSVP";
  }
});
