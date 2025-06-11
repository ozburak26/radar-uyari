let map, directionsService, directionsRenderer, marker;
const radarPoints = [
  {lat: 41.015137, lng: 28.979530, title: "Radar 1"},
  {lat: 39.920770, lng: 32.854110, title: "Radar 2"}
];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: 41.015137, lng: 28.979530 }
  });
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

  radarPoints.forEach(r => {
    new google.maps.Marker({ position: r, map: map, title: r.title });
  });

  trackUser();
}

function calcRoute() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  directionsService.route({
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING
  }, (response, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(response);
    } else {
      alert('Rota oluşturulamadı: ' + status);
    }
  });
}

function trackUser() {
  navigator.geolocation.watchPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const speed = pos.coords.speed || 0;
    document.getElementById("speed").textContent = (speed * 3.6).toFixed(1);
    checkRadarProximity({ lat, lng });
  }, err => {
    console.error(err);
  }, { enableHighAccuracy: true });
}

function checkRadarProximity(pos) {
  const alertBox = document.getElementById("alert");
  const sound = document.getElementById("alertSound");
  let nearest = 9999;
  radarPoints.forEach(r => {
    const d = getDistance(pos.lat, pos.lng, r.lat, r.lng);
    if (d < nearest) nearest = d;
  });

  if (nearest < 0.01) { alertBox.textContent = "📸 RADAR ÜZERİNDESİN!"; sound.play(); }
  else if (nearest < 0.05) { alertBox.textContent = "⚠ 50m içinde radar!"; sound.play(); }
  else if (nearest < 0.2) { alertBox.textContent = "⚠ 200m içinde radar!"; }
  else if (nearest < 0.5) { alertBox.textContent = "⚠ 500m içinde radar!"; }
  else if (nearest < 1) { alertBox.textContent = "⚠ 1km içinde radar!"; }
  else alertBox.textContent = "";
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
            Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180) *
            Math.sin(dLon/2)*Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

window.onload = initMap;