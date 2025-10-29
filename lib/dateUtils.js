/**
 * Shared utility functions for formatting dates and times
 */

/**
 * Format a date range for display
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {string} Formatted date range
 */
export function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  
  const startFormatted = start.toLocaleDateString('en-US', options).replace(',', '');
  const endFormatted = end.toLocaleDateString('en-US', options).replace(',', '');
  
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Format relative time from a timestamp
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}
