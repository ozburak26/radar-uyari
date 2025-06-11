navigator.geolocation.watchPosition(function(position) {
    const speed = position.coords.speed || 0;
    document.getElementById("speed").textContent = (speed * 3.6).toFixed(1);
    document.getElementById("status").textContent = "Konum güncellendi";
}, function(error) {
    document.getElementById("status").textContent = "Konum alınamadı: " + error.message;
}, { enableHighAccuracy: true });