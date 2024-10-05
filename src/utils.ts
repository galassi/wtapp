// utils.ts
export function _rel(rel: number, min: number, max: number): number {
  return min + rel * (max - min);
}
