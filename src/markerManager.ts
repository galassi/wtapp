import * as L from 'leaflet';
import { createIcon } from './iconManager';
import { setPlayerPosition, addClickEvent } from './info';
import { _rel } from './utils';

/**
 * Aggiungi i marker alla mappa usando i dati scaricati e le impostazioni della mappa.
 * @param map L'oggetto della mappa Leaflet
 * @param mapObjects Gli oggetti marker scaricati
 * @param map_min Le coordinate minime della mappa
 * @param map_max Le coordinate massime della mappa
 */
export function addMapMarkers(map: L.Map, mapObjects: any[], map_min: number[], map_max: number[]): void {
  mapObjects.forEach((obj: any) => {
    let x = obj.x || 0;
    let y = obj.y || 0;
    let dx = obj.dx || 0;
    let dy = obj.dy || 0;

    // Verifica se l'oggetto ha coordinate di inizio e fine, se sì calcola i valori medi
    if (obj.sx !== undefined && obj.sy !== undefined && obj.ex !== undefined && obj.ey !== undefined) {
      const startX = obj.sx;
      const startY = obj.sy;
      const endX = obj.ex;
      const endY = obj.ey;

      x = (startX + endX) / 2;
      y = (startY + endY) / 2;

      dx = endX - startX;
      dy = endY - startY;
    }

    // Converte le coordinate relative (0-1) in coordinate assolute basate su map_min e map_max
    const absX = _rel(x, map_min[0], map_max[0]); // Converte x in base a map_min e map_max
    const correctedY = 1 - y; // Corregge l'asse Y (inversione)
    const absY = _rel(correctedY, map_min[1], map_max[1]); // Converte y in base a map_min e map_max

    // Crea l'icona per il marker e posiziona il marker sulla mappa
    const icon = createIcon(obj, dx, dy);
    const marker = L.marker([absY, absX], { icon });

    marker.addTo(map); // Aggiunge il marker alla mappa

    // Se l'oggetto rappresenta il "Player", aggiorna la posizione del giocatore
    if (obj.icon === 'Player') {
      const playerLatLng = L.latLng(absY, absX);
      setPlayerPosition(playerLatLng);
    }

    // Aggiunge l'evento di click per calcolare la distanza dal marker
    addClickEvent(marker, absY, absX);
  });
}
