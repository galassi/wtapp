import { stringArray } from './script';
import axios from 'axios';
import config from './config.json';

// Variabile per salvare gli ID già filtrati
let filteredIds: Set<number> = new Set<number>();

// Variabile per salvare i tempi (time) associati ai messaggi filtrati
let filteredTimes: number[] = [];

// Parole chiave per il filtro dei messaggi (senza "ha ottenuto")
const keywordFilters = [
  "pesantemente danneggiato",
  "schiantato",
  "ha abbattuto",
  "gravemente danneggiato",
  "ha mandato in fiamme",
  "ha distrutto"
];

let isChatDataFetched = false;

// Variabile per l'ID attuale (da fornire dinamicamente, ad esempio dall'interfaccia utente)
let currentId = 0; // Può essere aggiornato dinamicamente tramite interfaccia

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
 * Funzione per estrarre il nome e il veicolo dell'avversario e filtrare i messaggi
 * @param damageLog Array di log dei danni
 * @param allies Array di stringhe contenente i nomi degli alleati
 * @returns Array con i dati degli avversari o degli alleati distrutti
 */
const extractOpponentData = (damageLog: any[], allies: string[]) => {
  return damageLog
    .filter(entry => {
      // Filtra l'ID se è maggiore dell'ID attuale
      if (entry.id > currentId) {
        return false;
      }

      // Controlla se l'ID è già stato filtrato
      if (filteredIds.has(entry.id)) {
        return false;
      }

      // Controlla se il messaggio contiene una delle parole chiave
      const containsKeyword = keywordFilters.some(keyword => entry.msg.includes(keyword));

      if (containsKeyword) {
        // Salva l'ID per evitare di rifiltrarlo in futuro
        filteredIds.add(entry.id);

        // Salva il valore di "time"
        filteredTimes.push(entry.time);

        return true; // Mantieni questo elemento nel risultato
      }

      return false; // Filtra via l'elemento se non contiene le parole chiave
    })
    .map(entry => {
      // Regex aggiornata per trovare attaccante e bersaglio (se presente) dal messaggio di log
      const regex = /([^\s()]+) \(([^)]+)\) ha .*? ([^\s()]+)? \(([^)]+)\)?/;
      const match = entry.msg.match(regex);

      if (match) {
        const attacker = match[1]; // Nome dell'attaccante
        const attackerVehicle = match[2]; // Veicolo dell'attaccante
        const target = match[3] || ''; // Nome del bersaglio (avversario), vuoto se non esiste
        const targetVehicle = match[4] || ''; // Veicolo del bersaglio, vuoto se non esiste

        // Se l'attaccante o il bersaglio è un alleato, verifica se è stato abbattuto/distrutto
        let isAllyDestroyed = false;
        let allyInfo = null;

        if (allies.includes(attacker)) {
          isAllyDestroyed = true;
          allyInfo = { ally: attacker, allyVehicle: attackerVehicle, action: 'attaccato' };
        } else if (allies.includes(target)) {
          isAllyDestroyed = true;
          allyInfo = { ally: target, allyVehicle: targetVehicle, action: 'bersaglio' };
        }

        // Restituisce i dati dell'avversario o dell'alleato
        if (isAllyDestroyed) {
          return {
            allyDestroyed: true,
            allyInfo,
            time: entry.time
          };
        } else {
          return {
            opponent: attacker,
            opponentVehicle: attackerVehicle,
            time: entry.time
          };
        }
      }

      return null; // Restituisce null se non c'è match
    })
    .filter(item => item !== null); // Filtra i risultati nulli
};

// Funzione per resettare il set di filteredIds
export function resetFilteredIds() {
  filteredIds.clear(); // Reset filteredIds
  console.log('filteredIds resettato a 0.');
}

// Esempio di utilizzo del bottone (se si sta usando un framework come React o vanilla JS)
document.getElementById('reset-button')?.addEventListener('click', resetFilteredIds);

// In un secondo momento, puoi accedere ai tempi filtrati così:
console.log('Tempi filtrati:', filteredTimes);
