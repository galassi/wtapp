import axios from 'axios';
import config from './config.json';

/**
 * Funzione per ottenere ed elaborare i dati della chat
 */
export async function fetchChatData() {
  try {
    const chatInfoResponse = await axios.get(config.CHAT);
    const chatInfo = chatInfoResponse.data;

    // Elaborazione dei dati della chat
    if (chatInfo.damage && chatInfo.damage.length > 0) {
      chatInfo.damage.forEach((damageEntry: any) => {
        const { id, msg, time } = damageEntry;

        // Condizioni per gestire i dati di 'id', 'msg' e 'time'
        if (id && msg && time) {
          // Filtrare il messaggio 'msg' in base alle necessità
          if (msg.includes('distrutto')) {
            //console.log(`Evento rilevante: ${msg}`);
            //console.log(`ID: ${id}, Time: ${time}`);
            
            // Aggiungi la tua logica qui per gestire il messaggio filtrato
          }
        }
      });
    }
  } catch (error) {
    console.error('Errore durante il fetch dei dati della chat:', error);
  }
}
