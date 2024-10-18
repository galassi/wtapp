import * as L from 'leaflet';
import { Marker } from './types'; // Supponendo che tu abbia un tipo Marker definito in types.ts

interface MissingMarker extends L.Marker {
    missingCount: number; // Contatore per tracciare quante volte è stato stampato
    originalColor: string; // Manteniamo il colore RGB originale del marker
    type: string;          // Aggiungiamo il campo 'type' per gestire il tipo del marker
}
// Definisci la mappa previousMarkers se non è già dichiarata da qualche altra parte
let previousMarkers: Map<number, Marker> = new Map(); // Mappa che contiene i marker precedenti
// Definizione di markerLayer come una mappa che associa ID a L.Marker
export const markerLayer: Map<number, L.Marker> = new Map();

// Funzione per controllare se il colore è una tonalità di verde
function isGreen(rgbArray: number[]): boolean {
    const [r, g, b] = rgbArray;
    return g > r && g > b; // Verde maggiore di rosso e blu
}

// Funzione per controllare se il colore è una tonalità di rosso
function isRed(rgbArray: number[]): boolean {
    const [r, g, b] = rgbArray;
    return r > g && r > b; // Rosso maggiore di verde e blu
}

function createIcon(obj: any, dx: number, dy: number, x: number, y: number) {
    let styles = 'font-size: 15px;';

    // Gestire la rotazione se dx e dy sono forniti e diversi da zero
    if (dx !== 0 || dy !== 0) {
        const rotationAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 45;
        styles += `transform: rotate(${rotationAngle}deg);`;
    }
    // Condizionatamente impostare l'icona in base alle proprietà di obj
    let iconHtml = '';


    switch (obj.icon) {
        case 'Player':
            iconHtml = isGreen(obj["color[]"]) ? `<div style="${styles}">🛰️​</div>` : iconHtml;
            break;
        case 'HeavyTank':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">🚋</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🚎</div>` : iconHtml;
            break;
        case 'TankDestroyer':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">🚓</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🚕</div>` : iconHtml;
            break;
        case 'Ground':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">👚</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🧥</div>` : iconHtml;
            break;
        case 'SPAA':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">📡</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">📻</div>` : iconHtml;
            break;
        case 'LightTank':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">🚗</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🚙</div>` : iconHtml;
            break;
        case 'MediumTank':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">🚚</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🚛</div>` : iconHtml;
            break;
        case 'Wheeled':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">🏎️</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🛺</div>` : iconHtml;
            break;
        case 'Airdefence':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">🚀</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🛡️</div>` : iconHtml;
            break;
        case 'Ship':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">⛵</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🛶</div>` : iconHtml;
            break;
        case 'respawn_base_bomber':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">🎊</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🎇</div>` : iconHtml;
            break;
        case 'respawn_base_fighter':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">🎈</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🎐</div>` : iconHtml;
            break;
        case 'Structure':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">🌋</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">🌄</div>` : iconHtml;
            break;
        case 'missing':
            iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">❓</div>` :
                isGreen(obj["color[]"]) ? `<div style="${styles}">♻️</div>` : iconHtml;
            break;

        default:
            // Gestione di altri tipi non specificati
            switch (obj.type) {
                case 'aircraft':
                    iconHtml = isGreen(obj["color[]"]) ? `<div style="${styles}">✈️</div>` :
                        isRed(obj["color[]"]) ? `<div style="${styles}">🛩️</div>` : iconHtml;
                    break;
                case 'airfield':
                    iconHtml = isGreen(obj["color[]"]) ? `<div style="${styles}">🟩</div>` :
                        isRed(obj["color[]"]) ? `<div style="${styles}">🟥</div>` : iconHtml;
                    break;
                case 'respawn_base_tank':
                    iconHtml = isGreen(obj["color[]"]) ? `<div style="${styles}">❇️</div>` :
                        isRed(obj["color[]"]) ? `<div style="${styles}">✴️</div>` : iconHtml;
                    break;
                case 'capture_zone':
                    const color = rgbArrayToCss(obj["color[]"]);
                    iconHtml = `<svg width="15" height="15" style="${styles}"><circle cx="7.5" cy="7.5" r="7.5" fill="${color}"/></svg>`;
                    break;
                case 'bombing_point':
                    iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">❌</div>` : iconHtml;
                    break;
                case 'defending_point':
                    iconHtml = isGreen(obj["color[]"]) ? `<div style="${styles}">❎</div>` : iconHtml;
                    break;
                default:
                    iconHtml = `<div style="${styles}">❗</div>`; // Fallback icon
                    console.log(obj);
                    break;
            }
    }

    // Gestire il lampeggiamento se richiesto
    if (obj.blink) {
        styles += 'animation: blink 1s infinite;';
        iconHtml = `<div style="${styles}">${iconHtml}</div>`;
    }

    return L.divIcon({
        html: iconHtml,
        iconSize: [15, 15],
        iconAnchor: [15, 15],
        className: 'custom-div-icon',
    });
}

