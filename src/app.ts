import axios from 'axios';
import * as L from 'leaflet';
import { createGrid } from './griglia';
import { createIcon } from './iconManager';
import { setPlayerPosition, addClickEvent } from './info';
import { fetchChatData } from './chat';
import config from './config.json';


let map: L.Map | null = null;

function _rel(rel: number, min: number, max: number) {
  return min + rel * (max - min);
}

async function initializeMap() {
  console.log('Inizio initializeMap function');

  try {
    const mapContainerWrapper = document.getElementById('map');
    if (mapContainerWrapper) {
      mapContainerWrapper.innerHTML = "<div id='map-inner' style='width: 100%; height: 100%;'></div>";
    } else {
      throw new Error('Contenitore della mappa non trovato');
    }

    const mapInnerContainer = document.getElementById('map-inner');
    if (!mapInnerContainer) {
      throw new Error('Contenitore interno della mappa non trovato');
    }

    const mapObjectsResponse = await axios.get(config.JSONMARKERSETTING);
    const mapObjects = mapObjectsResponse.data;

    const mapInfoResponse = await axios.get(config.JSONMAPSETTING);
    const mapInfo = mapInfoResponse.data;

    const chatInfoResponse = await axios.get(config.CHAT);
    const chatInfo = chatInfoResponse.data;

    if (!mapInfo.grid_size || !mapInfo.map_min || !mapInfo.map_max) {
      throw new Error('Mappa informazioni non valide');
    }

    const bounds: [[number, number], [number, number]] = [
      [mapInfo.map_min[1], mapInfo.map_min[0]],
      [mapInfo.map_max[1], mapInfo.map_max[0]]
    ];
    const imageUrl = config.MAPIMG;
    const map_min = mapInfo.map_min;
    const map_max = mapInfo.map_max;

    map = L.map(mapInnerContainer, {
      crs: L.CRS.Simple,
      minZoom: -6,
      maxZoom: 1,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      zoomSnap: 0.2,
      zoomDelta: 0.2,
      wheelPxPerZoomLevel: 200
    });

    L.imageOverlay(imageUrl, bounds).addTo(map);
    map.fitBounds(bounds);

    // Aggiungi la griglia sulla mappa
    createGrid(map, mapInfo.grid_zero, mapInfo.grid_steps, mapInfo.grid_size);

    window.addEventListener('resize', () => {
      if (map) {
        map.invalidateSize();
      }
    });

    let playerPosition: L.LatLng | null = null;

    mapObjects.forEach((obj: any) => {
      let x = obj.x || 0;
      let y = obj.y || 0;
      let dx = obj.dx || 0;
      let dy = obj.dy || 0;

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

      const absX = _rel(x, map_min[0], map_max[0]);
      const correctedY = 1 - y;
      const absY = _rel(correctedY, map_min[1], map_max[1]);

      if (isNaN(absX) || isNaN(absY)) {
        console.error('Coordinate non valide per oggetto:', obj);
        return;
      }

      const icon = createIcon(obj, dx, dy);
      const marker = L.marker([absY, absX], { icon });

      if (map) {
        marker.addTo(map);
      }

      if (obj.icon === 'Player') {
        const playerLatLng = L.latLng(absY, absX);
        setPlayerPosition(playerLatLng);  // Usa la funzione per memorizzare la posizione del giocatore
      }

      // Usa la funzione per aggiungere l'evento click per calcolare la distanza
      addClickEvent(marker, absY, absX);
    });

    // Chiamata alla funzione che gestisce i dati della chat
    await fetchChatData();

  } catch (error) {
    console.error('Si è verificato un errore:', error);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initializeMap();
});
