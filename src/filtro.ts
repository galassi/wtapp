import { Marker } from './types';

// Utilizzo di una mappa per gestire i marker esistenti per una ricerca più efficiente
let previousMarkers: Map<number, Marker> = new Map();
let currentMarkerId = 1; // Contatore iniziale per generare ID
let removedIds: Set<number> = new Set(); // Set per tracciare gli ID rimossi

// Funzione per ottenere un ID unico per i nuovi marker
function getMarkerId(): number {
  // Non riutilizzare immediatamente gli ID rimossi
  let newId = currentMarkerId++;
  while (previousMarkers.has(newId) || removedIds.has(newId)) {
    newId = currentMarkerId++;
  }
  return newId;
}

// Funzione per calcolare la distanza euclidea tra due punti
function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Funzione per trovare il marker più vicino con gli stessi attributi
function findClosestMarker(newMarker: Marker, availableMarkers: Marker[]): Marker | undefined {
  let closestMarker: Marker | undefined;
  let minDistance = Infinity;

  availableMarkers.forEach(existingMarker => {
    const distance = euclideanDistance(existingMarker.x, existingMarker.y, newMarker.x, newMarker.y);
    if (distance < minDistance) {
      minDistance = distance;
      closestMarker = existingMarker;
    }
  });

  return closestMarker;
}

// Funzione per rimuovere un marker e tracciare l'ID come rimosso
function removeMarker(id: number) {
  if (previousMarkers.has(id)) {
    previousMarkers.delete(id);
    removedIds.add(id); // Aggiungi l'ID alla lista degli ID rimossi
  }
}

// Funzione per confrontare i nuovi marker con quelli esistenti
export async function processMarkers(newMarkers: Marker[]): Promise<Marker[]> {
  const processedMarkers: Marker[] = [];
  const matchedMarkerIds = new Set<number>();
  const availableMarkers = Array.from(previousMarkers.values());

  newMarkers.forEach(newMarker => {
    const closestMarker = findClosestMarker(newMarker, availableMarkers.filter(marker => !matchedMarkerIds.has(marker.id!)));

    if (closestMarker) {
      newMarker.id = closestMarker.id; // Aggiorna il nuovo marker con l'ID esistente
      matchedMarkerIds.add(closestMarker.id!); // Traccia l'ID come abbinato
    } else {
      newMarker.id = getMarkerId(); // Assegna un nuovo ID se non c'è un match
    }

    processedMarkers.push(newMarker);
  });

  // Rimuovi i marker vecchi non trovati tra i nuovi
  previousMarkers.forEach((existingMarker, id) => {
    if (!matchedMarkerIds.has(id)) {
      removeMarker(id);
    }
  });

  // Aggiorna o aggiungi i nuovi marker nel set dei marker precedenti
  processedMarkers.forEach(newMarker => {
    previousMarkers.set(newMarker.id!, newMarker);
  });

  return processedMarkers; // I marker processati verranno gestiti da markermanager.ts
}


// Funzione per resettare tutti i marker
export function resetMarkers() {
  previousMarkers.clear();
  currentMarkerId = 1;
  removedIds.clear(); // Resetta anche gli ID rimossi
  ('I marker sono stati resettati.');
}
