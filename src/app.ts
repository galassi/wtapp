import { initializeMap, changeMapMode, loadOverlayAndBounds, resetView, mapInstance } from './mapManager';
import { fetchMarkerSettings } from './markerManager';
import { fetchChatData } from './chat';
import axios from 'axios';
import { processMarkers, resetMarkers } from './filtro';
import { removeAllMarkers } from './iconManager';

let isLoading = false;
let resetOn = false;
let aremarkerloading = false;
let intervalId: number | undefined;
let areMarkersLoading = false; // Flag per tenere traccia dello stato

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
  const chatToggleButton = document.getElementById('chat-toggle');

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
  if (resetButton && !resetOn) {
    resetButton.addEventListener('click', () => {
      resetOn = true;
      console.log('Resettando la vista e cancellando i file...');
      resetView(resetOn);
    });
  }

  // Listener per il bottone "Marker Toggle"
if (markerToggleButton) {
  markerToggleButton.addEventListener('click', async () => {
    if (!areMarkersLoading) {
      // Inizia il ciclo di fetch ogni 0.5 secondi
      console.log('Avviando il ciclo di fetch dei marker...');
      areMarkersLoading = true;

      // Avvia il fetchMarkerSettings ogni 0.5 secondi
      intervalId = window.setInterval(async () => {
        try {
          await fetchMarkerSettings();
        } catch (error) {
          console.error('Errore durante il fetch delle impostazioni dei marker:', error);
        }
      }, 1000); // 500 ms = 1 secondi

    } else {
      // Se il ciclo è già in esecuzione, fermalo e resetta i valori
      console.log('Arrestando il ciclo di fetch dei marker...');
      areMarkersLoading = false;

      // Ferma il ciclo di fetch dei marker
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        console.log('Fetching dei marker fermato.');
        intervalId = undefined;
      }

      // Rimuovi i marker e resettali solo se la mappa esiste
      if (mapInstance) {
        await removeAllMarkers(mapInstance);
      }
      await resetMarkers();
    }
  });
}

 if (chatToggleButton) {
  chatToggleButton.addEventListener('click', async () => {
    console.log('Toggling chat...');
    
    try {
      // Richiama la funzione fetchChatData per ottenere i dati della chat
      const chatData = await fetchChatData();

      // Se necessario, puoi aggiornare la UI o fare altre operazioni con i dati ricevuti
      console.log('Chat data fetched successfully:', chatData);

      // Aggiungi qui ulteriori operazioni sulla chat o aggiorna l'interfaccia utente
    } catch (error) {
      console.error('Errore durante il fetch dei dati della chat:', error);
    }
  });
}

});
