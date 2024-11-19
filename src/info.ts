import * as L from 'leaflet';

let playerPosition: L.LatLng | null = null;

// Funzione per memorizzare la posizione del giocatore
export function setPlayerPosition(latLng: L.LatLng) {
  playerPosition = latLng;
}

export function addMapClickEvent(map: L.Map) {
  map.on('click', () => {
    // Non fare nulla
  });
}
