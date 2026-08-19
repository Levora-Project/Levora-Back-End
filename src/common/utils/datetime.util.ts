export function toApiDatetime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
}
