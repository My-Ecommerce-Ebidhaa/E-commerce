export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function differenceInMinutes(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / (60 * 1000));
}

export function differenceInHours(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / (60 * 60 * 1000));
}

export function differenceInDays(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / (24 * 60 * 60 * 1000));
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

export function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function fromUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000);
}
