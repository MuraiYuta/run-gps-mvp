export function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

export function fmtPace(minPerKm) {
  if (!isFinite(minPerKm) || minPerKm <= 0) return "--:--";
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

export function distMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function elapsedSec(startedAt, pausedTotal, pauseStartedAt) {
  if (!startedAt) return 0;
  const now = Date.now();
  const pausedMs = pausedTotal + (pauseStartedAt ? (now - pauseStartedAt) : 0);
  return Math.max(0, Math.floor((now - startedAt - pausedMs) / 1000));
}
