import { stringArray } from './script'; 
import config from './config.json';
import { populateTable } from './chattable';  // Importa la funzione per popolare le tabelle

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

// Funzione per estrarre i dati degli avversari
const extractOpponentData = (damageLog: ChatEntry[], allies: string[]): OpponentData[] => {
  let opponentData: OpponentData[] = [];

  damageLog.forEach(entry => {
    if (!filteredIds.has(entry.id)) {
      const containsKeyword = keywordFilters.some(keyword => entry.msg.includes(keyword));

      if (containsKeyword) {
        filteredIds.add(entry.id);
        filteredTimes.push(entry.time);

        let regex, match;

        // Caso 1: Gravemente danneggiato
        regex = /([^\s()]+) \([^\)]+\) gravemente danneggiato .*? ([^\s()]+) \([^\)]+\)/;
        match = entry.msg.match(regex);

        if (match) {
          const attacker = match[1]; // Alleato o nemico che ha attaccato
          const target = match[2];   // Chi è stato attaccato

          const isAllyAttacker = allies.includes(attacker);
          const isAllyTarget = allies.includes(target);

          // Se l'attaccante è un alleato, lo segniamo come vivo
          if (isAllyAttacker) {
            opponentData.push({
              allyDestroyed: false,
              allyInfo: { ally: attacker, allyVehicle: "", action: 'gravemente danneggiato' },
              opponent: target,  // Il target è il nemico
              opponentVehicle: "",
              target: target,
              targetVehicle: "",
              time: entry.time,
              event: 'gravemente danneggiato'
            });
          }

          // Se il target è un alleato, lo segniamo come vivo
          if (isAllyTarget) {
            opponentData.push({
              allyDestroyed: false, // L'alleato è solo danneggiato, non distrutto
              allyInfo: { ally: target, allyVehicle: "", action: 'gravemente danneggiato' },
              opponent: attacker,  // L'attaccante è il nemico
              opponentVehicle: "",
              target: target,
              targetVehicle: "",
              time: entry.time,
              event: 'gravemente danneggiato'
            });
          }
        }

        // Caso 2: Ha distrutto
        regex = /([^\s()]+) \([^\)]+\) ha distrutto .*? ([^\s()]+) \([^\)]+\)/;
        match = entry.msg.match(regex);

        if (match) {
          const attacker = match[1]; // Alleato o nemico che ha attaccato
          const target = match[2];   // Chi è stato distrutto

          const isAllyTarget = allies.includes(target);

          // Se il target è un alleato, segna che è stato distrutto
          if (isAllyTarget) {
            opponentData.push({
              allyDestroyed: true,  // Il target è un alleato distrutto
              allyInfo: { ally: target, allyVehicle: "", action: 'distrutto' },
              opponent: null,
              opponentVehicle: null,
              target: target,
              targetVehicle: "",
              time: entry.time,
              event: 'distrutto'
            });
          } else {
            // Se il target non è un alleato, è il nemico che è stato distrutto
            opponentData.push({
              allyDestroyed: false,
              allyInfo: null,
              opponent: target,  // Il nemico è stato distrutto
              opponentVehicle: "",
              target: target,
              targetVehicle: "",
              time: entry.time,
              event: 'distrutto'
            });
          }
        }
      }
    }
  });

  return opponentData;
};

// Funzione per resettare filteredIds
export function resetFilteredIds() {
  filteredIds.clear();
  filteredTimes = [];
  currentId = 0;
}

// Funzione per aggiornare le tabelle dei giocatori
function updatePlayerTables(opponentData: OpponentData[], allies: string[]): void {
  // Set per evitare duplicati
  const aliveAllies = new Set<string>();
  const aliveEnemies = new Set<string>();
  const offlineAllies = new Set<string>();
  const offlineEnemies = new Set<string>();

  // Inizializza gli alleati come vivi
  allies.forEach(ally => {
    aliveAllies.add(ally);
  });

  opponentData.forEach(data => {
    // Se un alleato è stato distrutto
    if (data.allyInfo && data.allyDestroyed) {
      aliveAllies.delete(data.allyInfo.ally);
      offlineAllies.add(data.allyInfo.ally);
    }

    // Gestione dei nemici
    if (data.opponent) {
      if (data.event === 'distrutto' || data.event === 'schiantato') {
        aliveEnemies.delete(data.opponent);
        offlineEnemies.add(data.opponent);
      } else {
        // Se il nemico non è già stato registrato come offline
        if (!offlineEnemies.has(data.opponent)) {
          aliveEnemies.add(data.opponent);
        }
      }
    }
  });

  // Popola la tabella ONLINE (vivi) - Colonna sinistra: alleati, destra: nemici
  populateTable('table1', Array.from(aliveAllies), Array.from(aliveEnemies));

  // Popola la tabella OFFLINE (distrutti) - Colonna sinistra: alleati, destra: nemici
  populateTable('table2', Array.from(offlineAllies), Array.from(offlineEnemies));
}

// Funzione per aggiornare la visualizzazione delle tabelle
export async function fetchChatData(): Promise<OpponentData[]> {
  if (isChatDataFetched) {
    return []; // Evita di rifare il fetch
  }
  isChatDataFetched = true;

  try {
    const response = await fetch('/file/hudmsg.json');
    
    if (!response.ok) {
      throw new Error('Errore nella rete: ' + response.statusText);
    }

    const chatInfo = await response.json();

    if (chatInfo.damage && chatInfo.damage.length > 0) {
      // Passa 'stringArray' come secondo argomento per indicare gli alleati
      const opponentData = extractOpponentData(chatInfo.damage, stringArray);
      
      // Aggiorna le tabelle con i nuovi dati
      updatePlayerTables(opponentData, stringArray);

      return opponentData;
    }

    return [];
  } catch (error) {
    console.error('Errore durante il fetch dei dati della chat:', error);
    return [];
  }
}