export function updateMarkers(map: L.Map, processedMarkers: Marker[]) {

    // Rimuovi i marker dalla mappa che non sono più presenti in `processedMarkers`
    markerLayer.forEach((existingMarker, id) => {
        const markerExistsInProcessed = processedMarkers.some(marker => marker.id === id);

        if (!markerExistsInProcessed) {
            // Il marker non è presente tra i nuovi, modifichiamo solo gli attributi necessari a 'missing'
            const previousMarker = previousMarkers.get(id); // Prendi il marker vecchio con tutti gli attributi
            if (previousMarker) {

                const modifiedMarker = {
                    ...previousMarker, // Mantieni tutti gli attributi originali
                    type: 'missing',   // Imposta 'type' a 'missing'
                    icon: 'missing',   // Imposta 'icon' a 'missing'
                    id: 0              // Imposta l'ID a 0 per evitare conflitti
                };

                // Creiamo l'icona del marker "missing" con i suoi attributi precedenti
                const missingIcon = createIcon(modifiedMarker, modifiedMarker.dx, modifiedMarker.dy, modifiedMarker.x, modifiedMarker.y);
                existingMarker.setIcon(missingIcon); // Cambia l'icona a 'missing'

                // Aggiorna l'oggetto nel markerLayer con i nuovi attributi
                markerLayer.set(id, Object.assign(existingMarker, { type: 'missing', missingCount: (existingMarker as any).missingCount || 0 }));
            }
        }
    });

    // Gestione dei marker "missing": stampa i marker per 10 chiamate e poi rimuovili
    markerLayer.forEach((existingMarker, id) => {
        const missingMarker = existingMarker as MissingMarker;
        if (missingMarker.type === 'missing') {
            missingMarker.missingCount++;

            if (missingMarker.missingCount >= 10) {
                missingMarker.remove(); // Rimuovi il marker dalla mappa
                markerLayer.delete(id);  // Rimuovi il marker dal layer
            }
        }
    });

    // Aggiungi o aggiorna i marker presenti in `processedMarkers`
    processedMarkers.forEach((marker) => {
        if (marker.id === undefined) {
            console.warn(`Il marker non ha un ID valido: ${JSON.stringify(marker)}`);
            return; // Salta l'elaborazione di questo marker se non ha un ID
        }

        // Se il marker esiste già, aggiorna la posizione e l'icona
        if (markerLayer.has(marker.id)) {
            const existingMarker = markerLayer.get(marker.id);
            existingMarker!.setLatLng([marker.y, marker.x]); // Aggiorna la posizione
            const icon = createIcon(marker, marker.dx, marker.dy, marker.x, marker.y);
            existingMarker!.setIcon(icon); // Aggiorna l'icona
        } else {
            // Altrimenti, crea un nuovo marker e aggiungilo alla mappa
            const icon = createIcon(marker, marker.dx, marker.dy, marker.x, marker.y);

            const newMarker = L.marker([marker.y, marker.x], { icon }).addTo(map);
            markerLayer.set(marker.id, newMarker); // Aggiungi il nuovo marker al layer
        }

        // Salva il marker elaborato in previousMarkers
        previousMarkers.set(marker.id, marker);
    });


}



export function removeAllMarkers(mapInstance: L.Map) {
    if (!mapInstance || !markerLayer) {
        console.warn('Mappa o markerLayer non validi. Impossibile rimuovere i marker.');
        return;
    }

    console.log('Rimozione di tutti i marker dalla mappa...');
    try {
        markerLayer.forEach((marker) => {
            if (mapInstance.hasLayer(marker)) {
                mapInstance.removeLayer(marker); // Rimuove il marker dalla mappa se esiste
            }
        });
        markerLayer.clear(); // Cancella tutti i marker dal layer
        previousMarkers.clear(); // Resetta i marker precedenti
    } catch (error) {
        console.error('Errore durante la rimozione dei marker:', error);
    }
}


function rgbArrayToCss(colorArray: number[]): string {
    if (Array.isArray(colorArray) && colorArray.length === 3) {
        return `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`;
    }
    return 'black'; // Fallback in caso di errore
}