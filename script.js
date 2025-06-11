let map, directionsService, directionsRenderer, altRenderer;
let radarPoints = [
  {lat: 41.015137, lng: 28.979530},
  {lat: 39.920770, lng: 32.854110}
];
let userMarker;
let alertSound;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: radarPoints[0]
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map, suppressPolylines: false });
  altRenderer = [];

  radarPoints.forEach(r => {
    new google.maps.Marker({ position: r, map, icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" });
  });

  new google.maps.places.Autocomplete(document.getElementById("start"));
  new google.maps.places.Autocomplete(document.getElementById("end"));

  alertSound = document.getElementById("alertSound");

  navigator.geolocation.watchPosition(updatePosition, console.error, { enableHighAccuracy: true });
}

function updatePosition(pos) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const speed = pos.coords.speed || 0;

  document.getElementById("speed").textContent = (speed * 3.6).toFixed(1);

  if (userMarker) userMarker.setMap(null);
  userMarker = new google.maps.Marker({
    position: { lat, lng },
    map,
    icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 5, strokeColor: "blue" }
  });

  checkRadarProximity({ lat, lng });
}

function calculateAndDisplayRoutes() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  directionsService.route({
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true
  }, (res, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(res);
      altRenderer.forEach(r => r.setMap(null));
      altRenderer = [];

      for (let i = 1; i < res.routes.length; i++) {
        const renderer = new google.maps.DirectionsRenderer({
          map,
          directions: res,
          routeIndex: i,
          polylineOptions: { strokeColor: '#888' }
        });
        altRenderer.push(renderer);
      }
    } else {
      alert('Rota oluşturulamadı: ' + status);
    }
  });
}

function checkRadarProximity(pos) {
  const alertBox = document.getElementById("alert");
  let nearest = Infinity;

  radarPoints.forEach(r => {
    const d = getDistance(pos.lat, pos.lng, r.lat, r.lng);
    if (d < nearest) nearest = d;
  });

  if (nearest < 0.01) { alertBox.textContent = "📸 RADAR ÜZERİNDESİN!"; alertSound.play(); }
  else if (nearest < 0.05) { alertBox.textContent = "⚠ 50m içinde radar!"; alertSound.play(); }
  else if (nearest < 0.2) { alertBox.textContent = "⚠ 200m içinde radar!"; }
  else if (nearest < 0.5) { alertBox.textContent = "⚠ 500m içinde radar!"; }
  else if (nearest < 1.0) { alertBox.textContent = "⚠ 1km içinde radar!"; }
  else alertBox.textContent = "";
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI / 180;
  const dLon = (lon2-lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

window.initMap = initMap;