import { setPlayerPosition } from './info';
import { MapObject, Marker, MarkerId } from './types';
import { processMarkers } from './filtro'; // Importa la funzione processMarkers
import { getMarkerBounds, mapInstance } from './mapManager';
import { updateMarkers } from './iconManager';
import * as L from 'leaflet';
import axios from 'axios';

function _rel(rel: number, min: number, max: number): number {
  return min + rel * (max - min);
}
export let iterationCount = 0; // Contatore globale delle iterazioni

// Funzione per ottenere le impostazioni dei marker
export async function fetchMarkerSettings(): Promise<Marker[]> {
  try {
    const response = await axios.get<MapObject[]>('http://localhost:8111/map_obj.json'); // Supponendo che la risposta sia un array di oggetti
    const mapObjects = response.data;

    // Ottieni i bounds minimi e massimi
    const bounds = getMarkerBounds();
    const minLatLng = bounds.getSouthWest();
    const maxLatLng = bounds.getNorthEast();
    // Ottieni i valori minimi e massimi delle coordinate
    const map_min = [minLatLng.lng, minLatLng.lat]; // [minX, minY]
    const map_max = [maxLatLng.lng, maxLatLng.lat]; // [maxX, maxY]

    // Converti gli oggetti in Marker[]
    const markers: Marker[] = mapObjects.map((obj) => {
      let x = obj.x || 0;
      let y = obj.y || 0;
      let dx = obj.dx || 0;
      let dy = obj.dy || 0;

      // Se sono presenti le coordinate di inizio e fine, calcola i valori medi
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

      x = _rel(x, map_min[0], map_max[0]); // Converte x in base a map_min e map_max
      const correctedY = 1 - y; // Corregge l'asse Y (inversione)
      y = _rel(correctedY, map_min[1], map_max[1]); // Converte y in base a map_min e map_max



      // Crea l'oggetto Marker
      const marker: Marker = {
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        'color[]': obj['color[]'] || [255, 255, 255], // Imposta un colore di default se non specificato
        type: obj.type || 'default',
        icon: obj.icon || 'default-icon',
      };

      if (obj.icon === 'Player') {
        const playerLatLng = L.latLng(y, x); // Crea un oggetto LatLng
        setPlayerPosition(playerLatLng);
      }
      
      return marker; // Ritorna il marker con le sue proprietà
    });

    // Incrementa il contatore delle iterazioni
    iterationCount++;

    // Passa i marker alla funzione processMarkers e attendi il completamento prima di procedere con updateMarkers
    const processedMarkers = await processMarkers(markers);

    if (mapInstance) {
      // Esegui updateMarkers solo dopo il completamento di processMarkers
      await updateMarkers(mapInstance, processedMarkers);
    } else {
      console.error('Mappa non inizializzata');
    }

    return processedMarkers;
  } catch (error) {
    console.error('Errore durante il fetch delle impostazioni dei marker:', error);
    throw error;
  }
}

// Funzione per resettare il contatore delle iterazioni, se necessario
export function resetIterationCount() {
  iterationCount = 0;
  console.log('Contatore delle iterazioni resettato.');
}
