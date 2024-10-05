import { initializeMap, changeMapMode, resetMap, setSkyBounds, setGroundBounds, getSkyBounds, getGroundBounds } from './mapManager'; // Aggiungi getSkyBounds e getGroundBounds
import { fetchMarkerSettings } from './dataFetcher';
import { addMapMarkers } from './markerManager';
import { fetchChatData } from './chat';
import axios from 'axios';
import { MapInfo, MapObject } from './types';
import * as L from 'leaflet'; 

let isInitialized = false;
let isLoading = false;
let currentMap: L.Map | null = null;

// Imposta il timeout di Axios se necessario
axios.defaults.timeout = 10000; // 10 secondi

async function init(mode: 'sky' | 'ground') {
  if (isInitialized || isLoading) return;
  isLoading = true;

  try {
    const mapContainerWrapper = document.getElementById('map');
    if (mapContainerWrapper) {
      mapContainerWrapper.innerHTML = "<div id='map-inner' style='width: 100%; height: 100%;'></div>";
    } else {
      throw new Error('Map container not found');
    }

    // Log della richiesta
    console.log(`Scaricamento delle mappe per la modalità ${mode}...`);

    // Richiedi al server di scaricare i file per la modalità selezionata
    await axios.get(`/api/download-map?mode=${mode}`);

    const jsonMapSettingsFile = mode === 'sky' ? '/file/hud_type0.json' : '/file/hud_type1.json';

    // Ottieni le impostazioni della mappa
    const response = await axios.get<MapInfo>(jsonMapSettingsFile);
    const mapInfo: MapInfo = response.data;

    // Inizializza la mappa e assegna l'istanza a currentMap
    currentMap = await initializeMap(
      'map-inner',
      mapInfo.map_min,
      mapInfo.map_max,
      mapInfo.grid_zero,
      mapInfo.grid_steps,
      mapInfo.grid_size,
      mode 
    );

    // Imposta i bounds corretti per il cielo o la terra
    if (mode === 'sky') {
      setSkyBounds(mapInfo.map_min, mapInfo.map_max);
    } else if (mode === 'ground') {
      setGroundBounds(mapInfo.map_min, mapInfo.map_max);
    }

    // Ottieni i marker e aggiungili alla mappa
    const mapObjects: MapObject[] = await fetchMarkerSettings();
    if (currentMap) {
      addMapMarkers(currentMap, mapObjects, mapInfo.map_min, mapInfo.map_max);
    }

    // Ottieni i dati della chat
    await fetchChatData();

    isInitialized = true;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error during initialization:', error.message);
      console.error('Error code:', error.code);
      console.error('Request config:', error.config);
      console.error('Response:', error.response);
    } else {
      console.error('Unexpected error during initialization:', error);
    }
  } finally {
    isLoading = false;
  }
}


// Funzione per resettare la mappa e cancellare i file locali
async function resetView() {
  if (currentMap) {
    currentMap.eachLayer(layer => {
      currentMap?.removeLayer(layer);
    });
    currentMap.off();
    currentMap.remove();
    currentMap = null;
  }

  // Resetta le variabili della mappa
  resetMap();

  // Rimuovi il contenuto del contenitore della mappa
  const mapContainerWrapper = document.getElementById('map');
  if (mapContainerWrapper) {
    mapContainerWrapper.innerHTML = '';
  }

  isInitialized = false;

  // Richiedi al server di cancellare i file
  await axios.get('/api/delete-map');

  // Ripristina eventuali elementi UI o messaggi
  const messageContainer = document.getElementById('message');
  if (messageContainer) {
    messageContainer.innerText = 'Seleziona una mappa per iniziare.';
  }
}

document.addEventListener('DOMContentLoaded', function onLoaded() {
  const skyButton = document.getElementById('sky-button');
  const groundButton = document.getElementById('ground-button');
  const bothButton = document.getElementById('both-button');
  const resetButton = document.getElementById('reset-view-button');
  const messageContainer = document.getElementById('message');

  // Mostra un messaggio iniziale
  if (messageContainer) {
    messageContainer.innerText = 'Seleziona una mappa per iniziare.';
  }

// Funzione per inizializzare la mappa se non è già inizializzata
async function initializeIfNeeded(mode: 'sky' | 'ground' | 'both') {
  if (!isInitialized && !isLoading) {
    console.log('Inizializzando la mappa...');

    if (mode === 'both') {
      // Inizializza per entrambe le modalità
      await init('sky');
      await init('ground');
    } else {
      // Inizializza solo per la modalità selezionata
      await init(mode);
    }
  }

  // Cambia la modalità della mappa e applica i bound corretti
  changeMapMode(mode);

  if (mode === 'sky') {
    const skyBounds = getSkyBounds();  // Prendi i bounds del cielo
    if (skyBounds) {
      currentMap?.fitBounds(skyBounds);  // Usa il bounds impostato per il cielo
    }
  } else if (mode === 'ground') {
    const groundBounds = getGroundBounds();  // Prendi i bounds della terra
    if (groundBounds) {
      currentMap?.fitBounds(groundBounds);  // Usa il bounds impostato per la terra
    }
  } else if (mode === 'both') {
    const skyBounds = getSkyBounds();  // Prendi i bounds del cielo
    const groundBounds = getGroundBounds();  // Prendi i bounds della terra
    if (skyBounds && groundBounds) {
      // Combina i bounds e applica
      const combinedBounds = L.latLngBounds(skyBounds.getSouthWest(), skyBounds.getNorthEast())
        .extend(groundBounds.getSouthWest())
        .extend(groundBounds.getNorthEast());
      
      currentMap?.fitBounds(combinedBounds);  // Usa i bounds combinati
    }
  }
}

  
  // Listener per il bottone "Cielo"
  if (skyButton) {
    skyButton.addEventListener('click', () => {
      console.log('Passando alla modalità cielo...');
      initializeIfNeeded('sky');
    });
  }

  // Listener per il bottone "Terra"
  if (groundButton) {
    groundButton.addEventListener('click', () => {
      console.log('Passando alla modalità terra...');
      initializeIfNeeded('ground');
    });
  }

  // Listener per il bottone "Entrambi"
  if (bothButton) {
    bothButton.addEventListener('click', async () => {
      console.log('Visualizzando entrambe le mappe...');
      initializeIfNeeded('both');
    });
  }

  // Listener per il bottone "Reset"
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      console.log('Resettando la vista e cancellando i file...');
      resetView();
    });
  }
});
