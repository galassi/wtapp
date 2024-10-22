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
  allyInfo?: {
    allyOnline: boolean;
    allyName: string;
    allyPrint: string;
    action: string;
  } | null;
  enemyInfo?: {
    enemyOnline: boolean;
    enemyName: string;
    enemyPrint: string;
    action: string;
  } | null;
  time: number;
};

// Variabili per il fetch della chat
let filteredIds: Set<number> = new Set<number>();
let filteredTimes: number[] = [];


let currentId = 0; // ID attuale

// Funzione per estrarre nome, veicolo e prefisso dall'entry.msg
const manualSplit = (message: string, keywordFound: string) => {
  const parts = message.split(` ${keywordFound} `); // Usa la parola chiave per dividere il messaggio
  if (parts.length === 2) {
    const attackerPart = parts[0];
    const targetPart = parts[1];
    
    // Estrai il prefisso, il nome e il veicolo dell'attaccante
    const attackerPrefix = attackerPart.split(" ")[0];  // Il prefisso è la prima parte
    const attackerName = attackerPart.split(" ")[1];    // Il nome è la seconda parte
    const attackerVehicle = attackerPart.split("(")[1].split(")")[0]; // Estrai il veicolo
    
    // Estrai il prefisso, il nome e il veicolo del bersaglio
    const targetPrefix = targetPart.split(" ")[0];      // Il prefisso è la prima parte
    const targetName = targetPart.split(" ")[1];        // Il nome è la seconda parte
    const targetVehicle = targetPart.split("(")[1].split(")")[0]; // Estrai il veicolo
    
    return {
      attackerPrefix,
      attackerName,
      attackerVehicle,
      targetPrefix,
      targetName,
      targetVehicle,
    };
  }
  return null;
};

// Nuova lista di parole chiave, includendo "ha abbattuto"
const keywordFilters = [
  "ha distrutto",
  "ha abbattuto",
  "pesantemente danneggiato",
  "gravemente danneggiato",
  "ha mandato in fiamme"
];

// Funzione per processare ciascuna voce del damage log
const extractOpponentData = (damageLog: ChatEntry[], stringArray: string[]): OpponentData[] => {
  let opponentData: OpponentData[] = [];

  damageLog.forEach(entry => {
    if (!filteredIds.has(entry.id)) {
      // Trova la prima parola chiave presente nel messaggio
      const keywordFound = keywordFilters.find(keyword => entry.msg.includes(keyword));

      if (keywordFound) {
        filteredIds.add(entry.id);
        filteredTimes.push(entry.time);

        // Usa la funzione manualSplit invece della regex, passa la keyword trovata
        const result = manualSplit(entry.msg, keywordFound);
        
        if (result) {
          const { 
            attackerPrefix, attackerName, attackerVehicle, 
            targetPrefix, targetName, targetVehicle 
          } = result;

          // Verifica se l'attaccante è un alleato
          const isAllyAttacker = stringArray.includes(attackerName);
          // Verifica se il bersaglio è un alleato
          const isAllyTarget = stringArray.includes(targetName);

          let allyInfo: {
            allyOnline: boolean;
            allyName: string;
            allyPrint: string;
            action: string;
          } | null = null;

          let enemyInfo: {
            enemyOnline: boolean;
            enemyName: string;
            enemyPrint: string;
            action: string;
          } | null = null;

          // Controlla quale parola chiave è stata trovata
          if (keywordFound === 'ha distrutto' || keywordFound === 'ha abbattuto') {
            // Se il bersaglio è un alleato, è stato distrutto o abbattuto (offline)
            if (isAllyTarget) {
              allyInfo = {
                allyOnline: false,  // L'alleato è morto
                allyName: targetName,
                allyPrint: `${targetPrefix} ${targetName} (${targetVehicle})`, // Include il prefisso
                action: keywordFound,
              };
              enemyInfo = {
                enemyOnline: true,  // Il nemico (attaccante) è vivo
                enemyName: attackerName,
                enemyPrint: `${attackerPrefix} ${attackerName} (${attackerVehicle})`, // Include il prefisso
                action: keywordFound,
              };
            } else {
              // Se il bersaglio è un nemico, è stato distrutto o abbattuto
              enemyInfo = {
                enemyOnline: false,  // Il nemico è morto
                enemyName: targetName,
                enemyPrint: `${targetPrefix} ${targetName} (${targetVehicle})`,  // Include il prefisso
                action: keywordFound,
              };
              allyInfo = {
                allyOnline: true,  // L'alleato (attaccante) è vivo
                allyName: attackerName,
                allyPrint: `${attackerPrefix} ${attackerName} (${attackerVehicle})`,  // Include il prefisso
                action: keywordFound,
              };
            }
          } else {
            // Per le altre parole chiave (danneggiato, in fiamme), entrambi rimangono online
            allyInfo = {
              allyOnline: true,
              allyName: isAllyTarget ? targetName : attackerName,
              allyPrint: isAllyTarget 
                ? `${targetPrefix} ${targetName} (${targetVehicle})`
                : `${attackerPrefix} ${attackerName} (${attackerVehicle})`,
              action: keywordFound,
            };
            enemyInfo = {
              enemyOnline: true,
              enemyName: isAllyTarget ? attackerName : targetName,
              enemyPrint: isAllyTarget
                ? `${attackerPrefix} ${attackerName} (${attackerVehicle})`
                : `${targetPrefix} ${targetName} (${targetVehicle})`,
              action: keywordFound,
            };
          }

          // Aggiungi i dati raccolti in opponentData
          opponentData.push({
            allyInfo: allyInfo,
            enemyInfo: enemyInfo,
            time: entry.time
          });
        } else {
          console.log("Formato del messaggio non valido:", entry.msg);
        }
      }
    }
  });
  console.log(opponentData);
  return opponentData;
};



