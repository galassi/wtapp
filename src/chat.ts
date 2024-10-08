import { stringArray } from './script'; 
import config from './config.json';

let isChatDataFetched = false;

// Tipizzazione dei dati della chat
type ChatEntry = {
  id: number;
  msg: string;
  time: number;
  damage?: any;
};

type OpponentData = {
  allyDestroyed: boolean;
  allyInfo?: {
    ally: string;
    allyVehicle: string;
    action: string;
  } | null;
  opponent?: string | null;
  opponentVehicle?: string | null;
  target?: string | null;
  targetVehicle?: string | null;
  time: number;
  event?: string;
  vehicle?: string; 
};

// Variabili per il fetch della chat
let filteredIds: Set<number> = new Set<number>();
let filteredTimes: number[] = [];
const keywordFilters = [
  "pesantemente danneggiato",
  "schiantato",
  "ha abbattuto",
  "gravemente danneggiato",
  "ha mandato in fiamme",
  "ha distrutto"
];

let currentId = 0; // ID attuale

export async function fetchChatData(): Promise<OpponentData[]> {
  if (isChatDataFetched) {
    return []; // Prevent re-fetch
  }
  isChatDataFetched = true;

  try {
    const response = await fetch(config.CHAT);
    
    if (!response.ok) {
      throw new Error('Errore nella rete: ' + response.statusText);
    }

    const chatInfo = await response.json();

    if (chatInfo.damage && chatInfo.damage.length > 0) {
      const opponentData = extractOpponentData(chatInfo.damage, stringArray);
      return opponentData;
    }

    return [];
  } catch (error) {
    console.error('Errore durante il fetch dei dati della chat:', error);
    return [];
  }
}

// Funzione per estrarre i dati degli avversari
const extractOpponentData = (damageLog: ChatEntry[], allies: string[]): OpponentData[] => {
  return damageLog
    .filter(entry => {
      if (entry.id <= currentId) return false;
      if (filteredIds.has(entry.id)) return false;

      const containsKeyword = keywordFilters.some(keyword => entry.msg.includes(keyword));

      if (containsKeyword) {
        filteredIds.add(entry.id);
        filteredTimes.push(entry.time);
        return true;
      }

      return false;
    })
    .map(entry => {
      let regex, match;

      // Attaccante ha distrutto bersaglio
      regex = /([^\s()]+) \(([^)]+)\) ha .*? ([^\s()]+)? \(([^)]+)\)?/;
      match = entry.msg.match(regex);

      if (match) {
        const attacker = match[1];
        const attackerVehicle = match[2];
        const target = match[3] || '';
        const targetVehicle = match[4] || '';

        const isAllyDestroyed = allies.includes(attacker) || allies.includes(target);

        return {
          allyDestroyed: isAllyDestroyed,
          allyInfo: isAllyDestroyed ? { ally: attacker, allyVehicle: attackerVehicle, action: 'attaccato' } : null,
          opponent: !isAllyDestroyed ? attacker : null,
          opponentVehicle: !isAllyDestroyed ? attackerVehicle : null,
          target: !isAllyDestroyed ? target : null,
          targetVehicle: !isAllyDestroyed ? targetVehicle : null,
          time: entry.time
        };
      }

      // Caso: Veicolo si è schiantato
      regex = /([^\s()]+) \(([^)]+)\) si è schiantato/;
      match = entry.msg.match(regex);

      if (match) {
        const vehicle = match[2];
        return {
          event: 'schiantato',
          vehicle,
          time: entry.time
        };
      }

      // Caso: Colpo finale
      regex = /([^\s()]+) \(([^)]+)\) ha inflitto il colpo finale/;
      match = entry.msg.match(regex);

      if (match) {
        const attacker = match[1];
        const attackerVehicle = match[2];
        return {
          event: 'colpo_finale',
          attacker,
          attackerVehicle,
          time: entry.time
        };
      }

      // Caso: Veicolo distrutto senza attaccante
      regex = /([^\s()]+) \(([^)]+)\) è stato distrutto/;
      match = entry.msg.match(regex);

      if (match) {
        const target = match[1];
        const targetVehicle = match[2];
        const isAllyDestroyed = allies.includes(target);

        return {
          allyDestroyed: isAllyDestroyed,
          target,
          targetVehicle,
          time: entry.time
        };
      }

      return null; // Nessun pattern trovato
    })
    .filter(item => item !== null) as OpponentData[]; // Filtra risultati nulli
};

// Funzione per resettare filteredIds
export function resetFilteredIds() {
  filteredIds.clear();
}
