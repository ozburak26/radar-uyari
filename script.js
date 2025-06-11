let map, directionsService, directionsRenderer;
let userLocation = null;
const radarPoints = [
  {lat: 41.015137, lng: 28.979530},
  {lat: 39.920770, lng: 32.854110}
];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: radarPoints[0],
    zoom: 13
  });
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  radarPoints.forEach(r => {
    new google.maps.Marker({ position: r, map });
  });

  new google.maps.places.Autocomplete(document.getElementById("start"));
  new google.maps.places.Autocomplete(document.getElementById("end"));

  navigator.geolocation.getCurrentPosition(pos => {
    userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
  });

  trackUser();
}

function calcRoute() {
  let startVal = document.getElementById("start").value;
  const endVal = document.getElementById("end").value;

  if (!startVal && userLocation) {
    startVal = new google.maps.LatLng(userLocation.lat, userLocation.lng);
  }

  directionsService.route({
    origin: startVal,
    destination: endVal,
    travelMode: 'DRIVING'
  }, (res, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(res);
    } else {
      alert('Rota oluşturulamadı: ' + status);
    }
  });
}

function trackUser() {
  navigator.geolocation.watchPosition(pos => {
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    document.getElementById("speed").textContent = (pos.coords.speed * 3.6 || 0).toFixed(1);
    checkRadarProximity({lat, lng});
  }, console.error, {enableHighAccuracy: true});
}

function checkRadarProximity(pos) {
  let nearest = Infinity;
  radarPoints.forEach(r => {
    const d = getDistance(pos.lat, pos.lng, r.lat, r.lng);
    if (d < nearest) nearest = d;
  });

  const alertBox = document.getElementById("alert");
  const sound = document.getElementById("alertSound");
  if (nearest < 0.01) { alertBox.textContent="📸 RADAR ÜZERİNDESİN!"; sound.play();}
  else if (nearest < 0.05) { alertBox.textContent="⚠ 50m içinde radar!"; sound.play();}
  else if (nearest < 0.2) alertBox.textContent="⚠ 200m içinde radar!";
  else if (nearest < 0.5) alertBox.textContent="⚠ 500m içinde radar!";
  else if (nearest < 1) alertBox.textContent="⚠ 1km içinde radar!";
  else alertBox.textContent="";
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

window.initMap = initMap;