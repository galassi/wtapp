import * as L from 'leaflet';
import { createGrid } from './griglia';

let mapInstance: L.Map | null = null;
let skyOverlay: L.ImageOverlay | null = null;
let groundOverlay: L.ImageOverlay | null = null;
let skyBounds: L.LatLngBounds | null = null;
let groundBounds: L.LatLngBounds | null = null;

/**
 * Inizializza la mappa con le impostazioni caricate dal file locale.
 */
export async function initializeMap(
  containerId: string,
  mapMin: [number, number],
  mapMax: [number, number],
  gridZero: [number, number],
  gridSteps: [number, number],
  gridSize: [number, number],
  mode: 'sky' | 'ground'
): Promise<L.Map> {
  const mapInnerContainer = document.getElementById(containerId);
  if (!mapInnerContainer) {
    throw new Error('Contenitore interno della mappa non trovato');
  }

  // Crea i bounds specifici per ogni modalità
  const currentBounds: L.LatLngBounds = L.latLngBounds(
    [mapMin[1], mapMin[0]],
    [mapMax[1], mapMax[0]]
  );

  // Imposta i bounds in base alla modalità
  if (mode === 'sky') {
    setSkyBounds(mapMin, mapMax);
  } else if (mode === 'ground') {
    setGroundBounds(mapMin, mapMax);
  }

  // Crea una nuova istanza della mappa solo se non esiste
  if (!mapInstance) {
    mapInstance = L.map(mapInnerContainer, {
      crs: L.CRS.Simple,
      minZoom: -6,
      maxZoom: 1,
      maxBounds: currentBounds,
      maxBoundsViscosity: 1.0,
      zoomSnap: 0.2,
      zoomDelta: 0.2,
      wheelPxPerZoomLevel: 200,
    });

    // Aggiungi la griglia
    createGrid(mapInstance, gridZero, gridSteps, gridSize);

    // Imposta i limiti della mappa
    mapInstance.fitBounds(currentBounds);

    window.addEventListener('resize', () => {
      mapInstance!.invalidateSize();
    });
  }

  // Se gli overlay non sono stati creati, crearli e aggiungerli alla mappa
  if (mode === 'sky' && !skyOverlay) {
    skyOverlay = L.imageOverlay('/image/map0.jpg', getSkyBounds()!, { opacity: 1 });
    skyOverlay.addTo(mapInstance);
  }

  if (mode === 'ground' && !groundOverlay) {
    groundOverlay = L.imageOverlay('/image/map1.jpg', getGroundBounds()!, { opacity: 1 });
    groundOverlay.addTo(mapInstance);
  }

  return mapInstance;
}

/**
 * Cambia la modalità della mappa tra 'sky', 'ground' e 'both'.
 */
export function changeMapMode(mode: 'sky' | 'ground' | 'both') {
  if (!mapInstance || !skyOverlay || !groundOverlay) {
    console.error('La mappa non è stata inizializzata correttamente.');
    return;
  }

  if (mode === 'sky') {
    console.log('Passando alla modalità cielo');
    skyOverlay.setOpacity(1);
    groundOverlay.setOpacity(0);
    if (skyBounds) {
      // Usa direttamente i bounds del cielo
      mapInstance.fitBounds(skyBounds); 
    }
  } else if (mode === 'ground') {
    console.log('Passando alla modalità terra');
    skyOverlay.setOpacity(0);
    groundOverlay.setOpacity(1);
    if (groundBounds) {
      // Usa direttamente i bounds della terra
      mapInstance.fitBounds(groundBounds); 
    }
  } else if (mode === 'both') {
    console.log('Visualizzando entrambe le mappe');
    skyOverlay.setOpacity(1);
    groundOverlay.setOpacity(1);
    if (skyBounds && groundBounds) {
      // Usa i bounds combinati
      const combinedBounds = L.latLngBounds(skyBounds!.getSouthWest(), skyBounds!.getNorthEast())
        .extend(L.latLngBounds(groundBounds!.getSouthWest(), groundBounds!.getNorthEast()));
      mapInstance.fitBounds(combinedBounds); 
    }
  }
}




/**
 * Resetta la mappa e le variabili associate.
 */
export function resetMap() {
  if (mapInstance) {
    mapInstance.off();
    mapInstance.remove();
    mapInstance = null;
  }
  skyOverlay = null;
  groundOverlay = null;
  skyBounds = null;
  groundBounds = null;
}

/**
 * Imposta i bounds per il cielo.
 */
export function setSkyBounds(min: [number, number], max: [number, number]) {
  skyBounds = L.latLngBounds([min[1], min[0]], [max[1], max[0]]);
  console.log('Set sky bounds:', skyBounds);
}

/**
 * Imposta i bounds per la terra.
 */
export function setGroundBounds(min: [number, number], max: [number, number]) {
  groundBounds = L.latLngBounds([min[1], min[0]], [max[1], max[0]]);
  console.log('Set ground bounds:', groundBounds);
}

/**
 * Restituisce i bounds del cielo.
 */
export function getSkyBounds(): L.LatLngBounds | null {
  return skyBounds;
}

/**
 * Restituisce i bounds della terra.
 */
export function getGroundBounds(): L.LatLngBounds | null {
  return groundBounds;
}
