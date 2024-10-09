import { Marker } from './types';

interface ExtendedMarker extends Marker {
  notFoundCount?: number; // Contatore per i marker non trovati
}

let previousMarkers: ExtendedMarker[] = []; // Array che contiene i marker già esistenti
let currentMarkerId = 1; // Inizia da 1 o da qualsiasi valore iniziale

// Funzione per ottenere un ID unico per i nuovi marker
function getMarkerId(newMarker: Marker): number {
  // Trova l'ID minimo disponibile che non è già utilizzato nei marker esistenti
  while (previousMarkers.some(marker => marker.id === currentMarkerId)) {
    currentMarkerId++; // Incrementa fino a trovare un ID non utilizzato
  }
  
  return currentMarkerId++; // Restituisci l'ID e incrementa per il prossimo
}

// Funzione per confrontare due array di numeri
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

// Funzione per calcolare la distanza euclidea tra due punti
function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Funzione per trovare il marker più vicino con gli stessi attributi
function findClosestMarker(newMarker: Marker): ExtendedMarker | undefined {
  let closestMarker: ExtendedMarker | undefined;
  let minDistance = Infinity;

  previousMarkers.forEach(existingMarker => {
    // Controlla se i tipi, l'icona e il colore sono uguali
    if (
      existingMarker.type === newMarker.type &&
      existingMarker.icon === newMarker.icon &&
      arraysEqual(existingMarker['color[]'], newMarker['color[]'])
    ) {
      // Calcola la distanza euclidea
      const distance = euclideanDistance(existingMarker.x, existingMarker.y, newMarker.x, newMarker.y);
      // Se la distanza è minore dell'attuale distanza minima, aggiorna il marker più vicino
      if (distance < minDistance) {
        minDistance = distance;
        closestMarker = existingMarker;
      }
    }
  });

  return closestMarker; // Restituisci il marker più vicino con attributi corrispondenti
}

// Funzione per confrontare i nuovi marker con quelli esistenti
export function processMarkers(newMarkers: Marker[]): Marker[] {
  const processedMarkers: Marker[] = newMarkers.map(newMarker => {
    // Trova il marker più vicino con gli stessi attributi
    const closestMarker = findClosestMarker(newMarker);

    if (closestMarker) {
      // Mantieni l'ID del marker più vicino e resetta il contatore
      newMarker.id = closestMarker.id;
      closestMarker.notFoundCount = 0; // Reset del contatore poiché è stato trovato
    } else {
      // Se non c'è un marker esistente, assegna un nuovo ID
      newMarker.id = getMarkerId(newMarker);
    }

    return newMarker; // Ritorna il marker con l'ID aggiornato
  });

  // Aumenta il contatore per i marker che non sono più presenti
  previousMarkers.forEach(existingMarker => {
    const stillExists = newMarkers.some(newMarker => 
      existingMarker.id === newMarker.id
    );

    if (!stillExists) {
      existingMarker.notFoundCount = (existingMarker.notFoundCount || 0) + 1; // Incrementa il contatore
    }
  });

  // Rimuovi i marker che non vengono trovati per 10 iterazioni consecutive
  previousMarkers = previousMarkers.filter(marker => marker.notFoundCount! < 10);

  // Aggiungi i marker elaborati alla lista precedente per il prossimo confronto
  previousMarkers = [...previousMarkers, ...processedMarkers.filter(marker => marker.id !== undefined)];

  return processedMarkers;
}
