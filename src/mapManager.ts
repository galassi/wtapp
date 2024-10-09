import * as L from 'leaflet';
import { createGrid } from './griglia';
import axios from 'axios';
import { MapInfo } from './types';
import { markerLayer } from './iconManager';

export let mapInstance: L.Map | null = null;
let skyOverlay: L.ImageOverlay | null = null;
let groundOverlay: L.ImageOverlay | null = null;
let currentBounds: L.LatLngBounds | null = null;
let skyGridParams: { gridZero: [number, number], gridSteps: [number, number], gridSize: [number, number] } | null = null;
let groundGridParams: { gridZero: [number, number], gridSteps: [number, number], gridSize: [number, number] } | null = null;
let skygrid = false;
let groundgrid = false;

/* Inizializza la mappa con le impostazioni caricate dal file locale. */

export async function initializeMap(): Promise<L.Map> {
  const mapInnerContainer = document.getElementById('map-inner');

  if (!mapInnerContainer) {
    throw new Error('Contenitore interno della mappa non trovato');
  }
  // Controlla se esiste già una mappa e non crearne una nuova se esiste
  if (mapInstance) {
    console.warn('La mappa è già stata inizializzata, saltando la creazione di una nuova istanza.');
    return mapInstance;
  }

  console.log('Creazione di una nuova istanza della mappa...');
  mapInstance = L.map(mapInnerContainer!, {
    crs: L.CRS.Simple,
    minZoom: -6,
    maxZoom: 1,
    zoomSnap: 0.2,
    zoomDelta: 0.2,
    wheelPxPerZoomLevel: 200,
  });

  console.log('Mappa creata senza overlay iniziali.');
  return mapInstance;
}

/**
 * Carica i dati della mappa e crea l'overlay solo se non esiste.
 */
export async function loadOverlayAndBounds(mode: 'sky' | 'ground') {
  let url = mode === 'sky' ? '/file/hud_type0.json' : '/file/hud_type1.json';
  let imageUrl = mode === 'sky' ? '/image/map0.jpg' : '/image/map1.jpg';

  console.log(`Inizializzando overlay per ${mode}...`);

  try {
    let response = await axios.get<MapInfo>(url);
    let mapInfo = response.data;

    setBounds(mapInfo.map_min, mapInfo.map_max);
    setGrid(mapInfo.grid_zero, mapInfo.grid_steps, mapInfo.grid_size, mode); // Imposta i parametri della griglia
    if (mode === 'sky' && !skyOverlay) {
      // Crea l'overlay per il cielo solo se non esiste già
      if (skyOverlay) {
        mapInstance!.removeLayer(skyOverlay);
        skyOverlay = null;  // Resetta l'overlay del cielo
      }
      skyOverlay = L.imageOverlay(imageUrl, currentBounds!, { zIndex: 0 }); // Nascondi inizialmente
      skyOverlay.addTo(mapInstance!);
      console.log('Overlay cielo creato e aggiunto.');
    }

    if (mode === 'ground' && !groundOverlay) {
      // Crea l'overlay per la terra solo se non esiste già
      if (groundOverlay) {
        mapInstance!.removeLayer(groundOverlay);
        groundOverlay = null;  // Resetta l'overlay della terra
      }
      groundOverlay = L.imageOverlay(imageUrl, currentBounds!, { zIndex: 1 }); // Nascondi inizialmente
      groundOverlay.addTo(mapInstance!);
      console.log('Overlay terra creato e aggiunto.');
    }

  } catch (error) {
    console.error(`Errore durante il caricamento dei dati per ${mode}:`, error);
    throw new Error(`Impossibile caricare i dati della mappa per ${mode}`);
  }
}

/**
 * Cambia la visibilità degli overlay tra 'sky' e 'ground' e ricrea la griglia.
 */
