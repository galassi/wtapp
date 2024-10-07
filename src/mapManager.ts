import * as L from 'leaflet';
import { createGrid } from './griglia';
import axios from 'axios';
import { MapInfo } from './types';

let mapInstance: L.Map | null = null;
let skyOverlay: L.ImageOverlay | null = null;
let groundOverlay: L.ImageOverlay | null = null;
let currentBounds: L.LatLngBounds | null = null;
let skyGridParams: { gridZero: [number, number], gridSteps: [number, number], gridSize: [number, number] } | null = null;
let groundGridParams: { gridZero: [number, number], gridSteps: [number, number], gridSize: [number, number] } | null = null;


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
  const url = mode === 'sky' ? '/file/hud_type0.json' : '/file/hud_type1.json';
  const imageUrl = mode === 'sky' ? '/image/map0.jpg' : '/image/map1.jpg';

  console.log(`Inizializzando overlay per ${mode}...`);
  
  try {
    const response = await axios.get<MapInfo>(url);
    const mapInfo = response.data;
    setBounds(mapInfo.map_min, mapInfo.map_max);
    setGrid(mapInfo.grid_zero, mapInfo.grid_steps, mapInfo.grid_size, mode); // Imposta i parametri della griglia

    if (mode === 'sky' && !skyOverlay) {
      // Crea l'overlay per il cielo solo se non esiste già
      skyOverlay = L.imageOverlay(imageUrl, currentBounds!, { opacity: 0 }); // Nascondi inizialmente
      skyOverlay.addTo(mapInstance!);
      console.log('Overlay cielo creato e aggiunto.');
    }

    if (mode === 'ground' && !groundOverlay) {
      // Crea l'overlay per la terra solo se non esiste già
      groundOverlay = L.imageOverlay(imageUrl, currentBounds!, { opacity: 0 }); // Nascondi inizialmente
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

  if (mode === 'sky') {
    // Mostra l'overlay del cielo e nascondi quello della terra
    skyOverlay?.setOpacity(1);
    groundOverlay?.setOpacity(0);

    if (currentBounds) {
      mapInstance.fitBounds(currentBounds);
      console.log('Passato a modalità cielo. Adattato ai bounds del cielo.');
    }

    if (skyGridParams) {
      createGrid(mapInstance!, skyGridParams.gridZero, skyGridParams.gridSteps, skyGridParams.gridSize);
      console.log('Griglia cielo creata.');
    }

  } else if (mode === 'ground') {
    // Mostra l'overlay della terra e nascondi quello del cielo
    skyOverlay?.setOpacity(0);
    groundOverlay?.setOpacity(1);

    if (currentBounds) {
      mapInstance.fitBounds(currentBounds);
      console.log('Passato a modalità terra. Adattato ai bounds della terra.');
    }

    if (groundGridParams) {
      createGrid(mapInstance!, groundGridParams.gridZero, groundGridParams.gridSteps, groundGridParams.gridSize);
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
export async function resetView() {
  if (!mapInstance) {
    console.error('La mappa non è stata inizializzata.');
    return;
  }

  console.log('Reset della mappa in corso...');

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

  // Invia una richiesta al server per cancellare i file mappa e JSON
  try {
    console.log('Richiesta di cancellazione dei file al server...');
    await axios.get('/api/delete-map');
    console.log('File cancellati correttamente.');
  } catch (error) {
    console.error('Errore durante la cancellazione dei file:', error);
  }

  console.log('Reset completato.');
}