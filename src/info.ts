import * as L from 'leaflet';

let playerPosition: L.LatLng | null = null;

// Funzione per memorizzare la posizione del giocatore
export function setPlayerPosition(latLng: L.LatLng) {
  playerPosition = latLng;
}

// Funzione per aggiungere l'evento di click e calcolare la distanza
export function addClickEvent(marker: L.Marker, absY: number, absX: number) {
  marker.on('click', () => {
    if (playerPosition) {
      const markerLatLng = L.latLng(absY, absX);

      // Calcola la distanza euclidea (no curva della Terra)
      const distance = Math.sqrt(
        Math.pow(markerLatLng.lat - playerPosition.lat, 2) + 
        Math.pow(markerLatLng.lng - playerPosition.lng, 2)
      );

      const distanceElement = document.getElementById('distance');
      if (distanceElement) {
        distanceElement.innerText = `${distance.toFixed(2)} unità`; // Adatta l'unità di misura alle coordinate della tua mappa
      }
    } else {
      console.error('Posizione del giocatore non trovata!');
    }
  });
}
