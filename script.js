// =========================
// 1) COUNTDOWN (June 27, 2026 7:00 PM local)
// =========================
const weddingDate = new Date(2026, 5, 27, 19, 0, 0); // month is 0-based (5 = June)

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

// =========================
// 2) BACKGROUND HEARTS + SPARKLES
// =========================
function spawnHearts(){
  const wrap = document.getElementById("hearts");
  if (!wrap) return;

  wrap.innerHTML = "";
  const count = 18;

  for (let i=0;i<count;i++){
    const h = document.createElement("div");
    h.className = "h";

    const left = Math.random() * 100;
    const size = 14 + Math.random() * 26;
    const dur = 9 + Math.random() * 10;
    const delay = Math.random() * 6;
    const drift = (Math.random() * 80 - 40).toFixed(0) + "px";
    const alpha = (0.25 + Math.random() * 0.35).toFixed(2);

    h.style.left = left + "vw";
    h.style.setProperty("--size", size + "px");
    h.style.setProperty("--a", alpha);
    h.style.setProperty("--drift", drift);
    h.style.animationDuration = dur + "s";
    h.style.animationDelay = delay + "s";

    wrap.appendChild(h);
  }
}

function spawnSparkles(){
  const wrap = document.getElementById("sparkles");
  if (!wrap) return;

  wrap.innerHTML = "";
  const count = 26;

  for (let i=0;i<count;i++){
    const sp = document.createElement("div");
    sp.className = "sp";
    sp.style.left = (Math.random() * 100) + "vw";
    sp.style.top = (Math.random() * 100) + "vh";
    sp.style.animationDelay = (Math.random() * 3.5) + "s";
    sp.style.opacity = (0.25 + Math.random() * 0.55).toFixed(2);
    wrap.appendChild(sp);
  }
}

spawnHearts();
spawnSparkles();
window.addEventListener("resize", () => {
  spawnHearts();
  spawnSparkles();
});

// =========================
// 3) GOOGLE APPS SCRIPT WEB APP (YOUR EXEC URL)
// =========================
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz2rTrciXYwU2hW7MM6vfsFE9I_0TkwHthggKe_B0JthXSkylXCBfFwxYe_-NTp5teV6A/exec";

// =========================
// 4) RSVP SUBMIT
// =========================
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function setStatus(type, msg){
  statusEl.className = "status " + (type || "");
  statusEl.textContent = msg || "";
}

function heartBurst(x, y){
  const wrap = document.createElement("div");
  wrap.className = "burst";
  wrap.style.setProperty("--x", x + "px");
  wrap.style.setProperty("--y", y + "px");

  const pieces = 10;
  for (let i=0;i<pieces;i++){
    const el = document.createElement("i");
    el.textContent = "♥";
    const dx = (Math.random()*180 - 90).toFixed(0) + "px";
    const dy = (Math.random()*160 - 90).toFixed(0) + "px";
    el.style.setProperty("--dx", dx);
    el.style.setProperty("--dy", dy);
    el.style.fontSize = (14 + Math.random()*14).toFixed(0) + "px";
    wrap.appendChild(el);
  }

  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 950);
}

if (form){
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // IMPORTANT: stops GET submit (your “plain boxes” issue)

    // quick validation
    const reservationName = document.getElementById("reservationName").value.trim();
    const adults = document.getElementById("adults").value.trim();

    if (!reservationName || !adults){
      setStatus("err", "Please enter Reservation Name and Adults count.");
      return;
    }

    if (!APPS_SCRIPT_URL || !APPS_SCRIPT_URL.includes("/exec")){
      setStatus("err", "Apps Script URL not set correctly.");
      return;
    }

    // collect data
    const payload = {
      reservationName,
      phone: document.getElementById("phone").value.trim(),
      adults: Number(document.getElementById("adults").value || 0),
      children: Number(document.getElementById("children").value || 0),
      attending: document.getElementById("attending").value,
      message: document.getElementById("message").value.trim(),
      note: document.getElementById("note").value.trim()
    };

    submitBtn.disabled = true;
    setStatus("", "Submitting...");

    try {
      // IMPORTANT: text/plain avoids CORS preflight (works best with Apps Script)
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { ok:false, raw:text }; }

      if (data.ok){
        const rect = submitBtn.getBoundingClientRect();
        heartBurst(rect.left + rect.width/2, rect.top + rect.height/2);

        setStatus("ok", "✅ Submitted! Thank you.");
        form.reset();
      } else {
        setStatus("err", "❌ Submit failed. Check Apps Script permissions / deployment.");
      }

    } catch (err){
      setStatus("err", "❌ Network error. Try again.");
    } finally {
      submitBtn.disabled = false;
    }
  });
}
