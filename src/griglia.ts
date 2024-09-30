import * as L from 'leaflet';

export function createGrid(map: L.Map, gridZero: [number, number], gridSteps: [number, number], gridSize: [number, number]) {
  const [gridZeroX, gridZeroY] = gridZero;
  const [stepX, stepY] = gridSteps;
  const [gridSizeX, gridSizeY] = gridSize;

  // Invertire la Y di gridSize per adattarsi alla direzione dell'asse Y di Leaflet
  const finalGridZeroY = gridZeroY - gridSizeY; // Punto finale per Y
  const finalGridZeroX = gridZeroX + gridSizeX; // Punto finale per X

  // Disegna i paralleli (linee orizzontali)
  for (let y = gridZeroY; y >= finalGridZeroY; y -= stepY) { // Cambiato a decremento
    L.polyline([[y, gridZeroX], [y, finalGridZeroX]], { color: 'black', weight: 1 }).addTo(map);
  }

  // Disegna i meridiani (linee verticali)
  for (let x = gridZeroX; x <= finalGridZeroX; x += stepX) {
    L.polyline([[gridZeroY, x], [finalGridZeroY, x]], { color: 'black', weight: 1 }).addTo(map);
  }
}
