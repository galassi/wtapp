import * as L from 'leaflet';

export function createIcon(obj: any, dx: number, dy: number) {
  let styles = 'font-size: 15px;';

  // Handle rotation if dx and dy are provided and non-zero
  if (dx !== 0 || dy !== 0) {
    styles += `transform: rotate(${(Math.atan2(dy, dx) * 180 / Math.PI) + 45}deg);`;
  }

  // Conditionally set the icon based on the obj's properties
  let iconHtml = '';
  if (obj.icon === 'Player') {
    iconHtml = `<div style="${styles}">🛰️​</div>`;
  } else if (obj.icon === 'Player') {
    iconHtml = `<div style="${styles}">🛰️​</div>`;
  } else if (obj.icon === 'HeavyTank') {
    iconHtml = `<div style="${styles}">🚋</div>`;
  } else if (obj.icon === 'HeavyTank') {
    iconHtml = `<div style="${styles}">🚎</div>`;
  } else if (obj.icon === 'TankDestroyer') {
    iconHtml = `<div style="${styles}">🚓</div>`;
  } else if (obj.icon === 'TankDestroyer') {
    iconHtml = `<div style="${styles}">🚕</div>`;
  } else if (obj.icon === 'SPAA') {
    iconHtml = `<div style="${styles}">📡</div>`;
  } else if (obj.icon === 'SPAA') {
    iconHtml = `<div style="${styles}">📻</div>`;
  } else if (obj.icon === 'LightTank') {
    iconHtml = `<div style="${styles}">🚗</div>`;
  } else if (obj.icon === 'LightTank') {
    iconHtml = `<div style="${styles}">🚙</div>`;
  } else if (obj.icon === 'MediumTank') {
    iconHtml = `<div style="${styles}">🚛</div>`;
  } else if (obj.icon === 'Wheeled') {
    iconHtml = `<div style="${styles}">🏎️</div>`;
  } else if (obj.icon === 'Airdefence') {
    iconHtml = `<div style="${styles}">🛡️</div>`;
  } else if (obj.type === 'aircraft') {
    iconHtml = `<div style="${styles}">✈️</div>`;
  } else if (obj.type === 'airfield') {
    iconHtml = `<div style="${styles}">🟥</div>`;
  } else if (obj.type === 'respawn_base_tank') {
    iconHtml = `<div style="${styles}">❇️</div>`;
  } else if (obj.icon === 'respawn_base_bomber') {
    iconHtml = `<div style="${styles}">🎊</div>`;
  } else if (obj.icon === 'respawn_base_fighter') {
    iconHtml = `<div style="${styles}">🎇</div>`;
  } else if (obj.type === 'capture_zone') {
    iconHtml = `<svg width="15" height="15" style="${styles}"><circle cx="7.5" cy="7.5" r="7.5" fill="${obj.color}"/></svg>`;
  } else if (obj.type === 'bombing_point') {
    iconHtml = `<div style="${styles}">❌</div>`;
  } else if (obj.type === 'defending_point') {
    iconHtml = `<div style="${styles}">❎</div>`;
  } else if (obj.icon === 'Ship') {
    iconHtml = `<div style="${styles}">⛵</div>`;
  } else {
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
