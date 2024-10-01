import { stringArray } from './script';
import axios from 'axios';
import config from './config.json';

/**
 * Funzione per ottenere ed elaborare i dati della chat
 */

let isChatDataFetched = false;

export async function fetchChatData() {
  if (isChatDataFetched) return; // Prevent re-fetch
  isChatDataFetched = true;
  try {
    console.log('Recupero dati chat');
    const chatInfoResponse = await axios.get(config.CHAT);
    const chatInfo = chatInfoResponse.data;

    // Elaborazione dei dati della chat
    if (chatInfo.damage && chatInfo.damage.length > 0) {
      const opponentData = extractOpponentData(chatInfo.damage, stringArray);
      console.log(opponentData);
    }
  } catch (error) {
    console.error('Errore durante il fetch dei dati della chat:', error);
  }
}

/**
 * Funzione per estrarre il nome e il veicolo dell'avversario
 * @param damageLog Array di log dei danni
 * @param allies Array di stringhe contenente i nomi degli alleati
 * @returns Array con i dati degli avversari
 */
const extractOpponentData = (damageLog: any[], allies: string[]) => {
  return damageLog.map(entry => {
    // Regex per trovare attaccante e bersaglio (avversario) dal messaggio di log
    const regex = /(\w+) \(([^)]+)\) ha .* (\w+) \(([^)]+)\)/;
    const match = entry.msg.match(regex);

    if (match) {
      const attacker = match[1]; // Nome dell'attaccante
      const attackerVehicle = match[2]; // Veicolo dell'attaccante
      const target = match[3]; // Nome del bersaglio (avversario)
      const targetVehicle = match[4]; // Veicolo del bersaglio (avversario)

      // Se l'attaccante è un alleato, l'avversario è il bersaglio
      if (allies.includes(attacker)) {
        return {
          opponent: target,
          opponentVehicle: targetVehicle
        };
      } else { // Se l'attaccante non è un alleato, l'avversario è l'attaccante
        return {
          opponent: attacker,
          opponentVehicle: attackerVehicle
        };
      }
    }

    return null; // Restituisce null se non c'è match
  }).filter(item => item !== null); // Filtra i risultati nulli
};
