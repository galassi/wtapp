import axios from 'axios';
import config from './config.json';
import { MapObject, ChatInfo } from './types';

// Funzione per ottenere le impostazioni dei marker
export async function fetchMarkerSettings(): Promise<MapObject[]> {
  try {
    const response = await axios.get<MapObject[]>(config.JSONMARKERSETTING, {
      timeout: 10000, // Aggiungi un timeout per evitare richieste pendenti
    });
    return response.data;
  } catch (error) {
    console.error('Errore durante il fetch delle impostazioni dei marker:', error);
    throw error; // Propaga l'errore per una corretta gestione
  }
}

// Funzione per ottenere le impostazioni della chat
export async function fetchChatSettings(): Promise<ChatInfo> {
  try {
    const response = await axios.get<ChatInfo>(config.CHAT, {
      timeout: 10000, // Aggiungi un timeout per evitare richieste pendenti
    });
    return response.data;
  } catch (error) {
    console.error('Errore durante il fetch delle impostazioni della chat:', error);
    throw error; // Propaga l'errore per una corretta gestione
  }
}