export function changeMapMode(mode: 'sky' | 'ground') {
  if (!mapInstance) {
    console.error('La mappa non è stata inizializzata correttamente.');
    return;
  }

  if (mode === 'sky' && skyOverlay) {
    if (currentBounds) {
      mapInstance.fitBounds(currentBounds);
      console.log('Passato a modalità cielo. Adattato ai bounds del cielo.', currentBounds);
    }
    if (skyGridParams && !skygrid) {
      createGrid(mapInstance!, skyGridParams.gridZero, skyGridParams.gridSteps, skyGridParams.gridSize);
      skygrid = true;
      console.log('Griglia cielo creata.');
    }
  } if (mode === 'ground' && groundOverlay) {
    if (currentBounds) {
      mapInstance.fitBounds(currentBounds);
      console.log('Passato a modalità terra. Adattato ai bounds della terra.', currentBounds);
    }

    if (groundGridParams && !groundgrid) {
      createGrid(mapInstance!, groundGridParams.gridZero, groundGridParams.gridSteps, groundGridParams.gridSize);
      groundgrid = true;
      console.log('Griglia terra creata.');
    }
  }
}

/**
 * Imposta i bounds della mappa.
 */
function setBounds(min: [number, number], max: [number, number]) {
  currentBounds = L.latLngBounds([min[1], min[0]], [max[1], max[0]]);
}

export function getMarkerBounds(): L.LatLngBounds {
  if (currentBounds === null) {
    throw new Error('currentBounds non è stato ancora impostato.');
  }
  return currentBounds;
}
/**
 * Imposta i parametri della griglia separatamente per 'sky' e 'ground'.
 */
function setGrid(gridZero: [number, number], gridSteps: [number, number], gridSize: [number, number], mode: 'sky' | 'ground') {
  if (mode === 'sky') {
    skyGridParams = { gridZero, gridSteps, gridSize };
    console.log('Parametri griglia cielo impostati:', skyGridParams);
  } else if (mode === 'ground') {
    groundGridParams = { gridZero, gridSteps, gridSize };
    console.log('Parametri griglia terra impostati:', groundGridParams);
  }
}

/**
 * Funzione per resettare la mappa, rimuovere gli overlay e smontare completamente L.Map.
 */
export async function resetView(resetOn) {
  // Invia una richiesta al server per cancellare i file mappa e JSON
  try {
    console.log('Richiesta di cancellazione dei file al server...');
    resetOn = false;
    await axios.get('/api/delete-map');
    console.log('File cancellati correttamente.');
  } catch (error) {
    console.error('Errore durante la cancellazione dei file:', error);
  }

  if (!mapInstance) {
    console.error('La mappa non è stata inizializzata.');
    return;
  }

  console.log('Reset della mappa in corso...');

  // Rimuovi tutti i marker dalla mappa se esistono
  if (markerLayer && mapInstance) {
    console.log('Rimozione di tutti i marker dalla mappa...');
    markerLayer.forEach((marker, id) => {
      mapInstance?.removeLayer(marker);  // Usare optional chaining per evitare errori
    });
    markerLayer.clear();  // Svuota l'oggetto markerLayer per resettare i marker
  }

  // Rimuovi gli overlay della mappa
  if (skyOverlay) {
    console.log('Rimozione dell\'overlay del cielo...');
    mapInstance.removeLayer(skyOverlay);
    skyOverlay = null;  // Resetta l'overlay del cielo
  }

  if (groundOverlay) {
    console.log('Rimozione dell\'overlay della terra...');
    mapInstance.removeLayer(groundOverlay);
    groundOverlay = null;  // Resetta l'overlay della terra
  }

  // Smonta completamente la mappa
  console.log('Smontaggio completo della mappa...');
  mapInstance.remove();  // Rimuove la mappa dal DOM e pulisce tutte le risorse associate
  mapInstance = null;  // Resetta l'istanza della mappa

  // Resetta anche i bounds e i parametri della griglia
  currentBounds = null;
  skyGridParams = null;
  groundGridParams = null;
  skygrid = false;
  groundgrid = false;

  console.log('Reset completato.');
}

