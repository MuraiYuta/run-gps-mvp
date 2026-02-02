export function startWatch(onPos, onErr) {
  if (!navigator.geolocation) {
    onErr({ code: 0, message: "Geolocation not supported." });
    return null;
  }
  return navigator.geolocation.watchPosition(onPos, onErr, {
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 10000
  });
}

export function stopWatch(watchId) {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
}
