// lib/date-utils.ts
/**
 * Centralized date and time formatting utilities
 * Provides consistent date/time display across the application
 */

/**
 * Format a date for display in lists (relative format)
 * @param date - Date string or Date object
 * @returns Human-readable relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  // Handle future dates
  if (diffMs < 0) {
    const futureDiffMs = -diffMs;
    const diffDays = Math.floor(futureDiffMs / 86400000);
    if (diffDays === 0) return 'Later today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  }
  
  // Handle past dates
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);
  const diffMonths = Math.floor(diffMs / 2592000000); // ~30 days

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format a date for display in detail views (full format)
 * @param date - Date string or Date object
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string (e.g., "Jan 15, 2025" or "Jan 15, 2025 at 3:45 PM")
 */
export function formatFullDate(date: string | Date, includeTime: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  
  if (includeTime) {
    options.hour = 'numeric';
    options.minute = '2-digit';
    options.hour12 = true;
  }
  
  const formatted = dateObj.toLocaleDateString('en-US', options);
  
  if (includeTime) {
    // Format as "Jan 15, 2025 at 3:45 PM"
    const parts = formatted.split(', ');
    const datePart = parts.slice(0, -1).join(', ');
    const timePart = parts[parts.length - 1];
    return `${datePart} at ${timePart}`;
  }
  
  return formatted;
}

/**
 * Format a date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range (e.g., "Jan 15-17, 2025" or "Jan 15 - Feb 2, 2025")
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();

  // Same month
  if (startMonth === endMonth && start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  }
  
  // Different months
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

/**
 * Format time only (for display without date)
 * @param date - Date string or Date object
 * @returns Time string (e.g., "3:45 PM")
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format a date for ISO 8601 (for APIs and data storage)
 * @param date - Date object
 * @returns ISO 8601 formatted string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO string to Date object
 * @param isoString - ISO 8601 formatted string
 * @returns Date object
 */
export function fromISOString(isoString: string): Date {
  return new Date(isoString);
}
