import * as L from 'leaflet';

let playerPosition: L.LatLng | null = null;

// Funzione per memorizzare la posizione del giocatore
export function setPlayerPosition(latLng: L.LatLng) {
  playerPosition = latLng;
}

// Funzione per aggiungere l'evento di click su tutta la mappa e calcolare la distanza
export function addMapClickEvent(map: L.Map) {
  map.on('click', (e: L.LeafletMouseEvent) => {
    if (playerPosition) {
      const clickedLatLng = e.latlng; // Ottieni la posizione cliccata sulla mappa

      // Calcola la distanza euclidea (ignorando la curvatura terrestre)
      const deltaLat = clickedLatLng.lat - playerPosition.lat;
      const deltaLng = clickedLatLng.lng - playerPosition.lng;
      const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);

      const distanceElement = document.getElementById('distance');
      if (distanceElement) {
        distanceElement.innerText = `${distance.toFixed(2)} unità`; // Modifica 'unità' in base al sistema di coordinate che usi
      }
    } else {
      console.error('Posizione del giocatore non trovata!');
    }
  });
}
