import { initializeMap, changeMapMode, loadOverlayAndBounds, resetView } from './mapManager';
import { fetchMarkerSettings } from './markerManager';
import { fetchChatData } from './chat';
import axios from 'axios';

let isLoading = false;
let resetOn = false;

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
  const markerToggleButton = document.getElementById('marker-toggle');

  // Mostra un messaggio iniziale
  if (messageContainer) {
    messageContainer.innerText = 'Seleziona una mappa per iniziare.';
    console.log('Messaggio UI iniziale impostato.');
  }

  // Funzione per inizializzare la mappa se non è già inizializzata
  async function initializeIfNeeded(mode: 'sky' | 'ground') {
    // Aggiungi un controllo per evitare chiamate multiple
    if (isLoading) {
      console.log('Mappa già inizializzata o caricamento in corso, salto l\'inizializzazione.');
      return;
    }

    console.log('Inizializzazione della mappa richiesta in modalità:', mode);
    await init(mode);  // Chiama init una sola volta per inizializzare la mappa

    // Cambia la modalità della mappa
      await changeMapMode(mode);
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
  if (resetButton&&!resetOn) {
    resetButton.addEventListener('click', () => {
      resetOn = true;
      console.log('Resettando la vista e cancellando i file...');
      resetView(resetOn);
    });
  }
    // Listener per il bottone "Marker Toggle"
    if (markerToggleButton) {
      markerToggleButton.addEventListener('click', async () => {
        console.log('Eseguendo il toggle dei marker...');
        try {
          const markerSettings = await fetchMarkerSettings();
          console.log('Impostazioni dei marker:', markerSettings);
          // Qui puoi aggiungere eventuali funzioni per gestire i marker con i dati ottenuti
        } catch (error) {
          console.error('Errore durante il fetch delle impostazioni dei marker:', error);
        }
      });
    }
});
