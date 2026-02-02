import { distMeters, elapsedSec, fmtPace, fmtTime } from "./core.js";
import { startWatch, stopWatch } from "./geo.js";

(() => {
  const $ = (id) => document.getElementById(id);

  const btnStart = $("start");
  const btnPause = $("pause");
  const btnStop = $("stop");

  const elDist = $("dist");
  const elTime = $("time");
  const elPace = $("pace");
  const elAcc = $("acc");
  const elLog = $("log");

  let watchId = null;
  let running = false;
  let paused = false;

  let points = []; // {lat, lon, ts}
  let totalMeters = 0;

  let startedAt = null;
  let pausedTotal = 0;
  let pauseStartedAt = null;
  let timer = null;

  function log(s) {
    elLog.textContent = s + "\n" + elLog.textContent;
  }

  function render() {
    const km = totalMeters / 1000;
    elDist.textContent = km.toFixed(3);

    const sec = elapsedSec(startedAt, pausedTotal, pauseStartedAt);
    elTime.textContent = fmtTime(sec);

    const min = sec / 60;
    const pace = km > 0 ? (min / km) : Infinity;
    elPace.textContent = fmtPace(pace);
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(render, 500);
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function onPos(pos) {
    if (!running || paused) return;

    const { latitude, longitude, accuracy } = pos.coords;
    elAcc.textContent = accuracy ? Math.round(accuracy) : "--";

    if (accuracy && accuracy > 60) {
      log(`skip (accuracy ${Math.round(accuracy)}m) lat=${latitude}, lon=${longitude}`);
      return;
    }

    const p = { lat: latitude, lon: longitude, ts: pos.timestamp || Date.now() };
    const last = points[points.length - 1];

    if (last) {
      const d = distMeters(last, p);
      if (d < 50) totalMeters += d;
      else log(`jump ignored: ${d.toFixed(1)}m`);
    }
    points.push(p);

    log(
      `ok acc=${Math.round(accuracy)}m lat=${latitude.toFixed(6)} lon=${longitude.toFixed(6)}`
    );
    render();
  }

  function onErr(err) {
    log(`ERROR: ${err.code} ${err.message}`);
  }

  btnStart.addEventListener("click", () => {
    if (running) return;
    running = true;
    paused = false;

    points = [];
    totalMeters = 0;
    startedAt = Date.now();
    pausedTotal = 0;
    pauseStartedAt = null;

    btnStart.disabled = true;
    btnPause.disabled = false;
    btnStop.disabled = false;

    log("START");
    watchId = startWatch(onPos, onErr);
    startTimer();
    render();
  });

  btnPause.addEventListener("click", () => {
    if (!running) return;
    paused = !paused;

    if (paused) {
      pauseStartedAt = Date.now();
      btnPause.textContent = "Resume";
      log("PAUSE");
      stopWatch(watchId);
    } else {
      pausedTotal += (Date.now() - pauseStartedAt);
      pauseStartedAt = null;
      btnPause.textContent = "Pause";
      log("RESUME");
      watchId = startWatch(onPos, onErr);
    }
  });

  btnStop.addEventListener("click", () => {
    if (!running) return;
    running = false;

    stopWatch(watchId);
    watchId = null;
    stopTimer();
    render();

    btnStart.disabled = false;
    btnPause.disabled = true;
    btnStop.disabled = true;
    btnPause.textContent = "Pause";

    log("STOP");
    log(`RESULT: ${(totalMeters / 1000).toFixed(3)} km, ${fmtTime(elapsedSec(startedAt, pausedTotal, pauseStartedAt))}`);
  });
})();
