import * as L from 'leaflet';

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

export function createIcon(obj: any, dx: number, dy: number) {
  let styles = 'font-size: 15px;';

  // Gestire la rotazione se dx e dy sono forniti e diversi da zero
  if (dx !== 0 || dy !== 0) {
    styles += `transform: rotate(${(Math.atan2(dy, dx) * 180 / Math.PI) + 45}deg);`;
  }

  // Condizionatamente impostare l'icona in base alle proprietà di obj
  let iconHtml = '';
  if (obj.icon === 'Player' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🛰️​</div>`;
  } else if (obj.icon === 'Player' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🛰️​</div>`;
  } else if (obj.icon === 'HeavyTank' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🚋</div>`;
  } else if (obj.icon === 'HeavyTank' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🚎</div>`;
  } else if (obj.icon === 'TankDestroyer' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🚓</div>`;
  } else if (obj.icon === 'TankDestroyer' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🚕</div>`;
  } else if (obj.icon === 'SPAA' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">📡</div>`;
  } else if (obj.icon === 'SPAA' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">📻</div>`;
  } else if (obj.icon === 'LightTank' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🚗</div>`;
  } else if (obj.icon === 'LightTank' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🚙</div>`;
  } else if (obj.icon === 'MediumTank' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🚚</div>`;
  } else if (obj.icon === 'MediumTank' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🚛</div>`;
  } else if (obj.icon === 'Wheeled' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🏎️</div>`;
  } else if (obj.icon === 'Wheeled' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🛺</div>`;
  } else if (obj.icon === 'Airdefence' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🚀</div>`;
  } else if (obj.icon === 'Airdefence' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🛡️</div>`;
  } else if (obj.type === 'aircraft' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">✈️</div>`;
  } else if (obj.type === 'aircraft' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🛩️</div>`;
  } else if (obj.type === 'airfield' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🟥</div>`;
  } else if (obj.type === 'airfield' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🟩</div>`;
  } else if (obj.type === 'respawn_base_tank' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">✴️</div>`;
  } else if (obj.type === 'respawn_base_tank' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">❇️</div>`;
  } else if (obj.icon === 'respawn_base_bomber' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🎊</div>`;
  } else if (obj.icon === 'respawn_base_bomber' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🎇</div>`;
  } else if (obj.icon === 'respawn_base_fighter' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🎈</div>`;
  } else if (obj.icon === 'respawn_base_fighter' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🎐</div>`;
  } else if (obj.type === 'capture_zone') {
    iconHtml = `<svg width="15" height="15" style="${styles}"><circle cx="7.5" cy="7.5" r="7.5" fill="${obj.color}"/></svg>`;
  } else if (obj.type === 'bombing_point' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">❌</div>`;
  } else if (obj.type === 'defending_point' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">❎</div>`;
  } else if (obj.icon === 'Ship' && isRed(obj["color[]"])) {
    iconHtml = `<div style="${styles}">⛵</div>`;
  } else if (obj.icon === 'Ship' && isGreen(obj["color[]"])) {
    iconHtml = `<div style="${styles}">🛶</div>`;
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
    className: 'custom-div-icon'
  });
}
