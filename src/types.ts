export interface MapInfo {
  grid_size: [number, number];
  grid_steps: [number, number];
  grid_zero: [number, number];
  hud_type: number;
  map_generation: number;
  map_max: [number, number];
  map_min: [number, number];
  valid: boolean;
}

export interface DamageInfo {
  id: number;
  msg: string;
  sender: string;
  enemy: boolean;
  mode: string;
  time: number;
}


export interface ChatInfo {
  events: any[]; // Poiché events è sempre vuoto
  damage: DamageInfo[];
}


export interface MapObject {
  type: string;
  color: string;
  'color[]': number[];
  blink: number;
  icon: string;
  icon_bg: string;
  sx?: number;
  sy?: number;
  ex?: number;
  ey?: number;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
}