// Funzione per resettare filteredIds
export function resetFilteredIds() {
  filteredIds.clear();
  filteredTimes = [];
  currentId = 0;
}

// Function to update player tables
function updatePlayerTables(opponentData: OpponentData[]): void {
  const aliveAllies = new Set<string>();  
  const aliveEnemies = new Set<string>(); 
  const offlineAllies = new Set<string>();
  const offlineEnemies = new Set<string>();

  // Process opponent data
  opponentData.forEach(data => {
    // Handle allies
    if (data.allyInfo) {
      const { allyOnline, allyPrint } = data.allyInfo;

      if (!allyOnline) {
        // Se l'alleato è offline (distrutto), spostalo dalla lista degli online a quella degli offline
        aliveAllies.delete(allyPrint);  // Rimuovi dagli online
        offlineAllies.add(allyPrint);   // Aggiungi agli offline
      } else {
        // Se l'alleato è vivo, aggiungilo agli online
        aliveAllies.add(allyPrint);  // Aggiungi agli online
        offlineAllies.delete(allyPrint); // Per sicurezza, rimuovi dagli offline
      }
    }

    // Handle enemies
    if (data.enemyInfo) {
      const { enemyOnline, enemyPrint } = data.enemyInfo;

      if (!enemyOnline) {
        // Se il nemico è offline (distrutto), spostalo dalla lista degli online a quella degli offline
        aliveEnemies.delete(enemyPrint);  // Rimuovi dagli online
        offlineEnemies.add(enemyPrint);   // Aggiungi agli offline
      } else {
        // Se il nemico è vivo, aggiungilo agli online
        aliveEnemies.add(enemyPrint);  // Aggiungi agli online
        offlineEnemies.delete(enemyPrint);  // Per sicurezza, rimuovi dagli offline
      }
    }
  });

  // Popola le tabelle: nessun alleato o nemico viene duplicato
  populateTable('table1', Array.from(aliveAllies), Array.from(aliveEnemies));
  populateTable('table2', Array.from(offlineAllies), Array.from(offlineEnemies));
}





// Funzione per aggiornare la visualizzazione delle tabelle
export async function fetchChatData(): Promise<OpponentData[]> {
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
      updatePlayerTables(opponentData);

      return opponentData;
    }

    return [];
  } catch (error) {
    console.error('Errore durante il fetch dei dati della chat:', error);
    return [];
  }
}
