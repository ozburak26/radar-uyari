let map, directionsService, directionsRenderer;

function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: false });

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 39.9208, lng: 32.8541 },
    zoom: 7,
  });

  directionsRenderer.setMap(map);
}

function calcRoute() {
  const startEl = document.getElementById("start");
  const endEl = document.getElementById("end");

  const start = startEl.value || startEl.getPlace()?.formatted_address;
  const end = endEl.value || endEl.getPlace()?.formatted_address;

  if (!start || !end) {
    alert("Lütfen başlangıç ve bitiş noktalarını giriniz.");
    return;
  }

  const request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true
  };

  directionsService.route(request, function(result, status) {
    if (status === "OK") {
      directionsRenderer.setDirections(result);
    } else {
      alert("Rota oluşturulamadı: " + status);
    }
  });
}
