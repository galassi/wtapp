import { initializeMap, changeMapMode, loadOverlayAndBounds,resetView } from './mapManager';
import { fetchMarkerSettings } from './dataFetcher';
import { fetchChatData } from './chat';
import axios from 'axios';
import { MapObject } from './types';
import * as L from 'leaflet';

let isInitialized = false;
let isLoading = false;
let currentMap: L.Map | null = null;

// Imposta il timeout di Axios se necessario
axios.defaults.timeout = 10000; // 10 secondi

async function init(mode: 'sky' | 'ground') {
  if (isLoading) {
    console.warn(`Caricamento in corso. isLoading: ${isLoading}`);
    return;
  }
  isLoading = true;

  try {
    console.log(`Inizializzazione della mappa...`);

    // Richiedi al server di scaricare i file per la modalità selezionata
    await axios.get(`/api/download-map?mode=${mode}`);

    // Inizializza la mappa solo se non è già esistente
    await initializeMap();  // Controlla internamente se mapInstance esiste già

    // Carica l'overlay e i bounds in base alla modalità selezionata
    await loadOverlayAndBounds(mode);

    isInitialized = true;
    console.log('Mappa inizializzata correttamente.');
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Errore Axios durante l\'inizializzazione:', error.message);
    } else {
      console.error('Errore inatteso durante l\'inizializzazione:', error);
    }
  } finally {
    isLoading = false;
    console.log('Flag isLoading resettato a false.');
  }
}


document.addEventListener('DOMContentLoaded', function onLoaded() {
  const skyButton = document.getElementById('sky-button');
  const groundButton = document.getElementById('ground-button');
  const resetButton = document.getElementById('reset-view-button');
  const messageContainer = document.getElementById('message');

  // Mostra un messaggio iniziale
  if (messageContainer) {
    messageContainer.innerText = 'Seleziona una mappa per iniziare.';
    console.log('Messaggio UI iniziale impostato.');
  }

  // Funzione per inizializzare la mappa se non è già inizializzata
  async function initializeIfNeeded(mode: 'sky' | 'ground') {
    // Aggiungi un controllo per evitare chiamate multiple
    if (isInitialized || isLoading) {
      console.log('Mappa già inizializzata o caricamento in corso, salto l\'inizializzazione.');
      return;
    }

    console.log('Inizializzazione della mappa richiesta in modalità:', mode);
    await init(mode);  // Chiama init una sola volta per inizializzare la mappa

    // Cambia la modalità della mappa
    changeMapMode(mode);
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

  // Listener per il bottone "Reset"
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      console.log('Resettando la vista e cancellando i file...');
      resetView();
    });
  }
});
