import { Marker } from './types';
import { getMarkerId } from './markerManager'; // Assumendo che queste funzioni siano in markerManager.ts

interface ExtendedMarker extends Marker {
  notFoundCount?: number; // Contatore per i marker non trovati
}

let previousMarkers: ExtendedMarker[] = []; // Array che contiene i marker già esistenti

// Funzione per confrontare i nuovi marker con quelli esistenti
export function processMarkers(newMarkers: Marker[]): Marker[] {
  const processedMarkers: Marker[] = newMarkers.map(newMarker => {
    // Cerca se esiste già un marker con coordinate simili in `previousMarkers`
    const existingMarker = previousMarkers.find(existingMarker => 
      Math.abs(existingMarker.x - newMarker.x) < 10 && // Confronta se la differenza in x è minore di 10
      Math.abs(existingMarker.y - newMarker.y) < 10 && // Confronta se la differenza in y è minore di 10
      existingMarker.type === newMarker.type &&
      existingMarker.icon === newMarker.icon &&
      JSON.stringify(existingMarker['color[]']) === JSON.stringify(newMarker['color[]']) // Confronta l'array color[]
    );

    if (existingMarker) {
      // Mantieni l'ID esistente e resetta il contatore
      newMarker.id = existingMarker.id;
      existingMarker.notFoundCount = 0; // Reset del contatore poiché è stato trovato
    } else {
      // Se non c'è un marker esistente, assegna un nuovo ID
      newMarker.id = getMarkerId(newMarker);
    }

    return newMarker; // Ritorna il marker con l'ID aggiornato
  });

  // Aumenta il contatore per i marker che non sono più presenti
  previousMarkers.forEach(existingMarker => {
    const stillExists = newMarkers.some(newMarker => 
      Math.abs(existingMarker.x - newMarker.x) < 10 && // Confronta la differenza in x
      Math.abs(existingMarker.y - newMarker.y) < 10 && // Confronta la differenza in y
      existingMarker.type === newMarker.type &&
      existingMarker.icon === newMarker.icon &&
      JSON.stringify(newMarker['color[]']) === JSON.stringify(existingMarker['color[]'])
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
