export const BUS_STATUSES = new Set([
  'in_transit',
  'at_stop',
  'delayed',
  'out_of_service',
  'maintenance',
]);

export function normalizeSearch(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function parseLimit(value: unknown, fallback = 100, max = 100): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

export function validatePassengerCount(value: unknown, capacity: number): value is number {
  return Number.isInteger(value) && value >= 0 && value <= capacity;
}

export function validateCoordinates(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
