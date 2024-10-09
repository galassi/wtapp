import * as L from 'leaflet';

let gridLines: L.Polyline[] = []; // Array per memorizzare le linee della griglia

export function createGrid(map: L.Map, gridZero: [number, number], gridSteps: [number, number], gridSize: [number, number]) {
  // Prima di creare la nuova griglia, rimuovi la griglia precedente
  removeGrid(map);

  const [gridZeroX, gridZeroY] = gridZero;
  const [stepX, stepY] = gridSteps;
  const [gridSizeX, gridSizeY] = gridSize;

  // Invertire la Y di gridSize per adattarsi alla direzione dell'asse Y di Leaflet
  const finalGridZeroY = gridZeroY - gridSizeY; // Punto finale per Y
  const finalGridZeroX = gridZeroX + gridSizeX; // Punto finale per X

  // Disegna i paralleli (linee orizzontali)
  for (let y = gridZeroY; y >= finalGridZeroY; y -= stepY) { // Cambiato a decremento
    const polyline = L.polyline([[y, gridZeroX], [y, finalGridZeroX]], { color: 'black', weight: 1 });
    polyline.addTo(map);
    gridLines.push(polyline); // Memorizza la linea della griglia
  }

  // Disegna i meridiani (linee verticali)
  for (let x = gridZeroX; x <= finalGridZeroX; x += stepX) {
    const polyline = L.polyline([[gridZeroY, x], [finalGridZeroY, x]], { color: 'black', weight: 1 });
    polyline.addTo(map);
    gridLines.push(polyline); // Memorizza la linea della griglia
  }
}

// Funzione per rimuovere la griglia attuale
export function removeGrid(map: L.Map) {
  // Rimuovi ogni linea della griglia dalla mappa
  gridLines.forEach(line => map.removeLayer(line));
  // Svuota l'array delle linee
  gridLines = [];
}