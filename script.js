let map, marker;
let radarPoints = [
  {lat: 41.015137, lng: 28.979530, title: "Radar 1"},
  {lat: 39.920770, lng: 32.854110, title: "Radar 2"}
];

function initMap(position) {
    const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
    map = new google.maps.Map(document.getElementById("map"), {
        center: userPos,
        zoom: 14,
    });

    marker = new google.maps.Marker({
        position: userPos,
        map,
        title: "Senin Konumun",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    });

    radarPoints.forEach(radar => {
        new google.maps.Marker({
            position: { lat: radar.lat, lng: radar.lng },
            map,
            title: radar.title,
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        });
    });

    trackUser();
}

function trackUser() {
    navigator.geolocation.watchPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const speed = pos.coords.speed || 0;
        marker.setPosition({ lat, lng });
        document.getElementById("speed").textContent = (speed * 3.6).toFixed(1);
        document.getElementById("limit").textContent = estimateSpeedLimit(lat, lng);

        checkRadarProximity({lat, lng});
    }, err => {
        alert("Konum alınamadı: " + err.message);
    }, { enableHighAccuracy: true });
}

function estimateSpeedLimit(lat, lng) {
    return 90; // Örnek sabit limit
}

function checkRadarProximity(pos) {
    const alertBox = document.getElementById("alert");
    let nearest = 9999;
    radarPoints.forEach(radar => {
        const dist = getDistance(pos.lat, pos.lng, radar.lat, radar.lng);
        if (dist < nearest) nearest = dist;
    });

    if (nearest < 0.01) alertBox.textContent = "📸 RADAR ÜZERİNDESİN!";
    else if (nearest < 0.05) alertBox.textContent = "⚠ 50m içinde radar!";
    else if (nearest < 0.2) alertBox.textContent = "⚠ 200m içinde radar!";
    else if (nearest < 0.5) alertBox.textContent = "⚠ 500m içinde radar!";
    else if (nearest < 1) alertBox.textContent = "⚠ 1km içinde radar!";
    else alertBox.textContent = "";
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2-lat1)*Math.PI/180;
    const dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180) *
              Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

navigator.geolocation.getCurrentPosition(initMap, err => {
    alert("Başlangıç konumu alınamadı: " + err.message);
}, { enableHighAccuracy: true });