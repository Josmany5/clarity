// Utility functions for handling dates without timezone issues

/**
 * Parse a date string in YYYY-MM-DD format as local date (not UTC)
 * This prevents the "day before" bug when dates are stored as strings
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a Date object as YYYY-MM-DD string in local timezone
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 */
export function getTodayString(): string {
  return formatLocalDate(new Date());
}

/**
 * Compare two date strings (YYYY-MM-DD format)
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDateStrings(date1: string, date2: string): number {
  const d1 = parseLocalDate(date1);
  const d2 = parseLocalDate(date2);
  return d1.getTime() - d2.getTime();
}
