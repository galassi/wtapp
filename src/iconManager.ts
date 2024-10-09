import * as L from 'leaflet';
import { Marker } from './types'; // Supponendo che tu abbia un tipo Marker definito in types.ts

// Mappa per tenere traccia dei marker attualmente visualizzati
export const markerLayer = new Map<number, L.Marker>();

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
        styles += `transform: rotate(${(Math.atan2(dy, dx) * 180 / Math.PI) + 45}deg);`;
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
                    iconHtml = `<svg width="15" height="15" style="${styles}"><circle cx="7.5" cy="7.5" r="7.5" fill="${obj.color}"/></svg>`;
                    break;
                case 'bombing_point':
                    iconHtml = isRed(obj["color[]"]) ? `<div style="${styles}">❌</div>` : iconHtml;
                    break;
                case 'defending_point':
                    iconHtml = isGreen(obj["color[]"]) ? `<div style="${styles}">❎</div>` : iconHtml;
                    break;
                default:
                    iconHtml = `<div style="${styles}">❓</div>`; // Fallback icon
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
    const currentMarkerIds = new Set<number>();

    // Ciclare su processedMarkers per creare o aggiornare le icone
    processedMarkers.forEach((marker) => {
        // Verifica che il marker abbia un ID definito
        if (marker.id !== undefined) {
            currentMarkerIds.add(marker.id);

            if (markerLayer.has(marker.id)) {
                // Se il marker esiste già, aggiorna solo la posizione
                const existingMarker = markerLayer.get(marker.id);
                existingMarker?.setLatLng([marker.y, marker.x]);
            } else {
                // Crea un nuovo marker e aggiungilo alla mappa
                const icon = createIcon(marker, marker.dx, marker.dy, marker.x, marker.y);
                const newMarker = L.marker([marker.y, marker.x], { icon }).addTo(map);
                markerLayer.set(marker.id, newMarker);
            }
        } else {
            console.warn(`Il marker non ha un ID valido: ${JSON.stringify(marker)}`);
        }
    });

    // Smontare i marker non più presenti
    markerLayer.forEach((existingMarker, id) => {
        if (!currentMarkerIds.has(id)) {
            map.removeLayer(existingMarker);
            markerLayer.delete(id); // Rimuovi il marker dalla mappa e dalla mappa dei marker
        }
    });
}
