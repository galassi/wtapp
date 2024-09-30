import * as L from 'leaflet';

export function createIcon(obj: any, dx: number, dy: number) {
  let styles = 'font-size: 15px;';

  // Handle rotation if dx and dy are provided and non-zero
  if (dx !== 0 || dy !== 0) {
    styles += `transform: rotate(${(Math.atan2(dy, dx) * 180 / Math.PI) + 45}deg);`;
  }

  // Conditionally set the icon based on the obj's properties
  let iconHtml = '';
  if (obj.icon === 'Player' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">🛰️​</div>`;
  } else if (obj.icon === 'Player' && obj.color === '#5676D7') {
    iconHtml = `<div style="${styles}">🛰️​</div>`;
  } else if (obj.icon === 'HeavyTank' && obj.color === '#f00C00') {
    iconHtml = `<div style="${styles}">🚋</div>`;
  } else if (obj.icon === 'HeavyTank' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">🚎</div>`;
  } else if (obj.icon === 'TankDestroyer' && obj.color === '#f00C00') {
    iconHtml = `<div style="${styles}">🚓</div>`;
  } else if (obj.icon === 'TankDestroyer' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">🚕</div>`;
  } else if (obj.icon === 'SPAA' && obj.color === '#f00C00') {
    iconHtml = `<div style="${styles}">📡</div>`;
  } else if (obj.icon === 'SPAA' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">📻</div>`;
  } else if (obj.icon === 'LightTank' && obj.color === '#f00C00') {
    iconHtml = `<div style="${styles}">🚗</div>`;
  } else if (obj.icon === 'LightTank' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">🚙</div>`;
  } else if (obj.icon === 'MediumTank' && obj.color === '#f00C00') {
    iconHtml = `<div style="${styles}">🚚</div>`;
  } else if (obj.icon === 'MediumTank' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">🚛</div>`;
  } else if (obj.icon === 'Wheeled' && obj.color === '#f00C00') {
    iconHtml = `<div style="${styles}">🏎️</div>`;
  } else if (obj.icon === 'Wheeled' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">🛺</div>`;
  } else if (obj.icon === 'Airdefence' && obj.color === '#f00C00') {
    iconHtml = `<div style="${styles}">🚀</div>`;
  } else if (obj.icon === 'Airdefence' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">🛡️</div>`;
  } else if (obj.type === 'aircraft' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">✈️</div>`;
  } else if (obj.type === 'aircraft' && obj.color === '#fa0C00') {
    iconHtml = `<div style="${styles}">🛩️</div>`;
  } else if (obj.type === 'airfield' && obj.color === '#fa0C00' ) {
    iconHtml = `<div style="${styles}">🟥</div>`;
  } else if (obj.type === 'airfield' && obj.color === '#17FF51' ) {
    iconHtml = `<div style="${styles}">🟩</div>`;
  } else if (obj.type === 'respawn_base_tank' && obj.color === '#fa0C00' ) {
    iconHtml = `<div style="${styles}">✴️</div>`;
  } else if (obj.type === 'respawn_base_tank' && obj.color === '#17FF51' ) {
    iconHtml = `<div style="${styles}">❇️</div>`;
  } else if (obj.icon === 'respawn_base_bomber' && obj.color === '#fa0C00' ) {
    iconHtml = `<div style="${styles}">🎊</div>`;
  } else if (obj.icon === 'respawn_base_bomber' && obj.color === '#17FF51' ) {
    iconHtml = `<div style="${styles}">🎇</div>`;
  } else if (obj.icon === 'respawn_base_fighter' && obj.color === '#fa0C00' ) {
    iconHtml = `<div style="${styles}">🎈</div>`;
  } else if (obj.icon === 'respawn_base_fighter' && obj.color === '#17FF51' ) {
    iconHtml = `<div style="${styles}">🎐</div>`;
  } else if (obj.type === 'capture_zone') {
    iconHtml = `<svg width="15" height="15" style="${styles}"><circle cx="7.5" cy="7.5" r="7.5" fill="${obj.color}"/></svg>`;
  } else if (obj.type === 'bombing_point' && obj.color === '#fa0C00' ) {
    iconHtml = `<div style="${styles}">❌</div>`;
  } else if (obj.type === 'defending_point' && obj.color === '#17FF51' ) {
    iconHtml = `<div style="${styles}">❎</div>`;
  } else if (obj.icon === 'Ship' && obj.color === '#f00C00') {
    iconHtml = `<div style="${styles}">⛵</div>`;
  } else if (obj.icon === 'Ship' && obj.color === '#17FF51') {
    iconHtml = `<div style="${styles}">🛶</div>`;
  }

   else {
    iconHtml = `<div style="${styles}">❓</div>`; // Fallback icon
    console.log(obj)
  }

  // Handle blink if required
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
